import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/UnirseJuego.css';
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Container, ListGroup } from 'react-bootstrap';
import { io } from 'socket.io-client';

const UnirseJuego = () => {
    const [partidas, setPartidas] = useState([]);
    //const [socket, setSocket] = useState(null);

    useEffect(() => {
        //Simulación de conseguir las partidas
        const newPartdas = [
            {
                id: '56',
                nombre: 'juan02',
                jugadores: ['maria03', 'lupita34']
            },
            {
                id: '59',
                nombre: 'pez02',
                jugadores: ['rojoVivo', 'Noname']
            },
            {
                id: '34',
                nombre: 'babi9',
                jugadores: ['nio9', 'naniU']
            },
            {
                id: '87',
                nombre: 'suA9',
                jugadores: ['si78', 'jiU8']
            }
        ]

        setPartidas(newPartdas);
    }, []);
    

    return (
        <div>
            <div style={{margin: '10px'}}></div>

            <Container>
                <Row className='tituloStyle' style={{textAlign: 'center'}}>
                   <h1>Elija la partida que desee jugar:</h1> 
                </Row>

                <div style={{margin: '10px'}}></div>
                
                <Row>
                {partidas.map((partida) => (
                    <Card key={partida.id} className='cardStyle'>
                        <Card.Header className='headerStyle'>Entrar a Partida</Card.Header>
                        <Card.Body>
                            <Card.Text className='textStyle'>
                                <div><b style={{color: '#8f4039'}}>Id:</b> {partida.id}</div>
                                <div><b style={{color: '#8f4039'}}>Creador:</b> {partida.nombre}</div>
                                <div style={{margin: '8px'}}></div>
                                <div style={{textAlign: 'center', color: '#8f4039'}}><b>Jugadores:</b></div>
                            </Card.Text>
                        </Card.Body>
                        <ListGroup className="list-group-flush textStyle">
                            {partida.jugadores.map((jugador, index) => (
                                <ListGroup.Item style={{textAlign: 'center'}} key={index}>{jugador}</ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>
                ))}
                </Row>
            </Container>
        </div>
    );
};

export default UnirseJuego;
