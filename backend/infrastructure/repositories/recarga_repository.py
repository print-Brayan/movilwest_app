from infrastructure.database import db
from infrastructure.models import ControlRecarga

class RecargaRepository:
    def guardar(self, recarga):
        db.session.add(recarga)
        db.session.commit()
        return recarga