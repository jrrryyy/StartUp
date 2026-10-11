const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if restricted
}

let memoryServerInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Check if URI is still using the default placeholder
  const isPlaceholder = !uri || uri.includes('<db_password>');

  if (!isPlaceholder) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB Atlas successfully.');
      return;
    } catch (error) {
      console.warn('⚠️ Atlas connection failed:', error.message);
      console.log('🔄 Attempting local/in-memory fallback...');
    }
  } else {
    console.log('ℹ️ MONGODB_URI contains <db_password> placeholder.');
  }

  // Attempt local MongoDB
  const localUri = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/startup';
  try {
    console.log(`🔄 Attempting local MongoDB at ${localUri}...`);
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to local MongoDB successfully.');
    return;
  } catch (localError) {
    console.warn('ℹ️ Local MongoDB instance not reachable.');
  }

  // Graceful fallback to mongodb-memory-server
  try {
    console.log('🔄 Initializing in-memory MongoDB fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();
    await mongoose.connect(memUri);
    console.log('✅ Connected to In-Memory MongoDB successfully.');
    console.log('💡 Note: Data is saved during session. Replace <db_password> in server/.env with your MongoDB Atlas password for permanent cloud storage.');
  } catch (memError) {
    console.error('❌ Critical: Failed to connect to any MongoDB instance:', memError.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
