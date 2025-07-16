from readability import Document
import requests
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import time
from bs4 import BeautifulSoup
from bs4.element import Comment
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from langdetect import detect
import nltk
nltk.download('punkt')
nltk.download('punkt_tab') 
from nltk.tokenize import sent_tokenize
import re

def tag_visible(element):
    # 눈에 안 보이는 태그나 주석 필터링
    if element.parent.name in ['style', 'script', 'head', 'title', 'meta', '[document]']:
        return False
    if isinstance(element, Comment):
        return False
    return True

def crawl_visible_text_with_selenium(url):
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        time.sleep(3)
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        texts = soup.find_all(text=True)
        visible_texts = filter(tag_visible, texts)
        final_text = "\n".join(t.strip() for t in visible_texts if t.strip())
        return final_text
    finally:
        driver.quit()

def fetch_github_readme(repo_url):
    match = re.search(r"github\.com/([^/]+/[^/]+)", repo_url)
    if not match:
        return "Invalid GitHub URL"
    
    repo = match.group(1)
    raw_url = f"https://raw.githubusercontent.com/{repo}/main/README.md"
    print(raw_url)
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(raw_url, headers=headers, timeout=5)
    if response.status_code != 200:
        return "Failed to fetch README"
    
    return response.text

def crawl_blog_with_readability(url):
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Chrome(options=options)

    try:
        driver.get(url)
        time.sleep(3)
        html = driver.page_source

        doc = Document(html)
        main_html = doc.summary()

        soup = BeautifulSoup(main_html, "html.parser")
        return soup.get_text(separator="\n").strip()
    finally:
        driver.quit()

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

def summarize_text(text, summarizer, tokenizer, max_length=130, min_length=30, max_chunk_tokens=800):
    chunks = chunk_text(text, max_tokens=max_chunk_tokens, tokenizer=tokenizer)
    summaries = []
    for chunk in chunks:
        summary = summarizer(chunk, max_new_tokens=max_length, do_sample=False)
        summaries.append(summary[0]['summary_text'])
    return " ".join(summaries)

def get_summarizer_by_lang(text):
    lang = detect(text)
    print(f"Detected language: {lang}")

    # if lang == 'ko':
    #     model_name = "digit82/kobart-summarization"
    # else:
    #     model_name = "facebook/bart-large-cnn"

    model_name = "facebook/bart-large-cnn"
    # model_name = "digit82/kobart-summarization"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    return summarizer, tokenizer

if __name__ == "__main__":
    # url = "https://github.com/OpenBB-finance/OpenBB"
    # raw_text = fetch_github_readme(url)
    # url = "https://cornpip.tistory.com/138"
    url = "https://medium.com/@cornpip/connect-vs-bind-in-android-networking-whats-the-difference-835ee44271c9"
    # raw_text = crawl_visible_text_with_selenium(url)
    raw_text = crawl_blog_with_readability(url)
    print("=== Original Text Snippet ===")
    print(raw_text, "\n")

    summarizer, tokenizer = get_summarizer_by_lang(raw_text)
    summary = summarize_text(raw_text, summarizer, tokenizer)

    print("=== Summary ===")
    print(summary)
