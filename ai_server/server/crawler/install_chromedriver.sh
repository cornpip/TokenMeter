#!/bin/bash
set -e

# 필수 패키지 설치
apt-get update && apt-get install -y \
  jq curl unzip gnupg2 ca-certificates \
  fonts-liberation \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
  libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 \
  libxrandr2 xdg-utils libgbm1 libxshmfence1 libu2f-udev libvulkan1 \
  libpangocairo-1.0-0 libpango-1.0-0 \
  libxss1 libxtst6 libgtk-3-0 libxcb1 libxcursor1 libxext6 libxi6 libxrender1 \
  libglib2.0-0 \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# 구글 저장소 설정
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get update

# 설치할 Chrome 버전 (최신으로 설치)
apt-get install -y google-chrome-stable

# 설치된 Chrome 버전 구하기 (예: 138.0.7204)
CHROME_VERSION=$(google-chrome --version | grep -oP '\d+\.\d+\.\d+')
echo "Installed Chrome version: $CHROME_VERSION"

# ChromeDriver 버전 검색: Chrome 버전과 'major.minor.build'가 일치하는 가장 최근 버전으로
DRIVER_URL=$(curl -s https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json \
  | jq -r --arg ver "$CHROME_VERSION" '
    .versions[] | select(.version | startswith($ver)) |
    .downloads.chromedriver[] | select(.platform=="linux64") | .url' | head -n 1)

if [ -z "$DRIVER_URL" ]; then
  echo "Warning: 정확한 ChromeDriver 버전을 못 찾았습니다. 최신 버전으로 설치합니다."
  DRIVER_URL=$(curl -s https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json \
    | jq -r '
      .versions | sort_by(.version) | reverse |
      .[0].downloads.chromedriver[] | select(.platform=="linux64") | .url')
fi

echo "Downloading ChromeDriver from: $DRIVER_URL"
curl -sSL "$DRIVER_URL" -o /tmp/chromedriver.zip
unzip -q /tmp/chromedriver.zip -d /usr/local/bin/
mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver
chmod +x /usr/local/bin/chromedriver
rm -rf /usr/local/bin/chromedriver-linux64 /tmp/chromedriver.zip

echo "ChromeDriver version: $(chromedriver --version)"