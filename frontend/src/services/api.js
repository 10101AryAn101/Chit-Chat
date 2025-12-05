import { http } from './http.js';

export const api = {
  // Auth
  signup: (payload) => http.post('/auth/signup', payload)
  .then(r => r.data),
  login: (email, password) => http.post('/auth/login', { email, password })
  .then(r => r.data),
  logout: () => http.post('/auth/logout')
  .then(r => r.data),
  me: () => http.get('/auth/me')
  .then(r => r.data),
  deleteAccount: () => http.delete('/auth/delete-account')
  .then(r => r.data),
  getUserCount: () => http.get('/auth/user-count')
  .then(r => r.data),

  // Channels
  getChannels: () => http.get('/channels')
  .then(r => r.data),
  createChannel: (payload) => http.post('/channels', payload)
  .then(r => r.data),
  joinChannel: (id) => http.post(`/channels/${id}/join`)
  .then(r => r.data),
  leaveChannel: (id) => http.post(`/channels/${id}/leave`)
  .then(r => r.data),
  updateChannel: (id, payload) => http.patch(`/channels/${id}`, payload)
  .then(r => r.data),
  deleteChannel: (id) => http.delete(`/channels/${id}`)
  .then(r => r.data),
  channelInfo: (id) => http.get(`/channels/${id}`)
  .then(r => r.data),

  // Messages
  getMessages: (channelId, page = 1, limit = 30) => http.get(`/messages/${channelId}?page=${page}&limit=${limit}`)
  .then(r => r.data),
  sendMessage: (channelId, content) => http.post(`/messages/${channelId}`, { content })
  .then(r => r.data),
  editMessage: (messageId, content) => http.patch(`/messages/${messageId}`, { content })
  .then(r => r.data),
  deleteMessage: (messageId) => http.delete(`/messages/${messageId}`)
  .then(r => r.data)
};
