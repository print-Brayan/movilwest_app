from flask import Blueprint, jsonify
from adapters.auth_middleware import token_requerido
from infrastructure.repositories.dashboard_repository import DashboardRepository
from use_case.dashboard_use_cases import ObtenerDashboardUseCase

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@token_requerido
def obtener_estadisticas(usuario_actual):
    repositorio = DashboardRepository()
    caso_uso = ObtenerDashboardUseCase(repositorio)
    
    try:
        datos = caso_uso.ejecutar()
        return jsonify(datos), 200
    except Exception as e:
        print(f"Error en Dashboard: {str(e)}")
        return jsonify({"error": "Error interno al cargar dashboard"}), 500