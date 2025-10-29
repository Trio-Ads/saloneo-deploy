const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Définir le schéma User
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
    isActive: Boolean,
    startDate: Date,
    endDate: Date
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateSuperAdmin() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas\n');
    
    // Nouveaux identifiants
    const newEmail = 'hani@saloneo.app';
    const newPassword = 'Mazouni1990@';
    
    console.log('🔍 Recherche du super admin actuel...');
    
    // Chercher tous les admins possibles
    const admins = await User.find({ 
      $or: [
        { isAdmin: true },
        { role: 'admin' },
        { email: 'admin@saloneo.com' }
      ]
    });
    
    console.log(`📋 Trouvé ${admins.length} compte(s) admin\n`);
    
    if (admins.length === 0) {
      console.log('❌ Aucun compte admin trouvé!');
      console.log('💡 Création d\'un nouveau super admin...\n');
      
      // Créer un nouveau super admin
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const newAdmin = new User({
        email: newEmail,
        password: hashedPassword,
        firstName: 'Hani',
        lastName: 'Mazouni',
        establishmentName: 'Saloneo Administration',
        phone: '+213555000000',
        role: 'admin',
        isAdmin: true,
        subscription: {
          plan: 'ENTERPRISE',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
        }
      });
      
      await newAdmin.save();
      console.log('✅ ========================================');
      console.log('✅ NOUVEAU SUPER ADMIN CRÉÉ !');
      console.log('✅ ========================================\n');
    } else {
      // Mettre à jour le premier admin trouvé
      const admin = admins[0];
      
      console.log('📧 Admin actuel:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   isAdmin: ${admin.isAdmin}\n`);
      
      console.log('🔄 Mise à jour des identifiants...');
      
      // Hash du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Mettre à jour
      admin.email = newEmail;
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.isAdmin = true;
      admin.firstName = 'Hani';
      admin.lastName = 'Mazouni';
      
      await admin.save();
      
      console.log('✅ ========================================');
      console.log('✅ IDENTIFIANTS SUPER ADMIN MODIFIÉS !');
      console.log('✅ ========================================\n');
    }
    
    console.log('📧 Nouvel Email: ' + newEmail);
    console.log('🔑 Nouveau Mot de passe: ' + newPassword);
    console.log('👤 Role: admin');
    console.log('🔐 isAdmin: true');
    console.log('📦 Plan: ENTERPRISE\n');
    
    console.log('🔍 Vérification finale...');
    const updatedAdmin = await User.findOne({ email: newEmail });
    
    if (updatedAdmin) {
      console.log('✅ Confirmation: Le compte existe bien!');
      console.log(`   Email: ${updatedAdmin.email}`);
      console.log(`   Role: ${updatedAdmin.role}`);
      console.log(`   isAdmin: ${updatedAdmin.isAdmin}\n`);
    }
    
    console.log('✅ Vous pouvez maintenant vous connecter avec:');
    console.log(`   📧 ${newEmail}`);
    console.log(`   🔑 ${newPassword}\n`);
    
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.code === 11000) {
      console.error('\n⚠️  L\'email existe déjà. Utilisation d\'une autre approche...');
      
      try {
        // Si l'email existe déjà, juste mettre à jour le mot de passe
        const hashedPassword = await bcrypt.hash('Mazouni1990@', 10);
        const result = await User.updateOne(
          { email: 'hani@saloneo.app' },
          { 
            $set: { 
              password: hashedPassword,
              role: 'admin',
              isAdmin: true
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log('✅ Mot de passe mis à jour avec succès!');
        }
      } catch (updateError) {
        console.error('❌ Erreur de mise à jour:', updateError.message);
      }
    }
    
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateSuperAdmin();
