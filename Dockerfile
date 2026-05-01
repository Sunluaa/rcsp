FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

RUN mkdir -p /app/data && chown -R node:node /app/data

USER node

EXPOSE 8080

CMD ["npm", "run", "start"]
