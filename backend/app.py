import os
from flask import Flask, jsonify, request
from flask_migrate import Migrate, upgrade
from flask_cors import CORS
from dotenv import load_dotenv
from models.models import db, Usuario, Tarea  
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)  


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

#---------------------------------------------------- Termina la configuracion de BD --------------------------------------------------



# ------------------------------------------------------------- Configuraciones de JWT ------------------------------------------------

app.config["JWT_SECRET_KEY"] = "backendeandresprivadoparalistadetareas"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

#Lista negra para tokens que hacen logout
blacklist = set()  

#Funcion que checkea si el token está en la lista negra
@jwt.token_in_blocklist_loader
def check_token(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in blacklist

# Mensaje para tokens revocados (lista negra)
@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "error": "Este token fue invalidado. Por favor, haz login de nuevo."
    }), 401

# Mensaje para tokens expirados
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "error": "El token ha expirado. Por favor, vuelve a iniciar sesión."
    }), 401

# ------------------------------------------------------ Terminan las configuraciones de JWT -----------------------------------------



#--------------------------------------------------------------- Rutas ---------------------------------------------------------------

#Ruta base
@app.route('/')
def index():
    return jsonify({"mensaje": "Hola desde Flask!"})


# POST /register: Registro de nuevos usuarios.
# ○ POST /login: Autenticación de usuarios y generación de tokens.
# ○ POST /logout: Invalida el token del usuario.
# ○ GET /tasks: Devuelve las tareas del usuario autenticado.
# ○ POST /tasks: Crea una nueva tarea asociada al usuario autenticado.
# ○ PUT /tasks/<id>: Actualiza una tarea existente.
# ○ DELETE /tasks/<id>: Elimina una tarea.


#------------------------------------------------------- Usuario -----------------------------------------------------------------------

# Ruta para crear un nuevo usuario
@app.route('/register', methods=['POST'])
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
    
    hashed = generate_password_hash(data['clave'],
                                    method='pbkdf2:sha256',
                                    salt_length=16)
    
    # Validamos que el email ingresado no exista en base de datos 
    if Usuario.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'El email ya está en uso'}), 400
    
    # Creamos el nuevo usuario
    nuevo_usuario = Usuario(
        nombre=data['nombre'],
        email=data['email'],
        clave=hashed 
    )

    # Agregamos el nuevo usuario a la sesión y lo guardamos en la base de datos
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({"mensaje": "Usuario creado exitosamente", "usuario": nuevo_usuario.serialize()}), 201



# Ruta para obtener todos los usuarios
@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuario.query.all()
    return jsonify([u.serialize() for u in usuarios]), 200



# Ruta para hacer login
@app.route('/login', methods=['POST'])
def login():

    # Se valida que hayan datos en el cuerpo de la solicitud, en este caso requerido el email y la clave
    data = request.get_json() or {}
    if not data:
        return jsonify({'error': 'No se recibieron datos'}), 400
    
    # Se valida que lleguen todos los campos necesarios en la solicitud
    required_fields = ['email', 'clave']
    empty_fields = [field for field in required_fields if not data.get(field)]
    if empty_fields:
        return jsonify({
            'error': 'Algunos campos están vacíos o faltan',
            'Campos vacíos o faltantes': empty_fields
        }), 400
    
    # Buscamos al usuario por email
    usuario = Usuario.query.filter_by(email=data.get('email')).first()
    # Si no se encuentra el usuario, devolvemos un error
    if not usuario:
        return jsonify({'error': 'email o clave incorrectos'}), 401
    
    # Verificamos la clave ingresada con la almacenada en la base de datos
    if not check_password_hash(usuario.clave, data.get('clave')):
        return jsonify({'error': 'clave incorrecta'}), 401
    
    # Si se encuentra el usuario, generamos un token de acceso
    access_token = create_access_token(
        identity=usuario.email,
        expires_delta=timedelta(hours=1)
    )

    return jsonify({'mensaje' : 'Usuario Logeado Exitosamente', 'usuario' : usuario.serialize(), 'token': access_token}), 200



# Ruta para cerrar sesión
@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():

    # Obtenemos el token actual
    jti = get_jwt()['jti']

    # Agregamos el token a la lista negra para invalidarlo
    blacklist.add(jti)

    return jsonify({'mensaje': 'Logout exitoso'}), 200


