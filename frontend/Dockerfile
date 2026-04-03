FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
RUN npm install

# Copy application code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]