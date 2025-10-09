# ---- BASE ----
FROM node:20-alpine AS base
WORKDIR /app

# pnpm kurulum
RUN corepack enable && corepack prepare pnpm@9 --activate

# ---- DEPENDENCIES ----
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# ---- BUILD ----
COPY . .

# Docker ortamı için environment dosyasını .env olarak kopyala
# (Next.js sadece `.env` veya `.env.production` isimlerini otomatik tanır)
COPY .env.docker .env

# ---- RUN ----
EXPOSE 3000
CMD ["pnpm", "dev"]