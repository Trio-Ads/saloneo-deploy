// Script pour forcer la valeur showAsTeamMember à true dans le localStorage

// Fonction pour mettre à jour le localStorage
function updateLocalStorage() {
  try {
    // Récupérer les données du profil depuis le localStorage
    const profileKey = 'beauty-flow-profile';
    const profileData = localStorage.getItem(profileKey);
    
    if (!profileData) {
      console.error('❌ Aucune donnée de profil trouvée dans le localStorage');
      return false;
    }
    
    // Parser les données JSON
    const profileObj = JSON.parse(profileData);
    
    // Afficher l'état actuel
    console.log('📊 État actuel du profil:');
    console.log(profileObj);
    
    // Mettre à jour la valeur showAsTeamMember
    if (profileObj.state && profileObj.state.profile) {
      profileObj.state.profile.showAsTeamMember = true;
      
      // Sauvegarder les modifications dans le localStorage
      localStorage.setItem(profileKey, JSON.stringify(profileObj));
      
      console.log('✅ Mise à jour effectuée!');
      console.log('showAsTeamMember est maintenant: true');
      
      return true;
    } else {
      console.error('❌ Structure de données inattendue dans le localStorage');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du localStorage:', error);
    return false;
  }
}

// Exécuter la fonction et recharger la page si la mise à jour a réussi
if (updateLocalStorage()) {
  console.log('🔄 Rechargement de la page pour appliquer les changements...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}
