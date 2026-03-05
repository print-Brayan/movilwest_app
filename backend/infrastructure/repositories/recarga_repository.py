from infrastructure.database import db
from infrastructure.models import ControlRecarga
from datetime import date

class RecargaRepository:
    def guardar(self, recarga):
        db.session.add(recarga)
        db.session.commit()
        return recarga
    
    def obtener_todos(self):
        return ControlRecarga.query.all()
    
    def obtener_del_dia(self):
        """Busca solo las transacciones financieras que ocurrieron hoy."""
        hoy = date.today()
        # Filtramos directamente en PostgreSQL
        return ControlRecarga.query.filter(ControlRecarga.fecha_registro == hoy).all()