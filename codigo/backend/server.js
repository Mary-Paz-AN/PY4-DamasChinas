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
  },
});

// Función para generar un ID único para la partida
function generarIdPartida() {
  return 'partida_' + Math.random().toString(36).substr(2, 9); // Ejemplo de ID aleatorio
}

let partidas = {}; // Almacenará las partidas activas
let usuarios = {}; // Almacenará los usuarios con su socket ID
const jugadores = {};

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Enviar las partidas disponibles al conectarse
  socket.emit('actualizarPartidas', Object.values(partidas));

  // Login: asociar el nombre del usuario con su socket ID
  socket.on("login", ({ nombre, socketId }) => {
    if (nombre && socketId) {
      // Asociar el socket.id recibido con el nombre del usuario
      usuarios[socketId] = {nombre};
      console.log(`Usuario ${nombre} conectado con socket ID: ${socketId}`);
    } else {
      console.error("El nombre o socketId no es válido");
    }
  });

  // Evento para crear una partida
  socket.on('crearPartida', ({nombre, tipo, cantJug}) => {
    console.log('Partida creada por:', nombre);

    const partidaId = generarIdPartida(); // Generar un ID único para la partida

    // Guardar la partida en el objeto partidas
    partidas[partidaId] = { 
      id: partidaId, 
      nombre,
      tipo,
      cantJug,
      jugadores: [{ id: socket.id, nombre: usuarios[socket.id].nombre }] 
    };
    console.log(`Socket jugador: ${socket.id}`);
    console.log(`Nombre del jugador: ${usuarios[socket.id].nombre}`);
    console.log(partidas);


    // Emitir el ID de la partida creada al jugador
    socket.emit('partidaCreada', partidaId);

    // Emitir la lista de partidas a todos los clientes conectados
    io.emit('actualizarPartidas', Object.values(partidas));
  });

  // Evento para obtener las partidas disponibles
  socket.on('obtenerPartidas', () => {
    const partidasDisponibles = Object.values(partidas); // Convertir partidas a array
    socket.emit('actualizarPartidas', partidasDisponibles); // Enviar las partidas al cliente
  });

  // Evento para unirse a una partida existente
  socket.on('unirsePartida', ({partidaId, socketID}) => {
    const partida = partidas[partidaId];
    
    //Verifica que la partida exista
    if (!partida) {
      socket.emit('errorUnirsePartida', 'Partida no encontrada.');
      return;
    }

    //Verificar si el jugador ya esta en la partida
    const jugadorPartida = partida.jugadores.some(
      (jugador) => jugador.id === socketID
    );

    if (jugadorPartida) {
      socket.emit('errorUnirsePartida', 'Ya estás en esta partida.');
      return;
    }

    // Agregar al jugador a la partida
    partida.jugadores.push({ id: socketID, nombre: usuarios[socketID].nombre });

    console.log(`Jugador ${usuarios[socketID].nombre} (${socketID}) se unió a la partida ${partidaId}`);

    // Emitir evento al cliente indicando que se unió correctamente
    socket.emit('partidaUnida', partida);

    // Actualizar la lista de partidas a todos los clientes
    io.emit('actualizarPartidas', Object.values(partidas));
  });

  // Evento para desconectar
  socket.on('disconnect', () => {
    // Buscar y eliminar al jugador de las partidas
    for (const [id, partida] of Object.entries(partidas)) {
      const index = partida.jugadores.findIndex((jugador) => jugador.id === socket.id);
      if (index !== -1) {
        partida.jugadores.splice(index, 1);
        console.log(`Jugador ${usuarios[socket.id]} (${socket.id}) eliminado de la partida ${id}`);
      }
    }

    // Limpiar las partidas sin jugadores
    partidas = Object.fromEntries(
      Object.entries(partidas).filter(([id, partida]) => partida.jugadores.length > 0)
    );

    // Actualizar la lista de partidas a todos los clientes
    io.emit('actualizarPartidas', Object.values(partidas));
  });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("build")); // Para servir archivos estáticos si fuera necesario

// Endpoint para obtener el estado inicial del tablero
app.get("/board", (req, res) => {
  const initialBoard = [
    // Aquí puedes definir el estado inicial del tablero si es necesario
  ];
  res.json(initialBoard);
});

// Inicia el servidor
server.listen(3001, () => {
  console.log("Servidor iniciado en http://localhost:3001");
});
