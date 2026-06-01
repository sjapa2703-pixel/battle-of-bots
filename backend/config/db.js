const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === '') {
      console.warn('\n⚠️  WARNING: MONGO_URI is not set in .env file!');
      console.warn('⚠️  Backend is running in offline mode. Database features will fail.\n');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ Error connecting to MongoDB: ${error.message}`);
    console.error('⚠️  Please check your MONGO_URI string or ensure MongoDB is running.');
    console.error('⚠️  The server will continue running in OFFLINE MODE, but API calls will fail.\n');
  }
};

module.exports = connectDB;
