from readability import Document
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from bs4.element import Comment
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from nltk.tokenize import sent_tokenize
import re
import logging
from tqdm import tqdm
import torch

logging.basicConfig(level=logging.INFO)


# ⬇️ 눈에 보이는 태그 필터링
def tag_visible(element):
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True


# ⬇️ visible text 방식으로 크롤링
def extract_visible_text(html):
    soup = BeautifulSoup(html, 'html.parser')
    texts = soup.find_all(text=True)
    visible_texts = filter(tag_visible, texts)
    return "\n".join(t.strip() for t in visible_texts if t.strip())


# ⬇️ 공백 줄 제거
def clean_text(text):
    lines = text.splitlines()
    cleaned = [line.strip() for line in lines if line.strip()]
    return "\n".join(cleaned)


# ⬇️ 하이브리드 방식의 본문 크롤링 함수
def crawl_blog_content_hybrid(url):
    logging.info(f"crawl_blog_content_hybrid started for: {url}")

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("start-maximized")
    options.add_argument("disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
    try:
        driver = webdriver.Chrome(options=options)
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
            """
        })

        driver.get(url)

        # 명시적 대기: body 요소가 로드될 때까지 최대 10초 대기
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body")))

        html = driver.page_source

        # Step 1: Readability 방식 시도
        try:
            doc = Document(html)
            main_html = doc.summary()
            soup = BeautifulSoup(main_html, "html.parser")
            raw_text = soup.get_text(separator="\n")
            readable_text = clean_text(raw_text)
        except Exception:
            logging.warning("Readability 방식 실패", exc_info=True)
            readable_text = ""

        # Step 2: fallback if readable_text is too short
        if len(readable_text) < 200:
            logging.info("Fallback 방식 사용: extract_visible_text")
            try:
                fallback_text = extract_visible_text(html)
                return clean_text(fallback_text)
            except Exception:
                logging.error("extract_visible_text 실패", exc_info=True)
                return ""  # 또는 raise

        logging.info(f"crawl_blog_content_hybrid finish")
        return readable_text

    except Exception:
        logging.error(f"크롤링 전체 실패: {url}", exc_info=True)
        raise

    finally:
        if 'driver' in locals():
            driver.quit()


def fetch_github_readme(repo_url):
    logging.info(f"fetch_github_readme started for: {repo_url}")
    match = re.search(r"github\.com/([^/]+/[^/]+)", repo_url)
    if not match:
        return "Invalid GitHub URL"

    repo = match.group(1)

    branches = ['main', 'master']
    headers = {'User-Agent': 'Mozilla/5.0'}

    for branch in branches:
        raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/README.md"
        try:
            response = requests.get(raw_url, headers=headers, timeout=5)
            if response.status_code == 200:
                logging.info(f"fetch_github_readme finish")
                return response.text
        except requests.RequestException as e:
            return f"Request error: {e}"

    # README를 못가져왔으면 fallback으로 웹 크롤링 시도
    logging.info(f"README 직접 접근 실패, 페이지에서 본문 크롤링 시도 중...")
    return crawl_blog_content_hybrid(repo_url)


def chunk_text(text, max_tokens=800, tokenizer=None):
    sentences = sent_tokenize(text)
    sentence_tokens = [tokenizer.encode(
        s, add_special_tokens=False) for s in sentences]

    chunks = []
    current_chunk = []
    current_len = 0

    for tokens, sent in zip(sentence_tokens, sentences):
        if current_len + len(tokens) > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sent]
            current_len = len(tokens)
        else:
            current_chunk.append(sent)
            current_len += len(tokens)

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def summarize_text(text, summarizer, tokenizer, min_length=30, max_chunk_tokens=800):
    chunks = chunk_text(text, max_tokens=max_chunk_tokens, tokenizer=tokenizer)
    summaries = []
    default_output_len = int(max_chunk_tokens * 0.7)

    for idx, chunk in enumerate(tqdm(chunks, desc="Summarizing_per_chunk")):
        chunk = chunk.strip()
        if not chunk:
            continue
        try:
            # 입력 토큰 길이 간단히 측정
            input_len = len(tokenizer.encode(chunk))
            output_len = max(min_length, int(input_len * 0.7))
            if abs(output_len - default_output_len) < 30:
                output_len = default_output_len

            summary = summarizer(
                chunk,
                max_length=output_len,
                min_length=min_length,
                truncation=True,
                do_sample=False,
            )
            summaries.append(summary[0]['summary_text'])
        except Exception:
            logging.warning(f"[Chunk {idx}] 요약 실패", exc_info=True)
            logging.warning(f"내용 요약 실패 chunk: {repr(chunk[:200])}...")

    return " ".join(summaries)


def summarize_text_batch(text, model, tokenizer, device="cuda", max_tokens=512, batch_size=2):
    model.eval()
    model.to(device)

    chunks = chunk_text(text, max_tokens=max_tokens, tokenizer=tokenizer)
    input_texts = [chunk.strip() for chunk in chunks if chunk.strip()]

    # extract_visible_text 로 raw_text 뽑으면 양이 너무 많음
    num_iterations = (len(input_texts) + batch_size - 1) // batch_size
    if num_iterations >= 4:
        logging.warning(f"요약 반복 횟수가 너무 많음: {num_iterations}회 (4회 이상 실행하지 않음)")
        raise ValueError(f"요약 반복 횟수가 너무 많음: {num_iterations}회 (4회 이상 실행하지 않음)")

    summaries = []
    for i in tqdm(range(0, len(input_texts), batch_size), desc="Summarizing_in_batches"):
        batch = input_texts[i:i+batch_size]
        inputs = tokenizer(batch, return_tensors="pt", padding=True,
                           truncation=True, max_length=max_tokens).to(device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=150,
                min_length=30,
                do_sample=False,
                num_beams=2
            )
        decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        summaries.extend(decoded)

    return " ".join(summaries)


def get_summarizer():
    model_name = "facebook/bart-large-cnn"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    return summarizer, tokenizer
