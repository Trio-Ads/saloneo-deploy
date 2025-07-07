#!/bin/bash

echo "🚀 DÉMARRAGE SALONEO POUR ACCÈS MOBILE"
echo "============================================"
echo ""
echo "📱 URL pour votre mobile : http://192.168.100.6:3000"
echo ""
echo "🔧 Démarrage des serveurs..."
echo ""

# Fonction pour nettoyer les processus en arrière-plan
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C pour nettoyer
trap cleanup SIGINT

# Démarrer le backend en arrière-plan
echo "🔧 Démarrage du backend (port 5000)..."
cd ../beauty-flow-backend
npm run dev &
BACKEND_PID=$!

# Attendre un peu pour que le backend démarre
sleep 3

# Démarrer le frontend
echo "🔧 Démarrage du frontend (port 3000)..."
cd ../beauty-flow
npm run dev &
FRONTEND_PID=$!

# Attendre un peu pour que le frontend démarre
sleep 5

echo ""
echo "✅ SERVEURS DÉMARRÉS AVEC SUCCÈS !"
echo ""
echo "📱 ACCÈS MOBILE :"
echo "   URL : http://192.168.100.6:3000"
echo ""
echo "💻 ACCÈS LOCAL :"
echo "   URL : http://localhost:3000"
echo ""
echo "🔧 BACKEND API :"
echo "   URL : http://192.168.100.6:5000"
echo ""
echo "📋 INSTRUCTIONS :"
echo "   1. Assurez-vous que votre téléphone est sur le même Wi-Fi"
echo "   2. Ouvrez votre navigateur mobile"
echo "   3. Tapez : http://192.168.100.6:3000"
echo "   4. Profitez de Saloneo sur mobile !"
echo ""
echo "⚠️  Pour arrêter les serveurs, appuyez sur Ctrl+C"
echo ""

# Attendre indéfiniment
wait
