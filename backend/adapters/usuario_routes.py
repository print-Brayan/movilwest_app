# backend/adapters/usuario_routes.py
from flask import Blueprint, request, jsonify
from infrastructure.repositories.usuario_repository import UsuarioRepository
from use_cases.usuario_use_cases import RegistrarUsuarioUseCase

# Creamos un "Blueprint" que es como un mini-módulo de rutas en Flask
usuario_bp = Blueprint('usuario', __name__)

@usuario_bp.route('/registro', methods=['POST'])
def registrar_usuario():
    # Extraemos el JSON que nos envía el frontend
    datos = request.get_json()
    username = datos.get('username')
    password = datos.get('password')
    rol = datos.get('rol', 'VENDEDOR') # Si no envían rol, por defecto es VENDEDOR

    if not username or not password:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # Instanciamos nuestras capas limpias
    repositorio = UsuarioRepository()
    caso_uso = RegistrarUsuarioUseCase(repositorio)

    try:
        # Ejecutamos la lógica de negocio
        nuevo_usuario = caso_uso.ejecutar(username, password, rol)
        return jsonify({
            "mensaje": "Usuario creado exitosamente",
            "usuario_id": nuevo_usuario.usuario_id,
            "username": nuevo_usuario.username,
            "rol": nuevo_usuario.rol
        }), 201 # 201 significa "Creado"
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400