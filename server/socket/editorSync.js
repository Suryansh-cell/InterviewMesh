module.exports = function (io) {
  const editorNsp = io.of('/editor');

  editorNsp.on('connection', (socket) => {
    console.log(`📝 Editor connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined editor room: ${roomId}`);
      socket.to(roomId).emit('peer-joined', { socketId: socket.id });
    });

    socket.on('code-change', ({ roomId, code, cursorPosition }) => {
      socket.to(roomId).emit('code-update', { code, cursorPosition, from: socket.id });
    });

    socket.on('cursor-change', ({ roomId, cursorPosition }) => {
      socket.to(roomId).emit('cursor-update', { cursorPosition, from: socket.id });
    });

    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-update', { language, from: socket.id });
    });

    socket.on('chat-message', ({ roomId, message, sender }) => {
      socket.to(roomId).emit('chat-message', { message, sender, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log(`📝 Editor disconnected: ${socket.id}`);
    });
  });
};
