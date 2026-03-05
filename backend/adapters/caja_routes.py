from flask import Blueprint, request, jsonify
from adapters.auth_middleware import token_requerido
from infrastructure.repositories.caja_repository import CajaRepository
from use_case.caja_use_cases import AbrirCajaUseCase, AgregarInversionUseCase, CerrarCajaUseCase
from infrastructure.services.tasa_cambio_service import TasaCambioService

caja_bp = Blueprint('caja', __name__)

@caja_bp.route('/tasas', methods=['GET'])
@token_requerido
def obtener_tasas(usuario_actual):
    # Llama al servicio de Web Scraping que creamos antes
    tasas = TasaCambioService.obtener_tasas()
    return jsonify(tasas), 200

@caja_bp.route('/hoy', methods=['GET'])
@token_requerido
def estado_caja(usuario_actual):
    repositorio = CajaRepository()
    caja = repositorio.obtener_caja_hoy()
    
    if not caja:
        return jsonify({"estado": "NO_ABIERTA"}), 200
        
    return jsonify({
        "estado": caja.estado,
        "saldo_inicial_bs": float(caja.saldo_inicial_bs),
        "inversiones_bs": float(caja.inversiones_bs),
        "tasa_bcv": float(caja.tasa_bcv),
        "tasa_usdt": float(caja.tasa_usdt)
    }), 200

@caja_bp.route('/abrir', methods=['POST'])
@token_requerido
def abrir_caja(usuario_actual):
    datos = request.get_json()
    usuario_id = usuario_actual.get('usuario_id') or usuario_actual.get('id')
    
    repositorio = CajaRepository()
    caso_uso = AbrirCajaUseCase(repositorio)
    
    try:
        caja = caso_uso.ejecutar(
            saldo_inicial=datos['saldo_inicial_bs'],
            tasa_bcv=datos['tasa_bcv'],
            tasa_usdt=datos['tasa_usdt'],
            usuario_id=usuario_id
        )
        return jsonify({"mensaje": "Caja abierta exitosamente"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# (Puedes agregar aquí las rutas /inversion y /cerrar siguiendo el mismo patrón)