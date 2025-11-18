# Dockerfile backend chuẩn production cho CI/CD

FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --ignore-engines --frozen-lockfile --production=true

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 8888

CMD ["yarn", "start"]