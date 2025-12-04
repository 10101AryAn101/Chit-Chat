import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketCtx = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const socket = useMemo(() => {
    if (!user) return null;
    return io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: { userId: user?.id || user?._id }
    });
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('userOnline', ({ userId }) => setOnlineUsers(prev => new Set(prev).add(userId)));
    socket.on('userOffline', ({ userId }) => setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; }));
    return () => { socket.disconnect(); };
  }, [socket]);

  return (
    <SocketCtx.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketCtx.Provider>
  );
}

export function useSocket() { return useContext(SocketCtx); }
