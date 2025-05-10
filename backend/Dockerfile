FROM node:18-alpine

# Enable Yarn v3 via Corepack
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .
RUN yarn build

EXPOSE 4000
CMD ["node", "dist/index.js"]