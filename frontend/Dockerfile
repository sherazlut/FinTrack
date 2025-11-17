FROM node:20-alpine

WORKDIR /app

# Package files copy karein
COPY package*.json ./

# Dependencies install karein
RUN npm install

# Source code copy karein
COPY . .

# Port expose karein (Vite default port)
EXPOSE 5173

# Development server start karein
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

