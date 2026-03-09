# --- Stage 1: Builder (Compiling the code) ---
FROM node:24-alpine AS builder

# install generic build tools (optional but recommended for some npm packages)
# RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency definitions first
COPY package*.json ./

# Install ALL dependencies (including devDependencies like @swc/core and nest cli)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the NestJS application (creates the /dist folder)
RUN npm run build

# --- Stage 2: Production (Running the code) ---
FROM node:24-alpine AS production

WORKDIR /app

# Copy package.json again so we can install only production deps
COPY package*.json ./

# Install ONLY production dependencies (ignores devDependencies like typescript, swc, eslint)
# This drastically reduces image size
RUN npm ci --omit=dev

# Copy the compiled Javascript from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Set the environment to production
ENV NODE_ENV production

# Start the application using your script
CMD ["npm", "run", "start:prod"]