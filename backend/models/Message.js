import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  content: { type: String, required: true },
  edited: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ channelId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
