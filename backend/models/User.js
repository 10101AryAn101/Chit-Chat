import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  onlineStatus: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
