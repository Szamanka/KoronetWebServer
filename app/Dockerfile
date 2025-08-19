FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application source code
COPY . .

# Stage 2: Production - Creates a minimal, secure, and distroless image
FROM gcr.io/distroless/nodejs20-debian12

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/index.js ./

# Add any other necessary application files explicitly
# COPY --from=builder /app/src ./src

# Expose port
EXPOSE 3000

# Use the node binary path for distroless images
CMD ["index.js"]


# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"