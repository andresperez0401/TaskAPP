from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Date, Time, ForeignKey, Boolean, Float
from datetime import date, time
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from sqlalchemy import LargeBinary
import uuid


db = SQLAlchemy()

# ---------------------------- Usuario ----------------------------

class Usuario(db.Model):
    __tablename__ = 'usuario'

    idUsuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    clave: Mapped[str] = mapped_column(String(120))
  
    def serialize(self):
        return {
            'idUsuario': self.idUsuario,
            'nombre': self.nombre,
            'email': self.email
        }
    

# ---------------------------- Tarea ----------------------------

class Tarea(db.Model):
    __tablename__ = 'tarea'

    idTarea: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(120), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(500), nullable=True)
    completada: Mapped[bool] = mapped_column(Boolean, default=False)
    idUsuario: Mapped[int] = mapped_column(Integer, ForeignKey('usuario.idUsuario'), nullable=False)

    #Para que desde el usuario tambien se pueda acceder a las tareas
    usuario = relationship('Usuario', backref=backref('tareas', lazy=True))

    def serialize(self):
        return {
            'idTarea': self.idTarea,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'completada': self.completada,
            'idUsuario': self.idUsuario
        }