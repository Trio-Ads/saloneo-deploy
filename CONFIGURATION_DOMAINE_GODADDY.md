# 🌐 Configuration du Domaine GoDaddy avec Render

## 📋 Prérequis
- Un domaine acheté sur GoDaddy
- Votre application déployée sur Render (saloneo-app.onrender.com)

## 🔧 Étapes de Configuration

### 1. Dans Render
1. Connectez-vous à [dashboard.render.com](https://dashboard.render.com)
2. Cliquez sur votre service **saloneo-deploy**
3. Allez dans **Settings**
4. Descendez jusqu'à **Custom Domains**
5. Cliquez sur **Add Custom Domain**
6. Entrez votre domaine :
   - Pour le domaine principal : `saloneo.com`
   - Pour le sous-domaine www : `www.saloneo.com`

### 2. Récupérer les informations DNS
Render vous donnera l'une de ces options :
- **Option A** : Un enregistrement CNAME (pour www)
- **Option B** : Une adresse IP (pour le domaine racine)

Notez ces informations.

### 3. Configuration dans GoDaddy

#### Pour configurer le domaine racine (saloneo.com) :
1. Connectez-vous à [godaddy.com](https://godaddy.com)
2. Allez dans **My Products** > **Domains**
3. Cliquez sur **DNS** à côté de votre domaine
4. Dans la section **Records** :
   - Trouvez l'enregistrement **A** avec le nom **@**
   - Cliquez sur l'icône crayon pour éditer
   - Remplacez la valeur par l'IP fournie par Render
   - TTL : 600 secondes
   - Sauvegardez

#### Pour configurer www.saloneo.com :
1. Dans la même page DNS
2. Si un enregistrement CNAME **www** existe :
   - Éditez-le
   - Valeur : `saloneo-app.onrender.com`
3. Sinon, créez un nouveau CNAME :
   - Type : CNAME
   - Name : www
   - Value : `saloneo-app.onrender.com`
   - TTL : 600 secondes

### 4. Attendre la propagation DNS
- La propagation peut prendre de 5 minutes à 48 heures
- Généralement, c'est effectif en 15-30 minutes

### 5. Vérification dans Render
1. Retournez dans Render > Settings > Custom Domains
2. Render vérifiera automatiquement la configuration
3. Une fois validé, un certificat SSL sera généré automatiquement

## ⚠️ IMPORTANT : Mise à jour des variables d'environnement

Une fois le domaine configuré et fonctionnel :

1. Dans Render, allez dans **Environment**
2. Mettez à jour ces variables :
   ```
   FRONTEND_URL=https://saloneo.com
   CORS_ORIGIN=https://saloneo.com
   ```
3. Cliquez sur **Save Changes**
4. Le service redémarrera automatiquement

## 🔍 Vérification

Testez votre site :
- https://saloneo.com
- https://www.saloneo.com

Les deux devraient fonctionner avec HTTPS (cadenas vert).

## 🚨 Dépannage

### Le domaine ne fonctionne pas
- Vérifiez que les enregistrements DNS sont corrects dans GoDaddy
- Utilisez [dnschecker.org](https://dnschecker.org) pour vérifier la propagation
- Attendez jusqu'à 48h pour la propagation complète

### Erreur de certificat SSL
- Vérifiez que le domaine est bien vérifié dans Render
- Attendez quelques minutes après la vérification
- Contactez le support Render si le problème persiste

### Erreur CORS
- Assurez-vous d'avoir mis à jour FRONTEND_URL et CORS_ORIGIN
- Redémarrez manuellement le service si nécessaire
