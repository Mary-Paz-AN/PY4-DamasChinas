import React, { useState, useEffect } from 'react';
import "../styles/App.css";
import Juego from '../models/Juego';  // Importamos el modelo Juego

const socketJuego = new Juego();  // Usamos una única instancia de Juego

const CrearPartida = () => {
  const [nombre, setNombre] = useState('');  // Nombre de la partida
  const [partidaId, setPartidaId] = useState('');  // ID de la partida creada

  useEffect(() => {
    // Escuchar el evento 'partidaCreada' cuando el servidor emita el ID de la partida
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
    if (nombre.trim()) {
      socketJuego.crearPartida(nombre);  // Emitir al servidor para crear la partida
    }
  };

  return (
    <div>
      <h1 className="tituloStyle">Crear Partida</h1>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ingresa tu nombre"
      />
      <button onClick={handleCrearPartida}>Crear Partida</button>

      {/* Mostrar ID de la partida si fue creada */}
      {partidaId && <p>Partida creada con ID: {partidaId}</p>}
    </div>
  );
};

export default CrearPartida;
