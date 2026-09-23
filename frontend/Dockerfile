FROM node:20-alpine

WORKDIR /app

# Install dependencies using exact package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source files
COPY . .

# Build the existing React application for production (Vite reads .env automatically)
RUN npm run build

EXPOSE 3000

# Serve the already-built production application via the existing preview script
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]

