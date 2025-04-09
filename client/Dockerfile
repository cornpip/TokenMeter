# 1. Nginx 공식 경량 이미지 사용
FROM nginx:alpine

# 3. 커스텀 설정 파일 복사
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/common /etc/nginx/common

# 4. 정적 파일 (React 빌드 결과) 복사
COPY ./dist /token_meter_dist

# 5. Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
