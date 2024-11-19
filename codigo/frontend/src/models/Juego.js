import { io } from 'socket.io-client';
class Juego {
  constructor() {
    this.socket = io('http://localhost:3001');
    this.partidaId = null;
    this.nombre = '';

    this.socket.on('connect', () => {
      console.log('Conectado al servidor:', this.socket.id);
    });

    // Evento cuando se crea una partida en el backend
    this.socket.on('partidaCreada', (id) => {
      console.log(`Partida creada con ID: ${id}`);
      this.partidaId = id; // Guardamos el ID de la partida
    });

    this.socket.on('partidaUnida', (partida) => {
      console.log('Te has unido a la partida:', partida);
    });

    this.socket.on('inicioJuego', (partida) => {
      console.log('Juego comenzado en la partida:', partida);
    });
  }

  crearPartida(nombre) {
    this.nombre = nombre;
    this.socket.emit('crearPartida', nombre);
  }

  unirsePartida(idPartida, nombre) {
    this.nombre = nombre;
    this.socket.emit('unirsePartida', idPartida, nombre);
  }
}

export default Juego;