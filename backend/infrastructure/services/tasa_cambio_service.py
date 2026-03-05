class TasaCambioService:
    @staticmethod
    def obtener_tasas():
        # Devolvemos 0.0 por defecto para que el contenedor nunca colapse.
        # El usuario ingresará la tasa manualmente en la interfaz de React.
        return {
            "bcv": 0.0,
            "usdt": 0.0,
            "error": "Consulta automática en mantenimiento. Ingrese la tasa manualmente."
        }