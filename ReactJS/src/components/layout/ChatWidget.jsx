import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { 
    CommentOutlined, 
    SendOutlined, 
    CloseOutlined, 
    LoadingOutlined, 
    StopOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/auth.context';

const ChatWidget = () => {
    const { auth } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [chatState, setChatState] = useState('initial'); // 'initial' | 'waiting' | 'active' | 'ended'
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [managerInfo, setManagerInfo] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [unreadBadge, setUnreadBadge] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (chatState === 'active' || chatState === 'ended') {
            scrollToBottom();
        }
    }, [messages, chatState]);

    useEffect(() => {
        if (!auth.isAuthenticated || auth.user?.role?.toLowerCase() !== 'user') {
            return;
        }

        // Connect to Socket.IO server
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const socket = io(backendUrl, {
            withCredentials: true,
            autoConnect: true,
        });

        socketRef.current = socket;

        // Listen for events
        socket.on('connect', () => {
            console.log('[Socket] Connected to server as customer.');
        });

        socket.on('chat_accepted', ({ conversationId, otherUser, messages }) => {
            console.log('[Socket] Chat accepted by manager:', otherUser);
            setConversationId(conversationId);
            setManagerInfo(otherUser);
            setMessages(messages || []);
            setChatState('active');
            
            if (!isOpen) {
                setUnreadBadge(true);
            }
        });

        socket.on('receive_message', (message) => {
            setMessages(prev => [...prev, message]);
            if (!isOpen) {
                setUnreadBadge(true);
            }
        });

        socket.on('chat_ended', () => {
            setChatState('ended');
        });

        socket.on('manager_disconnected', () => {
            // Optional: visual notification that manager is offline temporarily
        });

        socket.on('error_message', (msg) => {
            alert(msg);
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [auth.isAuthenticated, auth.user?.role]);

    // Handle Open/Close Toggle
    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadBadge(false);
        }
    };

    // User requests chat with manager
    const handleRequestChat = () => {
        if (socketRef.current) {
            socketRef.current.emit('request_chat');
            setChatState('waiting');
        }
    };

    // User cancels pending request
    const handleCancelRequest = () => {
        if (socketRef.current) {
            socketRef.current.emit('cancel_request');
            setChatState('initial');
        }
    };

    // User sends message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !conversationId || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            conversationId,
            content: inputText
        });
        setInputText('');
    };

    // User ends active chat
    const handleEndChat = () => {
        if (conversationId && socketRef.current) {
            if (window.confirm('Bạn có chắc chắn muốn kết thúc cuộc trò chuyện này?')) {
                socketRef.current.emit('end_chat', { conversationId });
                setChatState('initial');
                setConversationId(null);
                setManagerInfo(null);
                setMessages([]);
            }
        }
    };

    // Clear ended screen and reset to initial
    const handleReset = () => {
        setChatState('initial');
        setConversationId(null);
        setManagerInfo(null);
        setMessages([]);
    };

    if (!auth.isAuthenticated || auth.user?.role?.toLowerCase() !== 'user') {
        return null;
    }

    return (
        <div style={styles.widgetContainer}>
            {/* Custom Animations & Fonts */}
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
                
                .chat-widget-wrapper {
                    font-family: 'Outfit', sans-serif;
                }
                
                @keyframes floatWidget {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }

                @keyframes pulseRing {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(30px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .floating-button {
                    animation: floatWidget 4s ease-in-out infinite;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .floating-button:hover {
                    transform: scale(1.1);
                }

                .pulse-active {
                    animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                .chat-window {
                    animation: slideIn 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
                }

                /* Scrollbar Customization */
                .chat-messages-container::-webkit-scrollbar {
                    width: 6px;
                }
                .chat-messages-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-messages-container::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .chat-messages-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.25);
                }
                `}
            </style>

            {/* Floating Bubble Button */}
            {!isOpen && (
                <button 
                    onClick={toggleChat} 
                    style={styles.floatingBtn}
                    className={`floating-button ${chatState === 'active' ? 'pulse-active' : ''}`}
                >
                    <CommentOutlined style={{ fontSize: '26px', color: '#fff' }} />
                    {unreadBadge && <div style={styles.badge} />}
                </button>
            )}

            {/* Chat Drawer Window */}
            {isOpen && (
                <div style={styles.chatWindow} className="chat-window chat-widget-wrapper">
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.headerTitleContainer}>
                            <CustomerServiceOutlined style={{ fontSize: '20px', color: '#fff' }} />
                            <div>
                                <h4 style={styles.headerTitle}>Hỗ trợ khách hàng</h4>
                                <span style={styles.headerSubtitle}>
                                    {chatState === 'active' ? 'Đang trò chuyện' : 'Trực tuyến'}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {chatState === 'active' && (
                                <button 
                                    onClick={handleEndChat} 
                                    style={styles.endChatBtn} 
                                    title="Kết thúc trò chuyện"
                                >
                                    <StopOutlined /> Kết thúc
                                </button>
                            )}
                            <button onClick={toggleChat} style={styles.closeBtn}>
                                <CloseOutlined style={{ fontSize: '16px' }} />
                            </button>
                        </div>
                    </div>

                    {/* Body Panels according to ChatState */}
                    <div style={styles.body}>
                        {chatState === 'initial' && (
                            <div style={styles.panelCenter}>
                                <div style={styles.iconCircle}>
                                    <CustomerServiceOutlined style={{ fontSize: '40px', color: '#2563eb' }} />
                                </div>
                                <h3 style={styles.panelTitle}>Chào {auth.user?.name}!</h3>
                                <p style={styles.panelText}>
                                    Bạn có thắc mắc hay cần hỗ trợ? Nhấn nút bên dưới để kết nối trực tiếp với nhân viên tư vấn của chúng tôi.
                                </p>
                                <button onClick={handleRequestChat} style={styles.primaryBtn}>
                                    Bắt đầu trò chuyện
                                </button>
                            </div>
                        )}

                        {chatState === 'waiting' && (
                            <div style={styles.panelCenter}>
                                <div style={styles.loadingWrapper}>
                                    <LoadingOutlined style={{ fontSize: '50px', color: '#2563eb' }} />
                                </div>
                                <h3 style={styles.panelTitle}>Đang tìm nhân viên...</h3>
                                <p style={styles.panelText}>
                                    Yêu cầu của bạn đã được gửi đến các quản lý. Vui lòng đợi trong giây lát khi chúng tôi kết nối bạn.
                                </p>
                                <button onClick={handleCancelRequest} style={styles.dangerBtn}>
                                    Hủy yêu cầu
                                </button>
                            </div>
                        )}

                        {chatState === 'active' && (
                            <div style={styles.chatActiveContainer}>
                                {/* Connection indicator showing manager name */}
                                <div style={styles.managerIndicator}>
                                    Tư vấn viên: <strong style={{ color: '#1e3a8a' }}>{managerInfo?.name || 'Quản lý'}</strong>
                                </div>

                                {/* Message log */}
                                <div style={styles.messagesContainer} className="chat-messages-container">
                                    {messages.map((msg) => {
                                        const isMyMessage = Number(msg.senderId) === Number(auth.user?.id);
                                        return (
                                            <div 
                                                key={msg.id} 
                                                style={{
                                                    ...styles.messageRow,
                                                    justifyContent: isMyMessage ? 'flex-end' : 'flex-start'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        ...styles.messageBubble,
                                                        backgroundColor: isMyMessage ? '#2563eb' : '#fff',
                                                        color: isMyMessage ? '#fff' : '#1e293b',
                                                        borderRadius: isMyMessage ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                                        boxShadow: isMyMessage ? '0 4px 10px rgba(37,99,235,0.2)' : '0 2px 6px rgba(0,0,0,0.05)',
                                                        border: isMyMessage ? 'none' : '1px solid #e2e8f0',
                                                    }}
                                                >
                                                    <div style={styles.messageContent}>{msg.content}</div>
                                                    <div style={{
                                                        ...styles.messageTime,
                                                        color: isMyMessage ? 'rgba(255,255,255,0.7)' : '#64748b'
                                                    }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Form Input */}
                                <form onSubmit={handleSendMessage} style={styles.inputForm}>
                                    <input 
                                        type="text" 
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Nhập tin nhắn..." 
                                        style={styles.textInput}
                                    />
                                    <button type="submit" style={styles.sendBtn}>
                                        <SendOutlined />
                                    </button>
                                </form>
                            </div>
                        )}

                        {chatState === 'ended' && (
                            <div style={styles.panelCenter}>
                                <div style={styles.iconCircleEnded}>
                                    <StopOutlined style={{ fontSize: '40px', color: '#ef4444' }} />
                                </div>
                                <h3 style={styles.panelTitle}>Trò chuyện đã kết thúc</h3>
                                <p style={styles.panelText}>
                                    Cuộc trò chuyện này đã được kết thúc bởi nhân viên hoặc do bạn yêu cầu. Cảm ơn bạn đã liên hệ!
                                </p>
                                <button onClick={handleReset} style={styles.primaryBtn}>
                                    Trở về ban đầu
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    widgetContainer: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
    },
    floatingBtn: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
        position: 'relative',
    },
    badge: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#ef4444',
        position: 'absolute',
        top: '2px',
        right: '2px',
        border: '2px solid #fff',
    },
    chatWindow: {
        width: '370px',
        height: '500px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#fff',
    },
    headerTitleContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    headerTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    closeBtn: {
        background: 'rgba(255,255,255,0.15)',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
    },
    endChatBtn: {
        background: 'rgba(239, 68, 68, 0.2)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '8px',
        padding: '4px 10px',
        color: '#fca5a5',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s',
    },
    body: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(248, 250, 252, 0.6)',
        position: 'relative',
    },
    panelCenter: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        textAlign: 'center',
    },
    iconCircle: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    iconCircleEnded: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    panelTitle: {
        fontSize: '20px',
        fontWeight: 600,
        color: '#0f172a',
        margin: '0 0 10px 0',
    },
    panelText: {
        fontSize: '14px',
        color: '#475569',
        margin: '0 0 24px 0',
        lineHeight: 1.5,
    },
    primaryBtn: {
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
        transition: 'transform 0.2s',
    },
    dangerBtn: {
        backgroundColor: '#ef4444',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        color: '#fff',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
        transition: 'transform 0.2s',
    },
    loadingWrapper: {
        marginBottom: '20px',
    },
    chatActiveContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
    },
    managerIndicator: {
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '8px 16px',
        fontSize: '13px',
        color: '#475569',
        textAlign: 'center',
    },
    messagesContainer: {
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    messageRow: {
        display: 'flex',
        width: '100%',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    messageContent: {
        fontSize: '14px',
        lineHeight: 1.4,
        wordBreak: 'break-word',
    },
    messageTime: {
        fontSize: '10px',
        textAlign: 'right',
    },
    inputForm: {
        padding: '12px 16px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        border: '1px solid #cbd5e1',
        borderRadius: '20px',
        padding: '10px 16px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border 0.2s',
    },
    sendBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(37,99,235,0.2)',
        transition: 'background 0.2s',
    }
};

export default ChatWidget;
