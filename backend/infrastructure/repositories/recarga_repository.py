from infrastructure.database import db
from infrastructure.models import ControlRecarga
from datetime import date

class RecargaRepository:
    def guardar(self, recarga):
        db.session.add(recarga)
        db.session.commit()
        return recarga

    def obtener_hoy(self):
        return ControlRecarga.query.filter_by(fecha_registro=date.today()).all()