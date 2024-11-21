import React, { useState, useEffect } from 'react';
import "../styles/App.css";
import { useNavigate } from "react-router-dom";
import Juego from '../models/Juego';
import socket from '../Sockets.js';  

const socketJuego = new Juego(socket); 

const CrearPartida = () => {
  const [nombre, setNombre] = useState('');  // Nombre de la partida
  const [tipoJuego, setTipo] = useState(''); //Tipo de partida
  const [cantJugadores, setCantJugadores] = useState(''); // Cantidad de jugadores para la partidas
  const [partidaId, setPartidaId] = useState('');  // ID de la partida creada
  const navigate = useNavigate();

  const tiposJuego = ['Vs'];
  const numJugadores = [2, 3, 4, 6];

  useEffect(() => {
    // Escuchar el evento partidaCreada cuando el servidor emita el ID de la partida
    socketJuego.socket.on('partidaCreada', (id) => {
      console.log(`Partida creada con ID: ${id}`);
      setPartidaId(id);  // Asignamos el ID de la partida a la variable de estado
    });

    // Limpiar los eventos cuando el componente se desmonte
    return () => {
      socketJuego.socket.off('partidaCreada');
      socketJuego.socket.off('actualizarPartidas');
    };
  }, []);  // Este useEffect solo se ejecuta una vez cuando se monta el componente

  const handleCrearPartida = () => {
    //AQUI HAY QUE EMPEZAR A CRONOMETRAR LOS 3 MINUTOS
    if (nombre.trim()) {
      socketJuego.crearPartida(nombre, tipoJuego, cantJugadores);  // Emitir al servidor para crear la partida
    }
  };

  const volver = () => {
    navigate('/');
  }

  return (
    <div>
      <button className='buttonStyle'style={{margin: '10px', width: '40px', height: '40px'}} onClick={volver}>⭠</button>

      <div className='contenedor'>
        <h1 className="tituloStyle">Crear Partida</h1>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingresa tu nombre"
          className='inputStyle'
        />
        
        <select 
          id="comboBox" 
          value={tipoJuego} 
          onChange={(e) => setTipo(e.target.value)}
          className='inputStyle'
        >
          <option value="" disabled>Seleccione el tipo de juego</option> 
          {tiposJuego.map((tipo, index) => (
            <option key={index} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        <select 
          id="comboBox" 
          value={cantJugadores} 
          onChange={(e) => setCantJugadores(e.target.value)}
          className='inputStyle'
        >
          <option value="" disabled>Seleccione el tipo de juego</option> 
          {numJugadores.map((num, index) => (
            <option key={index} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button onClick={handleCrearPartida} className='buttonStyle'>Crear Partida</button>

        {/* Mostrar ID de la partida si fue creada */}
        {partidaId && <p>Partida creada con ID: {partidaId}</p>}
      </div>
    </div>
  );
};

export default CrearPartida;
