import React, { useState } from 'react';

export default function MessageBubble({ msg, mine, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <div 
      className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-3 group`}
      onMouseEnter={() => mine && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative">
        <div className={`max-w-xl px-4 py-3 pb-6 rounded-2xl shadow-sm ${mine ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' : 'bg-white border border-gray-200'}`}>
          <div className={`text-xs mb-1 font-medium ${mine ? 'text-indigo-100' : 'text-gray-600'}`}>
            {msg.sender.username}
            {msg.edited && <span className="ml-2 italic">(edited)</span>}
          </div>
          <div className={`${mine ? 'text-white' : 'text-gray-900'} mb-1`}>{msg.content}</div>
          <div className={`text-xs absolute bottom-1.5 right-3 ${mine ? 'text-indigo-200' : 'text-gray-400'}`}>
            {formatTime(msg.createdAt)}
          </div>
        </div>
        {mine && showActions && (
          <div className="absolute -top-8 right-0 flex gap-1 bg-gray-800 rounded-lg shadow-lg px-2 py-1">
            <button 
              onClick={() => onEdit(msg)}
              className="text-xs text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
              title="Edit"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => onDelete(msg._id)}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors"
              title="Delete"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
