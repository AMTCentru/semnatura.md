# Folosim o imagine de bază cu Node.js
FROM node:18

# Instalăm bibliotecile necesare pentru Chrome
RUN apt-get update && apt-get install -y \
    wget \
    libnss3 \
    libxss1 \
    libgconf-2-4 \
    libxi6 \
    libxcursor1 \
    libxcomposite1 \
    libxrandr2 \
    libasound2 \
    libcups2 \
    libatk1.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libdrm2 \
    libgbm1 \
    libpangocairo-1.0-0 \
    libpango1.0-0 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Setăm directorul de lucru
WORKDIR /usr/src/app

# Copiem package.json și package-lock.json
COPY package*.json ./

# Instalăm dependențele
RUN npm install

# Copiem restul fișierelor aplicației
COPY . .

# Comanda pentru a rula aplicația
CMD ["npm", "start"]