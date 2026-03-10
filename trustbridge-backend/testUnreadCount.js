require('dotenv').config();
const mongoose = require('mongoose');
const ChatMessage = require('./models/ChatMessage');

const testUnreadCount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all messages
    const allMessages = await ChatMessage.find({}).populate('sender receiver', 'name email');
    console.log(`\n📊 Total messages in database: ${allMessages.length}`);

    if (allMessages.length > 0) {
      console.log('\n📝 Sample messages:');
      allMessages.slice(0, 5).forEach((msg, index) => {
        console.log(`${index + 1}. From: ${msg.sender?.name} → To: ${msg.receiver?.name}`);
        console.log(`   Read: ${msg.read}, Message: "${msg.message.substring(0, 50)}..."`);
      });
    }

    // Count unread messages per user
    const users = await ChatMessage.distinct('receiver');
    console.log(`\n👥 Users with messages: ${users.length}`);

    for (const userId of users) {
      const unreadCount = await ChatMessage.countDocuments({
        receiver: userId,
        read: false
      });
      if (unreadCount > 0) {
        const user = await mongoose.model('User').findById(userId);
        console.log(`📬 ${user?.name || 'Unknown'}: ${unreadCount} unread messages`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testUnreadCount();
