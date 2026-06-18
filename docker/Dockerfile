FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY tsconfig*.json mikro-orm.config.ts ./
COPY src ./src
COPY migrations ./migrations

RUN npm run build && npm run build:migrations

FROM node:24-alpine AS migrator

ENV NODE_ENV=production
ENV MIKRO_ORM_CLI_USE_TS_NODE=false

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["npx", "mikro-orm", "migration:up"]

FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:24-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN addgroup -S da-postork && adduser -S da-postork -G da-postork
USER da-postork

CMD ["npm", "run", "start:prod"]
