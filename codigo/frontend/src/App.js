// src/App.js
import React from "react";
import "./styles/App.css";
import { useNavigate } from 'react-router-dom';
import {io} from 'socket.io-client';
import Dado from "./Componentes/Dado";


const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Conectado al servidor:', socket.id);
});

const App = () => {
  const navigate = useNavigate();

  // Ir al apartdo de crear partida
  const crearPartida = () => {
    navigate('/crearPartida');
  }

  // Ir al apartado para unirse a un juego
  const unirseJuego = () => {
    navigate('/unirseJuego');
  }

  const dado = () => {
    navigate('/dado');
  }


  return (
      <div className="contenedor">
        <h1 className="tituloStyle">Damas Chinas - Online</h1>

        <div className="buttonContenedor">
          <button className="buttonStyle" onClick={crearPartida}>Crear Partida</button>
          <button className="buttonStyle" onClick={unirseJuego}>Unirse a Juego</button>
          <button className="buttonStyle" onClick={dado}>Ver Ranking</button>
        </div>
    </div>
  );
}

export default App;
