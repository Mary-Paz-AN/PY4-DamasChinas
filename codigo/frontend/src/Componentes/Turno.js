import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Juego from "../models/Juego.js";
import socket from '../Sockets.js';  

const socketJuego = new Juego(socket);

const Turnos = () => {
    const { partidaId } = useParams();
    const [jugadores, setJugadores] = useState([]);
    const [dadosLanzados, setDadosLanzados] = useState({});
    const [jugadorActual, setJugadorActual] = useState(0);
    const [fin, setFin] = useState(false);
    const [lanzando, setLanzando] = useState(false);
    const [resultadoActual, setResultadoActual] = useState(0);

    //Cosigue los jugadores y los actualiza si se lanzo el dado
    useEffect(() => {
        socketJuego.socket.emit('verificarJugadoresPartida', partidaId);
        
        socketJuego.socket.on('jugadoresPartida', (players) => {
            setJugadores(players.map(p => p.nombre));
        });

        socketJuego.socket.on('dadoLanzado', ({ jugador, numero }) => {
            setLanzando(true);
            setResultadoActual(numero);
            
            setTimeout(() => {
                setDadosLanzados(prevDados => ({
                    ...prevDados,
                    [jugador.nombre]: numero
                }));
                setLanzando(false);
                setResultadoActual(0);

                if (Object.keys(dadosLanzados).length + 1 === jugadores.length) {
                    setFin(true);
                } else {
                    setJugadorActual(prev => prev + 1);
                }
            }, 2000);
        });

        //if(listo) {
        //    navigate('/game/{jugadores}');
       // }

        return () => {
            socketJuego.socket.off('jugadoresPartida');
            socketJuego.socket.off('dadoLanzado');
        };
    }, [partidaId, jugadores]);

    //Hace la simulación de lanzr el dado y emite el evento para actualizar en los jugadores
    const lanzarDado = () => {
        const numero = Math.floor(Math.random() * 6) + 1;
        const jugador = {
            id: socketJuego.socket.id,
            nombre: jugadores[jugadorActual]
        };

        socketJuego.socket.emit('lanzamientoDado', { 
            partidaId, 
            jugador, 
            numero 
        });
    };

    return (
        <div className="contenedor">
            {!fin ? (
                <div className="buttonContenedor">
                    <h3 className="tituloStyle">
                        {jugadores[jugadorActual]} lanzá el dado
                    </h3>
                    <div>
                        {lanzando ? (
                            <img 
                                src={`/images/${resultadoActual}.png`} 
                                alt={`Dado ${resultadoActual}`} 
                                style={{ width: '50px' }} 
                            />
                        ) : dadosLanzados[jugadores[jugadorActual]] ? (
                            <img 
                                src={`/images/${dadosLanzados[jugadores[jugadorActual]]}.png`} 
                                alt={`Dado ${dadosLanzados[jugadores[jugadorActual]]}`} 
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
                        disabled={dadosLanzados[jugadores[jugadorActual]] || lanzando}
                    >
                        Lanzar Dado
                    </button>
                </div>
            ) : (
                <div>
                    <h2>Resultados de Dados:</h2>
                    {jugadores.map(nombre => (
                        <div key={nombre}>
                            {nombre}: 
                            <img 
                                src={`/images/${dadosLanzados[nombre]}.png`} 
                                alt={`Dado ${dadosLanzados[nombre]}`} 
                                style={{ width: '50px' }} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Turnos;