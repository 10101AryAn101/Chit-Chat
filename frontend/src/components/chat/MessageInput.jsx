import React, { useState, useEffect } from 'react';

export default function MessageInput({ onSend, disabled, isMember, onJoin, editingMessage, onCancelEdit, channelId }) {
  const [text, setText] = useState('');
  
  // Load draft from localStorage when channel changes
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
    } else if (channelId) {
      const draftKey = `draft_${channelId}`;
      const savedDraft = localStorage.getItem(draftKey);
      setText(savedDraft || '');
    } else {
      setText('');
    }
  }, [editingMessage, channelId]);
  
  const send = () => { 
    if (text.trim()) { 
      onSend(text.trim()); 
      setText(''); 
      // Clear draft from localStorage after sending
      if (channelId) {
        localStorage.removeItem(`draft_${channelId}`);
      }
    } 
  };
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    // Save draft to localStorage
    if (channelId) {
      if (newText.trim()) {
        localStorage.setItem(`draft_${channelId}`, newText);
      } else {
        localStorage.removeItem(`draft_${channelId}`);
      }
    }
  };
  
  // Show Join button if user is not a member
  if (!isMember) {
    return (
      <div className="h-16 md:h-20 border-t border-gray-200 bg-white flex items-center justify-center gap-3 px-3 md:px-4 shadow-lg">
        <button 
          className="bg-green-500 text-white px-4 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-xl hover:bg-green-600 transition-all font-semibold shadow-md hover:shadow-lg"
          onClick={onJoin}
        >
          <span className="hidden sm:inline">Join Channel to Send Messages</span>
          <span className="sm:hidden">Join to Send Messages</span>
        </button>
      </div>
    );
  }
  
  return (
    <div className="border-t border-gray-200 bg-white shadow-lg">
      {editingMessage && (
        <div className="px-3 md:px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="text-xs md:text-sm text-amber-800">
            <span className="font-semibold">Editing message</span>
          </div>
          <button onClick={onCancelEdit} className="text-xs md:text-sm text-amber-600 hover:text-amber-800 font-medium">Cancel</button>
        </div>
      )}
      <div className="h-16 md:h-20 flex items-center gap-2 md:gap-3 px-3 md:px-4">
        <textarea value={text} onChange={handleChange} onKeyDown={onKey} disabled={disabled}
          className="flex-1 resize-none h-10 md:h-11 rounded-xl border border-gray-300 px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white placeholder-gray-400 scrollbar-hide" placeholder="Type a message..." style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}} />
        <button className="bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" onClick={send} disabled={disabled}>
          {editingMessage ? 'Update' : 'Send'}
        </button>
      </div>
    </div>
  );
}
