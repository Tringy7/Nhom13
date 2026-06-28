import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
    UserOutlined,
    SendOutlined,
    StopOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    CommentOutlined,
    HistoryOutlined,
    SearchOutlined,
    ArrowLeftOutlined,
    CalendarOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { Empty, notification, Input, Spin, Pagination } from 'antd';
import ManagerLayout from './ManagerLayout.jsx';
import { AuthContext } from '../../context/auth.context';
import { getChatHistoryApi, getChatDetailApi } from '../../util/api/manager.api';

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ManagerChat = () => {
    const { auth } = useContext(AuthContext);

    /* ── Tab state ── */
    const [activeTab, setActiveTab] = useState('live'); // 'live' | 'history'

    /* ── Live Chat state ── */
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeChats, setActiveChats] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messagesByConv, setMessagesByConv] = useState({});
    const [inputText, setInputText] = useState('');
    const [unreadCounts, setUnreadCounts] = useState({});

    /* ── History state ── */
    const [historyList, setHistoryList] = useState([]);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyLimit] = useState(15);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null); // { conversation, messages }
    const [historyDetailLoading, setHistoryDetailLoading] = useState(false);

    /* ── Refs ── */
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const historyEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        if (selectedConvId) scrollToBottom();
    }, [messagesByConv, selectedConvId]);

    useEffect(() => {
        if (selectedHistory) historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedHistory]);

    /* ─────────── Socket.IO ─────────── */
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
        const socket = io(backendUrl, { withCredentials: true, autoConnect: true });
        socketRef.current = socket;

        socket.on('connect', () => console.log('[Socket] Manager connected.'));

        socket.on('pending_list_update', (list) => setPendingRequests(list));

        socket.on('active_chats_list', (chats) => {
            setActiveChats(prev => {
                const existingIds = new Set(prev.map(c => c.conversationId));
                return [...prev, ...chats.filter(c => !existingIds.has(c.conversationId))];
            });
        });

        socket.on('chat_accepted', ({ conversationId, otherUser, messages }) => {
            const chatInfo = {
                conversationId,
                userId: otherUser.id,
                userName: otherUser.name,
                userEmail: otherUser.email || '',
                userAvatar: otherUser.avatar || null,
            };
            setActiveChats(prev => prev.some(c => c.conversationId === conversationId) ? prev : [...prev, chatInfo]);
            setMessagesByConv(prev => ({ ...prev, [conversationId]: messages || [] }));
            setSelectedConvId(conversationId);
            notification.success({
                message: 'Đã chấp nhận cuộc trò chuyện',
                description: `Bạn đang trò chuyện với ${otherUser.name}.`,
                placement: 'topRight',
                duration: 3,
            });
        });

        socket.on('receive_message', (message) => {
            const convId = message.conversationId;
            setMessagesByConv(prev => ({ ...prev, [convId]: [...(prev[convId] || []), message] }));
            setUnreadCounts(prev => {
                if (String(selectedConvId) === String(convId)) return prev;
                return { ...prev, [convId]: (prev[convId] || 0) + 1 };
            });
        });

        socket.on('chat_ended', ({ conversationId }) => {
            notification.info({
                message: 'Trò chuyện đã kết thúc',
                description: `Cuộc trò chuyện #${conversationId} đã được kết thúc.`,
                placement: 'topRight',
                duration: 4,
            });
            setActiveChats(prev => prev.filter(c => c.conversationId !== conversationId));
            setMessagesByConv(prev => { const n = { ...prev }; delete n[conversationId]; return n; });
            setUnreadCounts(prev => { const n = { ...prev }; delete n[conversationId]; return n; });
            setSelectedConvId(prev => prev === conversationId ? null : prev);
        });

        socket.on('error_message', (msg) => notification.error({ message: 'Lỗi', description: msg, placement: 'topRight' }));

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (selectedConvId) setUnreadCounts(prev => ({ ...prev, [selectedConvId]: 0 }));
    }, [selectedConvId]);

    /* ─────────── History Fetch ─────────── */
    const fetchHistory = useCallback(async (page = 1, search = '') => {
        setHistoryLoading(true);
        try {
            const res = await getChatHistoryApi({ page, limit: historyLimit, search });
            if (res && res.success) {
                setHistoryList(res.data || []);
                setHistoryTotal(res.total || 0);
            }
        } catch (err) {
            console.error('Error fetching chat history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, [historyLimit]);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory(historyPage, historySearch);
        }
    }, [activeTab, historyPage]);

    const handleHistorySearch = () => {
        setHistoryPage(1);
        fetchHistory(1, historySearch);
    };

    const fetchHistoryDetail = async (conversationId) => {
        setHistoryDetailLoading(true);
        try {
            const res = await getChatDetailApi(conversationId);
            if (res && res.success) {
                setSelectedHistory(res.data);
            }
        } catch (err) {
            notification.error({ message: 'Lỗi', description: 'Không thể tải chi tiết cuộc trò chuyện.', placement: 'topRight' });
        } finally {
            setHistoryDetailLoading(false);
        }
    };

    /* ─────────── Live Chat Handlers ─────────── */
    const handleAcceptRequest = (userId) => {
        if (socketRef.current) socketRef.current.emit('accept_request', { userId });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedConvId || !socketRef.current) return;
        socketRef.current.emit('send_message', { conversationId: selectedConvId, content: inputText });
        setInputText('');
    };

    const handleEndChat = (conversationId) => {
        if (!conversationId || !socketRef.current) return;
        if (window.confirm('Bạn có chắc muốn kết thúc cuộc trò chuyện này?')) {
            socketRef.current.emit('end_chat', { conversationId });
        }
    };

    /* ─────────── Derived ─────────── */
    const selectedChat = activeChats.find(c => c.conversationId === selectedConvId);
    const selectedMessages = messagesByConv[selectedConvId] || [];
    const totalUnread = Object.values(unreadCounts).reduce((s, v) => s + v, 0);

    /* ─────────── Render ─────────── */
    return (
        <ManagerLayout activeKey="chat">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
                .manager-chat-root { font-family: 'Outfit', sans-serif; }
                .chat-tab-btn { transition: all 0.2s ease; cursor: pointer; }
                .chat-tab-btn:hover { background: rgba(37,99,235,0.08) !important; }
                .chat-list-item { transition: all 0.2s ease; cursor: pointer; }
                .chat-list-item:hover { background: rgba(37,99,235,0.06) !important; }
                .pending-item:hover { background: rgba(37,99,235,0.04) !important; }
                .accept-btn:hover { background: #1d4ed8 !important; }
                .end-btn:hover { background: #b91c1c !important; }
                .history-item { transition: all 0.2s; cursor: pointer; }
                .history-item:hover { background: rgba(37,99,235,0.06) !important; transform: translateX(2px); }
                .manager-msg-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
                .history-search-input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
                .messages-scroll::-webkit-scrollbar, .history-list-scroll::-webkit-scrollbar { width: 5px; }
                .messages-scroll::-webkit-scrollbar-track, .history-list-scroll::-webkit-scrollbar-track { background: transparent; }
                .messages-scroll::-webkit-scrollbar-thumb, .history-list-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>

            <div className="manager-chat-root" style={styles.root}>
                {/* ── Page Header ── */}
                <div style={styles.pageHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.headerIcon}>
                            <CommentOutlined style={{ fontSize: '22px', color: '#2563eb' }} />
                        </div>
                        <div>
                            <h2 style={styles.pageTitle}>Hỗ trợ trực tuyến</h2>
                            <p style={styles.pageSubtitle}>Quản lý các cuộc trò chuyện hỗ trợ khách hàng theo thời gian thực</p>
                        </div>
                    </div>
                    <div style={styles.statsRow}>
                        <div style={styles.statPill}>
                            <ClockCircleOutlined style={{ color: '#d97706' }} />
                            <span>{pendingRequests.length} đang chờ</span>
                        </div>
                        <div style={{ ...styles.statPill, background: 'rgba(22,163,74,0.1)' }}>
                            <MessageOutlined style={{ color: '#16a34a' }} />
                            <span style={{ color: '#15803d' }}>{activeChats.length} đang mở</span>
                        </div>
                    </div>
                </div>

                {/* ── Tab Bar ── */}
                <div style={styles.tabBar}>
                    <button
                        className="chat-tab-btn"
                        onClick={() => setActiveTab('live')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'live' ? styles.tabBtnActive : {}) }}
                    >
                        <MessageOutlined />
                        <span>Trực tuyến</span>
                        {totalUnread > 0 && (
                            <span style={styles.tabUnreadBadge}>{totalUnread}</span>
                        )}
                    </button>
                    <button
                        className="chat-tab-btn"
                        onClick={() => setActiveTab('history')}
                        style={{ ...styles.tabBtn, ...(activeTab === 'history' ? styles.tabBtnActive : {}) }}
                    >
                        <HistoryOutlined />
                        <span>Lịch sử trò chuyện</span>
                    </button>
                </div>

                {/* ── Tab Content ── */}
                {activeTab === 'live' ? (
                    <LiveChatPanel
                        pendingRequests={pendingRequests}
                        activeChats={activeChats}
                        selectedConvId={selectedConvId}
                        setSelectedConvId={setSelectedConvId}
                        selectedChat={selectedChat}
                        selectedMessages={selectedMessages}
                        unreadCounts={unreadCounts}
                        inputText={inputText}
                        setInputText={setInputText}
                        auth={auth}
                        messagesEndRef={messagesEndRef}
                        onAccept={handleAcceptRequest}
                        onSend={handleSendMessage}
                        onEnd={handleEndChat}
                    />
                ) : (
                    <HistoryPanel
                        historyList={historyList}
                        historyTotal={historyTotal}
                        historyPage={historyPage}
                        setHistoryPage={setHistoryPage}
                        historyLimit={historyLimit}
                        historyLoading={historyLoading}
                        historySearch={historySearch}
                        setHistorySearch={setHistorySearch}
                        onSearch={handleHistorySearch}
                        onRefresh={() => fetchHistory(historyPage, historySearch)}
                        selectedHistory={selectedHistory}
                        setSelectedHistory={setSelectedHistory}
                        onSelectConv={fetchHistoryDetail}
                        historyDetailLoading={historyDetailLoading}
                        auth={auth}
                        historyEndRef={historyEndRef}
                    />
                )}
            </div>
        </ManagerLayout>
    );
};

