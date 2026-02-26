# Usamos una versión ligera y reciente de Node.js
FROM node:20-alpine

RUN apk update && apk upgrade

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias (esto optimiza la caché de Docker)
COPY package.json package-lock.json* ./

# Instalamos las dependencias de React/Vite
RUN npm install

# Copiamos el resto del código de tu frontend
COPY . .

# Exponemos el puerto por defecto de Vite
EXPOSE 5173

# Comando para encender el servidor de desarrollo en la red local de Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]