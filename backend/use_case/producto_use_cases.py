from infrastructure.models import Producto

class RegistrarProductoUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, datos_producto):
        # 1. Reglas de negocio: El costo y el stock deben ser lógicos
        if float(datos_producto['costo_usd']) <= 0:
            raise ValueError("El costo del producto debe ser mayor a cero.")
        
        if int(datos_producto['stock']) < 0:
            raise ValueError("El stock no puede ser negativo.")

        # 2. Construir el objeto Producto
        # Asegúrate de que estos nombres coincidan con las columnas de tu models.py
        # 2. Construir el objeto Producto
        nuevo_producto = Producto(
            sku=datos_producto['sku'],
            categoria=datos_producto['categoria'],
            marca=datos_producto['marca'],
            modelo=datos_producto['modelo'],
            costo_usd=datos_producto['costo_usd'],
            precio_venta_usd=datos_producto['precio_venta_usd'],
            stock=datos_producto['stock']
        )

        # 3. Guardar en la base de datos
        return self.repositorio.guardar(nuevo_producto)

class ObtenerProductosUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self):
        productos = self.repositorio.obtener_todos()
        
        # Transformamos la lista de objetos en una lista de diccionarios
        lista_productos = []
        for p in productos:
            lista_productos.append({
                "producto_id": p.producto_id, # Ajusta esto si tu ID se llama diferente
                "sku": p.sku,
                "categoria": p.categoria,
                "marca": p.marca,
                "modelo": p.modelo,
                # Convertimos los precios a float por si la BD los devuelve como Decimal
                "precio_venta_usd": float(p.precio_venta_usd), 
                "stock": p.stock
            })
            
        return lista_productos