from infrastructure.models import ControlRecarga

class RegistrarRecargaUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, datos_recarga, usuario_id):
        # 1. Validación de negocio: No regalar dinero
        if float(datos_recarga['monto_invertido']) < 0 or float(datos_recarga['monto_generado']) < 0:
            raise ValueError("Los montos de la recarga no pueden ser negativos.")
        
        # 2. Armar el registro
        nueva_recarga = ControlRecarga(
            tipo_servicio=datos_recarga['tipo_servicio'],
            monto_invertido=datos_recarga['monto_invertido'],
            monto_generado=datos_recarga['monto_generado'],
            usuario_id=usuario_id # <-- ¡Este es el ID del usuario que hizo login!
        )

        return self.repositorio.guardar(nueva_recarga)