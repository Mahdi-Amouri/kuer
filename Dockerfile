# frontend/Dockerfile

# 1. Build-Stage mit Node 20-Alpine
FROM node:22-alpine AS builder
WORKDIR /app

# Nur Metadaten kopieren und Dependencies installieren
COPY package*.json ./
RUN npm ci

# Restlichen Code kopieren und bauen
COPY . .
RUN npm run build

# 2. Runtime-Stage
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve","-s","dist","-l","3000"]
