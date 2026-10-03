const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_recruitment_portal', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Error: ${error.message}`);
    console.log(`[MongoDB] Make sure MongoDB is running locally on port 27017.`);
    process.exit(1);
  }
};

module.exports = connectDB;
