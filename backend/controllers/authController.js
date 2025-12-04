import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export async function signup(req, res) {
  const { username, email, password, avatar } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(409).json({ message: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash, avatar });
  const token = signToken({ userId: user._id }, process.env.JWT_SECRET);
  // Broadcast user count change
  const count = await User.countDocuments();
  req.app.get('io')?.emit('userCountChanged', count);
  res.json({ user: { id: user._id, username, email, avatar }, token });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar }, token });
}

export async function me(req, res) {
  const user = await User.findById(req.userId).select('username email avatar onlineStatus');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user });
}

export async function logout(req, res) {
  res.json({ message: 'Logged out' });
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.userId;
    // Remove user from all channels
    const Channel = (await import('../models/Channel.js')).default;
    await Channel.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );
    // Delete all messages from this user
    const Message = (await import('../models/Message.js')).default;
    await Message.deleteMany({ sender: userId });
    // Delete the user account
    await User.findByIdAndDelete(userId);
    // Broadcast user count change
    const count = await User.countDocuments();
    req.app.get('io')?.emit('userCountChanged', count);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
}

export async function getUserCount(req, res) {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user count' });
  }
}
