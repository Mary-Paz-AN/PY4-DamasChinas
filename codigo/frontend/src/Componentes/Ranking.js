import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Card, ListGroup } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from '../Sockets.js';

const Ranking = () => {
  const [ranking, setRanking] = useState([]); // Estado para almacenar el ranking
  const navigate = useNavigate();

  useEffect(() => {
    // Solicitar la lista inicial del ranking
    const obtenerRankingInicial = () => {
      socket.emit("obtenerRanking");
    };

    // Escuchar actualizaciones del ranking
    socket.on("actualizarRanking", (nuevoRanking) => {
      console.log("Ranking actualizado:", nuevoRanking);
      setRanking(nuevoRanking);
    });

    // Esperar la conexión antes de solicitar el ranking
    if (socket.connected) {
      obtenerRankingInicial();
    } else {
      socket.on("connect", obtenerRankingInicial);
    }

    // Limpiar los listeners al desmontar el componente
    return () => {
      socket.off("actualizarRanking");
      socket.off("connect", obtenerRankingInicial);
    };
  }, []);

  const volver = () => {
    navigate('/');
  };

  return (
    <div>
      <div style={{ margin: '10px' }}></div>

      <Container>
        <Row>
          <button className='buttonStyle' style={{ margin: '10px', width: '40px', height: '40px' }} onClick={volver}>
            ⭠
          </button>
        </Row>

        <Row className='tituloStyle' style={{ textAlign: 'center' }}>
          <h1>Ranking de Partidas</h1>
        </Row>

        <div style={{ margin: '10px' }}></div>

        <Row>
          {ranking.length > 0 ? (
            ranking.map((item, index) => (
              <Card key={index} className='cardStyle' style={{ marginBottom: '15px' }}>
                <Card.Header className='headerStyle'>Partida</Card.Header>
                <Card.Body>
                  <Card.Text className='textStyle'>
                    <div>
                      <b style={{ color: '#8f4039' }}>Id:</b> {item.id}
                    </div>
                    <div>
                      <b style={{ color: '#8f4039' }}>Ganador:</b> {item.ganador}
                    </div>
                    <div>
                      <b style={{ color: '#8f4039' }}>Creador:</b> {item.creador}
                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="tituloStyle">No hay datos de ranking disponibles</p>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Ranking;
