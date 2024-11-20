import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/App.css";
import socket from "./Sockets.js";
import Login from "./Componentes/Login";

const App = () => {
  const [usuario, setUsuario] = useState(() => {
    return sessionStorage.getItem("usuario") || null;
  });  //Verifica si hay un usuario en la sesion
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado al servidor:", socket.id);
      
      const usuarioGuardado = sessionStorage.getItem("usuario");
      if (usuarioGuardado) {
        socket.emit("login", { 
          nombre: usuarioGuardado, 
          socketId: socket.id 
        });
      }
    });
  
    return () => {
      socket.off("connect");
    };
  }, []);

  const handleLogin = (nombre) => {
    setUsuario(nombre); // Guardar el nombre del usuario en el estado
    sessionStorage.setItem("usuario", nombre); // Guardar el nombre en sessionStorage

    // Emitir el socket.id y el nombre del usuario al backend
    socket.emit("login", { nombre, socketId: socket.id });
  };

  const crearPartida = () => {
    navigate("/crearPartida");
  };

  const partidaDisp = () => {
    navigate("/partidasDisponibles");
  };

  const unirseJuego = () => {
    navigate("/unirseJuego"); // Redirige a la página de unirse al juego
  };

  const verRanking = () => {
    navigate("/ranking"); // Redirige a la página de ranking
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem("usuario"); // Eliminar el usuario de sessionStorage
    setUsuario(null); // Borrar el estado del usuario
    socket.emit("logout"); // Emitir el evento de logout si es necesario
  };

  // Mostrar pantalla de login si el usuario no está autenticado
  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="contenedor">
      <h1 className="tituloStyle">Damas Chinas - Online</h1>
      <h2 className="bienvenidaStyle">Bienvenido, {usuario}</h2>

      <div className="buttonContenedor">
        <button className="buttonStyle" onClick={crearPartida}>
          Crear Partida
        </button>
        <button className="buttonStyle" onClick={partidaDisp}>
          Partidas Disponibles
        </button>
        <button className="buttonStyle" onClick={unirseJuego}>
          Unirse a Juego
        </button>
        <button className="buttonStyle" onClick={verRanking}>
          Ver Ranking
        </button>
        <button className="buttonStyle" onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default App;