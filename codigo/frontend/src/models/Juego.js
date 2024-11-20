class Juego {
  constructor(socket) {
    this.socket = socket; 
  }

  // Método para crear una partida
  crearPartida(nombre, tipo, cantJug) {
    this.socket.emit('crearPartida', { nombre, tipo, cantJug });
  }

  // Método para unirse a una partida
  unirsePartida(partidaId) {
    this.socket.emit('unirsePartida', partidaId);
  }

  // Método para obtener las partidas disponibles
  obtenerPartidas() {
    this.socket.emit('obtenerPartidas');
  }

  // Método para escuchar actualizaciones de partidas
  onActualizarPartidas(callback) {
    this.socket.on('actualizarPartidas', callback);
  }

  // Método para escuchar cuando una partida es creada
  onPartidaCreada(callback) {
    this.socket.on('partidaCreada', callback);
  }

  // Método para escuchar cuando se une a una partida
  onPartidaUnida(callback) {
    this.socket.on('partidaUnida', callback);
  }

  // Método para escuchar errores al unirse a una partida
  onErrorUnirsePartida(callback) {
    this.socket.on('errorUnirsePartida', callback);
  }

  // Método para limpiar los listeners
  limpiarListeners() {
    this.socket.off('actualizarPartidas');
    this.socket.off('partidaCreada');
    this.socket.off('partidaUnida');
    this.socket.off('errorUnirsePartida');
  }
}

export default Juego;