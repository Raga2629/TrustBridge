// Run once: approve all existing services so they remain visible
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/trustbridge').then(async () => {
  const Service = require('./models/Service');
  const result = await Service.updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: 'approved', verified: true } }
  );
  console.log('Approved existing services:', result.modifiedCount);
  await mongoose.disconnect();
}).catch(e => console.error(e.message));
