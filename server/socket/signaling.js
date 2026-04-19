module.exports = function (io) {
  const signalNsp = io.of('/signal');

  signalNsp.on('connection', (socket) => {
    console.log(`📡 Signal connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      const room = signalNsp.adapter.rooms.get(roomId);
      const numClients = room ? room.size : 0;
      
      if (numClients === 1) {
        socket.emit('room-created', roomId);
      } else if (numClients === 2) {
        socket.to(roomId).emit('peer-joined', { socketId: socket.id });
        socket.emit('room-joined', roomId);
      } else {
        socket.emit('room-full', roomId);
      }
    });

    socket.on('offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('offer', { offer, from: socket.id });
    });

    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', { answer, from: socket.id });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id });
    });

    socket.on('toggle-audio', ({ roomId, enabled }) => {
      socket.to(roomId).emit('peer-audio-toggle', { enabled, from: socket.id });
    });

    socket.on('toggle-video', ({ roomId, enabled }) => {
      socket.to(roomId).emit('peer-video-toggle', { enabled, from: socket.id });
    });

    socket.on('disconnect', () => {
      console.log(`📡 Signal disconnected: ${socket.id}`);
      socket.broadcast.emit('peer-disconnected', { socketId: socket.id });
    });
  });
};
