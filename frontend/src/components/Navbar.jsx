// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import { useContext } from 'react';

const Navbar = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await actions.logout();
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/tasks">TaskAPP</Link>
        
        {store.usuario && (
          <div className="d-flex align-items-center">
            <span className="text-light me-3">Hola, {store.usuario.nombre}</span>
            <button 
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;