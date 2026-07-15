FROM ghcr.io/pnpm/pnpm:11

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .
