import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { getMessages, postMessage, editMessage, deleteMessage } from '../controllers/messageController.js';

const router = express.Router();
router.get('/:channelId', requireAuth, getMessages);
router.post('/:channelId', requireAuth, postMessage);
router.patch('/:messageId', requireAuth, editMessage);
router.delete('/:messageId', requireAuth, deleteMessage);

export default router;
