// resetAdminPassword.js
// Usage: node scripts/resetAdminPassword.js <username> <newPassword>
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const [,, username, newPassword] = process.argv;
if (!username || !newPassword) {
  console.error('Usage: node scripts/resetAdminPassword.js <username> <newPassword>');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.error('Admin not found:', username);
      process.exit(1);
    }
    admin.password = newPassword; // pre-save hook will hash
    await admin.save();
    console.log('Password updated for', username);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
