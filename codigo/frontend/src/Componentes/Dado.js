import React, { useState } from "react";

const Dado = (jugador) => {
    const [numero, setNum] = useState(0);

    const turno = [
        {
            jugador: '',
            turno: ''
        },
        
    ]

    const lanzarDado = () => {
        const numero = Math.round(Math.random() * (6  - 1) + parseInt(1));
        setNum(numero);
    }

    return (
        <div>
            <img 
            src= {numero !== 0 ? `/images/${numero}.png` : '/images/0.png'}
            alt={"Dado " + numero} 
            style={{width: '80px'}}/>

            <button className="buttonStyle" onClick={lanzarDado}>Lanzar Dado</button>
        </div>
    );
}

export default Dado;