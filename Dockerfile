FROM node:20 AS build
WORKDIR /app/frontend

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN apk add --no-cache gettext

RUN rm -rf ./*

COPY --from=build /app/frontend/dist .

EXPOSE 80

CMD ["sh", "-c", "envsubst < /usr/share/nginx/html/index.html > /tmp/index.html && mv /tmp/index.html /usr/share/nginx/html/index.html && nginx -g 'daemon off;'"]
