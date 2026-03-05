from flask import Flask, jsonify
from flask_cors import CORS

from infrastructure.config import build_database_url
from infrastructure.database import db
from infrastructure.models import *


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = build_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Importamos y registramos nuestras rutas
    from adapters.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix='/api/usuarios')

    from adapters.producto_routes import producto_bp
    app.register_blueprint(producto_bp, url_prefix='/api/productos')

    from adapters.recarga_routes import recarga_bp
    app.register_blueprint(recarga_bp, url_prefix='/api/recargas')

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