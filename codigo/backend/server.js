// Dependencies
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketServer } from "socket.io";

// Constants
const app = express();
const server = http.createServer(app); // Usar este servidor para Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000", // URL del frontend
    methods: ["GET", "POST"],
  },
});

let partidas = {}; // Almacenará las partidas activas
let usuarios = {}; // Almacenará los usuarios con su socket ID
let ranking = {}; // Almacenará el ranking con formato {id: {ganador, creador, id}}
const tiempoPartida = 1 * 60 * 1000; //El tiempo que se tiene para iniciar una partida

// Función para generar un ID único para la partida
function generarIdPartida() {
  return "partida_" + Math.random().toString(36).substr(2, 9); // Ejemplo de ID aleatorio
}

// Función para eliminar una partida
function eliminarPartida(partidaId) {
  const partida = partidas[partidaId];
  
  //Verifica si la partida fue iniciada
  if(partida && !partida.iniciada) {
    //Eliminar la partida
    delete partidas[partidaId];
    console.log(`Se eliminó la partida ${partidaId} por no iniciarse a tiempo.`);

    //Avisar que la partida fue eliminada a los jugadores
    partida.jugadores.forEach(jugador => {
      io.to(jugador.id).emit('partidaEliminada', {
        partidaId,
        razon: 'Timepo para inicar la partida terminado.'
      });
    });

    //Actualizar la lista de partidas
    io.emit('actualizarPartidas', Object.values(partidas));

    console.log('\n');
  }
}

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar las partidas disponibles al conectarse
  socket.emit("actualizarPartidas", Object.values(partidas));

  // Login: asociar el nombre del usuario con su socket ID
  socket.on("login", ({ nombre, socketId }) => {
    if (nombre && socketId) {
      // Asociar el socket.id recibido con el nombre del usuario
      usuarios[socketId] = { nombre };
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
      iniciada: false,
      jugadores: [{ id: socket.id, nombre: usuarios[socket.id].nombre }] ,
      creada: Date.now()
    };

    console.log(`Socket jugador: ${socket.id}`);
    console.log(`Nombre del jugador: ${usuarios[socket.id].nombre}`);
    console.log(partidas);

    // Emitir el ID de la partida creada al jugador
    socket.emit('partidaCreada', partidaId);

    // Emitir la lista de partidas a todos los clientes conectados
    io.emit('actualizarPartidas', Object.values(partidas));

    //Inicia el temporizador para la eliminación de la partida
    setTimeout(() => {
      eliminarPartida(partidaId);
    }, tiempoPartida);

    console.log('\n');

  });

  //Evento para iniciar una partida
  socket.on('iniciarPartida', ({partidaId}) => {
    const partida = partidas[partidaId];
    
    if (!partida) {
      socket.emit('errorIniciarPartida', 'Partida no encontrada.');
      return;
    }
    
    partida.iniciada = true;
    console.log(`Intentando iniciar partida ${partidaId}`);
    console.log(`Número de jugadores: ${partida.jugadores.length}`);
    console.log(`Número de jugadores requeridos: ${partida.cantJug}`);

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

    console.log('\n');
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

    //Verificar si la partida ya fue iniciada o si el tiempo terminó
    const tiempo = Date.now() - partida.creada;

    if(partida.iniciada || tiempo >= tiempoPartida) {
      socket.emit('errorUnirsePartida', 'La partida no está disponible.');
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

    if (partida.jugadores.length >= partida.cantJug) {
      socket.emit('errorUnirsePartida', 'La partida ya está llena.');
      return;
    }

    // Agregar al jugador a la partida
    partida.jugadores.push({ id: socketID, nombre: usuarios[socketID].nombre });

    console.log(`Jugador ${usuarios[socketID].nombre} (${socketID}) se unió a la partida ${partidaId}`);

    // Emitir evento al cliente indicando que se unió correctamente
    socket.emit('partidaUnida', partida);

    // Actualizar la lista de partidas a todos los clientes
    io.emit('actualizarPartidas', Object.values(partidas));

    console.log('\n');
  });

  socket.on('obtenerDetallesPartida', (partidaId) => {
    const partida = partidas[partidaId];
    if (partida) {
      socket.emit('detallesPartida', partida);
    }
  });

  // Evento para obtener las partidas disponibles
  socket.on('obtenerPartidas', () => {
    const partidasDisponibles = Object.values(partidas); // Convertir partidas a array
    socket.emit('actualizarPartidas', partidasDisponibles); // Enviar las partidas al cliente
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

  // Evento para agregar un elemento al ranking
  socket.on("agregarRanking", ({ ganador, creador, id }) => {
    if (!ganador || !creador || !id) {
      socket.emit("errorRanking", "Datos incompletos para agregar al ranking.");
      return;
    }

    // Agregar el elemento al ranking
    ranking[id] = { ganador, creador, id };

    console.log(`Agregado al ranking: ${JSON.stringify(ranking[id])}`);

    // Emitir la lista de ranking actualizada a todos los clientes
    io.emit("actualizarRanking", Object.values(ranking));
  });

  // Evento para recuperar el ranking completo
  socket.on("obtenerRanking", () => {
    // Emitir el ranking completo al cliente
    socket.emit("actualizarRanking", Object.values(ranking));
  });

  // Evento para desconectar
  socket.on("disconnect", () => {
    // Buscar y eliminar al jugador de las partidas
    for (const [id, partida] of Object.entries(partidas)) {
      const index = partida.jugadores.findIndex(
        (jugador) => jugador.id === socket.id
      );
      if (index !== -1) {
        partida.jugadores.splice(index, 1);
        console.log(
          `Jugador ${usuarios[socket.id]} (${socket.id}) eliminado de la partida ${id}`
        );
      }
    }

    // Limpiar las partidas sin jugadores
    partidas = Object.fromEntries(
      Object.entries(partidas).filter(([id, partida]) => partida.jugadores.length > 0)
    );

    // Actualizar la lista de partidas a todos los clientes
    io.emit("actualizarPartidas", Object.values(partidas));
  });
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("build")); // Para servir archivos estáticos si fuera necesario

// Inicia el servidor
server.listen(3001, () => {
  console.log("Servidor iniciado en http://localhost:3001");
});
