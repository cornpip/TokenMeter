# Node.js 기반 이미지 사용
FROM node:20-alpine

WORKDIR /server

# 필수 패키지 설치
RUN apk update && apk add --no-cache \  
    sqlite \
    sqlite-libs \
    sqlite-dev \
    && rm -rf /var/cache/apk/*

# 프로젝트 파일 복사
COPY ./ /

# 의존성 설치
RUN npm install

# 서버 실행
CMD ["npm", "run", "server"]
