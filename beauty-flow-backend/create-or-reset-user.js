const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Define User schema with all required fields
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  establishmentName: { type: String, required: true },
  subscription: {
    plan: { type: String, default: 'FREE' },
    duration: { type: String, default: 'MONTHLY' },
    startDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  },
  settings: {
    language: { type: String, default: 'fr' },
    currency: { type: String, default: 'EUR' },
    timezone: { type: String, default: 'Europe/Paris' }
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function createOrResetUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-flow';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB successfully\n');

    // User details
    const email = 'hani.mazouni@gmail.com';
    const newPassword = 'Mazouni1990';
    const establishmentName = 'Salon Hani'; // Default name for new user
    
    console.log(`Looking for user with email: ${email}`);
    
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User not found. Creating new user...`);
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Create new user
      user = new User({
        email,
        password: hashedPassword,
        establishmentName,
        subscription: {
          plan: 'FREE',
          duration: 'MONTHLY',
          startDate: new Date(),
          isActive: true
        },
        settings: {
          language: 'fr',
          currency: 'DZD',
          timezone: 'Africa/Algiers'
        },
        isActive: true,
        isEmailVerified: false
      });
      
      await user.save();
      console.log(`New user created successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
      console.log(`Establishment: ${establishmentName}`);
      
    } else {
      console.log(`User found: ${user.establishmentName}`);
      console.log(`Resetting password...`);
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the password
      user.password = hashedPassword;
      user.updatedAt = new Date();
      await user.save();
      
      console.log(`Password successfully reset!`);
      console.log(`Email: ${email}`);
      console.log(`New password: ${newPassword}`);
    }
    
    // Verify the password works
    const isValid = await bcrypt.compare(newPassword, user.password);
    console.log(`\nPassword verification: ${isValid ? 'SUCCESS ✓' : 'FAILED ✗'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
createOrResetUser();
