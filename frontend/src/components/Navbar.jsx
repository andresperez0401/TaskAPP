// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import { useContext } from 'react';
import '../styles/Navbar.css';

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
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">TaskAPP</Link>
        
        <div className="navbar-links">
          {store.usuario ? (
            <>
              <span className="navbar-greeting">Hola, {store.usuario.nombre}</span>
              <button className="navbar-button" onClick={handleLogout}>Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Iniciar Sesión</Link>
              <Link to="/register" className="navbar-link">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;