/* ═══════════════════════════════════════════════════════════
   LIVE CHAT PANEL
═══════════════════════════════════════════════════════════ */
const LiveChatPanel = ({
    pendingRequests, activeChats, selectedConvId, setSelectedConvId,
    selectedChat, selectedMessages, unreadCounts, inputText, setInputText,
    auth, messagesEndRef, onAccept, onSend, onEnd
}) => (
    <div style={styles.mainPanel}>
        {/* Left Column */}
        <div style={styles.leftCol}>
            <div style={styles.colHeader}>
                <ClockCircleOutlined style={{ color: '#d97706' }} />
                <span style={styles.colTitle}>Yêu cầu chờ</span>
                {pendingRequests.length > 0 && <span style={styles.countBadgePending}>{pendingRequests.length}</span>}
            </div>

            <div style={{ ...styles.listArea, maxHeight: '200px' }}>
                {pendingRequests.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span style={{ fontSize: '12px', color: '#94a3b8' }}>Chưa có yêu cầu nào</span>}
                        style={{ margin: '16px auto' }} />
                ) : (
                    pendingRequests.map((req) => (
                        <div key={req.userId} className="pending-item" style={styles.pendingItem}>
                            <div style={styles.pendingAvatar}>
                                <UserOutlined style={{ color: '#2563eb', fontSize: '16px' }} />
                            </div>
                            <div style={styles.pendingInfo}>
                                <div style={styles.pendingName}>{req.name || 'Khách hàng'}</div>
                                <div style={styles.pendingEmail}>{req.email}</div>
                                <div style={styles.pendingTime}>
                                    {new Date(req.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <button className="accept-btn" onClick={() => onAccept(req.userId)} style={styles.acceptBtn}>
                                <CheckCircleOutlined /> Nhận
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div style={styles.divider} />

            <div style={styles.colHeader}>
                <MessageOutlined style={{ color: '#16a34a' }} />
                <span style={styles.colTitle}>Đang mở</span>
                {activeChats.length > 0 && <span style={styles.countBadgeActive}>{activeChats.length}</span>}
            </div>

            <div style={{ ...styles.listArea, maxHeight: '280px' }}>
                {activeChats.length === 0 ? (
                    <p style={styles.emptyText}>Chưa có cuộc trò chuyện</p>
                ) : (
                    activeChats.map((chat) => {
                        const isSelected = selectedConvId === chat.conversationId;
                        const unread = unreadCounts[chat.conversationId] || 0;
                        return (
                            <div
                                key={chat.conversationId}
                                className={`chat-list-item`}
                                onClick={() => setSelectedConvId(chat.conversationId)}
                                style={{
                                    ...styles.chatListItem,
                                    background: isSelected ? 'rgba(37,99,235,0.10)' : 'transparent',
                                    borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                                }}
                            >
                                <div style={styles.chatListAvatar}>
                                    <UserOutlined style={{ color: '#7c3aed', fontSize: '14px' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={styles.chatListName}>{chat.userName}</div>
                                    <div style={styles.chatListEmail}>{chat.userEmail}</div>
                                </div>
                                {unread > 0 && <span style={styles.unreadDot}>{unread}</span>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightCol}>
            {!selectedConvId ? (
                <div style={styles.noChatPlaceholder}>
                    <div style={styles.noChat}>
                        <CommentOutlined style={{ fontSize: '52px', color: '#cbd5e1' }} />
                        <h3 style={styles.noChatTitle}>Chọn cuộc trò chuyện</h3>
                        <p style={styles.noChatText}>Chấp nhận yêu cầu hoặc chọn một cuộc trò chuyện đang mở từ danh sách bên trái.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div style={styles.chatHeader}>
                        <div style={styles.chatHeaderUser}>
                            <div style={styles.chatHeaderAvatar}>
                                <UserOutlined style={{ color: '#fff', fontSize: '18px' }} />
                            </div>
                            <div>
                                <div style={styles.chatHeaderName}>{selectedChat?.userName || 'Khách hàng'}</div>
                                <div style={styles.chatHeaderEmail}>{selectedChat?.userEmail || ''}</div>
                            </div>
                        </div>
                        <button className="end-btn" onClick={() => onEnd(selectedConvId)} style={styles.endBtn}>
                            <StopOutlined /> Kết thúc trò chuyện
                        </button>
                    </div>

                    <div className="messages-scroll" style={styles.messagesArea}>
                        {selectedMessages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '30px', fontSize: '14px' }}>
                                Hãy bắt đầu cuộc trò chuyện!
                            </div>
                        ) : (
                            selectedMessages.map((msg) => {
                                const isMyMessage = Number(msg.senderId) === Number(auth.user?.id);
                                return (
                                    <MessageBubble key={msg.id} msg={msg} isMyMessage={isMyMessage} />
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={onSend} style={styles.inputForm}>
                        <input
                            className="manager-msg-input"
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Nhập tin nhắn hỗ trợ..."
                            style={styles.textInput}
                        />
                        <button type="submit" style={styles.sendBtn}>
                            <SendOutlined style={{ fontSize: '16px' }} />
                        </button>
                    </form>
                </>
            )}
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   HISTORY PANEL
═══════════════════════════════════════════════════════════ */
const HistoryPanel = ({
    historyList, historyTotal, historyPage, setHistoryPage, historyLimit,
    historyLoading, historySearch, setHistorySearch, onSearch, onRefresh,
    selectedHistory, setSelectedHistory, onSelectConv, historyDetailLoading,
    auth, historyEndRef
}) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onSearch();
    };

    return (
        <div style={styles.mainPanel}>
            {/* ── History List ── */}
            <div style={styles.leftColHistory}>
                {/* Search bar */}
                <div style={styles.historySearchBox}>
                    <input
                        className="history-search-input"
                        type="text"
                        placeholder="Tìm theo tên, email..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={styles.historySearchInput}
                    />
                    <button onClick={onSearch} style={styles.historySearchBtn}>
                        <SearchOutlined />
                    </button>
                    <button onClick={onRefresh} style={styles.historyRefreshBtn} title="Làm mới">
                        <ReloadOutlined />
                    </button>
                </div>

                <div style={{ padding: '0 12px 6px', fontSize: '12px', color: '#94a3b8' }}>
                    {historyTotal} cuộc trò chuyện
                </div>

                {/* List */}
                <div className="history-list-scroll" style={styles.historyListArea}>
                    {historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="default" />
                        </div>
                    ) : historyList.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa có lịch sử trò chuyện</span>}
                            style={{ margin: '30px auto' }}
                        />
                    ) : (
                        historyList.map((item) => {
                            const isSelected = selectedHistory?.conversation?.id === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="history-item"
                                    onClick={() => onSelectConv(item.id)}
                                    style={{
                                        ...styles.historyItem,
                                        background: isSelected ? 'rgba(37,99,235,0.08)' : '#fff',
                                        borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                                    }}
                                >
                                    <div style={styles.historyItemAvatar}>
                                        <UserOutlined style={{ color: '#7c3aed', fontSize: '16px' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={styles.historyItemName}>
                                            {item.user?.fullName || 'Khách hàng'}
                                        </div>
                                        <div style={styles.historyItemEmail}>{item.user?.email || ''}</div>
                                        {item.lastMessage && (
                                            <div style={styles.historyItemLastMsg} title={item.lastMessage.content}>
                                                {item.lastMessage.content.length > 40
                                                    ? item.lastMessage.content.slice(0, 40) + '...'
                                                    : item.lastMessage.content}
                                            </div>
                                        )}
                                    </div>
                                    <div style={styles.historyItemMeta}>
                                        <div style={styles.historyItemDate}>
                                            {new Date(item.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                        </div>
                                        <div style={styles.historyItemTime}>
                                            {new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {historyTotal > historyLimit && (
                    <div style={styles.historyPagination}>
                        <Pagination
                            current={historyPage}
                            total={historyTotal}
                            pageSize={historyLimit}
                            onChange={(page) => setHistoryPage(page)}
                            size="small"
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {/* ── History Detail ── */}
            <div style={styles.rightCol}>
                {historyDetailLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Spin size="large" />
                    </div>
                ) : !selectedHistory ? (
                    <div style={styles.noChatPlaceholder}>
                        <div style={styles.noChat}>
                            <HistoryOutlined style={{ fontSize: '52px', color: '#cbd5e1' }} />
                            <h3 style={styles.noChatTitle}>Xem lịch sử trò chuyện</h3>
                            <p style={styles.noChatText}>Chọn một cuộc trò chuyện từ danh sách bên trái để xem lại toàn bộ nội dung.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Detail header */}
                        <div style={styles.historyDetailHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={() => setSelectedHistory(null)}
                                    style={styles.backBtn}
                                    title="Quay lại"
                                >
                                    <ArrowLeftOutlined />
                                </button>
                                <div style={styles.chatHeaderAvatar}>
                                    <UserOutlined style={{ color: '#fff', fontSize: '16px' }} />
                                </div>
                                <div>
                                    <div style={styles.chatHeaderName}>
                                        {selectedHistory.conversation?.user?.fullName || 'Khách hàng'}
                                    </div>
                                    <div style={styles.chatHeaderEmail}>
                                        {selectedHistory.conversation?.user?.email || ''}
                                    </div>
                                </div>
                            </div>
                            <div style={styles.historyMeta}>
                                <CalendarOutlined style={{ color: '#64748b', fontSize: '13px' }} />
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    {new Date(selectedHistory.conversation?.createdAt).toLocaleString('vi-VN', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                                <span style={styles.msgCountBadge}>
                                    {selectedHistory.messages?.length || 0} tin nhắn
                                </span>
                            </div>
                        </div>

                        {/* Messages (read-only) */}
                        <div className="messages-scroll" style={{ ...styles.messagesArea, background: 'rgba(248,250,252,0.6)' }}>
                            {/* Readonly banner */}
                            <div style={styles.readonlyBanner}>
                                <HistoryOutlined style={{ color: '#64748b' }} />
                                <span>Đây là lịch sử trò chuyện — chỉ đọc</span>
                            </div>

                            {selectedHistory.messages?.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontSize: '14px' }}>
                                    Không có tin nhắn trong cuộc trò chuyện này.
                                </div>
                            ) : (
                                selectedHistory.messages.map((msg) => {
                                    const isMyMessage = Number(msg.senderId) === Number(auth.user?.id);
                                    return (
                                        <MessageBubble key={msg.id} msg={msg} isMyMessage={isMyMessage} senderName={msg.sender?.fullName} />
                                    );
                                })
                            )}
                            <div ref={historyEndRef} />
                        </div>

                        {/* Read-only input placeholder */}
                        <div style={styles.readonlyInputBar}>
                            <HistoryOutlined style={{ color: '#94a3b8' }} />
                            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Cuộc trò chuyện đã kết thúc — không thể gửi thêm tin nhắn</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   MESSAGE BUBBLE (shared)
═══════════════════════════════════════════════════════════ */
const MessageBubble = ({ msg, isMyMessage, senderName }) => (
    <div style={{ ...styles.msgRow, justifyContent: isMyMessage ? 'flex-end' : 'flex-start' }}>
        {!isMyMessage && (
            <div style={styles.msgAvatar}>
                <UserOutlined style={{ fontSize: '11px', color: '#2563eb' }} />
            </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start', gap: '2px' }}>
            {senderName && (
                <span style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: isMyMessage ? 0 : '4px' }}>
                    {senderName}
                </span>
            )}
            <div style={{
                ...styles.msgBubble,
                backgroundColor: isMyMessage ? '#2563eb' : '#fff',
                color: isMyMessage ? '#fff' : '#1e293b',
                borderRadius: isMyMessage ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                boxShadow: isMyMessage ? '0 4px 10px rgba(37,99,235,0.2)' : '0 2px 6px rgba(0,0,0,0.05)',
                border: isMyMessage ? 'none' : '1px solid #e2e8f0',
            }}>
                <div style={styles.msgContent}>{msg.content}</div>
                <div style={{ ...styles.msgTime, color: isMyMessage ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const styles = {
    root: { minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', gap: '16px' },

    pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' },
    headerIcon: { width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    pageTitle: { margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' },
    pageSubtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
    statsRow: { display: 'flex', gap: '10px' },
    statPill: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(217,119,6,0.1)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: 500, color: '#92400e' },

    /* Tab Bar */
    tabBar: { display: 'flex', gap: '4px', background: '#fff', borderRadius: '14px', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', width: 'fit-content' },
    tabBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '10px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: 500, color: '#64748b', cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap' },
    tabBtnActive: { background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' },
    tabUnreadBadge: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 },

    mainPanel: { flex: 1, display: 'flex', background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', minHeight: '580px' },

    /* Left Col Live */
    leftCol: { width: '290px', minWidth: '250px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', background: '#fafbfc' },
    colHeader: { display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px 8px' },
    colTitle: { fontSize: '11px', fontWeight: 700, color: '#374151', flex: 1, textTransform: 'uppercase', letterSpacing: '0.5px' },
    countBadgePending: { backgroundColor: '#f59e0b', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 },
    countBadgeActive: { backgroundColor: '#22c55e', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 },
    listArea: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px 8px', overflowY: 'auto' },
    divider: { height: '1px', background: '#f1f5f9', margin: '4px 0' },
    emptyText: { fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '12px' },

    pendingItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff' },
    pendingAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    pendingInfo: { flex: 1, minWidth: 0 },
    pendingName: { fontSize: '12px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    pendingEmail: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    pendingTime: { fontSize: '10px', color: '#f59e0b', marginTop: '1px' },
    acceptBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', transition: 'all 0.2s' },

    chatListItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' },
    chatListAvatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    chatListName: { fontSize: '12px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    chatListEmail: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    unreadDot: { backgroundColor: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: 700, flexShrink: 0 },

    /* Left Col History */
    leftColHistory: { width: '310px', minWidth: '260px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', background: '#fafbfc' },
    historySearchBox: { display: 'flex', gap: '6px', padding: '14px 12px 8px', alignItems: 'center' },
    historySearchInput: { flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: '#fff', transition: 'all 0.2s' },
    historySearchBtn: { width: '34px', height: '34px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
    historyRefreshBtn: { width: '34px', height: '34px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
    historyListArea: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px', overflowY: 'auto' },
    historyItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 10px', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '4px' },
    historyItemAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    historyItemName: { fontSize: '13px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    historyItemEmail: { fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    historyItemLastMsg: { fontSize: '11px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic' },
    historyItemMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 },
    historyItemDate: { fontSize: '11px', color: '#94a3b8', fontWeight: 500 },
    historyItemTime: { fontSize: '10px', color: '#cbd5e1' },
    historyPagination: { padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' },

    /* Right Col (shared) */
    rightCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    noChatPlaceholder: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
    noChat: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' },
    noChatTitle: { fontSize: '20px', fontWeight: 600, color: '#64748b', margin: 0 },
    noChatText: { fontSize: '14px', color: '#94a3b8', maxWidth: '320px', lineHeight: 1.6, margin: 0 },

    chatHeader: { padding: '14px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' },
    chatHeaderUser: { display: 'flex', alignItems: 'center', gap: '12px' },
    chatHeaderAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    chatHeaderName: { fontSize: '15px', fontWeight: 700, color: '#0f172a' },
    chatHeaderEmail: { fontSize: '12px', color: '#64748b' },
    endBtn: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' },

    messagesArea: { flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' },
    msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
    msgAvatar: { width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    msgBubble: { maxWidth: '65%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px' },
    msgContent: { fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' },
    msgTime: { fontSize: '10px', textAlign: 'right' },

    inputForm: { padding: '12px 18px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', alignItems: 'center' },
    textInput: { flex: 1, border: '1px solid #cbd5e1', borderRadius: '20px', padding: '10px 16px', fontSize: '14px', outline: 'none', transition: 'all 0.2s', background: '#f8fafc' },
    sendBtn: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.25)', flexShrink: 0 },

    /* History Detail */
    historyDetailHeader: { padding: '14px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexWrap: 'wrap', gap: '10px' },
    backBtn: { width: '34px', height: '34px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
    historyMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
    msgCountBadge: { backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', borderRadius: '10px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 },
    readonlyBanner: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(100,116,139,0.08)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#64748b', marginBottom: '8px', border: '1px solid rgba(100,116,139,0.15)' },
    readonlyInputBar: { padding: '12px 18px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' },
};

export default ManagerChat;
