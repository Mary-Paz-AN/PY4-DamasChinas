import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Añadir este import
import socket from '../Sockets.js';

const Turno = () => {
    // Obtener el partidaId de los parámetros de la URL
    const { partidaId } = useParams();
    
    const [jugadores, setJugadores] = useState([]);
    const [jugadorActual, setJugadorActual] = useState(null);
    const [estadoTurnos, setEstadoTurnos] = useState('preparando');
    const [dado, setDado] = useState(0);
    const [turnosLanzados, setTurnosLanzados] = useState([]);
    const [puedeJugar, setPuedeJugar] = useState(false);

    useEffect(() => {
        // Agregar verificación de partidaId
        console.log('partidaId recibido:', partidaId);
        
        if (!partidaId) {
            console.error('No se recibió un ID de partida válido');
            return;
        }

        // Verificar estado de conexión del socket
        console.log('Socket connected:', socket.connected);
        
        // Solicitar detalles de la partida
        const solicitarDetalles = () => {
            console.log('Solicitando detalles de partida');
            socket.emit('obtenerDetallesPartida', partidaId);
        };

        // Escuchar los detalles de la partida
        const handleDetallesPartida = (datosPartida) => {
            console.log('Detalles de la partida recibidos:', datosPartida);
            
            if (datosPartida && datosPartida.jugadores) {
                const nombresJugadores = datosPartida.jugadores.map(jugador => jugador.nombre);
                console.log('Jugadores en la partida:', nombresJugadores);
                
                setJugadores(nombresJugadores);
                
                // Establecer primer jugador
                setJugadorActual(nombresJugadores[0]);
                setEstadoTurnos('lanzandoDados');
            }
        };

        // Añadir listeners
        socket.on('detallesPartida', handleDetallesPartida);
        
        // Escuchar lanzamientos de dados de otros jugadores
        socket.on('dadoLanzado', (datos) => {
            console.log('Dado lanzado:', datos);
            setTurnosLanzados(prevTurnos => [...prevTurnos, {
                jugador: datos.jugador.nombre,
                numero: datos.numero
            }]);
        });

        // Escuchar orden de juego determinado
        socket.on('ordenJuegoDeterminado', (ordenJugadores) => {
            console.log('Orden de juego determinado:', ordenJugadores);
            setEstadoTurnos('turnosDefinidos');
        });

        // Solicitar detalles inmediatamente si el socket está conectado
        if (socket.connected) {
            solicitarDetalles();
        } else {
            // Conectar si no está conectado
            socket.connect();
            socket.on('connect', solicitarDetalles);
        }

        // Limpiar listeners
        return () => {
            socket.off('detallesPartida', handleDetallesPartida);
            socket.off('dadoLanzado');
            socket.off('ordenJuegoDeterminado');
            socket.off('connect');
        };
    }, [partidaId]);

    // Efecto para actualizar si puede lanzar el dado
    useEffect(() => {
        console.log('Estado actual:', {
            estadoTurnos,
            jugadorActual,
            turnosLanzados
        });

        // Verificar si es el turno de lanzar dado del jugador actual
        const puedeLanzar = 
            estadoTurnos === 'lanzandoDados' && 
            !turnosLanzados.some(turno => turno.jugador === jugadorActual);
        
        console.log('Puede jugar:', puedeLanzar);
        setPuedeJugar(puedeLanzar);
    }, [estadoTurnos, jugadorActual, turnosLanzados]);

    const lanzarDado = () => {
        if (!puedeJugar) return;

        const numero = Math.floor(Math.random() * 6) + 1;
        setDado(numero);

        // Emitir evento de lanzamiento de dado al servidor
        socket.emit('lanzamientoDado', {
            partidaId,
            jugador: { id: socket.id, nombre: jugadorActual },
            numero
        });

        // Preparar siguiente jugador
        const indiceActual = jugadores.indexOf(jugadorActual);
        const siguienteIndice = (indiceActual + 1) % jugadores.length;
        setJugadorActual(jugadores[siguienteIndice]);
    };

    const renderizarContenido = () => {
        console.log('Renderizando contenido. Estado:', estadoTurnos);
        
        switch(estadoTurnos) {
            case 'preparando':
                return <div>
                    <p>Preparando juego...</p>
                    <p>ID de Partida: {partidaId}</p>
                    <p>Jugadores: {jugadores.join(', ')}</p>
                </div>;
            
            case 'lanzandoDados':
                return (
                    <div className="buttonContenedor">
                        <h3 className="tituloStyle">
                            {jugadorActual} lanza el dado
                        </h3>
                        <div>
                            {turnosLanzados.map((turno, index) => (
                                <p key={index}>{turno.jugador}: {turno.numero}</p>
                            ))}
                        </div>
                        <img
                            src={`/images/${dado || '0'}.png`}
                            alt={`Dado ${dado || 'sin lanzar'}`}
                            style={{ width: '100px' }}
                        />
                        <button 
                            className="buttonStyle" 
                            onClick={lanzarDado} 
                            disabled={!puedeJugar}
                        >
                            {puedeJugar ? 'Lanzar Dado' : 'Esperando turno'}
                        </button>
                    </div>
                );
            
            case 'turnosDefinidos':
                return (
                    <div>
                        <h2>Orden de Turnos Definido</h2>
                        {turnosLanzados.sort((a, b) => b.numero - a.numero)
                            .map((turno, index) => (
                                <p key={index}>
                                    {turno.jugador}: {turno.numero}
                                </p>
                            ))}
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="contenedor">
            {renderizarContenido()}
        </div>
    );
};

export default Turno;