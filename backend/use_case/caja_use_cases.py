from datetime import date

class AbrirCajaUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, saldo_inicial, tasa_bcv, tasa_usdt, usuario_id):
        caja_existente = self.repositorio.obtener_caja_hoy()
        if caja_existente:
            raise ValueError("La caja de hoy ya está abierta.")

        from infrastructure.models import CajaDiaria
        nueva_caja = CajaDiaria(
            fecha=date.today(),
            saldo_inicial_bs=saldo_inicial,
            tasa_bcv=tasa_bcv,
            tasa_usdt=tasa_usdt,
            usuario_id=usuario_id,
            estado='ABIERTA'
        )
        return self.repositorio.guardar(nueva_caja)

class AgregarInversionUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, monto_bs):
        caja = self.repositorio.obtener_caja_hoy()
        if not caja or caja.estado == 'CERRADA':
            raise ValueError("No hay una caja abierta para hoy.")
        
        caja.inversiones_bs = float(caja.inversiones_bs) + float(monto_bs)
        self.repositorio.actualizar()
        return caja

class CerrarCajaUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, operaciones, ventas_totales_bs):
        caja = self.repositorio.obtener_caja_hoy()
        if not caja or caja.estado == 'CERRADA':
            raise ValueError("No hay una caja abierta para cerrar.")
        
        caja.cantidad_operaciones = operaciones
        caja.ventas_totales_bs = ventas_totales_bs
        caja.estado = 'CERRADA'
        self.repositorio.actualizar()
        return caja