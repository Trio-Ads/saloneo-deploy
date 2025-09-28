# Configuration du Rate Limiting

## Vue d'ensemble

Le système de limitation de taux (rate limiting) protège l'API contre les abus en limitant le nombre de requêtes qu'une adresse IP peut effectuer dans une période donnée.

## Configuration actuelle

### Production
- **Limite par défaut** : 2000 requêtes par 15 minutes (environ 133 requêtes/minute)
- **Fenêtre de temps** : 15 minutes (900000 ms)

### Développement
- **Limite par défaut** : 1000 requêtes par minute
- **Fenêtre de temps** : 1 minute (60000 ms)

## Variables d'environnement

Vous pouvez personnaliser ces limites en utilisant les variables d'environnement suivantes :

```bash
# Durée de la fenêtre en millisecondes
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Nombre maximum de requêtes par fenêtre
RATE_LIMIT_MAX_REQUESTS=2000  # 2000 requêtes
```

## Exemples de configuration

### Configuration très permissive (pour tests)
```bash
RATE_LIMIT_WINDOW_MS=60000      # 1 minute
RATE_LIMIT_MAX_REQUESTS=5000    # 5000 requêtes/minute
```

### Configuration stricte (haute sécurité)
```bash
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=500      # 500 requêtes/15 min (33/min)
```

### Configuration équilibrée
```bash
RATE_LIMIT_WINDOW_MS=300000     # 5 minutes
RATE_LIMIT_MAX_REQUESTS=1000    # 1000 requêtes/5 min (200/min)
```

## Désactiver le rate limiting

En développement, le rate limiting peut être complètement désactivé :
- Par défaut, il est désactivé si `NODE_ENV=development`
- Pour le forcer en développement : `ENABLE_RATE_LIMIT=true`

## Routes exemptées

Les routes suivantes ne sont pas soumises au rate limiting :
- `/health` - Endpoint de santé
- `/uploads/*` - Fichiers statiques

## Messages d'erreur

Lorsque la limite est atteinte, l'API retourne :
```json
{
  "error": "Too Many Requests",
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

## Recommandations

1. **Pour la production** : La limite actuelle de 2000 requêtes/15 min est généreuse et devrait convenir à la plupart des cas d'usage.

2. **Pour les tests de charge** : Augmentez temporairement les limites ou désactivez le rate limiting.

3. **Surveillance** : Surveillez les logs pour détecter les IPs qui atteignent fréquemment les limites.

4. **Ajustement** : Si des utilisateurs légitimes atteignent les limites, augmentez progressivement `RATE_LIMIT_MAX_REQUESTS`.

## Impact sur les performances

Le rate limiting a un impact minimal sur les performances car il utilise un stockage en mémoire. Cependant, en cas de très forte charge, considérez l'utilisation d'un store Redis pour le rate limiting distribué.
