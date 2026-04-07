const ChatMessage = require('../models/ChatMessage');
const Resident = require('../models/Resident');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Send message
// @route   POST /api/secure-chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // If sender is LOCAL_RESIDENT, check if they are APPROVED AND identity-verified
    if (req.user.role === 'LOCAL_RESIDENT') {
      const senderResident = await Resident.findOne({ user: req.user._id });
      if (!senderResident || senderResident.verificationStatus !== 'APPROVED') {
        return res.status(403).json({ 
          message: 'Only verified local residents can reply to messages. Please wait for admin approval.',
          verificationStatus: senderResident?.verificationStatus || 'NOT_FOUND'
        });
      }

      // Also require identity verification
      const IdentityVerification = require('../models/IdentityVerification');
      const identityVerified = await IdentityVerification.findOne({
        userId: req.user._id,
        verificationStatus: 'verified'
      });
      if (!identityVerified) {
        return res.status(403).json({
          message: 'Identity verification is required before you can help newcomers.',
          action: 'verify_identity',
          redirectTo: '/identity-verification'
        });
      }
    }

    // If receiver is LOCAL_RESIDENT, check if they are verified
    if (receiver.role === 'LOCAL_RESIDENT') {
      const resident = await Resident.findOne({ user: receiverId });
      if (!resident || resident.verificationStatus !== 'APPROVED') {
        return res.status(403).json({ message: 'Cannot send message to unverified resident' });
      }
    }

    // Create message
    const chatMessage = await ChatMessage.create({
      sender: req.user._id,
      receiver: receiverId,
      message
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name')
      .populate('receiver', 'name');

    // Create notification for receiver
    await createNotification(
      receiverId,
      'message',
      'New Message',
      `${req.user.name} sent you a message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      '/secure-chat',
      { senderId: req.user._id, messageId: chatMessage._id }
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/secure-chat/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort('createdAt');

    // Mark messages as read where current user is the receiver
    await ChatMessage.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        read: false
      },
      {
        $set: { read: true, readAt: new Date() }
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/secure-chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    console.log('🔍 Getting conversations for user:', req.user._id, req.user.name);
    
    // Get all unique users the current user has chatted with
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort('-createdAt');

    console.log(`📨 Found ${messages.length} messages for this user`);

    // Extract unique users
    const userMap = new Map();
    
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user._id.toString() 
        ? msg.receiver 
        : msg.sender;
      
      const userId = otherUser._id.toString();
      
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: otherUser,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt
        });
      }
    });

    const conversations = Array.from(userMap.values());
    
    console.log(`✅ Returning ${conversations.length} conversations`);
    console.log('Conversations:', conversations.map(c => ({ name: c.user.name, lastMessage: c.lastMessage })));

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Report message
// @route   POST /api/secure-chat/report/:messageId
// @access  Private
const reportMessage = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    const message = await ChatMessage.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is part of this conversation
    if (message.sender.toString() !== req.user._id.toString() && 
        message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to report this message' });
    }

    message.isReported = true;
    message.reportReason = reason;
    message.reportedBy = req.user._id;
    message.reportedAt = Date.now();

    await message.save();

    // If the sender is a LOCAL_RESIDENT, increment their complaints
    const sender = await User.findById(message.sender);
    if (sender && sender.role === 'LOCAL_RESIDENT') {
      const resident = await Resident.findOne({ user: sender._id });
      if (resident) {
        resident.complaintsCount += 1;
        resident.calculateTrustScore();
        resident.checkSuspension();
        await resident.save();
      }
    }

    res.json({ message: 'Message reported successfully' });
  } catch (error) {
    console.error('Report message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get verified residents for chat
// @route   GET /api/secure-chat/residents
// @access  Private
const getVerifiedResidents = async (req, res) => {
  try {
    const { city, area } = req.query;

    console.log('🔍 Searching for verified residents:', { city, area });

    let query = {
      verificationStatus: 'APPROVED',
      $or: [
        { suspended: false },
        { suspended: { $exists: false } }
      ]
    };

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (area) {
      query.area = new RegExp(area, 'i');
    }

    console.log('📋 Query:', JSON.stringify(query, null, 2));

    const residents = await Resident.find(query)
      .populate('user', 'name email phone')
      .select('city area yearsStaying trustScore user')
      .sort('-trustScore')
      .limit(20);

    console.log(`✅ Found ${residents.length} verified residents`);

    // Transform to include user data at top level
    const transformedResidents = residents.map(resident => ({
      _id: resident.user._id,
      name: resident.user.name,
      email: resident.user.email,
      phone: resident.user.phone,
      city: resident.city,
      area: resident.area,
      yearsStaying: resident.yearsStaying,
      trustScore: resident.trustScore
    }));

    console.log('📤 Returning residents:', transformedResidents);

    res.json(transformedResidents);
  } catch (error) {
    console.error('❌ Get verified residents error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search users for starting new conversation (verified residents only)
// @route   GET /api/secure-chat/search-users
// @access  Private (LOCAL_RESIDENT with APPROVED status only)
const searchUsers = async (req, res) => {
  try {
    // Only verified local residents can search for users
    if (req.user.role !== 'LOCAL_RESIDENT') {
      return res.status(403).json({ message: 'Only local residents can search users' });
    }

    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident || resident.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Only verified local residents can search users' });
    }

    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    // Search for users (not admins, not other local residents)
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: new RegExp(q, 'i') },
            { email: new RegExp(q, 'i') }
          ]
        },
        { role: { $in: ['USER'] } }, // Only regular users
        { _id: { $ne: req.user._id } } // Exclude self
      ]
    })
      .select('name email')
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/secure-chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await ChatMessage.countDocuments({
      receiver: req.user._id,
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  reportMessage,
  getVerifiedResidents,
  searchUsers,
  getUnreadCount
};
