// Usage: node createAdmin.js username password
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const [,, username, password] = process.argv;
if (!username || !password) {
  console.error('Usage: node createAdmin.js <username> <password>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }
    const admin = new Admin({ username, password });
    await admin.save();
    console.log('Admin created');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
