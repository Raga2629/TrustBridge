const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Start new chat with local resident
// @route   POST /api/chat/start
// @access  Private (USER only)
const startChat = async (req, res) => {
  try {
    const { localResidentId } = req.body;

    if (!localResidentId) {
      return res.status(400).json({ message: 'Please provide local resident ID' });
    }

    // Verify local resident exists and is verified
    const localResident = await User.findById(localResidentId);
    if (!localResident) {
      return res.status(404).json({ message: 'Local resident not found' });
    }

    if (localResident.role !== 'LOCAL') {
      return res.status(400).json({ message: 'User is not a local resident' });
    }

    if (!localResident.isVerified) {
      return res.status(400).json({ message: 'Local resident is not verified' });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      user: req.user._id,
      localResident: localResidentId,
      isResolved: false
    });

    if (existingChat) {
      return res.status(400).json({ message: 'Active chat already exists', chat: existingChat });
    }

    const chat = await Chat.create({
      user: req.user._id,
      localResident: localResidentId,
      messages: []
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('user', 'name email')
      .populate('localResident', 'name email city');

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send message in chat
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({ message: 'Please provide chat ID and message text' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of this chat
    const isParticipant = 
      chat.user.toString() === req.user._id.toString() ||
      chat.localResident.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to send message in this chat' });
    }

    // Add message
    chat.messages.push({
      sender: req.user._id,
      text,
      timestamp: new Date()
    });

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('user', 'name email')
      .populate('localResident', 'name email')
      .populate('messages.sender', 'name');

    res.json(populatedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's chats
// @route   GET /api/chat/user
// @access  Private (USER only)
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .populate('localResident', 'name email city trustScore')
      .populate('messages.sender', 'name')
      .sort('-createdAt');

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get local resident's chats
// @route   GET /api/chat/local
// @access  Private (LOCAL only)
const getLocalChats = async (req, res) => {
  try {
    const chats = await Chat.find({ localResident: req.user._id })
      .populate('user', 'name email city')
      .populate('messages.sender', 'name')
      .sort('-createdAt');

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark chat as resolved
// @route   PUT /api/chat/:id/resolve
// @access  Private
const resolveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Verify user is part of this chat
    const isParticipant = 
      chat.user.toString() === req.user._id.toString() ||
      chat.localResident.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    chat.isResolved = true;
    await chat.save();

    res.json({ message: 'Chat marked as resolved', chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  startChat,
  sendMessage,
  getUserChats,
  getLocalChats,
  resolveChat
};
