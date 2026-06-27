import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Paperclip, Send, Phone, Info, CheckCheck } from 'lucide-react';

const SupportChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [adminInfo, setAdminInfo] = useState({});
    const chatAreaRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('token');
    const currentUserId = 'user-123'; // Replace with actual user ID

    useEffect(() => {
        if (!token) return;

        const fetchConversation = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.get(`${BASE_URL}/api/v1/conversations/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConversationId(data.conversationId);
                setAdminInfo({ name: data.adminName, avatar: data.adminAvatar });

                const messagesRes = await axios.get(`${BASE_URL}/api/v1/conversations/${data.conversationId}/messages?page=1&limit=50`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(messagesRes.data.messages.reverse());
                
                // Mark messages as read when page is opened
                axios.patch(`${BASE_URL}/api/v1/conversations/${data.conversationId}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

            } catch (error) {
                console.error("Failed to fetch conversation:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversation();
    }, [token]);

    useEffect(() => {
        if (!conversationId || !token) return;

        const socket = io(BASE_URL, { auth: { token } });
        socketRef.current = socket;

        socket.emit('joinRoom', conversationId);

        socket.on('newMessage', (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
            // Mark as read since the user is on the page
            socket.emit('markRead', { conversationId });
        });

        socket.on('partnerTyping', ({ isTyping }) => setIsTyping(isTyping));
        socket.on('adminStatus', ({ online }) => setAdminOnline(online));
        socket.on('messagesRead', () => {
            setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
        });

        return () => socket.disconnect();
    }, [conversationId, token]);

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;

        const optimisticMessage = {
            id: Date.now(),
            senderId: currentUserId,
            content: inputValue,
            createdAt: new Date().toISOString(),
            isRead: false,
        };
        setMessages(prev => [...prev, optimisticMessage]);

        socketRef.current.emit('sendMessage', { conversationId, content: inputValue });
        setInputValue('');
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socketRef.current.emit('typing', { conversationId, isTyping: false });
    };

    const handleTyping = (e) => {
        setInputValue(e.target.value);
        if (!socketRef.current) return;

        socketRef.current.emit('typing', { conversationId, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('typing', { conversationId, isTyping: false });
        }, 1500);
    };

    const handleQuickReply = (text) => {
        const optimisticMessage = {
            id: Date.now(),
            senderId: currentUserId,
            content: text,
            createdAt: new Date().toISOString(),
            isRead: false,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        socketRef.current.emit('sendMessage', { conversationId, content: text });
        setInputValue('');
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Please <a href="/login" className="text-blue-600">log in</a> to start a chat.</p>
            </div>
        );
    }
    
    const quickReplies = ['Kiểm tra đơn hàng', 'Đổi địa chỉ', 'Hủy đơn', 'Hỗ trợ bảo hành'];

    return (
        <div className="container mx-auto my-8 p-4 sm:p-0">
            <div className="w-full max-w-3xl mx-auto h-[80vh] bg-white rounded-lg shadow-lg flex flex-col">
                {/* Header */}
                <div className="p-4 bg-gray-50 rounded-t-lg border-b flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="relative">
                            <img src={adminInfo.avatar || 'https://via.placeholder.com/40'} alt="Admin" className="w-10 h-10 rounded-full" />
                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${adminOnline ? 'bg-green-500' : 'bg-gray-400'} ring-2 ring-white`}></span>
                        </div>
                        <div className="ml-3">
                            <p className="font-semibold">{adminInfo.name || 'Manager'}</p>
                            <p className="text-xs text-gray-500">{adminOnline ? 'Online' : 'Thường trả lời trong vài giờ'}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-500">
                        <button className="hover:text-gray-800"><Phone size={20} /></button>
                        <button className="hover:text-gray-800"><Info size={20} /></button>
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={chatAreaRef} className="flex-1 p-4 overflow-y-auto bg-gray-100">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><p>Loading messages...</p></div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex mb-3 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                {msg.senderId !== currentUserId && (
                                    <img src={adminInfo.avatar || 'https://via.placeholder.com/40'} alt="Admin" className="w-8 h-8 rounded-full mr-2" />
                                )}
                                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${msg.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <div className={`text-xs mt-1 flex items-center ${msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.senderId === currentUserId && msg.isRead && (
                                            <CheckCheck size={14} className="ml-1 text-green-300" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="flex justify-start items-center mb-3">
                            <img src={adminInfo.avatar || 'https://via.placeholder.com/40'} alt="Admin" className="w-8 h-8 rounded-full mr-2" />
                            <div className="bg-white px-3 py-2 rounded-lg flex items-center shadow">
                                <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                            </div>
                        </div>
                    )}
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center my-4">
                            <p className="text-gray-500 mb-3">Gợi ý nhanh:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {quickReplies.map(reply => (
                                    <button key={reply} onClick={() => handleQuickReply(reply)} className="bg-white border border-gray-300 text-sm text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100">
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t">
                    <div className="flex items-center">
                        <button className="text-gray-500 hover:text-gray-800 mr-2"><Paperclip size={22} /></button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleTyping}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleSendMessage} disabled={!inputValue.trim()} className="ml-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300">
                            <Send size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportChatPage;