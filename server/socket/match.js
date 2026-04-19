module.exports = function (io) {
  const matchNsp = io.of('/match');
  const lobbyUsers = new Map(); // socketId -> user data
  const userById = new Map(); // userId -> socketId

  const broadcastLobby = () => {
    const users = Array.from(lobbyUsers.values());
    matchNsp.emit('lobby-update', users);
  };

  matchNsp.on('connection', (socket) => {
    console.log(`📡 Match lobby connected: ${socket.id}`);

    socket.on('join-lobby', (user) => {
      if (!user || !user.userId) {
        return socket.emit('lobby-error', { message: 'Invalid user data for match lobby.' });
      }

      lobbyUsers.set(socket.id, {
        socketId: socket.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        elo_score: user.elo_score || 1000,
        rating: user.rating || 0,
        skill_tags: Array.isArray(user.skill_tags) ? user.skill_tags : (user.skill_tags ? JSON.parse(user.skill_tags) : []),
        free_slots: user.free_slots || [],
      });
      userById.set(user.userId, socket.id);
      socket.join('lobby');
      broadcastLobby();
    });

    socket.on('request-match', ({ targetUserId, roomId, from }) => {
      const targetSocketId = userById.get(targetUserId);
      if (!targetSocketId) {
        socket.emit('match-error', { message: 'Peer is no longer available.' });
        return;
      }

      socket.to(targetSocketId).emit('incoming-match', {
        roomId,
        from,
      });
      socket.emit('match-requested', { roomId, targetUserId });
    });

    socket.on('disconnect', () => {
      const user = lobbyUsers.get(socket.id);
      if (user) {
        userById.delete(user.userId);
      }
      lobbyUsers.delete(socket.id);
      broadcastLobby();
      console.log(`📡 Match lobby disconnected: ${socket.id}`);
    });
  });
};
