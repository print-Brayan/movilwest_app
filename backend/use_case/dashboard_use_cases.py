from datetime import date, timedelta

class ObtenerDashboardUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self):
        datos = self.repositorio.obtener_kpis()
        hoy = date.today()
        
        # Mapeo de días para evitar problemas de idioma en el servidor Docker
        dias_es = {"Mon":"Lun", "Tue":"Mar", "Wed":"Mié", "Thu":"Jue", "Fri":"Vie", "Sat":"Sáb", "Sun":"Dom"}
        
        # Inicializamos los últimos 7 días en cero
        fechas = [(hoy - timedelta(days=i)) for i in range(6, -1, -1)]
        ventas_semana_dict = {
            f.strftime('%Y-%m-%d'): {
                "dia": dias_es.get(f.strftime('%a'), f.strftime('%a')), 
                "equipos": 0, 
                "recargas": 0
            } for f in fechas
        }
        
        distribucion_dict = {}

        for r in datos["recargas_semana"]:
            fecha_str = r.fecha_registro.strftime('%Y-%m-%d')
            ganancia = float(r.monto_generado - r.monto_invertido)
            
            # Llenar datos para Gráfico de Barras
            if fecha_str in ventas_semana_dict:
                if r.tipo_servicio.startswith('VENTA:'):
                    ventas_semana_dict[fecha_str]["equipos"] += float(r.monto_generado)
                else:
                    ventas_semana_dict[fecha_str]["recargas"] += float(r.monto_generado)
                    
            # Llenar datos para Gráfico Donut (Distribución de transacciones)
            tipo = "Venta Equipos" if r.tipo_servicio.startswith('VENTA:') else r.tipo_servicio
            distribucion_dict[tipo] = distribucion_dict.get(tipo, 0) + 1

        # Si no hay datos, enviamos un estado vacío para el Donut
        datos_servicios = [{"name": k, "value": v} for k, v in distribucion_dict.items()]
        if not datos_servicios:
            datos_servicios = [{"name": "Sin movimientos", "value": 1}]

        return {
            "kpis": {
                "ganancia_hoy": round(datos["ganancia_hoy"], 2),
                "valor_inventario": round(datos["valor_inventario"], 2),
                "equipos_vendidos_mes": datos["equipos_vendidos_mes"],
                "stock_critico": datos["stock_critico"]
            },
            "grafico_barras": list(ventas_semana_dict.values()),
            "grafico_donut": datos_servicios
        }