#------------------------------------------------------- Terminan las rutas de Usuario ----------------------------------------------------------



#----------------------------------------------------------------- Tareas -----------------------------------------------------------------------


# Ruta para obtener las tareas del usuario autenticado
@app.route('/tasks', methods=['GET'])
@jwt_required()
def obtener_tareas():

    # Obtenemos el email del usuario autenticado
    email = get_jwt_identity()

    # Buscamos al usuario por email
    usuario = Usuario.query.filter_by(email=email).first()
    
    # Si no se encuentra el usuario, devolvemos un error
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Obtenemos las tareas del usuario
    tareas = usuario.tareas

    return jsonify([t.serialize() for t in tareas]), 200



# Ruta para crear una nueva tarea
@app.route('/tasks', methods=['POST'])
@jwt_required()
def crear_tarea():

    # Obtenemos el email del usuario autenticado
    email = get_jwt_identity()

    # Buscamos al usuario por email
    usuario = Usuario.query.filter_by(email=email).first()
    
    # Si no se encuentra el usuario, devolvemos un error
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Se valida que hayan datos en el cuerpo de la solicitud
    data = request.get_json() or {}
    if not data:
        return jsonify({'error': 'No se recibieron datos'}), 400
    
    # Se valida que lleguen todos los campos necesarios en la solicitud
    required_fields = ['titulo']
    empty_fields = [f for f in required_fields if not data.get(f)]
    if empty_fields:
        return jsonify({
            'error': 'Algunos campos están vacíos o faltan',
            'Campos vacíos o faltantes': empty_fields
        }), 400
    
    # Creamos la nueva tarea
    nueva_tarea = Tarea(
        titulo=data['titulo'],
        descripcion=data.get('descripcion', ''), 
        completada = False,
        idUsuario=usuario.idUsuario
    )

    # Agregamos la nueva tarea a la sesión y la guardamos en la base de datos
    db.session.add(nueva_tarea)
    db.session.commit()

    return jsonify({"mensaje": "Tarea creada exitosamente", "tarea": nueva_tarea.serialize()}), 201



# Ruta para actualizar una tarea
@app.route('/tasks/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_tarea(id):

    # Obtenemos el email del usuario autenticado
    email = get_jwt_identity()

    # Buscamos al usuario por email
    usuario = Usuario.query.filter_by(email=email).first()
    
    # Si no se encuentra el usuario, devolvemos un error
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Buscamos la tarea por id
    tarea = Tarea.query.filter_by(idTarea=id, idUsuario=usuario.idUsuario).first()
    
    # Si no se encuentra la tarea, devolvemos un error
    if not tarea:
        return jsonify({'error': 'Tarea no encontrada para el usuario: ' + email}), 404
    
    # Se valida que hayan datos en el cuerpo de la solicitud
    data = request.get_json() or {}
    
    # Actualizamos los campos de la tarea
    tarea.titulo = data.get('titulo', tarea.titulo)
    tarea.descripcion = data.get('descripcion', tarea.descripcion)
    tarea.completada = data.get('completada', tarea.completada)

    # Guardamos los cambios en la base de datos
    db.session.commit()

    return jsonify({"mensaje": "Tarea actualizada exitosamente", "tarea": tarea.serialize()}), 200



# Ruta para eliminar una tarea
@app.route('/tasks/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_tarea(id):

    # Obtenemos el email del usuario autenticado
    email = get_jwt_identity()

    # Buscamos al usuario por email
    usuario = Usuario.query.filter_by(email=email).first()
    
    # Si no se encuentra el usuario, devolvemos un error
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Buscamos la tarea por id
    tarea = Tarea.query.filter_by(idTarea=id, idUsuario=usuario.idUsuario).first()
    
    # Si no se encuentra la tarea, devolvemos un error
    if not tarea:
        return jsonify({'error': 'Tarea no encontrada para el usuario: ' + email}), 404
    
    # Eliminamos la tarea de la base de datos
    db.session.delete(tarea)
    db.session.commit()

    return jsonify({"mensaje": "Tarea eliminada exitosamente"}), 200


#------------------------------------------------------- Terminan las rutas de Tareas ----------------------------------------------------------



if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Ejecuta la aplicación en el puerto 5000	
