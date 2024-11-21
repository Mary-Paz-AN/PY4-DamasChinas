import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Juego from "../models/Juego.js";
import socket from '../Sockets.js';  

const socketJuego = new Juego(socket);

const Turnos = () => {
    const navigate = useNavigate();
    const { partidaId } = useParams();

    // Estados del componente
    const [jugadores, setJugadores] = useState([]);
    const [jugadorActual, setJugadorActual] = useState(0);
    const [fin, setFin] = useState(false);
    const [lanzando, setLanzando] = useState(false);
    const [resultadoActual, setResultadoActual] = useState(0);

    // Referencias para manejar estados mutables
    const dadosLanzadosRef = useRef({});
    const jugadoresRef = useRef([]);

    // Obtener jugadores de la partida y configurar los listeners
    useEffect(() => {
        socketJuego.socket.emit('verificarJugadoresPartida', partidaId);

        socketJuego.socket.on('jugadoresPartida', (players) => {
            const nombresJugadores = players.map(p => p.nombre);
            setJugadores(nombresJugadores);
            jugadoresRef.current = nombresJugadores;
        });

        socketJuego.socket.on('dadoLanzado', ({ jugador, numero }) => {
            setLanzando(true);
            setResultadoActual(numero);

            setTimeout(() => {
                const nuevosDados = {
                    ...dadosLanzadosRef.current,
                    [jugador.nombre]: numero,
                };

                dadosLanzadosRef.current = nuevosDados;

                if (Object.keys(nuevosDados).length === jugadoresRef.current.length) {
                    setFin(true);
                } else {
                    setJugadorActual((prev) => (prev + 1) % jugadoresRef.current.length);
                }

                setResultadoActual(0);
                setLanzando(false);
            }, 2000);
        });

        return () => {
            socketJuego.socket.removeAllListeners(); // Elimina todos los listeners del socket
        };
    }, [partidaId]);

    // Maneja el lanzamiento del dado
    const lanzarDado = () => {
        const numero = Math.floor(Math.random() * 6) + 1;
        const jugador = {
            id: socketJuego.socket.id,
            nombre: jugadores[jugadorActual],
        };

        socketJuego.socket.emit('lanzamientoDado', { 
            partidaId, 
            jugador, 
            numero 
        });
    };

    // Redirige al tablero principal cuando termine la partida
    const finalizarPartida = () => {
        navigate(`/juego/partida/${partidaId}`);
    };

    return (
        <div className="contenedor">
            {!fin ? (
                <div className="buttonContenedor">
                    <h3 className="tituloStyle">
                        Turno de: {jugadores[jugadorActual]}
                    </h3>
                    <div>
                        {lanzando ? (
                            <img 
                                src={`/images/${resultadoActual}.png`} 
                                alt={`Dado ${resultadoActual}`} 
                                style={{ width: '50px' }} 
                            />
                        ) : dadosLanzadosRef.current[jugadores[jugadorActual]] ? (
                            <img 
                                src={`/images/${dadosLanzadosRef.current[jugadores[jugadorActual]]}.png`} 
                                alt={`Dado ${dadosLanzadosRef.current[jugadores[jugadorActual]]}`} 
                                style={{ width: '50px' }} 
                            />
                        ) : (
                            <img 
                                src="/images/0.png" 
                                alt="Dado inicial" 
                                style={{ width: '50px' }} 
                            />
                        )}
                    </div>
                    <button 
                        className="buttonStyle" 
                        onClick={lanzarDado}
                        disabled={dadosLanzadosRef.current[jugadores[jugadorActual]] || lanzando}
                    >
                        Lanzar Dado
                    </button>
                </div>
            ) : (
                <div>
                    <h2 className="tituloStyle">Resultados finales:</h2>
                    {jugadores.map(nombre => (
                        <div style={{color: '#8f4039', fontWeight: '600', fontSize: '18px'}} key={nombre}>
                            {nombre}: 
                            <img 
                                src={`/images/${dadosLanzadosRef.current[nombre]}.png`} 
                                alt={`Dado ${dadosLanzadosRef.current[nombre]}`} 
                                style={{ width: '50px', marginLeft: '5px' }} 
                            />
                        </div>
                    ))}
                    <div style={{margin: '10px'}}></div>
                    <button 
                        className="buttonStyle" 
                        onClick={finalizarPartida}
                    >
                        Volver al tablero
                    </button>
                </div>
            )}
        </div>
    );
};

export default Turnos;
