// src/store/flux.js
const getState = ({ getStore, getActions, setStore }) => {
  return {

    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Estado global de la app

    store: {
      tareas: [],
      token: null,
      usuario: null,
    },

    //Termina el estado global de la app
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------



    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Acciones del contexto

    actions: {

      //__________________________________________________________________________________________________________________________________________
      //1) Función para inicializar el estado del store, para cuando cargue la aplicación, recuperamos el token y el usuario del sessionStorage

      initialize: () => {

        const token = sessionStorage.getItem("token");
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));
        if (token && usuario) {
          setStore({ token, usuario });
        }
      },

      //Termina la función para inicializar el estado del store
      //__________________________________________________________________________________________________________________________________________
      

      //__________________________________________________________________________________________________________________________________________
      // 2) Registrar nuevo usuario

      register: async (nombre, email, clave) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nombre, email, clave }),
          });
          
          const data = await response.json();
          if (response.ok) {
            return { success: true, message: "Registro exitoso" };
          } else {
            return { success: false, message: data.error || "Error en registro de usuario" };
          }
        } catch (error) {
          return { success: false, message: "Error en el servidor" };
        }
      },

       // Termina la función para registrar nuevo usuario
      //__________________________________________________________________________________________________________________________________________
      


      //__________________________________________________________________________________________________________________________________________
      // 3) Login de usuario

      login: async (email, clave) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, clave }),
          });
          
          const data = await response.json();

          if (response.ok) {

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

            setStore({ 
              token: data.token, 
              usuario: data.usuario,
              tareas: []
            });

            return { success: true, message: "Inicio de sesión exitoso" };

          } else {
            return { success: false, message: data.error || "Credenciales inválidas" };
          }
        } catch (error) {
          return { success: false, message: "Error en el servidor" };
        }
      },

        // Termina la función para login de usuario
        //__________________________________________________________________________________________________________________________________________
      


      //____________________________________________________________________________________________________________________________________________
      // 4) Logout de usuario

      logout: async () => {
        try {
          const token = getStore().token;
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("usuario");
          setStore({ token: null, usuario: null, tareas: [] });
          return { success: true, message: "Sesión cerrada" };

        } catch (error) {
          return { success: false, message: "Error al cerrar sesión" };
        }
      },

      // Termina la función para logout de usuario
      //____________________________________________________________________________________________________________________________________________



      //____________________________________________________________________________________________________________________________________________
      // 5) Obtener tareas del usuario

      getTasks: async () => {
        try {
          const token = getStore().token;
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const data = await response.json();
          if (response.ok) {
            setStore({ tareas: data });
            return { success: true };
          } else {
            return { success: false, message: "Error al obtener tareas" };
          }
        } catch (error) {
          return { success: false, message: "Error de conexión" };
        }
      },

      // Termina la función para obtener tareas del usuario
      //____________________________________________________________________________________________________________________________________________



      //_____________________________________________________________________________________________________________________________________________
      // 6) Crear nueva tarea
      
      createTask: async (titulo, descripcion) => {
        try {
          const token = getStore().token;
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ titulo, descripcion }),
          });
          
          const data = await response.json();
          if (response.ok) {
            const store = getStore();
            setStore({ tareas: [...store.tareas, data.tarea] });
            return { success: true, message: "Tarea creada" };
          } else {
            return { success: false, message: data.error || "Error al crear tarea" };
          }
        } catch (error) {
          return { success: false, message: "Error de conexión" };
        }
      },

      // Termina la función para crear nueva tarea
      //_____________________________________________________________________________________________________________________________________________
      
      

      //_____________________________________________________________________________________________________________________________________________
      // 7) Actualizar tarea

      updateTask: async (id, titulo, descripcion, completada) => {
        try {
          const token = getStore().token;
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ titulo, descripcion, completada }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const store = getStore();
            const updatedTasks = store.tareas.map(task => 
              task.idTarea === id ? data.tarea : task
            );
            setStore({ tareas: updatedTasks });
            return { success: true, message: "Tarea actualizada" };
          } else {
            return { success: false, message: "Error al actualizar tarea" };
          }
        } catch (error) {
          return { success: false, message: "Error de conexión" };
        }
      },

      // Termina la función para actualizar tarea
      //_____________________________________________________________________________________________________________________________________________
      
      

      //_____________________________________________________________________________________________________________________________________________
      // 8) Eliminar tarea

      deleteTask: async (id) => {
        try {
          const token = getStore().token;
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const store = getStore();
            const filteredTasks = store.tareas.filter(task => task.idTarea !== id);
            setStore({ tareas: filteredTasks });
            return { success: true, message: "Tarea eliminada" };
          } else {
            return { success: false, message: "Error al eliminar tarea" };
          }
        } catch (error) {
          return { success: false, message: "Error de conexión" };
        }
      },

      // Termina la función para eliminar tarea
      //_____________________________________________________________________________________________________________________________________________
    },

    //Terminan las acciones del contexto
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
  };
};

export default getState;