// Dependencies
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { DamasChinas, crearPartidaDamasChinas } from'./models/Juego.js';

let turn = 0;
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
let games = {};

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

    cantJug = Number(cantJug);

    partidas[partidaId] = { 
      id: partidaId, 
      nombre,
      tipo,
      cantJug, // Convertir a número si es necesario
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

  socket.on('iniciarPartida', (partidaId) => {
    const partida = partidas[partidaId];
    if (!partida) {
      socket.emit('errorIniciarPartida', 'Partida no encontrada.');
      return;
    }
  
    console.log(`Intentando iniciar partida ${partidaId}`);
    console.log(`Número de jugadores: ${partida.jugadores.length}`);
    console.log(`Número de jugadores requeridos: ${partida.cantJug}`);
  
    // Cambiar la comparación para usar el número exacto de jugadores
    if (partida.jugadores.length === partida.cantJug) {
      // Unir todos los jugadores a una sala con el ID de la partida

      partida.jugadores.forEach(jugador => {
        const socketCliente = io.sockets.sockets.get(jugador.id);
        if (socketCliente) {
          socketCliente.join(partidaId);
        }
      });
  
      // Emitir evento de inicio de partida a todos los jugadores en la sala
      io.to(partidaId).emit('partidaIniciada', { 
        id: partidaId,
        jugadores: partida.jugadores
      });
    } else {
      socket.emit('errorIniciarPartida', `No hay suficientes jugadores. Se necesitan ${partida.cantJug}, hay ${partida.jugadores.length}.`);
    }
  });

  // Actualizar estado del tablero
  socket.on('actualizarTablero', ({ partidaId, nuevoTablero }) => {
    const partida = partidas[partidaId];
    
    if (partida) {
      partida.tablero = nuevoTablero;
      
      // Emitir a todos los jugadores en la sala del juego
      io.to(partidaId).emit('tableroActualizado', nuevoTablero);
    }
  });

  socket.on('moverFicha', (data) => {
    // Actualizar el estado del tablero en el servidor (opcional, si necesitas guardarlo)
    // Emitir el movimiento a todos los jugadores
    io.emit('actualizarTablero', data);  // 'actualizarTablero' es el evento que se emitirá a los clientes
  });

  socket.on('verificarJugadoresPartida', (partidaId) => {
    const partida = partidas[partidaId];
    if (partida) {
      socket.emit('jugadoresPartida', partida.jugadores);
    } else {
      socket.emit('errorPartida', 'Partida no encontrada');
    }
  });

  // Evento para unirse a una partida existente
  socket.on('unirsePartida', ({partidaId, socketID}) => {
    const partida = partidas[partidaId];
    
    //Verifica que la partida exista
    if (!partida) {
      socket.emit('errorUnirsePartida', 'Partida no encontrada.');
      return;
    }

    const cantJug = Number(partida.cantJug);

    if (partida.jugadores.length >= cantJug) {
      socket.emit('errorUnirsePartida', 'La partida ya está llena.');
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

  socket.on('obtenerDetallesPartida', (partidaId) => {
    const partida = partidas[partidaId];
    if (partida) {
      socket.emit('detallesPartida', partida);
    }
  });

  // Manejar lanzamientos de dado
  socket.on('lanzamientoDado', (data) => {
    const partida = partidas[data.partidaId];
    if (!partida) return;

    // Guardar el resultado del dado
    if (!partida.diceRolls) {
        partida.diceRolls = {};
    }
    partida.diceRolls[data.jugador.id] = data.numero;

    // Emitir el resultado a todos los jugadores
    io.to(data.partidaId).emit('dadoLanzado', {
        jugador: data.jugador,
        numero: data.numero
    });

    // Si todos han tirado, determinar el orden
    if (Object.keys(partida.diceRolls).length === partida.jugadores.length) {
        const ordenJugadores = partida.jugadores.sort((a, b) => {
            return partida.diceRolls[b.id] - partida.diceRolls[a.id];
        });

        partida.ordenJugadores = ordenJugadores;
        partida.turnoActual = 0;

        io.to(data.partidaId).emit('ordenJuegoDeterminado', ordenJugadores);
      }
  });

  // Evento para desconectar
  socket.on('disconnect', () => {
    // Buscar y eliminar al jugador de las partidas
    for (const [id, partida] of Object.entries(partidas)) {
      const index = partida.jugadores.findIndex((jugador) => jugador.id === socket.id);
      if (index !== -1) {
        partida.jugadores.splice(index, 1);
        console.log(`Jugador ${usuarios[socket.id]?.nombre} (${socket.id}) eliminado de la partida ${id}`);
        
        // Si la partida ya está iniciada, notificar a los demás jugadores
        if (partida.estado === 'iniciada') {
          io.to(id).emit('jugadorDesconectado', { 
            jugadorId: socket.id,
            mensaje: `El jugador ${usuarios[socket.id]?.nombre} se ha desconectado`
          });
        }
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

function validarMovimiento(tablero, origen, destino, turnoActual) {
  const [origenFila, origenCol] = origen;
  const [destinoFila, destinoCol] = destino;

  // Implementar lógica personalizada de validación del juego
  if (Math.abs(destinoFila - origenFila) > 2 || Math.abs(destinoCol - origenCol) > 2) {
    return { valido: false };
  }

  // Actualizar tablero si el movimiento es válido
  const nuevoTablero = [...tablero];
  nuevoTablero[origenFila][origenCol] = 0;
  nuevoTablero[destinoFila][destinoCol] = tablero[origenFila][origenCol];

  return { valido: true, nuevoTablero };
}

// Función para determinar siguiente jugador
function determinarSiguienteJugador(gameId) {
  // Lógica para rotar turnos entre jugadores
  const game = games[gameId];
  const currentPlayerIndex = game.currentPlayerIndex;
  const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
  
  game.currentPlayerIndex = nextPlayerIndex;
  return game.players[nextPlayerIndex];
}

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
