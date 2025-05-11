FROM node:18-alpine

# Enable Yarn v3 via Corepack
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn install && yarn build

EXPOSE 4000
CMD ["node", "dist/index.js"]