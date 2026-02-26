# backend/infrastructure/database.py
from flask_sqlalchemy import SQLAlchemy

# Instancia global de la base de datos, separada de la app de Flask
db = SQLAlchemy()