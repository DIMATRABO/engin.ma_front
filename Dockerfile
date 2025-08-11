FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy all source files including public folder
COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public  # make sure it exists in builder

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
