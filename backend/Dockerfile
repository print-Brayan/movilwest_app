# Usamos una versión ligera de Python
FROM python:3.12-slim

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Le decimos a Docker en qué carpeta trabajar dentro del contenedor
WORKDIR /app

# Copiamos el archivo de requerimientos primero
COPY requirements.txt .

# Instalamos las librerías
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código de tu backend
COPY . .

# Comando por defecto al encender el contenedor
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]