from flask import Blueprint, request, jsonify
from adapters.auth_middleware import token_requerido
from infrastructure.repositories.recarga_repository import RecargaRepository
from use_case.recarga_use_cases import RegistrarRecargaUseCase, ObtenerRecargasUseCase

recarga_bp = Blueprint('recarga', __name__)

@recarga_bp.route('/nueva', methods=['POST'])
@token_requerido
def registrar_recarga(usuario_actual):
    datos = request.get_json()
    
    campos_requeridos = ['tipo_servicio', 'monto_invertido', 'monto_generado']
    for campo in campos_requeridos:
        if campo not in datos:
            return jsonify({"error": f"Falta el campo obligatorio: {campo}"}), 400

    repositorio = RecargaRepository()
    caso_uso = RegistrarRecargaUseCase(repositorio)

    try:
        # Extraemos el ID del usuario directamente desde la información del Token decodificado
        usuario_id = usuario_actual['sub'] 
        
        # Ejecutamos pasando los datos y el ID del cajero/admin
        nueva_recarga = caso_uso.ejecutar(datos, usuario_id)
        
        # Calculamos la ganancia neta para mostrarla en la respuesta
        ganancia = float(nueva_recarga.monto_generado) - float(nueva_recarga.monto_invertido)

        return jsonify({
            "mensaje": "Registro de recarga exitoso",
            "recarga_id": nueva_recarga.control_recarga_id,
            "servicio": nueva_recarga.tipo_servicio,
            "ganancia_neta": ganancia
        }), 201
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
@recarga_bp.route('/hoy', methods=['GET'])
@token_requerido
def obtener_recargas_hoy(usuario_actual):
    repositorio = RecargaRepository()
    caso_uso = ObtenerRecargasUseCase(repositorio)
    return jsonify(caso_uso.ejecutar()), 200