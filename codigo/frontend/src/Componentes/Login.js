
import React, { useState } from "react";
import "../styles/App.css";

const Login = ({ onLogin }) => {
  const [nombre, setNombre] = useState("");

  const handleLogin = () => {
    if (nombre.trim()) {
      onLogin(nombre); 
    } else {
      alert("Por favor, introduce tu nombre.");
    }
  };

  return (
    <div className="contenedor">
      <h1 className="tituloStyle">Damas Chinas - Online</h1>
      <input
        type="text"
        placeholder="Introduce tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="inputStyle"
      />
      <button className="buttonStyle" onClick={handleLogin}>
        Iniciar Sesión
      </button>
    </div>
  );
};

export default Login;
