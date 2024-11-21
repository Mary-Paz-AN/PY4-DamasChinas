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
    this.socket.emit('unirsePartida', { 
      partidaId, 
      socketID: this.socket.id 
    });
  }

  // Método para iniciar una partida
  iniciarPartida(partidaId) {
    this.socket.emit('iniciarPartida', { partidaId });
  }

  // Método para obtener las partidas disponibles
  obtenerPartidas() {
    this.socket.emit('obtenerPartidas');
  }

  //Metodo para escuchar la navegacion a partidas
  onNavegacionPartida(callback) {
    this.socket.on('navegarAPartida', callback);
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

  // Método para escuchar cuando una partida es eliminada
  onPartidaEliminada(callback) {
    this.socket.on('partidaEliminada', callback);
  }

  // Método para escuchar cuando una partida es iniciada
  onPartidaIniciada(callback) {
    this.socket.on('partidaIniciada', callback);
  }

  // Método para actualizar ek dado
  lanzarDado(partidaId, jugador, numero) {
    this.socket.emit('lanzamientoDado', { 
      partidaId, 
      jugador, 
      numero 
    });
  }

  //Obtener los resultados del dado
  onDadoLanzado(callback) {
    this.socket.on('dadoLanzado', callback);
  }

  // Método para limpiar los listeners
  limpiarListeners() {
    this.socket.off('actualizarPartidas');
    this.socket.off('partidaCreada');
    this.socket.off('partidaUnida');
    this.socket.off('errorUnirsePartida');
    this.socket.off('partidaEliminada');
    this.socket.off('partidaIniciada');
  }
}

export default Juego;