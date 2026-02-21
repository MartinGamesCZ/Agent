FROM oven/bun

WORKDIR /app
COPY package.json bun.lock /app/

RUN bun install
COPY . .

CMD [ "bun", "run", "src/index.ts" ]