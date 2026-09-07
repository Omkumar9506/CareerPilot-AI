FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node /app

# Switch to non-root user
USER node

# Expose backend API port
EXPOSE 5000

# Set production environment default
ENV NODE_ENV=production

# Start production server
CMD ["node", "src/server.js"]
