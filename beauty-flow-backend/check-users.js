const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

async function checkAndCreateUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const usersToCheck = [
      {
        email: 'hani.mazouni@gmail.com',
        password: 'hello',
        establishmentName: 'Salon Hani Mazouni',
        phone: '+213123456789',
        address: 'Alger, Algérie'
      },
      {
        email: 'hello@thirdadvertising.dz',
        password: 'hello',
        establishmentName: 'Third Advertising',
        phone: '+213987654321',
        address: 'Alger, Algérie'
      }
    ];

    for (const userData of usersToCheck) {
      console.log(`\n🔍 Vérification de l'utilisateur: ${userData.email}`);
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✅ L'utilisateur ${userData.email} existe déjà`);
        console.log(`   - Nom de l'établissement: ${existingUser.establishmentName}`);
        console.log(`   - Actif: ${existingUser.isActive}`);
        console.log(`   - Date de création: ${existingUser.createdAt}`);
      } else {
        console.log(`❌ L'utilisateur ${userData.email} n'existe pas`);
        console.log(`🔨 Création de l'utilisateur...`);
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Créer l'utilisateur
        const newUser = new User({
          email: userData.email,
          password: hashedPassword,
          establishmentName: userData.establishmentName,
          phone: userData.phone,
          address: userData.address,
          subscription: {
            plan: 'FREE',
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          },
        });

        await newUser.save();
        console.log(`✅ Utilisateur ${userData.email} créé avec succès !`);
        console.log(`🔑 Mot de passe: ${userData.password}`);
      }
    }

    // Afficher tous les utilisateurs
    console.log('\n📋 Liste de tous les utilisateurs:');
    const allUsers = await User.find({}, 'email establishmentName isActive createdAt');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.establishmentName} (${user.isActive ? 'Actif' : 'Inactif'})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkAndCreateUsers();
