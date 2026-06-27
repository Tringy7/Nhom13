import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/auth.context';
import { io } from 'socket.io-client';

const ManagerChatDashboard = () => {
    const { auth } = useContext(AuthContext);
    const [pendingList, setPendingList] = useState([]);
    const [assignedList, setAssignedList] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const socketRef = React.useRef();

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const fetchPending = async () => {
            const { data } = await axios.get(`${BASE_URL}/api/v1/conversations/pending`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setPendingList(data);
        };
        fetchPending();

        socketRef.current = io(BASE_URL, { auth: { token: auth.token } });

        socketRef.current.on('newPendingChat', (newChat) => {
            setPendingList(prev => [newChat, ...prev]);
        });

        socketRef.current.on('removePending', ({ conversationId }) => {
            setPendingList(prev => prev.filter(c => c.conversationId !== conversationId));
        });

        socketRef.current.on('newMessage', (newMessage) => {
            if (newMessage.conversationId === activeConvId) {
                setMessages(prev => [...prev, newMessage]);
            }
        });

        return () => socketRef.current.disconnect();
    }, [auth.token, activeConvId]);

    const handleAccept = async (conversationId) => {
        try {
            const { data: assignedConv } = await axios.patch(`${BASE_URL}/api/v1/conversations/${conversationId}/assign`, {}, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setAssignedList(prev => [assignedConv, ...prev]);
            setActiveConvId(conversationId);
            const { data: messages } = await axios.get(`${BASE_URL}/api/v1/conversations/${conversationId}/messages`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setMessages(messages);
            socketRef.current.emit('joinRoom', { conversationId });
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert('This conversation has already been accepted by another manager.');
            }
        }
    };
    
    const handleSendMessage = () => {
        if (inputValue.trim() === '') return;
        socketRef.current.emit('sendMessage', { conversationId: activeConvId, content: inputValue });
        setInputValue('');
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '10px' }}>
                <h3>Pending Chats</h3>
                {pendingList.map(conv => (
                    <div key={conv.conversationId} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0' }}>
                        <p><strong>{conv.userName}</strong></p>
                        <p>{conv.firstMessage}</p>
                        <button onClick={() => handleAccept(conv.conversationId)}>Accept</button>
                    </div>
                ))}
                <hr />
                <h3>My Chats</h3>
                {assignedList.map(conv => (
                    <div key={conv.id} onClick={() => setActiveConvId(conv.id)}>
                        <p><strong>{conv.user?.fullName}</strong></p>
                    </div>
                ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {activeConvId ? (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                            {messages.map(msg => (
                                <div key={msg.id} style={{ textAlign: msg.senderId === auth.user.id ? 'right' : 'left' }}>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '10px' }}>
                            <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </>
                ) : (
                    <p>Select a conversation to start chatting.</p>
                )}
            </div>
        </div>
    );
};

export default ManagerChatDashboard;