FROM node:18-alpine

WORKDIR /app

# Copia los archivos de configuración
COPY package.json package-lock.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Puerto que expone Vite por defecto
EXPOSE 5173

# Comando para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 