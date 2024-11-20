import { Container, Row, Card, ListGroup, Button } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import Juego from "../models/Juego.js";
import '../styles/UnirseJuego.css';

const socketJuego = new Juego();    

const PartidasDisponibles = () => {
  const [partidas, setPartidas] = useState([]); // Estado para almacenar partidas disponibles

  useEffect(() => {
    // Solicitar la lista inicial de partidas después de conectarse al servidor
    const obtenerPartidasIniciales = () => {
      socketJuego.socket.emit("obtenerPartidas");
    };
  
    // Escuchar actualizaciones de partidas disponibles
    socketJuego.socket.on("actualizarPartidas", (nuevasPartidas) => {
      console.log("Partidas disponibles actualizadas:", nuevasPartidas);
      setPartidas(nuevasPartidas);
    });
  
    // Esperar la conexión antes de solicitar partidas
    if (socketJuego.socket.connected) {
      obtenerPartidasIniciales();
    } else {
      socketJuego.socket.on("connect", obtenerPartidasIniciales);
    }
  
    // Limpia los listeners al desmontar el componente
    return () => {
      socketJuego.socket.off("actualizarPartidas");
      socketJuego.socket.off("connect", obtenerPartidasIniciales);
    };
  }, []);

  // Función para unirse a una partida
  const handleUnirsePartida = (id) => {
    socketJuego.unirsePartida(id, (error) => {
      if (error) {
        alert(`No se pudo unir a la partida: ${error}`);
      } else {
        console.log(`Te uniste a la partida: ${id}`);
      }
    });
  };

  return (
    <div>
      <div style={{ margin: '10px' }}></div>

      <Container>
        <Row className='tituloStyle' style={{ textAlign: 'center' }}>
          <h1>Elija la partida que desee jugar:</h1>
        </Row>

        <div style={{ margin: '10px' }}></div>

        <Row>
          {partidas.length > 0 ? (
            partidas.map((partida) => (
              <Card key={partida.id} className='cardStyle' style={{ marginBottom: '15px' }}>
                <Card.Header className='headerStyle'>Entrar a Partida</Card.Header>
                <Card.Body>
                  <Card.Text className='textStyle'>
                    <div>
                      <b style={{ color: '#8f4039' }}>Id:</b> {partida.id}
                    </div>
                    <div>
                      <b style={{ color: '#8f4039' }}>Creador:</b> {typeof partida.nombre === 'object' ? partida.nombre.nombre : partida.nombre || "Sin nombre"}
                    </div>
                    <div style={{ margin: '8px' }}></div>
                    <div style={{ textAlign: 'center', color: '#8f4039' }}>
                      <b>Jugadores:</b> {partida.jugadores.length}/6
                    </div>
                  </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush textStyle">
                  {partida.jugadores.map((jugador, index) => (
                    <ListGroup.Item style={{ textAlign: 'center' }} key={index}>
                      {jugador.nombre}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Card.Body>
                  <Button
                    className="botonUnirse"
                    onClick={() => handleUnirsePartida(partida.id)}
                    disabled={partida.jugadores.length >= 6} // Desactivar si la partida está llena
                    variant={partida.jugadores.length >= 6 ? "danger" : "primary"}
                    style={{ width: '100%' }}
                  >
                    {partida.jugadores.length >= 6 ? "Llena" : "Unirse"}
                  </Button>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="tituloStyle">No hay partidas disponibles</p>
          )}
        </Row>
      </Container>
    </div>
  );
};
export default PartidasDisponibles;
