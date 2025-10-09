FROM node:20

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


CMD ["sh", "-c", "pnpm db:generate && pnpm db:migrate && pnpm run start:prod"]