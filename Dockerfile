FROM --platform=linux/ARM64 node:22-alpine AS builder

# Set working directory
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Build the application (if needed)
RUN npm run build

# Use a smaller runtime image
FROM --platform=linux/ARM64 node:22-alpine AS runtime

WORKDIR /app

# Copy built files and dependencies from builder stage
COPY --from=builder /app /app

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]