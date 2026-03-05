from infrastructure.database import db
from infrastructure.models import Producto

class ProductoRepository:
    def guardar(self, producto):
        db.session.add(producto)
        db.session.commit()
        return producto