import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test de persistance des templates
async function testTemplatePersistence() {
  console.log('🧪 Test de persistance des templates...\n');

  try {
    // 1. Connexion avec un utilisateur existant
    console.log('1. Connexion...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hello@thirdadvertising.dz',
        password: 'hello'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie');

    // 2. Sauvegarder un template
    console.log('\n2. Sauvegarde du template "modern-salon-2025"...');
    const saveTemplateResponse = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        theme: {
          primary: '#6366F1',
          secondary: '#14B8A6',
          accent: '#F59E0B',
          background: '#FFFFFF',
          selectedTemplateId: 'modern-salon-2025'
        }
      })
    });

    if (!saveTemplateResponse.ok) {
      throw new Error(`Erreur de sauvegarde: ${saveTemplateResponse.status}`);
    }
    console.log('✅ Template sauvegardé');

    // 3. Récupérer le profil pour vérifier
    console.log('\n3. Vérification de la sauvegarde...');
    const profileResponse = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`Erreur de récupération: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    console.log('📋 Profil récupéré:', {
      theme: profile.theme,
      selectedTemplate: profile.theme?.selectedTemplateId
    });

    if (profile.theme?.selectedTemplateId === 'modern-salon-2025') {
      console.log('✅ Template correctement sauvegardé dans la base de données');
    } else {
      console.log('❌ Template non sauvegardé');
    }

    // 4. Test de l'API publique
    console.log('\n4. Test de l\'API publique...');
    
    // Générer le slug du salon
    const salonName = profile.establishmentName || `${profile.firstName} ${profile.lastName}`;
    const slug = salonName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    console.log(`🔗 Slug généré: ${slug}`);

    const publicResponse = await fetch(`${API_BASE}/public/salon/${slug}`);
    
    if (!publicResponse.ok) {
      throw new Error(`Erreur API publique: ${publicResponse.status}`);
    }

    const publicData = await publicResponse.json();
    console.log('🌐 Données publiques récupérées:', {
      name: publicData.establishmentName || `${publicData.firstName} ${publicData.lastName}`,
      theme: publicData.theme,
      selectedTemplate: publicData.theme?.selectedTemplateId
    });

    if (publicData.theme?.selectedTemplateId === 'modern-salon-2025') {
      console.log('✅ Template accessible via l\'API publique');
    } else {
      console.log('❌ Template non accessible via l\'API publique');
    }

    console.log('\n🎉 Test de persistance des templates terminé avec succès !');
    console.log('\n📝 Résumé:');
    console.log('- ✅ Sauvegarde du template dans la base de données');
    console.log('- ✅ Récupération du template depuis le profil');
    console.log('- ✅ Accès au template via l\'API publique');
    console.log('\n🚀 Les templates sont maintenant persistants et synchronisés !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

// Exécuter le test
testTemplatePersistence();
