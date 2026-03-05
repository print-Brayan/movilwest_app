from flask import Blueprint, request, jsonify
from adapters.auth_middleware import token_requerido
from infrastructure.repositories.producto_repository import ProductoRepository
from use_case.producto_use_cases import RegistrarProductoUseCase

producto_bp = Blueprint('producto', __name__)

@producto_bp.route('/nuevo', methods=['POST'])
@token_requerido
def registrar_producto(usuario_actual):
    # Opcional: Podemos usar la información del token para dar permisos
    if usuario_actual.get('rol') != 'ADMIN':
        return jsonify({"error": "No tienes permisos para agregar productos."}), 403

    datos = request.get_json()
    
    # Validamos que no falte ningún dato en el paquete JSON
    campos_requeridos = ['sku', 'categoria', 'marca', 'modelo', 'costo_usd', 'precio_venta_usd', 'stock']
    for campo in campos_requeridos:
        if campo not in datos:
            return jsonify({"error": f"Falta el campo obligatorio: {campo}"}), 400

    repositorio = ProductoRepository()
    caso_uso = RegistrarProductoUseCase(repositorio)

    try:
        nuevo_producto = caso_uso.ejecutar(datos)
        return jsonify({
            "mensaje": "Producto registrado en el inventario exitosamente",
            "producto_id": nuevo_producto.producto_id, # Ajusta el ID según tu modelo
            "modelo": nuevo_producto.modelo
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400