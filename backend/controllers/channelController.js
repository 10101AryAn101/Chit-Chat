import Channel from '../models/Channel.js';

export async function listChannels(req, res) {
  const channels = await Channel.find({}).select('name description members createdAt');
  res.json({ channels });
}

export async function createChannel(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const exists = await Channel.findOne({ name });
  if (exists) return res.status(409).json({ message: 'Channel exists' });
  const channel = await Channel.create({ name, description, members: [req.userId] });
  res.status(201).json({ channel });
}

export async function joinChannel(req, res) {
  const { channelId } = req.params;
  const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { members: req.userId } }, { new: true });
  if (!channel) return res.status(404).json({ message: 'Not found' });
  res.json({ channel });
}

export async function leaveChannel(req, res) {
  const { channelId } = req.params;
  const channel = await Channel.findByIdAndUpdate(channelId, { $pull: { members: req.userId } }, { new: true });
  if (!channel) return res.status(404).json({ message: 'Not found' });
  res.json({ channel });
}

export async function channelInfo(req, res) {
  const { channelId } = req.params;
  const channel = await Channel.findById(channelId).populate('members', 'username avatar onlineStatus');
  if (!channel) return res.status(404).json({ message: 'Not found' });
  res.json({ channel, membersCount: channel.members.length });
}

export async function updateChannel(req, res) {
  const { channelId } = req.params;
  const { name, description } = req.body;
  
  const channel = await Channel.findById(channelId);
  if (!channel) return res.status(404).json({ message: 'Channel not found' });
  
  // Only channel members can edit
  if (!channel.members.some(m => m.toString() === req.userId)) {
    return res.status(403).json({ message: 'Only channel members can edit' });
  }
  
  if (name) {
    // Check if name already exists (for other channels)
    const exists = await Channel.findOne({ name, _id: { $ne: channelId } });
    if (exists) return res.status(409).json({ message: 'Channel name already exists' });
    channel.name = name;
  }
  
  if (description !== undefined) channel.description = description;
  
  await channel.save();
  res.json({ channel });
}

export async function deleteChannel(req, res) {
  const { channelId } = req.params;
  const channel = await Channel.findById(channelId);
  if (!channel) return res.status(404).json({ message: 'Channel not found' });
  
  // Only channel creator (first member) can delete
  if (channel.members.length > 0 && channel.members[0].toString() !== req.userId) {
    return res.status(403).json({ message: 'Only channel creator can delete' });
  }
  
  await Channel.findByIdAndDelete(channelId);
  
  // Also delete all messages in this channel
  const Message = (await import('../models/Message.js')).default;
  await Message.deleteMany({ channelId });
  
  res.json({ message: 'Channel deleted successfully' });
}
