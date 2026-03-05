# backend/adapters/auth_middleware.py
from functools import wraps
from flask import request, jsonify
import jwt
import os

def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = None
        
        # El token debe venir en los "Headers" de la petición bajo la etiqueta "Authorization"
        if 'Authorization' in request.headers:
            # El formato estándar es "Bearer <token>", así que lo separamos
            partes = request.headers['Authorization'].split()
            if len(partes) == 2 and partes[0] == 'Bearer':
                token = partes[1]

        if not token:
            return jsonify({"error": "Falta el token de autorización"}), 401

        try:
            secret_key = os.environ.get('JWT_SECRET', 'clave-super-secreta-movilwest-2026')
            # Decodificamos el token. Si expiró o es falso, esto lanzará un error
            data_usuario = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Pasamos los datos del usuario a la ruta por si los necesita
            usuario_actual = data_usuario 
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "El token ha expirado. Inicia sesión de nuevo."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        # Si todo está bien, dejamos que la petición continúe hacia la ruta original
        return f(usuario_actual, *args, **kwargs)

    return decorador