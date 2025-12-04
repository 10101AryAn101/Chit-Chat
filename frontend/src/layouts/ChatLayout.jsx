import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { api } from '../services/api.js';
import Sidebar from '../components/sidebar/Sidebar.jsx';
import MessageBubble from '../components/messages/MessageBubble.jsx';
import MessageInput from '../components/chat/MessageInput.jsx';
import CreateChannelModal, { EditChannelModal } from '../components/modals/CreateChannelModal.jsx';

export default function ChatLayout() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [channels, setChannels] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineUsersList, setOnlineUsersList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const currentChannelRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const listRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);

  useEffect(() => { (async () => {
    const { channels } = await api.getChannels();
    setChannels(channels);
    if (channels.length && !selected) setSelected(channels[0]);
    const { count } = await api.getUserCount();
    setTotalUsers(count);
  })(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('userCountChanged', (count) => {
      setTotalUsers(count);
    });
    socket.on('onlineUsersUpdate', (users) => {
      setOnlineUsersList(users);
    });
    return () => {
      socket.off('userCountChanged');
      socket.off('onlineUsersUpdate');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('getOnlineUsers');
  }, [socket, onlineUsers]);

  useEffect(() => {
    if (!socket || !selected) return;
    
    socket.emit('joinChannel', selected._id);
    
    socket.on('newMessage', (msg) => {
      if (msg.channelId === selected._id) {
        setMessages(prev => {
          const exists = prev.some(m => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    });
    
    socket.on('messageEdited', ({ messageId, content }) => {
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, content, edited: true } : m
      ));
    });
    
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    });
    
    return () => {
      socket.emit('leaveChannel', selected._id);
      socket.off('newMessage');
      socket.off('messageEdited');
      socket.off('messageDeleted');
    };
  }, [socket, selected, user]);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  const loadMessages = async (channelId, reset=false) => {
    if (!channelId) return;
    currentChannelRef.current = channelId;
    setLoadingMsgs(true);
    const nextPage = reset ? 1 : page;
    const { messages: m } = await api.getMessages(channelId, nextPage, 30);
    setHasMore(m.length === 30);
    setPage(nextPage + 1);
    setMessages(prev => {
      // Ignore stale responses if user switched channels during fetch
      if (currentChannelRef.current !== channelId) return prev;
      const combined = reset ? m : [...m, ...prev];
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        if (!seen.has(item._id)) { seen.add(item._id); unique.push(item); }
      }
      unique.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
      return unique;
    });
    setLoadingMsgs(false);
  };

  const send = async (text) => {
    if (!text.trim() || !selected) return;
    if (editingMessage) {
      await api.editMessage(editingMessage._id, text.trim());
      socket?.emit('editMessage', { channelId: selected._id, messageId: editingMessage._id, content: text.trim() });
      setMessages(prev => prev.map(m => 
        m._id === editingMessage._id ? { ...m, content: text.trim(), edited: true } : m
      ));
      setEditingMessage(null);
    } else {
      const { message } = await api.sendMessage(selected._id, text.trim());
      socket?.emit('newMessage', { channelId: selected._id, messageId: message._id });
      setMessages(prev => {
        const next = [...prev, message];
        next.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        return next;
      });
    }
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    await api.deleteMessage(msgId);
    socket?.emit('deleteMessage', { channelId: selected._id, messageId: msgId });
    setMessages(prev => prev.filter(m => m._id !== msgId));
  };

  const cancelEdit = () => {
    setEditingMessage(null);
  };

  const handleJoinFromInput = async () => {
    if (!selected) return;
    await onJoinLeave(selected);
  };

  const isUserMember = selected ? selected.members?.some(m => (m._id||m) === (user._id||user.id)) : false;

  const onScroll = (e) => {
    const top = e.target.scrollTop === 0;
    if (top && hasMore && selected) loadMessages(selected._id, false);
  };

  const onCreate = async ({ name, description }) => {
    setErrorMsg('');
    if (!name.trim()) { setErrorMsg('Channel name is required'); return; }
    try {
      const { channel } = await api.createChannel({ name, description });
      setChannels(prev => [channel, ...prev]);
      setShowCreate(false);
      // Auto-select and join the newly created channel
      setSelected(channel);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create channel';
      setErrorMsg(msg);
    }
  };

  const onJoinLeave = async (c) => {
    const isMember = c.members?.some(m => (m._id||m) === (user._id||user.id));
    const res = isMember ? await api.leaveChannel(c._id) : await api.joinChannel(c._id);
    // Update channels list
    setChannels(prev => prev.map(x => x._id===c._id ? res.channel : x));
    // If current selected is this channel, update selected reference and keep messages
    if (selected?._id === c._id) setSelected(res.channel);
  };

  const selectChannel = async (c) => {
    if (!c) return;
    setSelected(c);
    setMessages([]);
    setPage(1);
    await loadMessages(c._id, true);
  };

  const handleEditChannel = async ({ name, description }) => {
    if (!selected) return;
    setErrorMsg('');
    
    if (!name.trim()) {
      setErrorMsg('Channel name is required');
      return;
    }
    
    try {
      const { channel } = await api.updateChannel(selected._id, { name, description });
      // Update in channels list
      setChannels(prev => prev.map(c => c._id === selected._id ? channel : c));
      // Update selected
      setSelected(channel);
      setShowEdit(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update channel';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleDeleteChannel = async () => {
    if (!selected) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete "${selected.name}"? This will permanently delete all messages in this channel.`);
    
    if (!confirmed) return;
    
    try {
      await api.deleteChannel(selected._id);
      // Remove from channels list
      setChannels(prev => prev.filter(c => c._id !== selected._id));
      // Clear selection and messages
      setSelected(null);
      setMessages([]);
      // Select first available channel if any
      const remaining = channels.filter(c => c._id !== selected._id);
      if (remaining.length > 0) {
        await selectChannel(remaining[0]);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete channel';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar channels={channels} selectedId={selected?._id} onSelect={selectChannel} onCreate={() => setShowCreate(true)} onJoinLeave={onJoinLeave} onlineUsers={onlineUsers} totalUsers={totalUsers} onlineUsersList={onlineUsersList} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 md:h-20 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm px-3 md:px-6 py-2">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent tracking-wide truncate">{selected?.name || 'Select a channel'}</div>
            </div>
            {selected && <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {isUserMember && (
                <>
                  <button 
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-1.5 text-xs md:text-sm text-blue-600 hover:text-white bg-blue-50 hover:bg-green-500 px-2 md:px-3 py-1.5 rounded-full transition-all font-medium"
                    title="Edit Channel"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button 
                    onClick={handleDeleteChannel}
                    className="flex items-center gap-1.5 text-xs md:text-sm text-red-600 hover:text-white bg-red-50 hover:bg-red-500 px-2 md:px-3 py-1.5 rounded-full transition-all font-medium"
                    title="Delete Channel"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
                <span className="font-medium">{selected.members.length}</span>
              </div>
            </div>}
          </div>
        </div>
        {errorMsg && (
          <div className="px-4 py-3 bg-red-50 text-red-700 border-b border-red-200 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            {errorMsg}
          </div>
        )}
        <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {!selected && <div className="text-center text-gray-500 mt-10 px-4">Choose a channel to start chatting</div>}
          {selected && loadingMsgs && <div className="text-center text-gray-500">Loading messages...</div>}
          {selected && messages.map(m => (
            <MessageBubble 
              key={`${m._id}-${m.createdAt}`} 
              msg={m} 
              mine={(m.sender._id||m.sender.id) === (user._id||user.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {selected && !loadingMsgs && messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation.</div>
          )}
        </div>
        <MessageInput 
          onSend={send} 
          disabled={!selected} 
          isMember={isUserMember || !selected} 
          onJoin={handleJoinFromInput}
          editingMessage={editingMessage}
          onCancelEdit={cancelEdit}
          channelId={selected?._id}
        />
      </div>

      <CreateChannelModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={onCreate} />
      <EditChannelModal open={showEdit} onClose={() => setShowEdit(false)} onEdit={handleEditChannel} channel={selected} />
    </div>
  );
}
