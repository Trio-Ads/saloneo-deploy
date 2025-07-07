#!/bin/bash

echo "🚀 Script de déploiement GitHub pour Saloneo"
echo "=========================================="

# Configuration
REPO_URL="https://github.com/Trio-Ads/saloneo-deploy.git"

# Nettoyer et reconfigurer Git
echo "📝 Configuration Git..."
git remote remove origin 2>/dev/null || true
git remote add origin $REPO_URL

# Créer un commit plus léger en excluant certains fichiers
echo "📦 Préparation des fichiers..."

# Créer un .gitignore plus strict
cat > .gitignore << EOF
node_modules/
*.log
.DS_Store
.env.local
dist/
build/
uploads/
*.test.*
test-*.js
test-*.cjs
test-*.mjs
debug-*.js
fix-*.cjs
complete-*.cjs
finalize-*.cjs
diagnostic-*.cjs
migrate-*.js
update-*.cjs
clear-*.html
EOF

# Ajouter et committer
git add .gitignore
git add -A
git commit -m "Deploy: Saloneo production ready" --quiet

# Pousser avec force
echo "🔄 Push vers GitHub..."
git push --force origin main

echo "✅ Déploiement terminé!"
echo "📍 Repository: $REPO_URL"
