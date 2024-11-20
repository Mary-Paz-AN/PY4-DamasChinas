import React, { useState, useEffect } from "react";

const Turno = () => {
    const [turnos, setTurnos] = useState([]);
    const [jugadorActual, setJugadorActual] = useState(0);
    const [listo, setListo] = useState(false); //Solo para simular
    const [fin, setFin] = useState(false);
    const [dado, setDado] = useState(0); 

    // Simulación de jugadores
    const jugadores = ['maria01', 'halsey6', 'dClOVER'];

    // Una vez que todos los jugadores lancen el dado se les asigna el turno
    useEffect(() => {
        if(fin) {
            const contador = {};

            // Generar un contador por número repetido
            turnos.forEach(turno => {
                const numero = turno.numero;
                contador[numero] = (contador[numero] || 0) + 1;
            });

            const repetidos = Object.keys(contador).filter(numero => contador[numero] > 1);

            // Verifica si existen numeros repetidos
            if(repetidos.length > 0) {
                //  Hace el sort por orden alfabetico
                const sortTurnos = turnos.sort(function (a, b) {
                    if(a.jugador > b.jugador) {
                        return 1;
                    }
                    
                    if(a.jugador < b.jugador) {
                        return -1;
                    }
                    
                    return 0;
                });

                setTurnos(sortTurnos);
                
            } else {
                //Hace el sort por numero de mayor a menor
                const sortTurnos =  turnos.sort(function (a, b) {
                    if (a.numero < b.numero) {
                        return 1;
                    }
                    
                    if (a.numero > b.numero) {
                        return -1;
                    }
                    
                    return 0;
                });

                setTurnos(sortTurnos);
            };

            setListo(true);
        }

    }, [fin, turnos]);

    // Pasa de jugador en jugador para que tire el dado
    const actualizarTurno = (jugador, numero) => {
        setTurnos((prevTurnos) => [
            ...prevTurnos,
            { jugador, numero }
        ]);

        // Si ya se paso por todos los jugadores 
        if (jugadorActual + 1 === jugadores.length) {
            setTimeout(() => {
                setFin(true);
            }, 2000);
        } else {
            setTimeout(() => {
                setJugadorActual(jugadorActual + 1);
                setDado(0);
            }, 2000);
        }

        if(listo) {
            console.log(turnos);
        }
    };

    // Genera un número aleatoria para simular un dado
    const lanzarDado = () => {
        const numero = Math.floor(Math.random() * 6) + 1; 
        setDado(numero); 
        const jugador = jugadores[jugadorActual];
        actualizarTurno(jugador, numero);
    };

    return (
        <div className="contenedor">
            {!listo ? (
                <div className="buttonContenedor">
                    <h3 className="tituloStyle">{jugadores[jugadorActual]} lancé el dado</h3>
                    <img
                        src={dado !== 0 ? `/images/${dado}.png` : `/images/0.png`}
                        alt={`Dado ${dado || 'sin lanzar'}`}
                        style={{ width: '100px' }}
                    />
                    <button className="buttonStyle" onClick={lanzarDado} disabled={dado !== 0}>Lanzar Dado</button>
                </div>
            ) : (
                <div>
                    <h2>Resultados de los Turnos:</h2>
                    {turnos.map((turno, index) => (
                        <p key={index}>
                            {turno.jugador}: {turno.numero}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Turno;
