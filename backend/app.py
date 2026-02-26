import os
from flask import Flask, jsonify
from flask_cors import CORS

# Importamos la instancia de la base de datos y los modelos
from infrastructure.database import db
from infrastructure.models import *

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configuración de la base de datos leyendo la variable de entorno de Docker
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializamos la base de datos con la app de Flask
    db.init_app(app)
    
    # Este bloque crea las tablas en PostgreSQL automáticamente si no existen
    with app.app_context():
        db.create_all()

    @app.route('/api/status', methods=['GET'])
    def status():
        return jsonify({
            "estado": "ok", 
            "mensaje": "¡Base de datos conectada y estructurada!"
        })

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)