import React, { useState, useEffect } from 'react';

export default function CreateChannelModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-50">
      <div className="bg-white w-[28rem] p-6 rounded-2xl border border-gray-200 shadow-2xl">
        <div className="text-2xl font-bold mb-4 text-gray-900">Create Channel</div>
        <div className="space-y-3">
          <input className="input" placeholder="Channel name" value={name} onChange={e=>setName(e.target.value)} />
          <textarea className="input h-24" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium" onClick={onClose}>Cancel</button>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md" onClick={()=>onCreate({ name, description })}>Create</button>
        </div>
      </div>
    </div>
  );
}

export function EditChannelModal({ open, onClose, onEdit, channel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (channel) {
      setName(channel.name || '');
      setDescription(channel.description || '');
    }
  }, [channel]);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-50">
      <div className="bg-white w-[28rem] p-6 rounded-2xl border border-gray-200 shadow-2xl">
        <div className="text-2xl font-bold mb-4 text-gray-900">Edit Channel</div>
        <div className="space-y-3">
          <input className="input" placeholder="Channel name" value={name} onChange={e=>setName(e.target.value)} />
          <textarea className="input h-24" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium" onClick={onClose}>Cancel</button>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md" onClick={()=>onEdit({ name, description })}>Save</button>
        </div>
      </div>
    </div>
  );
}
