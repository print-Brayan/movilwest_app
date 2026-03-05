from infrastructure.models import ControlRecarga
from datetime import datetime, timezone

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
            usuario_id=usuario_id,
            fecha_registro=datetime.now(timezone.utc)
        )

        return self.repositorio.guardar(nueva_recarga)

class ObtenerRecargasUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self):
        # 👇 CAMBIAMOS la función que llamamos aquí:
        # Antes decía: self.repositorio.obtener_todos()
        recargas = self.repositorio.obtener_del_dia() 
        
        lista_recargas = []
        for r in recargas:
            lista_recargas.append({
                "control_recarga_id": r.control_recarga_id,
                "tipo_servicio": r.tipo_servicio,
                "monto_invertido": float(r.monto_invertido),
                "monto_generado": float(r.monto_generado),
                # Formateamos la fecha si existe para evitar errores en React
                "fecha_registro": r.fecha_registro.strftime('%Y-%m-%d') if r.fecha_registro else None,
                "usuario_id": r.usuario_id
            })
            
        return lista_recargas