import requests
from bs4 import BeautifulSoup
import html2text
import re
import tiktoken

def count_tokens(text: str, model="gpt-4o-mini"):
    # tiktoken 토큰 카운터 초기화
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))

def markdown_structured_to_natural_text(structured, max_tokens=2000, model="gpt-4o-mini"):
    """
    structured: [{'title': ..., 'content': ...}, ...]
    max_tokens: 토큰 최대 제한
    model: 토큰 계산용 모델명 (OpenAI 모델명과 동일하게)
    
    return: 토큰 제한 내에서 자연어 문장으로 합친 텍스트
    """
    sentences = []
    for section in structured:
        title = section['title'].strip()
        content = section['content'].strip()

        # bullet list나 줄바꿈을 문장으로 자연스럽게 변환
        content = content.replace("\n", " ").replace("- ", "• ")
        
        # 문장 조합 예: "Overview: ~ 내용"
        sentence = f"{title}: {content}"
        sentences.append(sentence)

    # 토큰 제한 내에서 문장 합치기
    final_text = ""
    for sent in sentences:
        trial_text = final_text + "\n\n" + sent if final_text else sent
        if count_tokens(trial_text, model) > max_tokens:
            break
        final_text = trial_text

    return final_text


def extract_structured_content_from_url(url: str, headers=None, max_tokens=2000, model="gpt-4o-mini"):
    headers = headers or {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        return {"error": f"Request failed: {e}"}

    soup = BeautifulSoup(response.text, "lxml")
    main_content = soup.find('main') or soup.find('article') or soup.find('body')
    if not main_content:
        return {"error": "No main/article/body tag found in HTML."}

    converter = html2text.HTML2Text()
    converter.ignore_links = False
    converter.body_width = 0
    markdown_text = converter.handle(str(main_content))

    sections = re.split(r'\n(?=#+ )', markdown_text.strip())
    structured = []
    for section in sections:
        lines = section.strip().splitlines()
        if not lines:
            continue
        title_line = lines[0]
        title = re.sub(r'^#+\s*', '', title_line)
        content = "\n".join(lines[1:]).strip()
        structured.append({"title": title, "content": content})

    # 자연어 텍스트로 변환 + 토큰 제한 적용
    natural_text = markdown_structured_to_natural_text(structured, max_tokens=max_tokens, model=model)

    return natural_text


# 사용 예시
url = "https://github.com/OpenBB-finance/OpenBB"
result = extract_structured_content_from_url(url, max_tokens=4000)  # 토큰 제한 1000

print(result)

# requests
# beautifulsoup4
# lxml
# html2text
# tiktoken