import { io } from 'socket.io-client';

class Juego {
  constructor() {
    if (!Juego.instance) {
      // Solo se crea la conexión al socket si no existe una instancia
      this.socket = io('http://localhost:3001');
      this.partidaId = null;
      this.nombre = '';

      this.socket.on('connect', () => {
        console.log('Conectado al servidor:', this.socket.id);
      });

      // Eventos del servidor
      this.socket.on('partidaCreada', (id) => {
        console.log(`Partida creada con ID: ${id}`);
        this.partidaId = id;
      });

      this.socket.on('partidaUnida', (partida) => {
        console.log('Te has unido a la partida:', partida);
      });

      this.socket.on('inicioJuego', (partida) => {
        console.log('Juego comenzado en la partida:', partida);
      });

      // Usamos una propiedad estática para asegurarnos que solo exista una instancia
      Juego.instance = this;
    }

    return Juego.instance; // Retorna la misma instancia cada vez
  }

  // Métodos para interactuar con el servidor
  crearPartida(nombre) {
    this.nombre = nombre;
    if (this.socket.connected) {
      this.socket.emit('crearPartida', { nombre });
    } else {
      console.error('No estás conectado al servidor');
    }
  }

  unirsePartida(partidaId) {
    if (this.socket.connected) {
      this.socket.emit('unirsePartida', partidaId);
    } else {
      console.error('No estás conectado al servidor');
    }
  }
}

// Hacemos de Juego un singleton para evitar crear múltiples instancias
export default Juego;
