FROM node:20-alpine AS builder

WORKDIR /app

# Accept env vars from docker-compose
ARG NEXT_DISABLE_ESLINT
ENV NEXT_DISABLE_ESLINT=$NEXT_DISABLE_ESLINT

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
