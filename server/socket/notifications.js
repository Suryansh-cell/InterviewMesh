module.exports = function (io) {
  const notificationNsp = io.of('/notifications');

  notificationNsp.on('connection', (socket) => {
    // We already have userId from the middleware in index.js
    const userId = socket.userId;
    console.log(`🔔 Notifications connected: ${userId} (Socket: ${socket.id})`);

    // Handler for sending an invitation
    socket.on('send-invite', ({ targetUserId, roomId, callerName }) => {
      console.log(`📧 Invitation from ${callerName} (${userId}) to ${targetUserId} for room ${roomId}`);
      
      const targetSockets = global.userSocketMap.get(targetUserId);
      if (targetSockets && targetSockets.size > 0) {
        targetSockets.forEach(socketId => {
          io.to(socketId).emit('receive-invite', {
            callerId: userId,
            callerName,
            roomId
          });
        });
      } else {
        socket.emit('error-notice', { message: 'User is offline' });
      }
    });

    // Handler for accepting an invitation
    socket.on('accept-invite', ({ callerId, roomId }) => {
      const callerSockets = global.userSocketMap.get(callerId);
      if (callerSockets) {
        callerSockets.forEach(socketId => {
          io.to(socketId).emit('invite-accepted', {
            targetId: userId,
            roomId
          });
        });
      }
    });

    // Handler for declining an invitation
    socket.on('decline-invite', ({ callerId }) => {
      const callerSockets = global.userSocketMap.get(callerId);
      if (callerSockets) {
        callerSockets.forEach(socketId => {
          io.to(socketId).emit('invite-declined', {
            targetId: userId
          });
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔔 Notifications disconnected: ${userId}`);
    });
  });
};
