const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/socket.io',
        createProxyMiddleware({
            target: 'http://localhost:3001', // URL del backend con Socket.IO
            changeOrigin: true,
            ws: true, // Habilita WebSocket
        })
    );
};
