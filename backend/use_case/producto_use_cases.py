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
            stock=datos_producto['stock'],
            foto_url=datos_producto.get('foto_url')
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
                "producto_id": p.producto_id, 
                "sku": p.sku,
                "categoria": p.categoria,
                "marca": p.marca,
                "modelo": p.modelo,
                "precio_venta_usd": float(p.precio_venta_usd), 
                "stock": p.stock,
                "foto_url": p.foto_url
            })
            
        return lista_productos

class EliminarProductoUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, producto_id):
        return self.repositorio.eliminar(producto_id)

class VenderProductoUseCase:
    def __init__(self, repositorio_prod, repositorio_fin):
        self.repositorio_prod = repositorio_prod
        self.repositorio_fin = repositorio_fin

    def ejecutar(self, producto_id, cantidad, usuario_id):
        producto = self.repositorio_prod.obtener_por_id(producto_id)
        
        if not producto or producto.stock < cantidad:
            raise ValueError(f"Stock insuficiente. Solo quedan {producto.stock} unidades.")

        # Calculamos la ganancia total para el registro financiero
        inversion_total = float(producto.costo_usd) * cantidad
        venta_total = float(producto.precio_venta_usd) * cantidad
        
        # Descontamos del inventario
        nuevo_stock = producto.stock - cantidad
        self.repositorio_prod.actualizar_stock(producto_id, nuevo_stock)

        # Registramos la transacción en el control de recargas
        from infrastructure.models import ControlRecarga
        nueva_transaccion = ControlRecarga(
            tipo_servicio=f"VENTA: {producto.marca} {producto.modelo}",
            monto_invertido=inversion_total,
            monto_generado=venta_total,
            usuario_id=usuario_id 
        )
        self.repositorio_fin.guardar(nueva_transaccion)

        return producto
    