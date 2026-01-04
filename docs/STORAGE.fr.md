# DeepMemo - Système de Stockage (IndexedDB)

**Version :** V0.10+
**Dernière mise à jour :** 2026-01-04

## Vue d'ensemble

Depuis la V0.10, DeepMemo utilise **IndexedDB avec Dexie.js** pour tout le stockage de données, remplaçant l'ancien système basé sur localStorage. Cela offre une capacité de stockage significativement supérieure et de meilleures performances.

## Architecture de stockage

### Base de données IndexedDB : `deepmemo`

L'application utilise une seule base IndexedDB avec trois object stores :

```javascript
db.version(1).stores({
  // Table des nœuds avec index
  nodes: 'id, parent, *tags, created, modified',

  // Table des paramètres (paires clé-valeur)
  settings: 'key',

  // Table des pièces jointes (fichiers en blobs)
  attachments: 'id'
});
```

### Capacité de stockage

| Type de stockage | Avant (V0.9) | Après (V0.10) |
|------------------|--------------|---------------|
| Capacité max | 5-10 MB (localStorage) | 500 MB - 1 GB (IndexedDB) |
| Structure données | Blob JSON unique | Tables structurées avec index |
| Performance | ~50ms save, ~200ms load | <100ms save, <500ms load |

### Structure des données

**Store nodes :**
- Stocke tous les objets nœuds (notes, symlinks)
- Indexé par : `id`, `parent`, `tags`, `created`, `modified`
- Permet des requêtes rapides par parent, tag, ou plage de dates

**Store settings :**
- Paires clé-valeur pour les paramètres de l'app
- Clé spéciale : `rootNodes` (array des IDs des nœuds racines)
- Autres paramètres : `viewMode`, `fontPreference`, `language`

**Store attachments :**
- Stocke les blobs de fichiers avec leurs IDs
- Structure : `{id: string, blob: Blob}`
- Pas de métadonnées ici (métadonnées dans le array `attachments` du nœud)

## Migration depuis localStorage

### Migration automatique

Au premier chargement après mise à jour vers V0.10, l'app automatiquement :

1. Détecte les données localStorage (`deepmemo_data`)
2. Migre tous les nœuds vers le store IndexedDB `nodes`
3. Migre `rootNodes` vers le store `settings`
4. Migre les anciens attachments depuis la base `deepmemo-attachments`
5. Préserve localStorage comme backup
6. Définit le flag : `deepmemo_migrated_to_indexeddb: true`

**Temps de migration :** ~1 seconde pour 100 nœuds

### Sécurité du backup

Après migration :
- Les données localStorage originales sont **conservées comme backup**
- L'ancienne base `deepmemo-attachments` est **préservée**
- Les utilisateurs peuvent effacer localStorage manuellement après confirmation

Pour effacer le backup localStorage :
```javascript
// Dans la console du navigateur
await window.Storage.clearLocalStorageBackup();
```

## Synchronisation multi-onglets

La V0.10 utilise **BroadcastChannel API** pour la synchro temps réel entre onglets :

```javascript
// Module : src/js/utils/sync.js
const channel = new BroadcastChannel('deepmemo-sync');

// Après chaque saveData()
channel.postMessage({ type: 'data-changed' });

// Les autres onglets rechargent les données automatiquement
channel.onmessage = () => loadData();
```

**Support navigateurs :** Tous les navigateurs modernes (Chrome 54+, Firefox 38+, Safari 15.4+)

## Outils de développement

### Commandes console

```javascript
// Obtenir les statistiques de stockage
const stats = await window.Storage.getStats();
console.table(stats);
// → { nodes: 50, attachments: 5, totalAttachmentsSizeMB: "2.34" }

// Lister tous les nœuds
const nodes = await window.Storage.loadNodes();
console.log(Object.keys(nodes).length, 'nodes');

// Lister tous les IDs d'attachments
const attachments = await window.Storage.listAttachments();
console.log(attachments);

// Obtenir la taille totale des attachments
const size = await window.Storage.getTotalAttachmentsSize();
console.log((size / 1024 / 1024).toFixed(2), 'MB');

// Effacer toutes les données (⚠️ DANGER - irréversible !)
await window.Storage.clearAllData();
```

### Inspection DevTools

**Chrome/Edge DevTools :**
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Application**
3. Développer **IndexedDB** → `deepmemo`
4. Voir les stores : `nodes`, `settings`, `attachments`

**Firefox DevTools :**
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Stockage**
3. Développer **Indexed DB** → `deepmemo`

## Fichiers de référence

- **Stockage core :** `src/js/core/storage.js` (285 lignes)
- **Logique migration :** `src/js/core/migration.js` (185 lignes)
- **Module sync :** `src/js/utils/sync.js` (80 lignes)
- **Attachments :** `src/js/core/attachments.js` (simplifié)

## Métriques de performance

**Opérations typiques :**
- Sauvegarde nœud unique : <50ms (async, non-bloquant)
- Chargement toutes données : <500ms (100 nœuds + paramètres)
- Migration : ~1s (100 nœuds + attachments)
- Notification multi-onglets : <10ms (BroadcastChannel)

**Optimisations :**
- Les opérations en masse utilisent `bulkPut()` pour de meilleures performances
- Cache mémoire (objet `data`) pour accès synchrone
- Les sauvegardes async ne bloquent pas l'UI
- Index sur `parent` et `tags` pour requêtes rapides

## Stratégie de fallback

Si IndexedDB est indisponible (ex : mode navigation privée), l'app :
1. Bascule sur localStorage
2. Affiche un warning dans la console
3. Continue de fonctionner avec capacité réduite

```javascript
// Dans data.js
try {
  await Storage.saveNodes(data.nodes);
} catch (error) {
  console.error('IndexedDB échoué, fallback vers localStorage');
  localStorage.setItem('deepmemo_data', JSON.stringify(data));
}
```

## Améliorations futures

Prévu pour V0.11+ :
- **Compression :** Gzip des données avant stockage
- **Versionning :** Snapshots quotidiens pour récupération de données
- **Gestion quota :** Warnings quand approche des limites de stockage
- **Planificateur d'export :** Backups périodiques automatiques
- **Protocole sync :** Sync cloud avec chiffrement E2E

---

**Documentation liée :**
- [Architecture](ARCHITECTURE.fr.md) - Architecture générale de l'app
- [Spec Attachments](SPEC-ATTACHMENTS.fr.md) - Détails gestion fichiers
- [Tests Migration](MIGRATION-TESTING.md) - Scénarios de test (archivé)
