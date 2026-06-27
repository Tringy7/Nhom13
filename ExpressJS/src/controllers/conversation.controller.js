import entities from '../entities/index.js';
import { Op } from 'sequelize';

const { Conversation, Message, User } = entities;

const findOrCreateConversation = async (req, res) => {
    try {
        const [conversation, created] = await Conversation.findOrCreate({
            where: {
                userId: req.userId,
                status: { [Op.ne]: 'Resolved' }
            },
            defaults: {
                userId: req.userId,
                status: 'Pending'
            }
        });
        res.status(created ? 201 : 200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            where: { userId: req.userId, status: { [Op.ne]: 'Resolved' } },
            include: [
                { model: User, as: 'assignedManager', attributes: ['id', 'fullName', 'avatar'] },
                { model: Message, as: 'messages', order: [['createdAt', 'ASC']] }
            ]
        });
        if (!conversation) {
            return res.status(404).json({ message: "No active conversation found." });
        }
        res.status(200).json({ conversation });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPendingConversations = async (req, res) => {
    try {
        const pendingConversations = await Conversation.findAll({
            where: { status: 'Pending' },
            include: [
                { model: User, as: 'user', attributes: ['id', 'fullName'] },
                { model: Message, as: 'messages', limit: 1, order: [['createdAt', 'ASC']] }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.status(200).json(pendingConversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const assignConversation = async (req, res) => {
    const { id } = req.params;
    const io = req.app.get('socketio');

    try {
        const [affectedRows] = await Conversation.update(
            { assignedManagerId: req.userId, status: 'Assigned' },
            { where: { id, status: 'Pending' } }
        );

        if (affectedRows === 0) {
            return res.status(409).json({ message: 'Conversation already assigned or resolved.' });
        }

        const conversation = await Conversation.findByPk(id, {
            include: [{ model: User, as: 'assignedManager', attributes: ['id', 'fullName', 'avatar'] }]
        });

        // Notify user and other managers
        io.to(`conv_${id}`).emit('conversationAssigned', { manager: conversation.assignedManager });
        io.to('managers:pending').emit('removePending', { conversationId: id });

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMessages = async (req, res) => {
    const { id } = req.params;
    try {
        const conversation = await Conversation.findByPk(id);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

        // Authorization
        if (req.userId !== conversation.userId && req.userId !== conversation.assignedManagerId) {
            return res.status(403).json({ message: 'Not authorized to view these messages.' });
        }

        const messages = await Message.findAll({
            where: { conversationId: id },
            order: [['createdAt', 'ASC']],
            limit: 100 // Or use pagination
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    const { id } = req.params;
    const io = req.app.get('socketio');
    try {
        await Message.update(
            { isRead: true },
            { where: { conversationId: id, senderId: { [Op.ne]: req.userId }, isRead: false } }
        );
        io.to(`conv_${id}`).emit('messagesRead', { readBy: req.userId });
        res.status(200).json({ message: 'Messages marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const resolveConversation = async (req, res) => {
    const { id } = req.params;
    const io = req.app.get('socketio');
    try {
        const conversation = await Conversation.findByPk(id);
        if (conversation.assignedManagerId !== req.userId) {
            return res.status(403).json({ message: 'Only the assigned manager can resolve this conversation.' });
        }
        await conversation.update({ status: 'Resolved' });
        io.to(`conv_${id}`).emit('conversationResolved');
        res.status(200).json({ message: 'Conversation has been resolved.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export default {
    findOrCreateConversation,
    getMyConversation,
    getPendingConversations,
    assignConversation,
    getMessages,
    markAsRead,
    resolveConversation
};