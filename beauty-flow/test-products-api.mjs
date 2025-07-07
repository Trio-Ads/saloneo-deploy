import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test de l'API des produits
async function testProductsAPI() {
  console.log('🧪 Test de l\'API des produits...\n');

  try {
    // 1. Test de connexion et authentification
    console.log('1. Test de connexion...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
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

    // Headers avec authentification
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Test de récupération des produits (liste vide au début)
    console.log('\n2. Test de récupération des produits...');
    const getProductsResponse = await fetch(`${API_BASE_URL}/products`, {
      headers: authHeaders
    });

    if (!getProductsResponse.ok) {
      throw new Error(`Erreur lors de la récupération des produits: ${getProductsResponse.status}`);
    }

    const productsData = await getProductsResponse.json();
    console.log('✅ Produits récupérés:', productsData);

    // 3. Test de création d'un produit
    console.log('\n3. Test de création d\'un produit...');
    const newProduct = {
      name: 'Shampooing Test',
      description: 'Shampooing de test pour l\'API',
      quantity: 100,
      minQuantity: 20,
      unit: 'ml'
    };

    const createProductResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProduct)
    });

    if (!createProductResponse.ok) {
      const errorData = await createProductResponse.text();
      throw new Error(`Erreur lors de la création du produit: ${createProductResponse.status} - ${errorData}`);
    }

    const createdProduct = await createProductResponse.json();
    console.log('✅ Produit créé:', createdProduct);
    const productId = createdProduct.product._id || createdProduct.product.id;

    // 4. Test de récupération d'un produit par ID
    console.log('\n4. Test de récupération d\'un produit par ID...');
    const getProductResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: authHeaders
    });

    if (!getProductResponse.ok) {
      throw new Error(`Erreur lors de la récupération du produit: ${getProductResponse.status}`);
    }

    const productData = await getProductResponse.json();
    console.log('✅ Produit récupéré par ID:', productData);

    // 5. Test de mise à jour d'un produit
    console.log('\n5. Test de mise à jour d\'un produit...');
    const updateData = {
      name: 'Shampooing Test Modifié',
      description: 'Description mise à jour',
      quantity: 150,
      minQuantity: 25,
      unit: 'ml'
    };

    const updateProductResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updateData)
    });

    if (!updateProductResponse.ok) {
      const errorData = await updateProductResponse.text();
      throw new Error(`Erreur lors de la mise à jour du produit: ${updateProductResponse.status} - ${errorData}`);
    }

    const updatedProduct = await updateProductResponse.json();
    console.log('✅ Produit mis à jour:', updatedProduct);

    // 6. Test de mise à jour de la quantité
    console.log('\n6. Test de mise à jour de la quantité...');
    const quantityUpdateResponse = await fetch(`${API_BASE_URL}/products/${productId}/quantity`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ quantityChange: -10 })
    });

    if (!quantityUpdateResponse.ok) {
      const errorData = await quantityUpdateResponse.text();
      throw new Error(`Erreur lors de la mise à jour de la quantité: ${quantityUpdateResponse.status} - ${errorData}`);
    }

    const quantityUpdatedProduct = await quantityUpdateResponse.json();
    console.log('✅ Quantité mise à jour:', quantityUpdatedProduct);

    // 7. Test des statistiques
    console.log('\n7. Test des statistiques...');
    const statsResponse = await fetch(`${API_BASE_URL}/products/stats`, {
      headers: authHeaders
    });

    if (!statsResponse.ok) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ Statistiques récupérées:', statsData);

    // 8. Test de suppression d'un produit
    console.log('\n8. Test de suppression d\'un produit...');
    const deleteProductResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    if (!deleteProductResponse.ok) {
      throw new Error(`Erreur lors de la suppression du produit: ${deleteProductResponse.status}`);
    }

    const deleteResult = await deleteProductResponse.json();
    console.log('✅ Produit supprimé:', deleteResult);

    // 9. Test de vérification que le produit est bien supprimé
    console.log('\n9. Vérification de la suppression...');
    const checkDeleteResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
      headers: authHeaders
    });

    if (checkDeleteResponse.status === 404) {
      console.log('✅ Produit bien supprimé (404 attendu)');
    } else {
      console.log('⚠️ Le produit semble toujours exister');
    }

    console.log('\n🎉 Tous les tests de l\'API des produits ont réussi !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests
testProductsAPI();
