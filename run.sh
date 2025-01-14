docker run --rm \
  -p 80:80 \
  -p 3000:3000 \
  --name token_meter_test \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf \
  token_meter