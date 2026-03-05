from infrastructure.database import db
from infrastructure.models import Producto

class ProductoRepository:
    def guardar(self, producto):
        db.session.add(producto)
        db.session.commit()
        return producto
    
    def obtener_todos(self):
        return Producto.query.all()
    
    def obtener_por_id(self, producto_id):
        return Producto.query.get(producto_id)
    
    def eliminar(self, producto_id):
        producto = Producto.query.get(producto_id)
        if producto:
            db.session.delete(producto)
            db.session.commit()
            return True
        return False

    def actualizar_stock(self, producto_id, nuevo_stock):
        producto = Producto.query.get(producto_id)
        if producto:
            producto.stock = nuevo_stock
            db.session.commit()
            return producto
        return None