FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn

COPY templates/ ./templates/
COPY . .

# Build the NestJS application
RUN yarn build

# Production image
FROM node:18-alpine as production

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
# Install Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Set environment variables
ENV CHROME_BIN=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set Chromium options
ENV CHROME_PATH /usr/lib/chromium/
ENV CHROMIUM_FLAGS --headless --no-sandbox --disable-gpu --disable-dev-shm-usage

CMD ["yarn", "start:prod"]
