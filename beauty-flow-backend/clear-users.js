const mongoose = require('mongoose');

// Configuration de la base de données
const MONGODB_URI = 'mongodb://localhost:27017/beauty-flow';

// Schéma utilisateur simplifié
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  establishmentName: { type: String, required: true },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: true },
  subscription: {
    plan: { type: String, enum: ['FREE', 'BASIC', 'PREMIUM'], default: 'FREE' },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  refreshToken: String,
});

const User = mongoose.model('User', userSchema);

async function clearAllUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Afficher tous les utilisateurs avant suppression
    console.log('\n📋 Utilisateurs existants avant suppression:');
    const existingUsers = await User.find({}, 'email establishmentName');
    if (existingUsers.length === 0) {
      console.log('   Aucun utilisateur trouvé');
    } else {
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.establishmentName}`);
      });
    }

    // Supprimer tous les utilisateurs
    console.log('\n🗑️  Suppression de tous les utilisateurs...');
    const result = await User.deleteMany({});
    console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s) avec succès !`);

    // Vérifier que la collection est vide
    const remainingUsers = await User.countDocuments();
    console.log(`📊 Utilisateurs restants: ${remainingUsers}`);

    if (remainingUsers === 0) {
      console.log('🎉 La base de données est maintenant vide !');
      console.log('💡 Vous pouvez maintenant créer de nouveaux comptes via l\'interface d\'inscription.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des utilisateurs:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

clearAllUsers();
