import React, { useEffect, useContext } from 'react';
import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css'
import { ToastContainer } from "react-toastify";
import injectContext from "./store/appContext.jsx";
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import StartPage from './components/StartPage.jsx';
import { Context } from './store/appContext.jsx';

const AppContent = () => {
  const location = useLocation();
  const hideLayout = location.pathname === "/" ||
    location.pathname === "/register" ||
    location.pathname === "/login";


  const {store, actions} = useContext(Context);

  useEffect(() => {

    // Se inicializa el store si existe el token en el contexto.
    actions.initialize();

  }, []);

  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Para alertas y notificaciones de la app */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

// 2️⃣ Ahora envolvemos ese component con nuestro HOC de Flux/Context:
const AppContentWithFlux = injectContext(AppContent);

function App() {
  return (
    <div className="App">
        <Router>
          <AppContentWithFlux />
        </Router>
    </div>
  );
}

export default App;