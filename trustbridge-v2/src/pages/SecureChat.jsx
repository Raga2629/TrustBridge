import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../styles/Chat.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Inline gate: checks identity verification for LOCAL_RESIDENT before allowing chat
function IdentityGate({ user, children }) {
  const [checked, setChecked] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/identity-verification/status', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setIdentityVerified(res.data?.verificationStatus === 'verified');
      })
      .catch(() => setIdentityVerified(false))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  if (!identityVerified) {
    return (
      <div className="chat-disabled-notice">
        <p>🪪 Identity verification required to help newcomers.</p>
        <a href="/identity-verification" className="chat-verify-link">
          Complete Identity Verification →
        </a>
      </div>
    );
  }

  return children;
}

const SecureChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [residents, setResidents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('conversations'); // 'conversations' or 'residents'
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  // Check if user is verified local resident
  const isVerifiedResident = user?.role === 'LOCAL_RESIDENT' && user?.verificationStatus === 'APPROVED';

  useEffect(() => {
    fetchConversations();
    if (user?.role !== 'LOCAL_RESIDENT') {
      fetchVerifiedResidents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📞 Fetching conversations...');
      const res = await axios.get('/secure-chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Conversations loaded:', res.data);
      setConversations(res.data);
      
      // Auto-select first conversation if exists and no user is selected
      if (res.data.length > 0 && !selectedUser) {
        console.log('🎯 Auto-selecting first conversation');
        setSelectedUser(res.data[0].user);
      }
    } catch (err) {
      console.error('❌ Fetch conversations error:', err);
    }
  };

  const fetchVerifiedResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching verified residents...');
      
      // Don't filter by city/area - get all approved residents
      const res = await axios.get('/secure-chat/residents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Received residents:', res.data);
      setResidents(res.data);
      
      if (res.data.length === 0) {
        console.warn('⚠️ No verified residents found');
      }
    } catch (err) {
      console.error('❌ Fetch residents error:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/secure-chat/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Fetch conversation error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    // Check if LOCAL_RESIDENT and not approved
    if (user?.role === 'LOCAL_RESIDENT' && user?.verificationStatus !== 'APPROVED') {
      alert('You must be verified by admin before you can send messages.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/secure-chat/send', {
        receiverId: selectedUser._id,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchConversation(selectedUser._id);
      fetchConversations();
    } catch (err) {
      console.error('Send message error:', err);
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleReportMessage = async (messageId) => {
    const reason = prompt('Please provide a reason for reporting this message:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/secure-chat/report/${messageId}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Message reported successfully');
    } catch (err) {
      console.error('Report message error:', err);
      alert('Failed to report message');
    }
  };

  const selectResident = (resident) => {
    setSelectedUser({
      _id: resident._id,
      name: resident.name,
      area: resident.area,
      city: resident.city,
      yearsStaying: resident.yearsStaying,
      trustScore: resident.trustScore,
      isResident: true
    });
    setView('conversations');
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(`/secure-chat/search-users?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search users error:', err);
    }
  };

  const startNewConversation = (user) => {
    setSelectedUser({
      _id: user._id,
      name: user.name,
      email: user.email
    });
    setShowNewChatModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Secure Chat</h3>
          <div className="sidebar-actions">
            {isVerifiedResident && (
              <button 
                className="btn-new-chat"
                onClick={() => setShowNewChatModal(true)}
                title="Start new conversation"
              >
                + New Conversation
              </button>
            )}
            {user?.role !== 'LOCAL_RESIDENT' && (
              <div className="view-toggle">
                <button 
                  className={view === 'conversations' ? 'active' : ''}
                  onClick={() => setView('conversations')}
                >
                  Chats
                </button>
                <button 
                  className={view === 'residents' ? 'active' : ''}
                  onClick={() => setView('residents')}
                >
                  Residents
                </button>
              </div>
            )}
          </div>
        </div>

        {view === 'conversations' ? (
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <p className="empty-state">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.user._id}
                  className={`conversation-item ${selectedUser?._id === conv.user._id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(conv.user)}
                >
                  <div className="conv-avatar">{conv.user.name[0]}</div>
                  <div className="conv-info">
                    <div className="conv-name">{conv.user.name}</div>
                    <div className="conv-last-message">{conv.lastMessage}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="residents-list">
            {residents.length === 0 ? (
              <p className="empty-state">No verified residents found</p>
            ) : (
              residents.map((resident) => (
                <div
                  key={resident._id}
                  className="resident-item"
                  onClick={() => selectResident(resident)}
                >
                  <div className="resident-avatar">✓</div>
                  <div className="resident-info">
                    <div className="resident-name">{resident.name}</div>
                    <div className="resident-location">
                      📍 {resident.area}, {resident.city}
                    </div>
                    <div className="resident-details">
                      {resident.yearsStaying} years • Trust: {resident.trustScore}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <h3>{selectedUser.name}</h3>
                {selectedUser.isResident && (
                  <div className="resident-badge">
                    ✓ Verified Resident • {selectedUser.area} • {selectedUser.yearsStaying} years
                  </div>
                )}
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="empty-state">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    {msg.sender._id !== user._id && (
                      <button
                        className="report-btn"
                        onClick={() => handleReportMessage(msg._id)}
                        title="Report incorrect guidance"
                      >
                        ⚠️
                      </button>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSendMessage}>
              {user?.role === 'LOCAL_RESIDENT' && user?.verificationStatus !== 'APPROVED' ? (
                <div className="chat-disabled-notice">
                  <p>⏳ Chat replies are disabled until your account is verified by admin.</p>
                  <p>You can browse services while waiting for verification.</p>
                </div>
              ) : user?.role === 'LOCAL_RESIDENT' && user?.verificationStatus === 'APPROVED' ? (
                // Verified resident — check identity verification via API on first render
                <IdentityGate user={user}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading || !newMessage.trim()}>
                    Send
                  </button>
                </IdentityGate>
              ) : (
                <>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading || !newMessage.trim()}>
                    Send
                  </button>
                </>
              )}
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="empty-icon">💬</div>
            <p>Select a conversation or resident to start chatting</p>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-box new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start New Conversation</h3>
              <button className="modal-close" onClick={() => setShowNewChatModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={searchUsers}
                />
              </div>
              <div className="search-results">
                {searchResults.length === 0 && searchQuery && (
                  <p className="empty-state">No users found</p>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="search-result-item"
                    onClick={() => startNewConversation(user)}
                  >
                    <div className="result-avatar">{user.name[0]}</div>
                    <div className="result-info">
                      <div className="result-name">{user.name}</div>
                      <div className="result-email">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureChat;
