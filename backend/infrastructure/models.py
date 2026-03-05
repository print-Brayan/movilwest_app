# backend/infrastructure/models.py
from .database import db
from datetime import datetime, timezone, date
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    usuario_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False) # 'ADMIN', 'VENDEDOR'
    activo = db.Column(db.Boolean, default=True)

class Producto(db.Model):
    __tablename__ = 'productos'
    
    producto_id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    categoria = db.Column(db.String(50), nullable=False) # 'TELEFONO', 'ACCESORIO'
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(100), nullable=False)
    costo_usd = db.Column(db.Numeric(10, 2), nullable=False)
    precio_venta_usd = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0)
    foto_url = db.Column(db.String(255), nullable=True)
    fecha_compra = db.Column(db.Date, nullable=True)
    
    # Relación 1 a 1 con especificaciones
    especificaciones = db.relationship('EspecificacionTelefono', backref='producto', uselist=False, cascade="all, delete-orphan")

class EspecificacionTelefono(db.Model):
    __tablename__ = 'especificaciones_telefonos'
    
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.producto_id'), primary_key=True)
    camara = db.Column(db.String(100))
    procesador = db.Column(db.String(100))
    ram = db.Column(db.String(20))
    almacenamiento = db.Column(db.String(50))
    tamano_pantalla = db.Column(db.String(50))
    tipo_pantalla = db.Column(db.String(50))
    red = db.Column(db.String(20))
    tipo_sim = db.Column(db.String(50))
    plug_audio = db.Column(db.Boolean)
    puerto_carga = db.Column(db.String(50))

class ChipMovilnet(db.Model):
    __tablename__ = 'chips_movilnet'
    
    chip_movilnet_id = db.Column(db.Integer, primary_key=True)
    iccid_o_numero = db.Column(db.String(50), unique=True, nullable=False)
    costo_usd = db.Column(db.Numeric(10, 2), nullable=False)
    precio_venta_usd = db.Column(db.Numeric(10, 2), nullable=False)
    plan_vendido = db.Column(db.String(100))
    estado = db.Column(db.String(20), default='DISPONIBLE') # 'DISPONIBLE', 'VENDIDO'
    fecha_venta = db.Column(db.DateTime, nullable=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.usuario_id'), nullable=True)

class ControlRecarga(db.Model):
    __tablename__ = 'control_recargas'
    
    control_recarga_id = db.Column(db.Integer, primary_key=True)
    tipo_servicio = db.Column(db.String(50), nullable=False) # 'MOVILNET', 'AGUA', 'GAS', 'ASEO'
    fecha_registro = db.Column(db.Date, default=datetime.now(timezone.utc).date)
    monto_invertido = db.Column(db.Numeric(10, 2), nullable=False)
    monto_generado = db.Column(db.Numeric(10, 2), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.usuario_id'), nullable=False)

class CajaDiaria(db.Model):
    __tablename__ = 'caja_diaria'
    
    caja_id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date, unique=True, nullable=False, default=date.today)
    
    # Tasas del día fijadas al abrir la caja
    tasa_bcv = db.Column(db.Numeric(10, 4), nullable=False)
    tasa_usdt = db.Column(db.Numeric(10, 4), nullable=False)
    
    # Flujo de Dinero (En Bolívares para cuadrar con el portal)
    saldo_inicial_bs = db.Column(db.Numeric(15, 2), nullable=False)
    inversiones_bs = db.Column(db.Numeric(15, 2), default=0.00)
    
    # Datos de Cierre
    cantidad_operaciones = db.Column(db.Integer, default=0)
    ventas_totales_bs = db.Column(db.Numeric(15, 2), default=0.00)
    
    # Control
    estado = db.Column(db.String(20), default='ABIERTA') # ABIERTA o CERRADA
    usuario_id = db.Column(db.Integer, nullable=True) # Quién abrió/cerró la caja