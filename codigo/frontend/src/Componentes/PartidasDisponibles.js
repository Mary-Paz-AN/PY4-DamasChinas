import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Card, ListGroup, Button } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/UnirseJuego.css';
import Juego from "../models/Juego.js";
import socket from '../Sockets.js';  

const socketJuego = new Juego(socket);    

const PartidasDisponibles = () => {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerPartidasIniciales = () => {
      socketJuego.socket.emit("obtenerPartidas");
    };
  
    socketJuego.socket.on("actualizarPartidas", (nuevasPartidas) => {
      console.log("Partidas disponibles actualizadas:", nuevasPartidas);
      setPartidas(nuevasPartidas);
    });
  
    if (socketJuego.socket.connected) {
      obtenerPartidasIniciales();
    } else {
      socketJuego.socket.on("connect", obtenerPartidasIniciales);
    }
  
    return () => {
      socketJuego.socket.off("actualizarPartidas");
      socketJuego.socket.off("connect", obtenerPartidasIniciales);
    };
  }, []);

  useEffect(() => {

    socketJuego.socket.on('errorUnirsePartida', (error) => {
      alert(`No se pudo unir a la partida: ${error}`);
      setLoading(false);
    });
  
    socketJuego.socket.on('partidaUnida', (partida) => {
      console.log(`Te uniste a la partida: ${partida.id}`);
      setLoading(false);
    });

    socketJuego.socket.on('errorIniciarPartida', (error) => {
      alert(error);
      setLoading(false);
    });

    // Listener para partidas eliminadas
    socketJuego.onPartidaEliminada(({partidaId, razon}) => {
      setPartidas(prevPartidas => 
        prevPartidas.filter(partida => partida.id !== partidaId)
      );
      alert(`Partida ${partidaId} eliminada: ${razon}`);
    });
  
    return () => {
      socketJuego.socket.off('errorUnirsePartida');
      socketJuego.socket.off('partidaUnida');
      socketJuego.socket.off('partidaEliminada');
      socketJuego.socket.off('partidaIniciada');
      socketJuego.socket.off('errorIniciarPartida');
    };
  }, []);

  const handleEntrarJuego = (partidaId) => {
    setLoading(true);
    socketJuego.iniciarPartida(partidaId);

    // Escuchar la confirmación de inicio de partida
    socketJuego.socket.on('partidaIniciada', (datos) => {
      console.log(`Partida ${datos.id} iniciada con jugadores:`, datos.jugadores);
      navigate('/GameArea');
    });
  };  

  const handleUnirsePartida = (id) => {
    setLoading(true);
    socketJuego.unirsePartida(id);
  };

  const volver = () => {
    navigate('/');
  };

  return (
    <div>
      <div style={{ margin: '10px' }}></div>

      <Container>
        <Row>
          <button 
            className='buttonStyle' 
            style={{margin: '10px', width: '40px', height: '40px'}} 
            onClick={volver}
            disabled={loading}
          >
            ⭠
          </button>
        </Row>

        <Row className='tituloStyle' style={{ textAlign: 'center' }}>
          <h1>Elija la partida que desee jugar:</h1>
          {loading && <p>Cargando...</p>}
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
                      <b style={{ color: '#8f4039' }}>Creador:</b> {partida.nombre}
                    </div>
                    <div style={{ margin: '8px' }}></div>
                    <div style={{ textAlign: 'center', color: '#8f4039' }}>
                      <b>Jugadores:</b> {partida.jugadores.length}/{partida.cantJug}
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
                  {partida.jugadores.length >= partida.cantJug ? (
                    <Button
                      className="buttonEstilo"
                      onClick={() => handleEntrarJuego(partida.id)}
                      variant="success"
                      style={{ width: '100%' }}
                      disabled={loading}
                    >
                      {loading ? 'Iniciando...' : 'Entrar'}
                    </Button>
                  ) : (
                    <Button
                      className="buttonEstilo"
                      onClick={() => handleUnirsePartida(partida.id)} 
                      variant="primary"
                      style={{ width: '100%' }}
                      disabled={loading}
                    >
                      {loading ? 'Uniéndose...' : 'Unirse'}
                    </Button>
                  )}
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
