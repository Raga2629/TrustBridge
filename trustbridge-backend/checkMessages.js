const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ChatMessage = require('./models/ChatMessage');
const User = require('./models/User');

dotenv.config();

const checkMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all messages
    const messages = await ChatMessage.find({})
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort('-createdAt');

    console.log(`📨 Total Messages in Database: ${messages.length}\n`);

    if (messages.length === 0) {
      console.log('❌ No messages found in database!');
      console.log('This is why conversations are empty.\n');
    } else {
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      messages.forEach((msg, index) => {
        console.log(`Message #${index + 1}:`);
        console.log(`  From: ${msg.sender.name} (${msg.sender.email}) [${msg.sender.role}]`);
        console.log(`  To: ${msg.receiver.name} (${msg.receiver.email}) [${msg.receiver.role}]`);
        console.log(`  Message: "${msg.message}"`);
        console.log(`  Sent: ${msg.createdAt}`);
        console.log(`  Reported: ${msg.isReported ? 'Yes' : 'No'}`);
        console.log('───────────────────────────────────────────────────────────────\n');
      });
    }

    // Check specific users
    console.log('\n🔍 Checking specific users:\n');
    
    const sindhuja = await User.findOne({ email: 'merugusindhuja@gmail.com' });
    const radhika = await User.findOne({ email: 'radhikanasani@gmail.com' });

    if (sindhuja) {
      console.log(`✅ Sindhuja found: ${sindhuja._id}`);
      const sindhujaMessages = await ChatMessage.find({
        $or: [
          { sender: sindhuja._id },
          { receiver: sindhuja._id }
        ]
      });
      console.log(`   Messages involving Sindhuja: ${sindhujaMessages.length}`);
    } else {
      console.log('❌ Sindhuja not found');
    }

    if (radhika) {
      console.log(`✅ Radhika found: ${radhika._id}`);
      const radhikaMessages = await ChatMessage.find({
        $or: [
          { sender: radhika._id },
          { receiver: radhika._id }
        ]
      });
      console.log(`   Messages involving Radhika: ${radhikaMessages.length}`);
    } else {
      console.log('❌ Radhika not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkMessages();
