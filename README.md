
# TaskApp 

App web para gestionar tareas, desarrollada con:

- 🔙 **Backend:** Flask, SQLAlchemy, JWT  
- ⚛️ **Frontend:** React + Vite  
- 🐍 **Base de Datos:** SQLite 

---

## 📁 Estructura del proyecto

```
taskapp/
├── backend/     # API en Flask
└── frontend/    # App React
```

---

## ⚙️ Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- Python 3.9 o mayor 
- Node.js (v16 o superior) y npm  
- pipenv (opcional pero recomendado)

---

## 🚀 Instrucciones de instalación

### 1️⃣ Backend (Flask API)

#### Paso 1: Entrar al directorio raíz del proyecto

```bash
cd backend
```

#### Paso 2: Crear entorno virtual e instalar dependencias

**Con pipenv (recomendado):**

```bash
pipenv install
pipenv shell
```

#### Paso 3: Inicializar la base de datos con Flask-Migrate

```bash
flask db init                 # Solo la primera vez
flask db migrate -m "Initial migration"
flask db upgrade
```

#### Paso 4: Levantar el servidor

```bash
flask run
```

El backend quedará activo en:  
📍 `http://localhost:5000`

---

### 2️⃣ Frontend (React + Vite)

#### Paso 1: Entrar al directorio

```bash
cd frontend
```

#### Paso 2: Instalar dependencias

```bash
npm install
```

#### Paso 3: Crear archivo `.env` en frontend (opcional)

```env

# Dirección del backend

VITE_BACKEND_URL=http://localhost:5000
```

#### Paso 4: Levantar el frontend

```bash
npm run dev
```

Abre tu navegador en:  
📍 `http://localhost:5173`

#### 🔹 Paso 5: Generar build (si lo necesitas)

```bash
npm run build
```

---

## 🔐 Endpoints de la API

| Método | Ruta            | Descripción                    | Requiere JWT |
|--------|-----------------|--------------------------------|--------------|
| POST   | /register       | Registrar nuevo usuario        | ❌           |
| POST   | /login          | Login y obtener token          | ❌           |
| POST   | /logout         | Logout del usuario             | ✅           |
| GET    | /tasks          | Listar tareas del usuario      | ✅           |
| POST   | /tasks          | Crear nueva tarea              | ✅           |
| PUT    | /tasks/:id      | Editar tarea                   | ✅           |
| DELETE | /tasks/:id      | Eliminar tarea                 | ✅           |

**Importante:** Para las rutas protegidas debes enviar el token en el header:

```
Authorization: Bearer <tu_token>
```

---

---

## ✍️

Desarrollado por **Andrés Pérez**  
🧠 Egresado de Ingeniería Informática de la UCAB.
🧠 Certificado en Desarrollo Full Stack por 4Geeks Academy.

---

