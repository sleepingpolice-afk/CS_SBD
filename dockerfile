# Use a specific Node version for consistency (e.g., 18 LTS)
FROM node

# Set working directory
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose a port (optional, if needed)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
