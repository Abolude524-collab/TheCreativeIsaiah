// listAdmins.js
// Usage: node scripts/listAdmins.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const admins = await Admin.find({}, { username: 1, _id: 0 }).lean();
    if (!admins || admins.length === 0) {
      console.log('No admin users found.');
    } else {
      console.log('Admin users:');
      admins.forEach(a => console.log(' -', a.username));
    }
    process.exit(0);
  } catch (err) {
    console.error('Error connecting or querying admins:', err.message || err);
    process.exit(1);
  }
})();
