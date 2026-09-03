FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/mastra/package.json ./apps/mastra/
COPY packages/*/package.json ./packages/
COPY tools/*/package.json ./tools/

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages first
RUN npm run build --workspace=@ai-ctrl/contracts
RUN npm run build --workspace=@ai-ctrl/authz
RUN npm run build --workspace=@ai-ctrl/telemetry
RUN npm run build --workspace=@ai-ctrl/tool-sdk
RUN npm run build --workspace=@ai-ctrl/tool-smc
RUN npm run build --workspace=@ai-ctrl/tool-alerts
RUN npm run build --workspace=@ai-ctrl/note-generator
RUN npm run build --workspace=@ai-ctrl/retool-workflows

# Build mastra app
RUN npm run build --workspace=@ai-ctrl/mastra

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy built artifacts
COPY --from=builder /app/apps/mastra/dist ./apps/mastra/dist
COPY --from=builder /app/apps/mastra/package.json ./apps/mastra/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/tools ./tools
COPY --from=builder /app/data ./data
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

CMD ["node", "apps/mastra/dist/index.js"]