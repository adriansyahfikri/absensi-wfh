# ---- Build stage ----
# Compiles all three monorepo apps once into /app/dist.
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Build each app explicitly so all three entry points exist in dist/.
RUN npx nest build gateway \
 && npx nest build employee-service \
 && npx nest build attendance-service

# ---- Runtime stage ----
# One lean image shared by all three services. The APP env var (set per
# service in docker-compose) decides which compiled app this container runs.
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# APP is provided at runtime by docker-compose (gateway / employee-service /
# attendance-service). Shell form is required so ${APP} is expanded.
CMD ["sh", "-c", "node dist/apps/${APP}/main"]
