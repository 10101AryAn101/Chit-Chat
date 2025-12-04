import express from 'express';
import { signup, login, me, logout, deleteAccount, getUserCount } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);
router.delete('/delete-account', requireAuth, deleteAccount);
router.get('/user-count', requireAuth, getUserCount);

export default router;
