import Message from '../models/Message.js';

export async function getMessages(req, res) {
  const { channelId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
  const skip = (page - 1) * limit;
  const messages = await Message.find({ channelId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar');
  res.json({ messages: messages.reverse(), page, limit });
}

export async function postMessage(req, res) {
  const { channelId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required' });
  console.log(`API: User ${req.userId} sending message to channel ${channelId}`);
  const msg = await Message.create({ sender: req.userId, channelId, content });
  const populated = await msg.populate('sender', 'username avatar');
  console.log(`API: Message created with sender: ${populated.sender.username} (${populated.sender._id})`);
  res.status(201).json({ message: populated });
}

export async function editMessage(req, res) {
  const { messageId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Content required' });
  const msg = await Message.findById(messageId);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  if (msg.sender.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });
  msg.content = content;
  msg.edited = true;
  await msg.save();
  res.json({ message: msg });
}

export async function deleteMessage(req, res) {
  const { messageId } = req.params;
  const msg = await Message.findById(messageId);
  if (!msg) return res.status(404).json({ message: 'Message not found' });
  if (msg.sender.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });
  await Message.findByIdAndDelete(messageId);
  res.json({ message: 'Message deleted' });
}
