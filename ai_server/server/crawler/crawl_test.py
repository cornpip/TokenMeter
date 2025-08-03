import logging
from crawl_func import summarize_text, fetch_github_readme, crawl_blog_content_hybrid, summarize_text_batch

logging.basicConfig(level=logging.INFO)


def test_crawl_blog_content_hybrid():
    logging.basicConfig(level=logging.INFO)

    test_urls = [
        "https://medium.com/@cornpip/connect-vs-bind-in-android-networking-whats-the-difference-835ee44271c9",
    ]

    for url in test_urls:
        try:
            text = crawl_blog_content_hybrid(url)
            print(f"--- 크롤링 결과 (길이: {len(text)}자) ---")
            print(text[:1000])  # 앞 1000자만 출력
            # print(text)
            print("\n\n")
        except Exception as e:
            logging.error(f"Error while crawling {url}: {e}")


if __name__ == "__main__":
    test_crawl_blog_content_hybrid()
