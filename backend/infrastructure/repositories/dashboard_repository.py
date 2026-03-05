from infrastructure.database import db
from infrastructure.models import Producto, ControlRecarga
from datetime import date, timedelta

class DashboardRepository:
    def obtener_kpis(self):
        hoy = date.today()
        inicio_mes = hoy.replace(day=1)
        hace_7_dias = hoy - timedelta(days=6)

        # 1. Inventario Total y Stock Crítico
        productos = Producto.query.all()
        valor_inventario = sum([float(p.costo_usd) * p.stock for p in productos])
        stock_critico = sum([1 for p in productos if p.stock <= 3])

        # 2. Finanzas de Hoy
        recargas_hoy = ControlRecarga.query.filter(ControlRecarga.fecha_registro == hoy).all()
        ganancia_hoy = sum([float(r.monto_generado - r.monto_invertido) for r in recargas_hoy])

        # 3. Equipos vendidos este mes
        recargas_mes = ControlRecarga.query.filter(ControlRecarga.fecha_registro >= inicio_mes).all()
        equipos_vendidos_mes = sum([1 for r in recargas_mes if r.tipo_servicio.startswith('VENTA:')])

        # 4. Historial de la última semana para las gráficas
        recargas_semana = ControlRecarga.query.filter(ControlRecarga.fecha_registro >= hace_7_dias).all()

        return {
            "valor_inventario": valor_inventario,
            "ganancia_hoy": ganancia_hoy,
            "stock_critico": stock_critico,
            "equipos_vendidos_mes": equipos_vendidos_mes,
            "recargas_semana": recargas_semana
        }