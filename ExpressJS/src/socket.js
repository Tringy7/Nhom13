import { Server } from 'socket.io';
import db from './entities/index.js';
import jwt from 'jsonwebtoken';

const { Conversation, Message, User } = db;

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: Token not provided'));
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error: Invalid token'));
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        });
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id} with userId: ${socket.userId} and role: ${socket.userRole}`);

        if (socket.userRole === 'manager' || socket.userRole === 'admin') {
            socket.join('managers:pending');
        }

        socket.on('joinRoom', async ({ conversationId }) => {
            const conversation = await Conversation.findByPk(conversationId);
            if (conversation && (conversation.userId === socket.userId || conversation.assignedManagerId === socket.userId)) {
                socket.join(`conv_${conversationId}`);
                console.log(`User ${socket.userId} joined room: conv_${conversationId}`);
            }
        });

        socket.on('sendMessage', async ({ conversationId, content }) => {
            try {
                const conversation = await Conversation.findByPk(conversationId);
                if (!conversation) return; // Handle error: conversation not found

                // Authorization
                if (conversation.status === 'Assigned' &&
                    socket.userId !== conversation.userId &&
                    socket.userId !== conversation.assignedManagerId) {
                    // Maybe emit an error to the sender
                    return;
                }
                
                const message = await Message.create({
                    conversationId,
                    senderId: socket.userId,
                    content,
                });

                // If this is the first message, emit newPendingChat
                const messageCount = await Message.count({ where: { conversationId } });
                if (messageCount === 1) {
                    const convWithDetails = await Conversation.findByPk(conversation.id, {
                        include: [{ model: User, as: 'user', attributes: ['id', 'fullName'] }]
                    });
                    io.to('managers:pending').emit('newPendingChat', {
                        conversationId: convWithDetails.id,
                        userName: convWithDetails.user.fullName,
                        firstMessage: message.content,
                        createdAt: convWithDetails.createdAt
                    });
                }

                io.to(`conv_${conversationId}`).emit('newMessage', message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(`conv_${conversationId}`).emit('partnerTyping', { isTyping });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default initSocket;