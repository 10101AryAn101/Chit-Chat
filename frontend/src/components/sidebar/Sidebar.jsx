import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({ channels, selectedId, onSelect, onCreate, onJoinLeave, onlineUsers, totalUsers, onlineUsersList }) {
  const { user, logout, deleteAccount } = useAuth();
  const [searchOnline, setSearchOnline] = React.useState('');
  const [showAllOnline, setShowAllOnline] = React.useState(false);

  const handleDelete = () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data.');
    if (confirmed) {
      deleteAccount();
    }
  };

  const filteredOnlineUsers = onlineUsersList.filter(u => 
    u.username.toLowerCase().includes(searchOnline.toLowerCase())
  );
  
  const displayedOnlineUsers = showAllOnline ? filteredOnlineUsers : filteredOnlineUsers.slice(0, 10);
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900 text-white flex flex-col border-r border-indigo-700/50 shadow-xl max-h-64 md:max-h-full overflow-y-auto md:overflow-visible">
      <div className="px-3 md:px-5 py-3 md:py-4 border-b border-indigo-700/30 flex items-center gap-2 md:gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${user?.onlineStatus ? 'bg-green-400 shadow-lg shadow-green-500/50' : 'bg-gray-500'}`}></div>
        <span className="font-bold text-base md:text-xl text-white drop-shadow-lg truncate">{user?.username}</span>
        <button className="ml-auto text-xs md:text-sm text-white bg-red-900 hover:bg-red-300 hover:text-gray-900 px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium transition-colors" onClick={handleDelete}><span className="hidden sm:inline">Delete</span><span className="sm:hidden">Del</span></button>
        <button className="text-xs md:text-sm text-gray-300 hover:bg-red-600 hover:text-white px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium transition-colors" onClick={logout}>Logout</button>
      </div>
      <div className="px-3 md:px-5 py-3 md:py-4 border-b border-indigo-700/30 flex items-center justify-between">
        <div className="text-xs md:text-sm font-bold uppercase tracking-wide text-white">Channels</div>
        <button className="text-xs bg-indigo-600 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-md hover:bg-indigo-700 transition-colors font-medium" onClick={onCreate}>+ New</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {channels.map(c => {
          const isMember = c.members?.some(m => (m._id||m) === (user._id||user.id));
          return (
            <div key={c._id} className={`px-3 md:px-5 py-2 md:py-3 cursor-pointer transition-all duration-300 ${selectedId===c._id?'bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-l-4 border-indigo-400 shadow-lg':'hover:bg-gradient-to-r hover:from-indigo-700/40 hover:to-purple-700/40 hover:shadow-md border-l-4 border-transparent hover:border-indigo-500/50'}`} onClick={()=>onSelect(c)}>
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-left flex-1 font-medium text-white text-sm md:text-base">{c.name}</div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <span className="text-xs text-white bg-indigo-800/50 px-1.5 md:px-2 py-0.5 rounded-full">{c.members.length}</span>
                  <button className={`text-xs px-2 md:px-2.5 py-0.5 md:py-1 rounded-md font-medium transition-colors ${isMember?'bg-red-500 hover:bg-red-600 text-white':'bg-green-500 hover:bg-green-600 text-white'}`}
                          onClick={(e)=>{e.stopPropagation(); onJoinLeave(c);}}>
                    {isMember ? 'Leave' : 'Join'}
                  </button>
                </div>
              </div>
              {c.description && <div className="text-xs text-gray-200 mt-1 md:mt-1.5 truncate">{c.description}</div>}
            </div>
          );
        })}
      </div>
      <div className="border-t border-indigo-700/30 bg-indigo-950/50">
        <div className="px-3 md:px-5 py-2 md:py-3 border-b border-indigo-700/30">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="text-xs md:text-sm font-bold uppercase tracking-wide text-white">Online</div>
              <div className="bg-green-500 text-white text-xs px-1.5 md:px-2 py-0.5 rounded-full font-semibold">{onlineUsers.size}</div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="text-xs md:text-sm font-bold uppercase tracking-wide text-white">Total</div>
              <div className="bg-indigo-700 text-white text-xs px-1.5 md:px-2 py-0.5 rounded-full font-semibold">{totalUsers}</div>
            </div>
          </div>
          {onlineUsersList.length > 5 && (
            <input
              type="text"
              placeholder="Search users..."
              value={searchOnline}
              onChange={(e) => setSearchOnline(e.target.value)}
              className="w-full bg-indigo-800/50 text-gray-200 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-indigo-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-indigo-300"
            />
          )}
        </div>
        <div className="px-3 md:px-5 py-2 md:py-3 max-h-48 md:max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-indigo-900">
          {filteredOnlineUsers.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              {searchOnline ? 'No users found' : 'No users online'}
            </div>
          )}
          {displayedOnlineUsers.map((u) => (
            <div key={u._id} className="flex items-center gap-2 py-2 hover:bg-indigo-800/30 rounded px-2 transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0"></div>
              <div className="text-sm text-white truncate flex-1">{u.username}</div>
              {u._id === user?._id && <span className="text-xs text-indigo-300">(you)</span>}
            </div>
          ))}
          {filteredOnlineUsers.length > 10 && (
            <button
              onClick={() => setShowAllOnline(!showAllOnline)}
              className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 py-2 font-medium"
            >
              {showAllOnline ? `Show less` : `Show ${filteredOnlineUsers.length - 10} more...`}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
