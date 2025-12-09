# AgentDesk Browser Tools MCP Server - Fly.io Dockerfile
# Lighthouse auditing, accessibility testing, and SEO analysis

FROM node:20-bullseye

# Install Chromium and ALL necessary dependencies for containerized browser execution
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxshmfence1 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path for Lighthouse
ENV CHROME_PATH=/usr/bin/chromium \
    LIGHTHOUSE_CHROMIUM_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port 5031
EXPOSE 5031

# Start the HTTP server
CMD ["node", "http-server.js"]
