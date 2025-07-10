// src/components/StartPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import '../styles/StartPage.css';

const StartPage = () => {
  const { store, actions } = useContext(Context);
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [completada, setCompletada] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (store.token) {
      actions.getTasks().then(result => {
        if (!result.success) {
          toast.error(result.message || 'Error al cargar tareas');
        }
      });
    }
  }, [store.token]);

  const openModalForCreate = () => {
    setEditingTask(null);
    setTitulo('');
    setDescripcion('');
    setCompletada(false);
    setShowModal(true);
  };

  const openModalForEdit = (task) => {
    setEditingTask(task);
    setTitulo(task.titulo);
    setDescripcion(task.descripcion);
    setCompletada(task.completada);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    
    if (editingTask) {
      const result = await actions.updateTask(
        editingTask.idTarea,
        titulo,
        descripcion,
        completada
      );
      
      if (result.success) {
        toast.success('Tarea actualizada');
        setShowModal(false);
      } else {
        toast.error(result.message || 'Error al actualizar tarea');
      }
      
    } else {
      const result = await actions.createTask(titulo, descripcion);
      if (result.success) {
        toast.success('Tarea creada');
        setShowModal(false);
      } else {
        toast.error(result.message || 'Error al crear tarea');
      }
    }
  };

  const handleDelete = async (taskToDelete) => {
    if (taskToDelete) {
        const result = await actions.deleteTask(taskToDelete.idTarea);
        if (result.success) {
        toast.success('Tarea eliminada');
        setShowModal(false);
        await actions.getTasks();
        } else {
        toast.error(result.message || 'Error al eliminar tarea');
        }
    }
};

  const showToast  = (task) => {
    toast.info(
        <div>
        <p>¿Seguro que quieres eliminarla?</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
            onClick={async () => {
                toast.dismiss();
                await handleDelete(task);
            }}
            >
            Sí
            </button>
            <button onClick={() => toast.dismiss()}>No</button>
        </div>
        </div>,
        { autoClose: false }
    );
  }

  const toggleComplete = async (task) => {
    const result = await actions.updateTask(
      task.idTarea,
      task.titulo,
      task.descripcion,
      !task.completada
    );
    
    if (result.success) {
      toast.success(`Tarea marcada como ${!task.completada ? 'completada' : 'pendiente'}`);
    } else {
      toast.error(result.message || 'Error al actualizar tarea');
    }
  };

  if (!store.usuario) {
    return (
      <div className="not-logged-in">
        <h2>Debes iniciar sesión para ver tus tareas</h2>
        <button className="login-button" onClick={() => navigate('/login')}>Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div className="start-page">
      <div className="header">
        <h1>Mis Tareas</h1>
        <button className="add-button" onClick={openModalForCreate}>+</button>
      </div>
      
      <div className="tasks-grid">
        {store.tareas.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas. ¡Agrega tu primera tarea!</p>
          </div>
        ) : (
          store.tareas.map(task => (
            <div 
              key={task.idTarea} 
              className={`task-card ${task.completada ? 'completed' : ''}`}
              onClick={() => openModalForEdit(task)}
            >
              <div className="task-header">
                <h3 className="task-title">{task.titulo}</h3>
                <button 
                  className="complete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(task);
                  }}
                >
                  {task.completada ? '✓' : ''}
                </button>
              </div>
              {task.descripcion && <p className="task-description">{task.descripcion}</p>}
              <div className="task-footer">
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast(task);
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              
              {editingTask && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={completada}
                      onChange={(e) => setCompletada(e.target.checked)}
                    />
                    Completada
                  </label>
                </div>
              )}
              
              <div className="modal-buttons">
                {editingTask && (
                  <button type="button" className="delete-button" style={{border: '1px solid #e74c3c'}} onClick={() => showToast(editingTask)}>
                    Eliminar
                  </button>
                )}
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  {editingTask ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartPage;