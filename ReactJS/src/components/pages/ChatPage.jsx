import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Phone, Info, User, Paperclip, Image, Smile, Send, Clock, MessageCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/auth.context';

// Helper to get initials from a name
const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// --- UI Sub-components defined within the same file ---

const LoadingSkeleton = () => (
    <div className="w-full max-w-4xl mx-auto h-[calc(100vh-110px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b animate-pulse">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        </div>
        <div className="flex-1 p-6 space-y-6 overflow-y-hidden animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex items-end space-x-2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    {i % 2 === 0 && <div className="w-8 h-8 rounded-full bg-gray-200"></div>}
                    <div className={`h-12 rounded-lg bg-gray-200 ${i % 2 === 0 ? 'w-2/5' : 'w-1/2'}`}></div>
                </div>
            ))}
        </div>
        <div className="p-4 border-t animate-pulse">
            <div className="h-12 bg-gray-200 rounded-full"></div>
        </div>
    </div>
);

const ChatHeader = ({ managerInfo, conversation }) => {
    const statusConfig = {
        Pending: { icon: <Clock size={14} className="text-yellow-600" />, text: 'Đang tìm nhân viên...' },
        Assigned: { icon: <span className="w-2 h-2 rounded-full bg-green-500"></span>, text: 'Đang hỗ trợ' },
        Resolved: { icon: <span className="w-2 h-2 rounded-full bg-gray-400"></span>, text: 'Cuộc trò chuyện đã kết thúc' },
    };
    const currentStatus = statusConfig[conversation?.status] || statusConfig.Resolved;

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-500 font-bold text-lg">
                    {managerInfo?.avatar ? (
                        <img src={managerInfo.avatar} alt="Manager" className="w-full h-full rounded-full object-cover" />
                    ) : managerInfo ? (
                        getInitials(managerInfo.fullName)
                    ) : (
                        <User size={24} />
                    )}
                </div>
                <div>
                    <h2 className="font-semibold text-base text-gray-800">
                        {managerInfo?.fullName || 'Hỗ trợ khách hàng'}
                    </h2>
                    <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                        {currentStatus.icon}
                        <span>{currentStatus.text}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                    <Info size={20} className="text-gray-600" />
                </button>
            </div>
        </div>
    );
};

const MessageBubble = ({ message, isOwnMessage, showAvatar, managerInfo }) => {
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-end gap-2.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
            {!isOwnMessage && (
                <div className="w-8 h-8">
                    {showAvatar && (
                        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">
                            {getInitials(managerInfo?.fullName)}
                        </div>
                    )}
                </div>
            )}
            <div>
                <div
                    className={`
                        max-w-full px-4 py-2.5 transition-transform duration-200 hover:scale-[1.01]
                        ${isOwnMessage
                            ? 'bg-[#1677ff] text-white rounded-2xl rounded-br-md'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm'
                        }
                    `}
                >
                    <p className="text-sm break-words">{message.content}</p>
                </div>
                <p className={`text-xs mt-1.5 text-gray-400 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    {timeFormatter.format(new Date(message.createdAt))}
                </p>
            </div>
        </motion.div>
    );
};

const ChatInput = ({ value, onChange, onSend, disabled }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim() !== '') onSend();
        }
    };

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors duration-200"><Paperclip size={22} /></button>
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors duration-200"><Image size={22} /></button>
                <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors duration-200"><Smile size={22} /></button>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    disabled={disabled}
                    className="flex-1 w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 disabled:bg-gray-100 transition-shadow duration-200"
                />
                <button
                    onClick={onSend}
                    disabled={disabled || value.trim() === ''}
                    className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full transition-all duration-200 transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

const PendingState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="bg-gray-100 p-6 rounded-full animate-pulse">
            <Clock size={40} className="text-gray-500" />
        </div>
        <h3 className="mt-4 font-semibold text-lg text-gray-700">Đang tìm nhân viên hỗ trợ</h3>
        <p className="text-gray-500 text-sm">Thông thường mất dưới 1 phút. Vui lòng chờ trong giây lát.</p>
    </div>
);

const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <MessageCircle size={48} className="text-gray-300" />
        <h3 className="mt-4 font-semibold text-lg text-gray-700">Chưa có tin nhắn</h3>
        <p className="text-gray-500 text-sm">Hãy bắt đầu cuộc trò chuyện.</p>
    </div>
);

const ResolvedState = () => (
    <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
            <h4 className="font-semibold text-green-800">Cuộc trò chuyện đã kết thúc.</h4>
            <p className="text-sm text-green-700">Nếu cần hỗ trợ thêm, vui lòng tạo một cuộc trò chuyện mới.</p>
        </div>
    </div>
);


// --- Main ChatPage Component ---

const ChatPage = () => {
    // --- EXISTING LOGIC (UNCHANGED) ---
    const { auth } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [conversation, setConversation] = useState(null);
    const [managerInfo, setManagerInfo] = useState(null);
    const socketRef = useRef(null);
    const chatAreaRef = useRef(null);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const token = auth.token;

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        const initChat = async () => {
            setIsLoading(true);
            try {
                const { data: conv } = await axios.post(`${BASE_URL}/api/v1/conversations`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setConversation(conv);

                if (conv.assignedManager) {
                    setManagerInfo(conv.assignedManager);
                }

                if (conv.status === 'Assigned' || conv.status === 'Resolved') {
                    const { data: msgs } = await axios.get(`${BASE_URL}/api/v1/conversations/${conv.id}/messages`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setMessages(msgs);
                }

                socketRef.current = io(BASE_URL, { auth: { token } });
                socketRef.current.emit('joinRoom', { conversationId: conv.id });

                socketRef.current.on('newMessage', (newMessage) => {
                    setMessages(prev => [...prev, newMessage]);
                });

                socketRef.current.on('conversationAssigned', ({ manager }) => {
                    setManagerInfo(manager);
                    setConversation(prev => ({ ...prev, status: 'Assigned' }));
                });

                socketRef.current.on('conversationResolved', () => {
                    setConversation(prev => ({ ...prev, status: 'Resolved' }));
                });

            } catch (error) {
                console.error("Failed to initialize chat:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initChat();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [token]);

    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTo({
                top: chatAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (inputValue.trim() === '' || !conversation) return;
        
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: inputValue,
            senderId: auth.user.id,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);

        socketRef.current.emit('sendMessage', {
            conversationId: conversation.id,
            content: inputValue
        });
        setInputValue('');
    };
    // --- END OF EXISTING LOGIC ---

    // --- NEW UI RENDERING ---
    const renderChatContent = () => {
        if (conversation?.status === 'Pending') return <PendingState />;
        if (messages.length === 0 && conversation?.status === 'Assigned') return <EmptyState />;
        
        return (
            <div className="flex-1 p-6 space-y-4">
                {messages.map((msg, index) => {
                    const prevMessage = messages[index - 1];
                    const isOwnMessage = msg.senderId === auth.user.id;
                    const showAvatar = !isOwnMessage && (!prevMessage || prevMessage.senderId !== msg.senderId);
                    return (
                        <div key={msg.id} className={`w-full flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[65%] md:max-w-[85%]">
                                <MessageBubble
                                    message={msg}
                                    isOwnMessage={isOwnMessage}
                                    showAvatar={showAvatar}
                                    managerInfo={managerInfo}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-gray-100 flex justify-center items-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <style>{`
                .chat-bg {
                    background-color: #f5f5f5;
                    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
                }
                .chat-scroll::-webkit-scrollbar { display: none; }
                .chat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {isLoading ? <LoadingSkeleton /> : (
                <div className="w-full max-w-4xl mx-auto h-[calc(100vh-110px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <ChatHeader managerInfo={managerInfo} conversation={conversation} />
                    
                    <div ref={chatAreaRef} className="flex-1 overflow-y-auto chat-bg chat-scroll">
                        {renderChatContent()}
                    </div>

                    {conversation?.status === 'Resolved' ? (
                        <ResolvedState />
                    ) : (
                        <ChatInput
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onSend={handleSendMessage}
                            disabled={conversation?.status !== 'Assigned'}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatPage;