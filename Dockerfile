FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

RUN apk add --no-cache git 

COPY . .

# Install dependencies
RUN npm install

# Build the application (if needed)
RUN npm run build

# Use a smaller runtime image
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy built files and dependencies from builder stage
COPY --from=builder /app /app

# Set environment variables
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]