# Multi-stage build for React application
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_NAME=PesoWise
ARG REACT_APP_VERSION=1.0.0

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_NAME=$REACT_APP_NAME
ENV REACT_APP_VERSION=$REACT_APP_VERSION

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pesowise -u 1001

# Change ownership of nginx files
RUN chown -R pesowise:nodejs /var/cache/nginx && \
    chown -R pesowise:nodejs /var/log/nginx && \
    chown -R pesowise:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R pesowise:nodejs /var/run/nginx.pid && \
    chown -R pesowise:nodejs /usr/share/nginx/html

# Switch to non-root user
USER pesowise

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
