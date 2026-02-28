# backend/use_cases/usuario_use_cases.py
import bcrypt
from infrastructure.models import Usuario

class RegistrarUsuarioUseCase:
    def __init__(self, repositorio):
        self.repositorio = repositorio

    def ejecutar(self, username, password_plana, rol):
        # 1. Validar si el usuario ya existe
        usuario_existente = self.repositorio.buscar_por_username(username)
        if usuario_existente:
            raise ValueError("El nombre de usuario ya está registrado.")

        # 2. Encriptar la contraseña (¡Nunca guardar contraseñas en texto plano!)
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password_plana.encode('utf-8'), salt).decode('utf-8')

        # 3. Crear el modelo
        nuevo_usuario = Usuario(
            username=username,
            password_hash=password_hash,
            rol=rol,
            activo=True
        )

        # 4. Guardar en base de datos usando el repositorio
        return self.repositorio.guardar(nuevo_usuario)