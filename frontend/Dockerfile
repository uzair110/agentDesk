FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
