# .env 파일 수정
echo "VITE_API_PORT=${S_PORT:-10998}" > /client/.env

git pull origin master

# npm 실행
exec npm run start_docker