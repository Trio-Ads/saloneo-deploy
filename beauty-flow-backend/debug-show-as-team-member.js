// Script pour déboguer et forcer la valeur showAsTeamMember à true
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models/User');

// Fonction principale
async function main() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔌 Connecté à MongoDB');

    // Récupérer l'utilisateur actuel (utiliser l'email pour identifier l'utilisateur)
    const userEmail = process.argv[2]; // Passer l'email en argument de ligne de commande
    
    if (!userEmail) {
      console.error('❌ Veuillez fournir un email d\'utilisateur en argument');
      console.log('Usage: node debug-show-as-team-member.js user@example.com');
      process.exit(1);
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.error(`❌ Aucun utilisateur trouvé avec l'email: ${userEmail}`);
      process.exit(1);
    }

    // Afficher l'état actuel
    console.log('📊 État actuel:');
    console.log(`Email: ${user.email}`);
    console.log(`Nom: ${user.firstName} ${user.lastName}`);
    console.log(`Établissement: ${user.establishmentName}`);
    console.log(`showAsTeamMember: ${user.showAsTeamMember}`);

    // Forcer la valeur à true
    user.showAsTeamMember = true;
    await user.save();

    console.log('\n✅ Mise à jour effectuée!');
    console.log(`showAsTeamMember est maintenant: ${user.showAsTeamMember}`);
    
    // Vérifier que la mise à jour a bien été prise en compte
    const updatedUser = await User.findOne({ email: userEmail });
    console.log(`\n🔍 Vérification: showAsTeamMember = ${updatedUser.showAsTeamMember}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
main();
