# 1. Use Node 18 with Corepack for Yarn v3
FROM node:18-alpine

# 2. Enable Corepack & prepare Yarn
RUN corepack enable \
 && corepack prepare yarn@stable --activate

# 3. Set working directory
WORKDIR /app

# 4. Copy yarn config
COPY .yarnrc.yml ./

# 5. Copy only package descriptors
COPY package.json yarn.lock ./

# 6. Install all dependencies (incl. @prisma/client & prisma)
RUN yarn install --frozen-lockfile

# 7. Copy your Prisma schema & migrations
COPY prisma ./prisma

# 8. Generate the Prisma client using your installed binary
RUN yarn prisma generate

# 9. Copy the rest of your source
COPY . .

# 10. Build your app (this will run your build script, e.g. tsc)
RUN yarn build

# 11. Expose port and start: apply migrations then launch
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]