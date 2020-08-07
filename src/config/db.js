/* eslint-disable no-console */
const mongoose = require('mongoose');

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('✅ Connected to DB');
  } catch (err) {
    console.log(`❌ Failed to connect to DB ${err}`);
    process.exit(1);
  }
};
