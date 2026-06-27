import express from 'express';
import conversationController from '../controllers/conversation.controller.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, conversationController.findOrCreateConversation);
router.get('/my', verifyToken, conversationController.getMyConversation);

// Manager routes
router.get('/pending', verifyToken, authorize('manager', 'admin'), conversationController.getPendingConversations);
router.patch('/:id/assign', verifyToken, authorize('manager', 'admin'), conversationController.assignConversation);
router.patch('/:id/resolve', verifyToken, authorize('manager', 'admin'), conversationController.resolveConversation);

// Common routes
router.get('/:id/messages', verifyToken, conversationController.getMessages);
router.patch('/:id/read', verifyToken, conversationController.markAsRead);

export default router;