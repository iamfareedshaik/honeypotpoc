# Use the official Node.js image as base
FROM node:14 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 (assuming your Node.js app runs on port 3000)
EXPOSE 3000

# Start the Node.js application
CMD ["node", "index.js"]
