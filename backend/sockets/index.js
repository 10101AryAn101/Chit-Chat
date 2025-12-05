import { Server } from 'socket.io';
import User from '../models/User.js';

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN, credentials: true }
  });

  io.on('connection', async (socket) => {
    const userId = socket.handshake.auth?.userId;
    socket.userId = userId;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, { onlineStatus: true });
      io.emit('userOnline', { userId });
      
      const onlineUsers = await User.find({ onlineStatus: true })
      .select('_id username avatar')
      .limit(100)
      .lean();
      io.emit('onlineUsersUpdate', onlineUsers);
    }

    socket.on('getOnlineUsers', async () => {
      const onlineUsers = await User.find({ onlineStatus: true })
      .select('_id username avatar')
      .limit(100)
      .lean();
      socket.emit('onlineUsersUpdate', onlineUsers);
    });

    socket.on('joinChannel', (channelId) => {
      socket.join(channelId);
    });

    socket.on('leaveChannel', (channelId) => {
      socket.leave(channelId);
    });

    socket.on('newMessage', async ({ channelId, messageId }) => {
      const Message = (await import('../models/Message.js')).default;
      const msg = await Message.findById(messageId).populate('sender', 'username avatar');
      if (msg) {
        const messageObj = {
          _id: msg._id,
          sender: {
            _id: msg.sender._id,
            username: msg.sender.username,
            avatar: msg.sender.avatar
          },
          channelId: msg.channelId,
          content: msg.content,
          edited: msg.edited,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        };
        io.to(channelId).emit('newMessage', messageObj);
      }
    });

    socket.on('editMessage', ({ channelId, messageId, content }) => {
      io.to(channelId).emit('messageEdited', { messageId, content });
    });

    socket.on('deleteMessage', ({ channelId, messageId }) => {
      io.to(channelId).emit('messageDeleted', { messageId });
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { onlineStatus: false });
        io.emit('userOffline', { userId: socket.userId });
        
        const onlineUsers = await User.find({ onlineStatus: true }).select('_id username avatar').limit(100).lean();
        io.emit('onlineUsersUpdate', onlineUsers);
      }
    });
  });

  return io;
}
