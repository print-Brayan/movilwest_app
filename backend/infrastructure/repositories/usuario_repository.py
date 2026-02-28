# backend/infrastructure/repositories/usuario_repository.py
from infrastructure.database import db
from infrastructure.models import Usuario

class UsuarioRepository:
    def guardar(self, usuario):
        db.session.add(usuario)
        db.session.commit()
        return usuario

    def buscar_por_username(self, username):
        return Usuario.query.filter_by(username=username).first()