import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/App.css";
import socket from "./Sockets.js"; // Importamos la conexión centralizada
import Login from "./Componentes/Login";

let socketInitialized = false;

const App = () => {
  const [usuario, setUsuario] = useState(null); // Estado para guardar el nombre del usuario
  const navigate = useNavigate();

  useEffect(() => {
    if (!socketInitialized) {
      socket.on("connect", () => {
        console.log("Conectado al servidor:", socket.id);
      });
      socketInitialized = true; // Establece el flag para evitar futuras conexiones
    }

    // Intenta cargar el usuario desde sessionStorage al montar el componente
    const usuarioGuardado = sessionStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado); // Establece el usuario si está guardado
      // Emitir el socket.id y el nombre del usuario al backend
      socket.emit("login", { nombre: usuarioGuardado, socketId: socket.id });
    }
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

  const dado = () => {
    navigate('/dado');
  }


  return (
    <div className="App">
      <h1 className="tituloStyle">Damas Chinas - Online</h1>
      <h2 className="bienvenidaStyle">Bienvenido, {usuario}</h2>

        <div className="buttonContenedor">
          <button className="buttonStyle" onClick={crearPartida}>Crear Partida</button>
          <button className="buttonStyle" onClick={unirseJuego}>Unirse a Juego</button>
          <button className="buttonStyle">Ver Ranking</button>
        </div>
    </div>
  );
};

export default App;