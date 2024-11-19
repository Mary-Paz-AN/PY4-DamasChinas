// Dependencies
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

// Constants
const app = express();
const server = http.createServer(app); // Usar este servidor para Socket.IO
const io = new SocketServer(server, {
    cors: {
        origin: "http://localhost:3000", // URL del frontend
        methods: ["GET", "POST"],
    }
});

// Función para generar un ID único para la partida
function generarIdPartida() {
    return 'partida_' + Math.random().toString(36).substr(2, 9); // Ejemplo de ID aleatorio
  }
// Socket.IO connection
let partidas = [];

io.on('connection', (socket) => { 
    console.log('Cliente conectado:', socket.id);

    // Emitir todas las partidas activas cuando un nuevo cliente se conecta
    socket.emit('partidasActivas', partidas);
  
    // Evento para crear una partida
    socket.on('crearPartida', (nombre) => {
      const idPartida = generarIdPartida(); // Generar ID de la partida
      const partida = { id: idPartida, creador: nombre, jugadores: [nombre] };
      partidas.push(partida); // Guardar partida en la lista
      console.log(`Partida creada por ${nombre} con ID: ${idPartida}`);
  
      // Emitir el ID de la partida al creador
      socket.emit('partidaCreada', partidaId);
  
      // Emitir la lista actualizada de partidas a todos los clientes
      io.emit('partidasActivas', partidas);
    });
  
    // Evento para unirse a una partida
    socket.on('unirsePartida', (idPartida, nombre) => {
      const partida = partidas.find(p => p.id === idPartida);
      if (partida) {
        partida.jugadores.push(nombre); // Agregar jugador a la partida
        console.log(`${nombre} se ha unido a la partida ${idPartida}`);
  
        // Emitir la lista de jugadores actualizada a todos los jugadores
        io.emit('partidasActivas', partidas);
      } else {
        console.log('Partida no encontrada');
      }
    });
  
    // Desconectar al cliente
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("build")); 

// Endpoint para obtener el estado inicial del tablero
app.get("/board", (req, res) => {
    const initialBoard = [
        // Define el estado inicial del tablero aquí
    ];
    res.json(initialBoard);
});

// Inicia el servidor
server.listen(3001);
console.log("Servidor iniciado en http://localhost:3001");