import bcrypt
import jwt
import datetime
import os

class LoginUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, username, password_plana):
        # 1. Buscar al usuario en la base de datos
        usuario = self.repositorio.buscar_por_username(username)
        if not usuario:
            raise ValueError("Usuario o contraseña incorrectos")

        # 2. Verificar que la contraseña coincida con el Hash guardado
        # Convertimos ambas a bytes ('utf-8') porque bcrypt trabaja en ese formato
        if not bcrypt.checkpw(password_plana.encode('utf-8'), usuario.password_hash.encode('utf-8')):
            raise ValueError("Usuario o contraseña incorrectos")

        # 3. Fabricar el Token VIP (JWT)
        # Usamos una clave secreta (si no está en las variables de entorno, usamos una por defecto)
        secret_key = os.environ.get('JWT_SECRET', 'clave-super-secreta-movilwest-2026')
        
        # El "payload" es la información que viajará dentro del token
        payload = {
            'sub': usuario.usuario_id,                  # Subject (A quién pertenece)
            'username': usuario.username,
            'rol': usuario.rol,
            'iat': datetime.datetime.now(datetime.timezone.utc), # Emitido ahora mismo
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1) # Expira en 1 día
        }
        
        # Firmamos el token
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        
        return token, usuario