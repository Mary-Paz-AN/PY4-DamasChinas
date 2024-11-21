import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from "./App"; 
import CrearPartida from "./Componentes/CrearPartida";
import PartidasDisponibles from "./Componentes/PartidasDisponibles";
import Ranking from "./Componentes/Ranking";
import Turno from "./Componentes/Turno";
import GameArea from "./Componentes/GameArea";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> 
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/crearPartida" element={<CrearPartida />} />
            <Route path="/partidasDisponibles" element={<PartidasDisponibles />} />
            <Route path="/GameArea" element={<GameArea />} />
            <Route path="/Ranking" element={<Ranking partidas={[]} />} />
            <Route path="/juego/turnos/:partidaId" element={<Turno />} />
            <Route path="/juego/partida/:partidaId" element={<GameArea />} />
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
