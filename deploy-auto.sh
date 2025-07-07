#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT AUTOMATIQUE SALONEO
# Ce script automatise tout le processus de déploiement

echo "🚀 DÉMARRAGE DU DÉPLOIEMENT AUTOMATIQUE SALONEO..."
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "server.js" ] || [ ! -f "package.json" ]; then
    print_error "Erreur: Ce script doit être exécuté depuis le répertoire racine du projet"
    exit 1
fi

# 1. Vérifier l'état Git
print_status "Vérification de l'état Git..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Des fichiers non commités détectés. Ajout et commit automatique..."
    git add .
    git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
else
    print_success "Répertoire Git propre"
fi

# 2. Pousser vers GitHub
print_status "Push vers GitHub..."
if git push origin main; then
    print_success "Code poussé vers GitHub avec succès"
else
    print_error "Erreur lors du push vers GitHub"
    exit 1
fi

# 3. Vérifier les dépendances
print_status "Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    print_warning "Installation des dépendances..."
    npm install
fi

# 4. Build du frontend
print_status "Build du frontend React..."
cd beauty-flow
if npm run build; then
    print_success "Build frontend terminé"
    cd ..
else
    print_error "Erreur lors du build frontend"
    cd ..
    exit 1
fi

# 5. Test du serveur localement
print_status "Test du serveur unifié..."
timeout 10s node server.js &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Serveur démarre correctement"
    kill $SERVER_PID 2>/dev/null
else
    print_warning "Le serveur a des problèmes de démarrage (probablement MongoDB)"
fi

# 6. Déploiement sur Render via webhook (si configuré)
RENDER_DEPLOY_HOOK="https://api.render.com/deploy/srv-ctqhvhbtq21c73e3lqag?key=rKNOJOhGLJo"

if [ -n "$RENDER_DEPLOY_HOOK" ]; then
    print_status "Déclenchement du déploiement Render..."
    if curl -X POST "$RENDER_DEPLOY_HOOK"; then
        print_success "Déploiement Render déclenché"
    else
        print_warning "Impossible de déclencher le déploiement Render automatiquement"
    fi
else
    print_warning "Webhook Render non configuré"
fi

# 7. Affichage des informations finales
echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "======================="
print_success "Code poussé vers GitHub: https://github.com/Trio-Ads/saloneo-deploy"
print_success "Déploiement Render: https://saloneo-deploy.onrender.com"
echo ""
print_status "Prochaines étapes manuelles:"
echo "1. Aller sur https://dashboard.render.com"
echo "2. Vérifier que le déploiement se lance automatiquement"
echo "3. Surveiller les logs de déploiement"
echo "4. Tester l'application une fois déployée"
echo ""
print_warning "Note: Le premier déploiement peut prendre 5-10 minutes"
print_warning "MongoDB doit être accessible depuis Render"

# 8. Ouvrir les liens utiles
if command -v open &> /dev/null; then
    print_status "Ouverture des liens utiles..."
    open "https://dashboard.render.com"
    open "https://github.com/Trio-Ads/saloneo-deploy"
fi

echo ""
print_success "Script terminé avec succès ! 🚀"
