#!/bin/bash

echo "🔄 Redémarrage du backend Beauty Flow..."

# Arrêter le processus backend s'il existe
echo "📛 Arrêt du backend existant..."
pkill -f "beauty-flow-backend" || echo "Aucun processus backend trouvé"

# Attendre un peu pour s'assurer que le processus est arrêté
sleep 2

# Démarrer le backend en arrière-plan
echo "🚀 Démarrage du nouveau backend..."
cd beauty-flow-backend && npm run dev &

# Attendre que le backend démarre
echo "⏳ Attente du démarrage du backend (10 secondes)..."
sleep 10

# Tester les nouvelles API
echo "🧪 Test des nouvelles API publiques..."
cd .. && node beauty-flow/test-public-salon.mjs

echo "✅ Test terminé!"
