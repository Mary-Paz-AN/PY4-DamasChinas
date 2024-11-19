// src/App.js
import React from "react";
import GameArea from './Componentes/GameArea';
import "./styles/App.css";
const App = () => {
    return (
        <div className="App">
            <h1>Tablero de juego</h1>
            <GameArea />
        </div>
    );
}

export default App;
