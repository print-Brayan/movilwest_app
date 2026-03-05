import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from adapters.auth_middleware import token_requerido
from infrastructure.repositories.producto_repository import ProductoRepository
from infrastructure.repositories.recarga_repository import RecargaRepository # 👈 NUEVO IMPORT
from use_case.producto_use_cases import RegistrarProductoUseCase, ObtenerProductosUseCase, EliminarProductoUseCase, VenderProductoUseCase

# Configuración de carpetas y formatos
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

producto_bp = Blueprint('producto', __name__)

def allowed_file(filename):
    """Verifica si la extensión del archivo está permitida."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@producto_bp.route('/nuevo', methods=['POST'])
@token_requerido
def registrar_producto(usuario_actual):
    if usuario_actual.get('rol') != 'ADMIN':
        return jsonify({"error": "No tienes permisos para agregar productos."}), 403

    datos = request.form.to_dict()
    
    campos_requeridos = ['sku', 'categoria', 'marca', 'modelo', 'costo_usd', 'precio_venta_usd', 'stock']
    for campo in campos_requeridos:
        if campo not in datos:
            return jsonify({"error": f"Falta el campo obligatorio: {campo}"}), 400

    foto_url = datos.get('foto_url')
    if 'foto' in request.files:
        file = request.files['foto']
        if file and file.filename != '' and allowed_file(file.filename):
            nombre_archivo = secure_filename(f"{datos['sku']}_{file.filename}")
            ruta_destino = os.path.join('/app/uploads', nombre_archivo)
            os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)
            file.save(ruta_destino)
            foto_url = f"/uploads/{nombre_archivo}"

    datos['foto_url'] = foto_url
    repositorio = ProductoRepository()
    caso_uso = RegistrarProductoUseCase(repositorio)

    try:
        nuevo_producto = caso_uso.ejecutar(datos)
        return jsonify({
            "mensaje": "Producto registrado en el inventario exitosamente",
            "producto_id": nuevo_producto.producto_id,
            "modelo": nuevo_producto.modelo,
            "foto_url": foto_url
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@producto_bp.route('/', methods=['GET'])
@token_requerido
def obtener_inventario(usuario_actual):
    repositorio = ProductoRepository()
    caso_uso = ObtenerProductosUseCase(repositorio)
    try:
        lista = caso_uso.ejecutar()
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@producto_bp.route('/<int:id>', methods=['DELETE'])
@token_requerido
def eliminar_producto(usuario_actual, id):
    if usuario_actual.get('rol') != 'ADMIN':
        return jsonify({"error": "No tienes permisos"}), 403
    
    repositorio = ProductoRepository()
    caso_uso = EliminarProductoUseCase(repositorio)
    if caso_uso.ejecutar(id):
        return jsonify({"mensaje": "Producto eliminado"}), 200
    return jsonify({"error": "No encontrado"}), 404


@producto_bp.route('/vender/<int:id>', methods=['POST'])
@token_requerido
def vender_producto(usuario_actual, id):
    datos = request.get_json()
    cantidad = int(datos.get('cantidad', 1))

    # 1. 🔍 MODO DEPURACIÓN: Imprimimos en la consola de Docker qué trae tu token
    print(f"🔴 CONTENIDO DEL TOKEN: {usuario_actual}")

    # 2. Intentamos atrapar el ID probando los nombres más comunes
    id_del_vendedor = (
        usuario_actual.get('usuario_id') or 
        usuario_actual.get('id') or 
        usuario_actual.get('sub') or 
        usuario_actual.get('id_usuario')
    )

    # 3. 🛡️ SEGURO ANTI-FALLOS: Si no hay ID, abortamos ANTES de tocar el stock
    if not id_del_vendedor:
        return jsonify({
            "error": "Error de sesión: El token no contiene un ID válido. Revisa los logs del servidor."
        }), 401

    repositorio_prod = ProductoRepository()
    repositorio_fin = RecargaRepository()
    caso_uso = VenderProductoUseCase(repositorio_prod, repositorio_fin)
    
    try:
        producto = caso_uso.ejecutar(id, cantidad, id_del_vendedor)
        return jsonify({
            "mensaje": "Venta procesada con éxito", 
            "nuevo_stock": producto.stock
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"🔴 ERROR EN BD: {str(e)}")
        return jsonify({"error": "Error interno al procesar la venta"}), 500