const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkUserPlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const user = await User.findOne({ email: 'hello@thirdadvertising.dz' });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('\n📊 Informations de l\'utilisateur:');
    console.log('Email:', user.email);
    console.log('Plan actuel:', user.subscription?.plan || 'Non défini');
    console.log('Statut:', user.subscription?.status || 'Non défini');
    
    // Si le plan n'est pas défini ou n'est pas "starter", le mettre à jour
    if (!user.subscription || user.subscription.plan !== 'starter') {
      console.log('\n🔄 Mise à jour du plan vers "starter"...');
      
      await User.updateOne(
        { email: 'hello@thirdadvertising.dz' },
        { 
          $set: { 
            'subscription.plan': 'starter',
            'subscription.status': 'active'
          } 
        }
      );
      
      console.log('✅ Plan mis à jour vers "starter"');
      
      // Vérifier la mise à jour
      const updatedUser = await User.findOne({ email: 'hello@thirdadvertising.dz' });
      console.log('\n📊 Nouveau plan:', updatedUser.subscription?.plan);
    } else {
      console.log('\n✅ Le plan est déjà configuré comme "starter"');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

checkUserPlan();
