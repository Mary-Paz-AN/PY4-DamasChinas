import io from "socket.io-client";

// Verifica si ya existe un socket en sessionStorage (o localStorage si prefieres persistencia entre sesiones)
let socket;

// Verifica si ya se ha creado un socket en la sesión
if (!sessionStorage.getItem('socketCreated')) {
  // Si no existe, crea un nuevo socket y guarda esta información en sessionStorage
  socket = io("http://localhost:3001");
  sessionStorage.setItem('socketCreated', 'true');
  console.log("Nuevo socket creado");
} else {
  // Si ya existe, reutiliza la instancia
  socket = io("http://localhost:3001"); // Asegúrate de que solo se use una instancia
  console.log("Socket ya existe");
}

// Exporta el socket para usarlo en otras partes del código
export default socket;
