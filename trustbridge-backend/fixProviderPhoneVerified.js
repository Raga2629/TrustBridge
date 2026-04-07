const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/trustbridge').then(async () => {
  const User = require('./models/User');
  const result = await User.updateMany(
    { role: 'PROVIDER', isPhoneVerified: { $ne: true } },
    { $set: { isPhoneVerified: true } }
  );
  console.log('Updated:', result.modifiedCount, 'providers → isPhoneVerified: true');
  await mongoose.disconnect();
}).catch(e => console.error(e.message));
