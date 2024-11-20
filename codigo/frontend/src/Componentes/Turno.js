import React, { useEffect, useState } from "react";

const Turno = () => {
    const [turnos, setTurnos] = useState([]);
    const [listo, setListo] = useState(false);

    const jugadores = ['maria01', 'halsey6', 'dClOVER'];


    return (
        <div>
            {listo ? 
                ( turnos.map((turno, index) =>
                    <p key={index}>{turno.jugador}</p>
                )) : (
                    <p>Escogiendo turnos...</p>
                )
            }
        </div>
    );
}

export default Turno;