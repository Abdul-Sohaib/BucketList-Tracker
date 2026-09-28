# Stage 1: Build React application
FROM node:22-alpine AS builder

WORKDIR /bucketlist-tracker

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# Stage 2: Serve React application
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /bucketlist-tracker/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]