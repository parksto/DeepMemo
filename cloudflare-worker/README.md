# CloudFlare Worker - PDF Generation

> 🚧 **Documentation en cours de rédaction**
>
> **Version** : V0.10.5
> **Statut** : Stub créé le 2026-01-28

## Contenu Prévu

### CloudFlare Worker
- Deployment guide
- API documentation
- Rate limiting details

### PDF Generation
- Online PDF generation endpoint
- Request/response format
- Error handling

### Current Status
⚠️ **Not deployed** - The CloudFlare Worker endpoint is not currently deployed in production.

## Sources à Consulter

- `cloudflare-worker/src/index.js` - Worker implementation
- `cloudflare-worker/wrangler.toml` - Configuration
- Rate limiting code

---

**Cette page sera complétée prochainement avec toutes les informations nécessaires.**

## Stats d'usage (privées)

Chaque requête (PDF valide ou refusée : origine 403, limite 429, invalide 400, erreur 500, méthode 405) écrit un data point dans Workers Analytics Engine (dataset `deepmemo_pdf`) : catégorie, pays, user-agent tronqué, nombre de pages. Aucune IP ni donnée de document. Rétention : environ 3 mois.

```bash
npx wrangler secret put STATS_KEY        # clé d'accès à /stats (longue valeur aléatoire)
npx wrangler secret put CF_ACCOUNT_ID    # ID du compte Cloudflare
npx wrangler secret put CF_API_TOKEN     # token avec la permission Account > Account Analytics > Read
npx wrangler deploy
```

Consultation : `https://<worker>/stats?key=<STATS_KEY>` (404 si la clé est absente ou incorrecte).
