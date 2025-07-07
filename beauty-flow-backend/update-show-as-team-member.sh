#!/bin/bash

# Script pour mettre à jour directement le champ showAsTeamMember via l'API

# Récupérer le token d'authentification
echo "Veuillez entrer votre email:"
read EMAIL

echo "Veuillez entrer votre mot de passe:"
read -s PASSWORD

echo "Connexion en cours..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extraire le token
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "Erreur d'authentification. Vérifiez vos identifiants."
  exit 1
fi

echo "Authentification réussie!"

# Mettre à jour le profil pour activer showAsTeamMember
echo "Mise à jour du profil..."
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3001/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"showAsTeamMember\":true}")

echo "Réponse du serveur:"
echo $UPDATE_RESPONSE

echo "Vérification de la mise à jour..."
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3001/api/profile \
  -H "Authorization: Bearer $TOKEN")

# Extraire et afficher la valeur de showAsTeamMember
SHOW_AS_TEAM_MEMBER=$(echo $PROFILE_RESPONSE | grep -o '"showAsTeamMember":[^,}]*' | sed 's/"showAsTeamMember"://')

echo "Valeur actuelle de showAsTeamMember: $SHOW_AS_TEAM_MEMBER"

if [ "$SHOW_AS_TEAM_MEMBER" = "true" ]; then
  echo "✅ La mise à jour a réussi! Vous apparaissez maintenant comme membre de l'équipe."
else
  echo "❌ La mise à jour a échoué. Veuillez réessayer."
fi
