# Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci

# Copy rest of the source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Run the production build
FROM node:20-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
#COPY --from=builder /app/next.config.js ./next.config.js

# Set NODE_ENV
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run Next.js
CMD ["npm", "run", "start"]
