import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { listChannels, createChannel, joinChannel, leaveChannel, channelInfo, updateChannel, deleteChannel } from '../controllers/channelController.js';

const router = express.Router();
router.get('/', requireAuth, listChannels);
router.post('/', requireAuth, createChannel);
router.post('/:channelId/join', requireAuth, joinChannel);
router.post('/:channelId/leave', requireAuth, leaveChannel);
router.patch('/:channelId', requireAuth, updateChannel);
router.delete('/:channelId', requireAuth, deleteChannel);
router.get('/:channelId', requireAuth, channelInfo);

export default router;
