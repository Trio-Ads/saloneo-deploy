const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define User schema directly
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  establishmentName: { type: String, required: true },
  // Other fields are not needed for password reset
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function resetPassword() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-flow';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully');

    // Find the user
    const email = 'hani.mazouni@gmail.com';
    const newPassword = 'Mazouni1990';
    
    console.log(`Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    console.log(`User found: ${user.establishmentName}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`Password successfully reset for ${email}`);
    console.log('New password: Mazouni1990');
    
    // Verify the password works
    const isValid = await bcrypt.compare(newPassword, user.password);
    console.log(`Password verification: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
resetPassword();
