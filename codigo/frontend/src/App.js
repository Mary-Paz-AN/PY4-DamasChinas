// src/App.js
import React from "react";
import "./styles/App.css";
import { useNavigate } from 'react-router-dom';

const App = () => {
  const navigate = useNavigate();

  const crearPartida = () => {
    navigate('/crearPartida');
  }

  return (
      <div className="App">
        <h1 className="tituloStyle">Damas Chinas - Online</h1>

        <div className="buttonContenedor">
          <button className="buttonStyle" onClick={crearPartida}>Crear Partida</button>
          <button className="buttonStyle">Unirse a Juego</button>
          <button className="buttonStyle">Ver Ranking</button>
        </div>
      </div>
  );
}

export default App;
