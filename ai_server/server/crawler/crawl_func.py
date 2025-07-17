from readability import Document
import requests
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import time
from bs4 import BeautifulSoup
from bs4.element import Comment
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from nltk.tokenize import sent_tokenize
import re

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

def chunk_text(text, max_tokens=800, tokenizer=None):
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = ""
    for sent in sentences:
        trial = current_chunk + " " + sent if current_chunk else sent
        if tokenizer and len(tokenizer.encode(trial)) > max_tokens:
            chunks.append(current_chunk)
            current_chunk = sent
        else:
            current_chunk = trial
    if current_chunk:
        chunks.append(current_chunk)
    return chunks

# ⬇️ 하이브리드 방식의 본문 크롤링 함수
def crawl_blog_content_hybrid(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        time.sleep(3)
        html = driver.page_source

        # Step 1: Readability 방식 시도
        try:
            doc = Document(html)
            main_html = doc.summary()
            soup = BeautifulSoup(main_html, "html.parser")
            raw_text = soup.get_text(separator="\n")
            readable_text = clean_text(raw_text)
        except Exception:
            readable_text = ""

        # Step 2: fallback if readable_text is too short
        if len(readable_text) < 200:  # 짧다고 판단되는 기준은 조정 가능
            fallback_text = extract_visible_text(html)
            return clean_text(fallback_text)

        return readable_text

    finally:
        driver.quit()

def fetch_github_readme(repo_url):
    match = re.search(r"github\.com/([^/]+/[^/]+)", repo_url)
    if not match:
        return "Invalid GitHub URL"
    
    repo = match.group(1)

    branches = ['main']
    headers = {'User-Agent': 'Mozilla/5.0'}

    for branch in branches:
        raw_url = f"https://raw.githubusercontent.com/{repo}/{branch}/README.md"
        try:
            response = requests.get(raw_url, headers=headers, timeout=5)
            if response.status_code == 200:
                return response.text
        except requests.RequestException as e:
            return f"Request error: {e}"

    # README를 못가져왔으면 fallback으로 웹 크롤링 시도
    print("README 직접 접근 실패, 페이지에서 본문 크롤링 시도 중...")
    return crawl_blog_content_hybrid(repo_url)

def summarize_text(text, summarizer, tokenizer, max_length=130, min_length=30, max_chunk_tokens=800):
    chunks = chunk_text(text, max_tokens=max_chunk_tokens, tokenizer=tokenizer)
    summaries = []
    for chunk in chunks:
        summary = summarizer(chunk, max_new_tokens=max_length, do_sample=False)
        summaries.append(summary[0]['summary_text'])
    return " ".join(summaries)

def get_summarizer():
    model_name = "facebook/bart-large-cnn"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    return summarizer, tokenizer