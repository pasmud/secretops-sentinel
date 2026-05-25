FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm install

COPY . .

RUN npm run db:generate --prefix server
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache gitleaks

COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/package.json .

RUN npm install --omit=dev --prefix server
RUN npm run db:generate --prefix server

ENV NODE_ENV=production
ENV PORT=42001

EXPOSE 42001

CMD ["node", "server/dist/index.js"]
