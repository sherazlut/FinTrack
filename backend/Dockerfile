FROM node:20-alpine

WORKDIR /app

# Package files copy karein (dependency caching ke liye)
COPY package*.json ./

# Dependencies install karein
RUN npm ci --only=production

# Source code copy karein
COPY . .

# Port expose karein
EXPOSE 5000

# Server start karein
CMD ["npm", "start"]

