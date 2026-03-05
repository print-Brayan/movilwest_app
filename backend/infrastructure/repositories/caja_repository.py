from infrastructure.database import db
from infrastructure.models import CajaDiaria
from datetime import date

class CajaRepository:
    def obtener_caja_hoy(self):
        hoy = date.today()
        return CajaDiaria.query.filter_by(fecha=hoy).first()

    def guardar(self, caja):
        db.session.add(caja)
        db.session.commit()
        return caja

    def actualizar(self):
        # SQLAlchemy hace el tracking automático, solo necesitamos el commit
        db.session.commit()