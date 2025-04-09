# Node.js 기반 이미지 사용
FROM node:23.11-bullseye-slim

WORKDIR /server

# 필수 패키지 설치
RUN apt update && \
    apt install -y build-essential python3 sqlite3 libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# 프로젝트 파일 복사
COPY ./ /

# 의존성 설치
RUN npm install

# 서버 실행
CMD ["npm", "run", "server"]
