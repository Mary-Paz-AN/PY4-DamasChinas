import io from "socket.io-client";

// Usa solo el socket global
let socket;

if (!window.globalSocket) {
  window.globalSocket = io("http://localhost:3001", {
    reconnection: true,
    transports: ['websocket']
  });
  socket = window.globalSocket;
} else {
  socket = window.globalSocket;
}

export default socket;