FROM node:18

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install exact dependencies using package-lock.json
RUN npm ci --only=production

# Copy essential configuration files
COPY .env.example ./
COPY eslint.config.js ./
COPY .gitignore ./

# Copy documentation and deployment files  
COPY README.md ./
COPY deploy.sh ./
COPY docker-compose.yml ./

# Copy all source code
COPY src/ ./src/

# Copy RAG state directory (critical for RAG Superior functionality)
COPY rag-state/ ./rag-state/

# Copy additional directories
COPY docs/ ./docs/
COPY scripts/ ./scripts/
COPY monitoring/ ./monitoring/
COPY .github/ ./.github/

# Create necessary directories and set permissions
RUN mkdir -p /app/logs /app/rag-state/context_cache
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose the application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "src/server.js"]