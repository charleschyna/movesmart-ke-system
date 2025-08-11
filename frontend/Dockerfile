# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files explicitly to avoid Windows glob issues
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
