const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Définir le schéma User directement
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  establishmentName: String,
  phone: String,
  role: { type: String, enum: ['owner', 'admin'], default: 'owner' },
  isAdmin: { type: Boolean, default: false },
  subscription: {
    plan: String,
    status: String,
    startDate: Date,
    endDate: Date
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@saloneo.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Un compte admin existe déjà avec cet email');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('🔐 isAdmin:', existingAdmin.isAdmin);
      
      // Mettre à jour pour s'assurer qu'il est admin
      existingAdmin.role = 'admin';
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log('✅ Compte mis à jour en admin');
    } else {
      // Créer un nouveau compte admin
      const password = 'Admin@Saloneo2025'; // Mot de passe sécurisé
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const admin = new User({
        email: 'admin@saloneo.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Saloneo',
        establishmentName: 'Administration Saloneo',
        phone: '+213555000000',
        role: 'admin',
        isAdmin: true,
        subscription: {
          plan: 'ENTERPRISE',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
        }
      });
      
      await admin.save();
      
      console.log('\n✅ ========================================');
      console.log('✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS !');
      console.log('✅ ========================================\n');
      console.log('📧 Email: admin@saloneo.com');
      console.log('🔑 Mot de passe: Admin@Saloneo2025');
      console.log('👤 Role: admin');
      console.log('🔐 isAdmin: true');
      console.log('📦 Plan: ENTERPRISE');
      console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');
      console.log('\n🔗 Vous pouvez maintenant vous connecter et accéder à /admin\n');
    }
    
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdmin();
