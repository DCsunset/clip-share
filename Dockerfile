FROM docker.io/library/alpine:3.17
LABEL MAINTAINER="DCsunset"

COPY server /app/server
COPY webui /app/webui-src
COPY container /app/container

# install deps
RUN apk --no-cache add \
	nodejs npm caddy

# build webui
RUN cd /app/webui-src && \
	npm ci && \
	npm run build && \
	cp -r dist /app/webui && \
	rm -rf /app/webui-src
	
# build server
RUN cd /app/server && \
	npm ci && \
	npm run build && \
	npm prune --omit=dev

ENV NODE_ENV=production
WORKDIR /app
EXPOSE 80 3000

CMD ["./container/start.sh"]
