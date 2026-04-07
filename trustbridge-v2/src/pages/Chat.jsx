import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Chat.css';

const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showStartChat, setShowStartChat] = useState(false);
  const [locals, setLocals] = useState([]);

  useEffect(() => {
    fetchChats();
    if (user.role === 'USER') {
      fetchLocalResidents();
    }
  }, []);

  useEffect(() => {
    if (id && chats.length > 0) {
      const chat = chats.find(c => c._id === id);
      if (chat) setSelectedChat(chat);
    }
  }, [id, chats]);

  const fetchChats = async () => {
    try {
      const endpoint = user.role === 'LOCAL' ? '/chat/local' : '/chat/user';
      const { data } = await axios.get(endpoint);
      setChats(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    } catch (err) {
      console.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocalResidents = async () => {
    try {
      const { data } = await axios.get('/admin/users');
      const verifiedLocals = data.filter(u => u.role === 'LOCAL' && u.isVerified);
      setLocals(verifiedLocals);
    } catch (err) {
      console.error('Failed to load local residents');
    }
  };

  const handleStartChat = async (localId) => {
    try {
      const { data } = await axios.post('/chat/start', {
        localResidentId: localId
      });
      setShowStartChat(false);
      fetchChats();
      setSelectedChat(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      await axios.post('/chat/message', {
        chatId: selectedChat._id,
        text: message
      });
      setMessage('');
      fetchChats();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const handleResolveChat = async () => {
    if (!selectedChat) return;
    
    try {
      await axios.put(`/chat/${selectedChat._id}/resolve`);
      fetchChats();
      alert('Chat marked as resolved');
    } catch (err) {
      alert('Failed to resolve chat');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  if (chats.length === 0 && user.role === 'USER') {
    return (
      <div className="chat-container-empty">
        <div className="empty-state-chat">
          <div className="empty-icon-large">💬</div>
          <h2>No Chats Yet</h2>
          <p>Start a conversation with a verified local resident to get help settling in</p>
          <button onClick={() => setShowStartChat(true)} className="btn-start-chat">
            Start New Chat
          </button>
        </div>

        {showStartChat && (
          <div className="modal-overlay" onClick={() => setShowStartChat(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Select a Local Resident</h3>
              <div className="locals-list">
                {locals.length === 0 ? (
                  <p>No verified local residents available</p>
                ) : (
                  locals.map(local => (
                    <div key={local._id} className="local-item" onClick={() => handleStartChat(local._id)}>
                      <div className="local-info">
                        <strong>{local.name}</strong>
                        <p>{local.city}</p>
                        <span className="trust-badge">Trust Score: {local.trustScore}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowStartChat(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Chats</h2>
          {user.role === 'USER' && (
            <button onClick={() => setShowStartChat(true)} className="btn-new-chat">
              +
            </button>
          )}
        </div>
        <div className="chat-list">
          {chats.length === 0 ? (
            <p className="no-chats">No chats yet</p>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                <h4>
                  {user.role === 'LOCAL' ? chat.user?.name : chat.localResident?.name}
                </h4>
                <p>{chat.messages?.length || 0} messages</p>
                {chat.isResolved && <span className="resolved-badge">Resolved</span>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <h3>
                {user.role === 'LOCAL' 
                  ? `Chat with ${selectedChat.user?.name}` 
                  : `Chat with ${selectedChat.localResident?.name}`}
              </h3>
              {!selectedChat.isResolved && (
                <button onClick={handleResolveChat} className="btn-resolve">
                  Mark as Resolved
                </button>
              )}
            </div>

            <div className="chat-messages">
              {selectedChat.messages?.length === 0 ? (
                <p className="no-messages">No messages yet. Start the conversation!</p>
              ) : (
                selectedChat.messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === user._id ? 'sent' : 'received'}`}
                  >
                    <p>{msg.text}</p>
                    <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                ))
              )}
            </div>

            {!selectedChat.isResolved && (
              <form onSubmit={handleSendMessage} className="chat-input">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button type="submit">Send</button>
              </form>
            )}
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {showStartChat && (
        <div className="modal-overlay" onClick={() => setShowStartChat(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select a Local Resident</h3>
            <div className="locals-list">
              {locals.length === 0 ? (
                <p>No verified local residents available</p>
              ) : (
                locals.map(local => (
                  <div key={local._id} className="local-item" onClick={() => handleStartChat(local._id)}>
                    <div className="local-info">
                      <strong>{local.name}</strong>
                      <p>{local.city}</p>
                      <span className="trust-badge">Trust Score: {local.trustScore}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowStartChat(false)} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
