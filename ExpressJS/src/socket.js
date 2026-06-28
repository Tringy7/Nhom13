import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import db from "./entities/index.js";

const { User, Conversation, Message } = db;

// Maps to track in-memory state
// userId -> { userId, name, email, socketId, createdAt }
const pendingRequests = new Map();
// userId -> { conversationId, managerId, userSocketId, managerSocketId }
const activeChats = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authenticate websocket handshake using JWT
  io.use((socket, next) => {
    let token = null;

    // 1. Try to get token from cookies
    const cookieHeader = socket.handshake.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/accessToken=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
    
    // 2. If not in cookie, check auth handshake
    if (!token && socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role ? decoded.role.toLowerCase() : 'user',
        fullName: decoded.fullName
      };
      next();
    });
  });

  io.on("connection", async (socket) => {
    const { id: userId, role, fullName, email } = socket.user;
    console.log(`[Socket] Connected: ${fullName} (ID: ${userId}, Role: ${role}), Socket: ${socket.id}`);

    // If manager connects, join managers room and send pending list
    if (role === 'manager' || role === 'admin') {
      socket.join("managers");
      socket.emit("pending_list_update", Array.from(pendingRequests.values()));
      
      // Also send list of active chats for this manager to resume them
      const managerChats = [];
      for (const [uId, chatInfo] of activeChats.entries()) {
        if (chatInfo.managerId === userId) {
          chatInfo.managerSocketId = socket.id;
          socket.join(`room_${chatInfo.conversationId}`);
          
          try {
            const userRecord = await User.findByPk(uId, { attributes: ['id', 'fullName', 'email', 'avatar'] });
            managerChats.push({
              conversationId: chatInfo.conversationId,
              userId: uId,
              userName: userRecord?.fullName || "Khách hàng",
              userEmail: userRecord?.email || "",
              userAvatar: userRecord?.avatar || null
            });
          } catch (e) {
            console.error("Error fetching user record on reconnect:", e);
          }
        }
      }
      if (managerChats.length > 0) {
        socket.emit("active_chats_list", managerChats);
      }
    } else {
      // If user connects and has an active chat in memory, restore it
      if (activeChats.has(userId)) {
        const chatInfo = activeChats.get(userId);
        chatInfo.userSocketId = socket.id;
        socket.join(`room_${chatInfo.conversationId}`);
        
        try {
          const messages = await Message.findAll({
            where: { conversationId: chatInfo.conversationId },
            order: [['createdAt', 'ASC']],
            limit: 50
          });

          const manager = await User.findByPk(chatInfo.managerId, {
            attributes: ['id', 'fullName', 'email', 'avatar']
          });

          socket.emit("chat_accepted", {
            conversationId: chatInfo.conversationId,
            otherUser: {
              id: manager.id,
              name: manager.fullName,
              role: 'manager',
              avatar: manager.avatar
            },
            messages
          });

          if (chatInfo.managerSocketId) {
            io.to(chatInfo.managerSocketId).emit("user_reconnected", { userId });
          }
        } catch (err) {
          console.error("Error restoring user chat session:", err);
        }
      }
    }

    // 1. User requests support chat
    socket.on("request_chat", () => {
      if (role !== 'user') {
        return socket.emit("error_message", "Chỉ khách hàng mới có thể yêu cầu hỗ trợ.");
      }

      if (activeChats.has(userId)) {
        return socket.emit("error_message", "Bạn đang có cuộc trò chuyện hoạt động.");
      }

      pendingRequests.set(userId, {
        userId,
        name: fullName,
        email,
        socketId: socket.id,
        createdAt: new Date()
      });

      console.log(`[Socket] Chat requested by user: ${fullName} (ID: ${userId})`);
      io.to("managers").emit("pending_list_update", Array.from(pendingRequests.values()));
    });

    // 2. User cancels pending request
    socket.on("cancel_request", () => {
      if (pendingRequests.has(userId)) {
        pendingRequests.delete(userId);
        console.log(`[Socket] Request cancelled by user: ${fullName} (ID: ${userId})`);
        io.to("managers").emit("pending_list_update", Array.from(pendingRequests.values()));
      }
    });

    // 3. Manager accepts a pending request
    socket.on("accept_request", async ({ userId: targetUserId }) => {
      if (role !== 'manager' && role !== 'admin') {
        return socket.emit("error_message", "Chỉ quản lý hoặc admin mới được chấp nhận cuộc gọi.");
      }

      const pendingReq = pendingRequests.get(Number(targetUserId) || targetUserId);
      if (!pendingReq) {
        return socket.emit("error_message", "Yêu cầu đã được nhận bởi người khác hoặc đã bị hủy.");
      }

      pendingRequests.delete(targetUserId);
      io.to("managers").emit("pending_list_update", Array.from(pendingRequests.values()));

      try {
        // Create conversation
        const conversation = await Conversation.create({
          userId: targetUserId,
          adminId: userId
        });

        const userRecord = await User.findByPk(targetUserId, {
          attributes: ['id', 'fullName', 'email', 'avatar']
        });

        const chatInfo = {
          conversationId: conversation.id,
          managerId: userId,
          userSocketId: pendingReq.socketId,
          managerSocketId: socket.id
        };

        activeChats.set(targetUserId, chatInfo);

        // Put sockets in same room
        const targetSocket = io.sockets.sockets.get(pendingReq.socketId);
        if (targetSocket) {
          targetSocket.join(`room_${conversation.id}`);
        }
        socket.join(`room_${conversation.id}`);

        // Notify User
        io.to(pendingReq.socketId).emit("chat_accepted", {
          conversationId: conversation.id,
          otherUser: {
            id: userId,
            name: fullName,
            role: 'manager',
            avatar: socket.user.avatar || null
          },
          messages: []
        });

        // Notify Manager
        socket.emit("chat_accepted", {
          conversationId: conversation.id,
          otherUser: {
            id: targetUserId,
            name: userRecord.fullName,
            role: 'user',
            avatar: userRecord.avatar || null
          },
          messages: []
        });

        console.log(`[Socket] Manager ${fullName} accepted chat with User ID ${targetUserId}`);
      } catch (err) {
        console.error("Error accepting chat:", err);
        socket.emit("error_message", "Lỗi khởi tạo cuộc trò chuyện.");
      }
    });

    // 4. Send Message
    socket.on("send_message", async ({ conversationId, content }) => {
      if (!content || !content.trim()) return;

      try {
        const message = await Message.create({
          conversationId,
          senderId: userId,
          content,
          isRead: false
        });

        // Emit to the room
        io.to(`room_${conversationId}`).emit("receive_message", message);
      } catch (err) {
        console.error("Error saving message:", err);
        socket.emit("error_message", "Lỗi gửi tin nhắn.");
      }
    });

    // 5. End Chat
    socket.on("end_chat", async ({ conversationId }) => {
      let chatUserKey = null;
      let chatInfo = null;

      for (const [uId, info] of activeChats.entries()) {
        if (info.conversationId === Number(conversationId)) {
          chatUserKey = uId;
          chatInfo = info;
          break;
        }
      }

      if (chatInfo) {
        activeChats.delete(chatUserKey);

        io.to(`room_${conversationId}`).emit("chat_ended", { conversationId });

        // Sockets leave the room
        const userSocket = io.sockets.sockets.get(chatInfo.userSocketId);
        if (userSocket) userSocket.leave(`room_${conversationId}`);

        const managerSocket = io.sockets.sockets.get(chatInfo.managerSocketId);
        if (managerSocket) managerSocket.leave(`room_${conversationId}`);

        console.log(`[Socket] Chat ended for conversation ID ${conversationId}`);
      }
    });

    // Clean disconnects
    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${fullName} (Socket: ${socket.id})`);

      if (pendingRequests.has(userId) && pendingRequests.get(userId).socketId === socket.id) {
        pendingRequests.delete(userId);
        io.to("managers").emit("pending_list_update", Array.from(pendingRequests.values()));
      }

      // Handle socket nulls in activeChats
      for (const [uId, info] of activeChats.entries()) {
        if (info.userSocketId === socket.id) {
          info.userSocketId = null;
          if (info.managerSocketId) {
            io.to(info.managerSocketId).emit("user_disconnected", { userId });
          }
        } else if (info.managerSocketId === socket.id) {
          info.managerSocketId = null;
          if (info.userSocketId) {
            io.to(info.userSocketId).emit("manager_disconnected", { managerId: userId });
          }
        }
      }
    });
  });
};

export default initSocket;
