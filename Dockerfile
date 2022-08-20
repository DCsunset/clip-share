FROM node:18 AS build-env
COPY server /app
WORKDIR /app
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs:18
ENV NODE_ENV=production
LABEL MAINTAINER="DCsunset"
COPY --from=build-env /app /app
WORKDIR /app
CMD ["dist/server.js"]
