class Partida {
    constructor(id) {
      this.id = id;
      this.jugadores = [];
      this.estado = 'esperando'; // Puede ser 'esperando', 'jugando', 'finalizado'
    }
  
    agregarJugador(jugador) {
      if (this.jugadores.length < 2) {
        this.jugadores.push(jugador);
      }
      if (this.jugadores.length === 2) {
        this.estado = 'jugando';
      }
    }
  
    obtenerJugadores() {
      return this.jugadores;
    }
  }

export { Partida};