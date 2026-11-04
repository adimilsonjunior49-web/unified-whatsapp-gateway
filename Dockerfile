# ------------------------------------------------------------------------------
# 1. BUILD STAGE
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# ------------------------------------------------------------------------------
# 2. RUNTIME STAGE
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

# Instala FFmpeg para transcodificação de áudios PTT (Opus/OGG)
RUN apk add --no-cache ffmpeg

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Diretórios para persistência de sessões e temporários de mídia
RUN mkdir -p sessions temp

EXPOSE 8080

CMD ["node", "dist/index.js"]
