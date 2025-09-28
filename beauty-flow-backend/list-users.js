const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define User schema directly
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  establishmentName: { type: String, required: true },
  createdAt: { type: Date },
  // Other fields are not needed for listing
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-flow';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB successfully\n');

    // Find all users
    const users = await User.find({}, 'email establishmentName createdAt').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} users:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Establishment: ${user.establishmentName}`);
        console.log(`   Created: ${user.createdAt ? user.createdAt.toLocaleString() : 'N/A'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
listUsers();
