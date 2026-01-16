# DeepMemo PDF Worker

CloudFlare Worker pour générer des PDFs à partir des branches DeepMemo.

## Fonctionnalités

- ✅ **Génération PDF** : Utilise Puppeteer (Browser Rendering API)
- 🔒 **Rate limiting** : 5 PDFs/heure, 20/jour par IP hashée (SHA-256)
- 🛡️ **Privacy-first** : IP hashée uniquement, TTL 24h, pas de logs de contenu
- 🚀 **Performances** : CloudFlare edge network
- 💰 **Coûts abordables** : $0.000125 par PDF après 7,200 PDFs gratuits/mois

## Prérequis

- Compte CloudFlare avec **Workers Paid Plan** ($5/mois)
- Node.js 18+ et npm installés
- CLI Wrangler : `npm install -g wrangler`

## Installation

### 1. Installer les dépendances

```bash
cd cloudflare-worker
npm install
```

### 2. Authentification CloudFlare

```bash
wrangler login
```

### 3. Créer le namespace KV pour rate limiting

```bash
wrangler kv:namespace create "RATE_LIMIT"
```

Cette commande affichera un ID. Copiez-le et ajoutez-le dans `wrangler.toml` :

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "votre_id_ici"  # <-- Remplacer par l'ID obtenu
```

### 4. Tester localement

```bash
npm run dev
```

Le worker sera accessible sur `http://localhost:8787`

### 5. Déployer en production

```bash
npm run deploy
```

CloudFlare affichera l'URL du worker (ex: `https://deepmemo-pdf.workers.dev`)

### 6. (Optionnel) Configurer domaine personnalisé

Dans le dashboard CloudFlare :
1. Workers & Pages → deepmemo-pdf → Settings → Triggers
2. Add Custom Domain : `pdf.deepmemo.org`

## Configuration Frontend

Après déploiement, mettre à jour `src/js/app.js` ligne ~686 :

```javascript
// Remplacer l'URL placeholder par l'URL réelle du worker
const response = await fetch('https://pdf.deepmemo.org/generate', {
  // ... reste du code
});
```

Décommenter le code dans la fonction `confirmExportPDF()`.

## API

### POST /generate

**Request:**
```json
{
  "nodes": {
    "node_123": {
      "id": "node_123",
      "title": "Mon nœud",
      "content": "# Contenu markdown...",
      "children": ["child_456"]
    }
  },
  "rootId": "node_123"
}
```

**Response (Success):**
- Status: 200
- Content-Type: application/pdf
- Headers:
  - `X-RateLimit-Remaining-Hour`: Nombre de requêtes restantes (heure)
  - `X-RateLimit-Remaining-Day`: Nombre de requêtes restantes (jour)
- Body: PDF binary

**Response (Rate Limited):**
```json
{
  "error": "Limite atteinte : 5 PDFs par heure maximum"
}
```
Status: 429

## Rate Limiting

### Limites
- **5 PDFs par heure** par IP
- **20 PDFs par jour** par IP

### Privacy
- IP **hashée** avec SHA-256 avant stockage
- Compteurs expirés automatiquement (1h / 24h)
- Aucune donnée de document sauvegardée
- Conforme RGPD

### Vérifier les compteurs (dev)

```bash
# Voir les logs en temps réel
npm run tail
```

## Monitoring

Dashboard CloudFlare → Workers & Pages → deepmemo-pdf :
- **Analytics** : Nombre de requêtes, CPU time, erreurs
- **Browser Rendering** : Heures de browser consommées

## Coûts estimés

### Workers Paid Plan : $5/mois
Inclus :
- 10 millions de requêtes
- 10 heures de Browser Rendering
- 1 GB Workers KV (storage)
- 100,000 lectures KV/jour
- 1,000 écritures KV/jour

### Au-delà du plan inclus :
- Browser Rendering : $0.09/heure
- 1 PDF ≈ 5 secondes = **$0.000125 par PDF**

### Exemples :
- 10,000 PDFs/mois : $5.35/mois
- 50,000 PDFs/mois : $11.25/mois

KV operations (rate limiting) : Gratuit jusqu'à 100k lectures/jour

## Troubleshooting

### Erreur "Namespace not found"
→ Vérifier que l'ID du KV namespace est correct dans `wrangler.toml`

### PDF vide ou erreur 500
→ Vérifier les logs : `npm run tail`
→ Tester les données envoyées (nodes, rootId)

### Rate limit trop strict
→ Ajuster les limites dans `worker.js` (lignes 29-30) :
```javascript
if (hourRequests >= 10) { // Au lieu de 5
if (dayRequests >= 50) {  // Au lieu de 20
```

### Timeout sur PDF complexes
→ Ajouter timeout dans `wrangler.toml` :
```toml
[env.production]
workers_dev = false
limits = { cpu_ms = 30000 }  # 30s max
```

## Documentation

- [CloudFlare Browser Rendering](https://developers.cloudflare.com/browser-rendering/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [KV Storage](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [@cloudflare/puppeteer](https://github.com/cloudflare/puppeteer)

## Support

- Issues GitHub : https://github.com/[votre-repo]/issues
- CloudFlare Community : https://community.cloudflare.com/

## Licence

MIT
