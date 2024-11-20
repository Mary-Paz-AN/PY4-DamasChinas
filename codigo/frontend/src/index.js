import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from "./App"; 
import CrearPartida from "./Componentes/CrearPartida";
import UnirseJuego from "./Componentes/UnirseJuego";
import Dado from "./Componentes/Dado";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> 
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/crearPartida" element={<CrearPartida />} />
            <Route path="/unirseJuego" element={<UnirseJuego />} />
            <Route path="/dado" element={<Dado />} />
        </Routes>
    </BrowserRouter>
  </React.StrictMode>
);