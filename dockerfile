FROM node:18

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ .

# Install frontend dependencies and build
COPY frontend/ ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Go back to app directory
WORKDIR /app

# Create public directory for frontend
RUN mkdir -p public
RUN cp -r frontend/dist/* public/

# Expose port (Render utilise le port 10000)
EXPOSE 10000

# Start the application
CMD ["node", "app.js"]