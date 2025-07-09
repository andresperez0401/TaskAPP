import os
from flask import Flask, jsonify, request
from flask_migrate import Migrate, upgrade
from flask_cors import CORS
from dotenv import load_dotenv
from models.models import db, Usuario  
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

load_dotenv()

app = Flask(__name__)
CORS(app)  # Permite solicitudes desde otros orígenes (React)


#----------------------------------------------------- Base de Datos -----------------------------------------------------------------

# 1) Armamos la ruta al archivo SQLite
base_dir = os.path.dirname(os.path.realpath(__file__))  # carpeta backend/
ruta_sqlite = os.path.join(base_dir, "sqlite", "database.db")
default_uri = f"sqlite:///{ruta_sqlite}"

# 2) Usa DATABASE_URL si está definido, si no, SQLite local
db_uri = os.getenv("DATABASE_URL", default_uri).replace("postgres://", "postgresql://")
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
Migrate(app, db, compare_type=True)

#---------------------------------------------------- Termina la BD configuración -----------------------------------------------------


#----------------------------------------------------- Rutas --------------------------------------------------------------------------

#Ruta base
@app.route('/')
def index():
    return jsonify({"mensaje": "Hola desde Flask!"})



#------------------------------------------------------- Usuario -----------------------------------------------------------------------


# Ruta para crear un nuevo usuario
@app.route('/usuarios', methods=['POST'])
def crear_usuario():
    
    # Se valida que hayan datos en el cuerpo de la solicitud
    data = request.get_json() or {}
    if not data:
        return jsonify({'error': 'No se recibieron datos'}), 400
    
    # Se valida que lleguen todos los campos necesarios en la solicitud
    required_fields = ['nombre', 'email', 'clave']
    empty_fields = [f for f in required_fields if not data.get(f)]
    if empty_fields:
        return jsonify({
            'error': 'Algunos campos están vacíos o faltan',
            'Campos vacíos o faltantes': empty_fields
        }), 400
    
    # Validamos que el email ingresado no exista en base de datos 
    if Usuario.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'El email ya está en uso'}), 400
    
    # Creamos el nuevo usuario
    nuevo_usuario = Usuario(
        nombre=data['nombre'],
        email=data['email'],
        clave=data['clave'] 
    )

    # Agregamos el nuevo usuario a la sesión y lo guardamos en la base de datos
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({"mensaje": "Usuario creado exitosamente", "usuario": nuevo_usuario.serialize()}), 201

#Finaliza la ruta de creación de usuario
#----------------------------------------------------------------------------------------------------------------



# Ruta para obtener todos los usuarios
@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([u.serialize() for u in usuarios]), 200



if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Ejecuta la aplicación en el puerto 5000	
