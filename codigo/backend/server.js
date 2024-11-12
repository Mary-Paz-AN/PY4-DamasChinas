//Dependency for the proper functioning of the server
const express = require("express");
const cors = require("cors");
//Constants
const app = express();
const PORT = process.env.PORT || 3001;

//
app.listen(PORT, () => console.log(`The server started on  http://localhost:${PORT}`));
app.use(express.static("build"));
app.use( express.json());
app.use(express.urlencoded({ extended: true}));

//Inica las consultas al API

app.use(cors()); // Permitir solicitudes del frontend

// Endpoint para obtener el estado inicial del tablero
app.get("/board", (req, res) => {
    const initialBoard = [
        // Agrega aquí el estado inicial del tablero como en initialBoard.js del frontend
    ];
    res.json(initialBoard);
});


