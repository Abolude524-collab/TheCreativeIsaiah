// test-mongo.js
// Usage: node scripts/test-mongo.js
// Attempts to connect to MongoDB using process.env.MONGO_URI and prints detailed errors.
const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    console.log('Using MONGO_URI:', process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:(.*)@/, ':*****@') : '(not set)');
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed — full error:');
    console.error(err);
    if (err && err.reason) {
      console.error('\nReason:');
      console.error(err.reason);
    }
    process.exit(1);
  }
})();
