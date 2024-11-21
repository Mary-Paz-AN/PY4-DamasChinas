import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from "./App"; 
import CrearPartida from "./Componentes/CrearPartida";
import PartidasDisponibles from "./Componentes/PartidasDisponibles";
import Turno from "./Componentes/Turno";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> 
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/crearPartida" element={<CrearPartida />} />
            <Route path="/partidasDisponibles" element={<PartidasDisponibles />} />
            <Route path="/GameArea" element={<GameArea />} />
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
