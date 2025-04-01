FROM node:22.14.0-bullseye

COPY . .
RUN chmod +x /entrypoint.sh \
    && apt update

ARG S_PORT=10998
ENV S_PORT=${S_PORT}

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]