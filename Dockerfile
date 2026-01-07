FROM node:20 AS build
WORKDIR /app/frontend

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_BOTTOM_ONLINE_BACKEND_URL
ARG VITE_TEST

ENV VITE_BOTTOM_ONLINE_BACKEND_URL=$VITE_BOTTOM_ONLINE_BACKEND_URL
ENV VITE_TEST=$VITE_TEST

RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/frontend/dist .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]