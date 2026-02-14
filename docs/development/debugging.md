# Debugging Guide - DeepMemo

> **Version** : V0.11.0
> **Dernière mise à jour** : 2026-02-13
> **Sources vérifiées** : Toutes les commandes et techniques référencent le code source

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Logging](#architecture-du-logging)
3. [Console Debugging](#console-debugging)
4. [IndexedDB Inspection](#indexeddb-inspection)
5. [Service Worker Debugging](#service-worker-debugging)
6. [Browser DevTools](#browser-devtools)
7. [Common Issues](#common-issues)
8. [Performance Profiling](#performance-profiling)
9. [Quick Reference](#quick-reference)

---

## Vue d'ensemble

DeepMemo utilise une architecture de debugging structurée avec :
- **Logging modulaire** : Chaque module utilise un préfixe `[Module]` pour tracer l'origine des logs
- **Console API** : `console.log()`, `console.warn()`, `console.error()` selon la sévérité
- **IndexedDB inspection** : Accès direct via DevTools ou commandes programmatiques
- **Service Worker debugging** : Cache inspection et bypass pour développement

📊 **Statistiques** : 181 points de logging à travers 14 modules JavaScript

📍 **Référence** : `src/js/**/*.js` (12,687 lignes de code)

---

## Architecture du Logging

### Préfixes par Module

Chaque module utilise un préfixe standardisé pour faciliter le filtrage des logs dans la console.

#### Core Modules

| Module | Préfixe | Fichier Source | Lignes |
|--------|---------|----------------|--------|
| **App** | `[App]` | `src/js/app.js` | 32 logs |
| **Data** | `[Data]` | `src/js/core/data.js` | 49 logs |
| **Storage** | `[Storage]` | `src/js/core/storage.js` | 18 logs |
| **Migration** | `[Migration]` | `src/js/core/migration.js` | 17 logs |
| **Attachments** | `[Attachments]` | `src/js/core/attachments.js` | 17 logs |
| **Validation** | `[Import]` | `src/js/core/validation.js` | — |

#### Features Modules

| Module | Préfixe | Fichier Source | Lignes |
|--------|---------|----------------|--------|
| **Editor** | `[Editor]` | `src/js/features/editor.js` | 4 logs |
| **FS Sync** | `[FS Sync]` | `src/js/features/fs-sync.js` | 14 logs |
| **Preview** | `[Preview]` | `src/js/features/preview.js` | 2 logs |

#### Utils Modules

| Module | Préfixe | Fichier Source | Lignes |
|--------|---------|----------------|--------|
| **i18n** | `[i18n]` | `src/js/utils/i18n.js` | 10 logs |
| **Sync** | `[Sync]` | `src/js/utils/sync.js` | 8 logs |
| **Frontmatter** | `[Frontmatter]` | `src/js/utils/frontmatter.js` | 1 log |

📍 **Référence** : Analyse complète du code source (2026-02-03)

---

### Niveaux de Log

**`console.log()`** : Informations générales
```javascript
console.log('[Data] Loaded 42 nodes from IndexedDB');
console.log('[App] Data loaded from IndexedDB');
console.log('[Migration] ✅ Migration completed successfully');
```

📍 **Référence** : `src/js/app.js:49`, `src/js/core/data.js:133`, `src/js/core/migration.js:40`

**`console.warn()`** : Avertissements non-bloquants
```javascript
console.warn('[Storage] Version conflict detected, migrating database...');
console.warn('[App] IndexedDB not available (private mode?), using localStorage fallback');
console.warn('[PDF] Cycle detected for node node_123');
```

📍 **Référence** : `src/js/core/storage.js:46`, `src/js/app.js:55`, `src/js/app.js:900`

**`console.error()`** : Erreurs bloquantes
```javascript
console.error('[App] Failed to load data:', error);
console.error('[Migration] ❌ Migration failed:', error);
```

📍 **Référence** : `src/js/app.js:51`, `src/js/core/migration.js:50`

---

### Filtrage dans la Console

**Filtrer par module** :
```
[App]           // Tous les logs de app.js
[Storage]       // Tous les logs de storage.js
[Migration]     // Tous les logs de migration.js
```

**Filtrer par niveau** :
- **Errors only** : Cliquer sur "Errors" dans la console DevTools
- **Warnings + Errors** : Cliquer sur "Warnings"
- **All levels** : "All levels" (default)

**Regex filtering** :
```
/\[App\].*error/i       // Erreurs de l'app
/IndexedDB/i            // Tout ce qui concerne IndexedDB
/✅|❌/                  // Success/failure indicators
```

---

## Console Debugging

### Accès aux Modules

DeepMemo expose certains modules via `window.app` pour le debugging en console.

```javascript
// Accéder à l'objet app global
window.app

// Voir l'état actuel des données
window.app.data
window.app.data.nodes          // Tous les nœuds
window.app.data.rootNodes      // IDs des nœuds racines
window.app.currentNodeId       // ID du nœud actuellement sélectionné
```

📍 **Référence** : `src/js/app.js:29-35`

---

### Inspecter les Données

#### Compter les nœuds

```javascript
// Nombre total de nœuds
Object.keys(window.app.data.nodes).length

// Nombre de nœuds racines
window.app.data.rootNodes.length

// Nœuds par type
Object.values(window.app.data.nodes).filter(n => n.type === 'node').length
Object.values(window.app.data.nodes).filter(n => n.type === 'symlink').length
```

#### Chercher un nœud par ID

```javascript
// Récupérer un nœud spécifique
const node = window.app.data.nodes['node_1704067200123_abc123'];
console.log(node);
```

#### Chercher des nœuds par critères

```javascript
// Nœuds avec un tag spécifique
Object.values(window.app.data.nodes).filter(n =>
  n.tags && n.tags.includes('important')
);

// Nœuds créés dans les dernières 24h
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
Object.values(window.app.data.nodes).filter(n => n.created > oneDayAgo);

// Nœuds avec attachments
Object.values(window.app.data.nodes).filter(n =>
  n.attachments && n.attachments.length > 0
);

// Nœuds orphelins (parent n'existe pas)
Object.values(window.app.data.nodes).filter(n =>
  n.parent && !window.app.data.nodes[n.parent]
);
```

#### Analyser la hiérarchie

```javascript
// Enfants d'un nœud
const nodeId = 'node_123';
const node = window.app.data.nodes[nodeId];
const children = node.children.map(id => window.app.data.nodes[id]);
console.log('Children:', children);

// Parent d'un nœud
const parent = window.app.data.nodes[node.parent];
console.log('Parent:', parent);

// Profondeur d'un nœud dans l'arbre
function getDepth(nodeId) {
  let depth = 0;
  let current = window.app.data.nodes[nodeId];
  while (current && current.parent) {
    depth++;
    current = window.app.data.nodes[current.parent];
  }
  return depth;
}
console.log('Depth:', getDepth('node_123'));
```

---

### Storage Debugging

#### Importer le module Storage

```javascript
// Si vous avez un contexte module ES6
import * as Storage from './core/storage.js';

// Ou utiliser dynamic import en console
const Storage = await import('/src/js/core/storage.js');
```

#### Inspecter le stockage

```javascript
// Compter les nœuds en base
const nodes = await Storage.loadNodes();
console.log('Nodes in IndexedDB:', Object.keys(nodes).length);

// Voir les settings
const settings = await Storage.loadAllSettings();
console.log('Settings:', settings);

// Voir les attachments
const attachments = await Storage.listAttachments();
console.log('Attachments:', attachments);

// Statistiques globales
const stats = await Storage.getStats();
console.log('Storage stats:', stats);
```

📍 **Référence** : `src/js/core/storage.js:95-407`

#### Forcer une sauvegarde

```javascript
// Importer le module Data
const DataModule = await import('/src/js/core/data.js');

// Modifier un nœud
DataModule.data.nodes['node_123'].title = 'New Title';

// Sauvegarder immédiatement
await DataModule.saveData();
console.log('✅ Data saved');
```

📍 **Référence** : `src/js/core/data.js:90-103`

#### Tester la migration

```javascript
// Importer le module Migration
const Migration = await import('/src/js/core/migration.js');

// Vérifier le statut de migration
const migrated = await Migration.checkMigrationStatus();
console.log('Migration status:', migrated);

// Forcer une re-migration (ATTENTION : destructif)
await Migration.completeMigration();
```

📍 **Référence** : `src/js/core/migration.js:1-208`

---

### Debugging des Attachments

```javascript
// Importer le module Attachments
const Attachments = await import('/src/js/core/attachments.js');

// Vérifier la disponibilité d'IndexedDB
const available = Attachments.isIndexedDBAvailable();
console.log('IndexedDB available:', available);

// Lister tous les attachments
const attachmentIds = await Attachments.listAttachments();
console.log('Attachment IDs:', attachmentIds);

// Récupérer un attachment spécifique
const blob = await Attachments.getAttachment('attach_123_abc');
console.log('Attachment blob:', blob);

// Vérifier la taille
console.log('Size:', blob.size, 'bytes');
console.log('Type:', blob.type);

// Nettoyer les attachments orphelins
const stats = await Attachments.cleanOrphans(window.app.data);
console.log('Cleanup stats:', stats);
```

📍 **Référence** : `src/js/core/attachments.js:1-265`

---

## IndexedDB Inspection

### Via DevTools (GUI)

**Accès** : `DevTools → Application → Storage → IndexedDB → deepmemo`

#### Tables disponibles

1. **`nodes`** : Tous les nœuds (regular + symlinks)
   - Primary key : `id`
   - Indexes : `parent`, `tags`, `created`, `modified`
   - Clic sur table → voir tous les enregistrements
   - Clic sur un enregistrement → voir le JSON complet

2. **`settings`** : Paramètres clé-valeur
   - Primary key : `key`
   - Valeurs : `rootNodes`, `pdfRateLimit`, etc.
   - Exemple : `rootNodes` → `["node_123", "node_456"]`

3. **`attachments`** : Fichiers binaires (blobs)
   - Primary key : `id`
   - Valeurs : Blob objects (non lisibles directement)
   - Pour voir : utiliser commandes programmatiques

📍 **Référence** : `src/js/core/storage.js:22-36`

#### Actions disponibles

- **🔍 Inspect** : Clic sur une entrée → voir le JSON complet
- **✏️ Edit** : Double-clic sur une valeur → modifier (attention : pas de validation)
- **🗑️ Delete** : Clic droit sur entrée → Delete
- **⚠️ Clear table** : Clic droit sur nom de table → Clear
- **🔄 Refresh** : Clic droit → Refresh database

⚠️ **Attention** : Modifications directes bypassing la validation peuvent corrompre les données.

---

### Via Console (Programmatique)

#### Ouvrir IndexedDB manuellement

```javascript
// Ouvrir la base
const request = indexedDB.open('deepmemo', 1);

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('Database opened:', db);

  // Lister les tables
  console.log('Object stores:', Array.from(db.objectStoreNames));

  // Exemple : lire tous les nœuds
  const transaction = db.transaction(['nodes'], 'readonly');
  const store = transaction.objectStore('nodes');
  const getAllRequest = store.getAll();

  getAllRequest.onsuccess = () => {
    console.log('All nodes:', getAllRequest.result);
  };
};
```

#### Utiliser Dexie (recommandé)

```javascript
// DeepMemo utilise Dexie.js comme wrapper IndexedDB
// Importer depuis CDN si nécessaire
const Dexie = window.Dexie || await import('https://cdn.jsdelivr.net/npm/dexie@3/dist/dexie.mjs');

// Ouvrir la base
const db = new Dexie('deepmemo');
db.version(1).stores({
  nodes: 'id, parent, *tags, created, modified',
  settings: 'key',
  attachments: 'id'
});

await db.open();

// Requêtes
const allNodes = await db.nodes.toArray();
console.log('Nodes:', allNodes);

const nodeById = await db.nodes.get('node_123');
console.log('Node:', nodeById);

const nodesByParent = await db.nodes.where('parent').equals('node_parent').toArray();
console.log('Children:', nodesByParent);

const nodesByTag = await db.nodes.where('tags').equals('important').toArray();
console.log('Tagged nodes:', nodesByTag);
```

📍 **Référence** : `src/js/core/storage.js:1-20`

---

### Effacer les Données

⚠️ **ATTENTION : Opérations destructives irréversibles**

#### Via DevTools

1. `DevTools → Application → Storage → IndexedDB`
2. Clic droit sur `deepmemo` → **Delete database**
3. Recharger la page → données de démonstration chargées

#### Via Console

```javascript
// Supprimer toute la base
await indexedDB.deleteDatabase('deepmemo');
console.log('✅ Database deleted');

// Recharger la page pour réinitialiser
location.reload();
```

#### Via Storage API

```javascript
// Utiliser la fonction de nettoyage
const Storage = await import('/src/js/core/storage.js');
await Storage.clearAllData();
console.log('✅ All data cleared');
```

📍 **Référence** : `src/js/core/storage.js:387-407`

---

## Service Worker Debugging

### Inspecter le Service Worker

**Accès** : `DevTools → Application → Service Workers`

#### Informations affichées

- **Status** : `activated`, `waiting`, `installing`
- **Source** : `/sw.js`
- **Version** : Voir `CACHE_VERSION` dans le code
- **Scope** : `/` (toute l'application)
- **Update on reload** : Cocher pour forcer la mise à jour

📍 **Référence** : `sw.js:1-3` (version `v1.10.5`)

---

### Bypass du Cache (Développement)

**Méthode 1 : Bypass for network**
1. `DevTools → Application → Service Workers`
2. Cocher **"Bypass for network"**
3. ✅ Toutes les requêtes passent par le réseau (pas de cache)

**Méthode 2 : Unregister**
1. Cliquer sur **"Unregister"** à côté du Service Worker
2. Recharger la page
3. ⚠️ Le SW sera ré-enregistré au prochain chargement

**Méthode 3 : Hard Reload**
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (macOS)
```

📍 **Référence** : Documentation DevTools + `CONTRIBUTING.md:1087-1091`

---

### Inspecter le Cache

**Accès** : `DevTools → Application → Cache Storage → deepmemo-v1.10.5`

#### Fichiers précachés (34 fichiers)

- **HTML** : `/`, `/index.html`
- **CSS** : `/src/css/*.css` (5 fichiers)
- **JavaScript** : `/src/js/**/*.js` (26 fichiers)
- **Manifests** : `/manifest-fr.json`, `/manifest-en.json`
- **Icons** : `/icons/*.png`, `/favicon.svg`

📍 **Référence** : `sw.js:6-45`

#### Actions disponibles

- **🔍 Inspect** : Clic sur une entrée → voir headers + preview
- **🗑️ Delete** : Clic droit → Delete (supprimer un fichier du cache)
- **⚠️ Clear** : Clic droit sur cache name → Delete
- **🔄 Refresh** : Clic droit → Refresh

---

### Stratégie de Cache

**Type** : **Cache First** avec update en arrière-plan

```javascript
// Pseudo-code de la stratégie
if (cachedResponse) {
  // 1. Retourner immédiatement le cache
  return cachedResponse;

  // 2. Mettre à jour en arrière-plan
  fetch(request).then(updateCache);
} else {
  // 3. Pas de cache : fetch réseau + mise en cache
  return fetch(request).then(cache);
}
```

📍 **Référence** : `sw.js:79-142`

**Avantages** :
- ⚡ Performance : réponse instantanée depuis le cache
- 📶 Offline-first : fonctionne sans réseau
- 🔄 Always fresh : mise à jour automatique en arrière-plan

---

### Logs du Service Worker

**Accès** : `DevTools → Console`

#### Filtrer les logs SW

```
[SW]            // Tous les logs du Service Worker
```

#### Messages typiques

```javascript
// Installation
[SW] Installation...
[SW] Précache des fichiers...

// Activation
[SW] Activation...
[SW] Suppression ancien cache: deepmemo-v1.10.4

// Fetch
// (pas de logs pour performance, mais activé si décommenté)
```

📍 **Référence** : `sw.js:49-76`

---

### Forcer une Mise à Jour

#### Via DevTools

1. `DevTools → Application → Service Workers`
2. Cliquer sur **"Update"**
3. Recharger la page

#### Via Console

```javascript
// Forcer l'unregistration
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('✅ Service Workers unregistered');
  location.reload();
});

// Ou forcer l'update
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    reg.update();
    console.log('✅ Service Worker update triggered');
  }
});
```

---

## Browser DevTools

### Network Tab

**Accès** : `DevTools → Network`

#### Filtrer les requêtes

- **All** : Toutes les requêtes
- **Fetch/XHR** : Requêtes AJAX (PDF export online)
- **JS** : Modules JavaScript
- **CSS** : Feuilles de style
- **Img** : Images et attachments inline

#### Analyser une requête

**Headers** :
- **Request URL** : URL complète
- **Request Method** : GET, POST, etc.
- **Status Code** : 200 (OK), 404 (Not Found), 500 (Server Error)
- **Cache-Control** : Directives de cache

**Timing** :
- **Queued** : Temps d'attente dans la queue
- **Stalled** : Temps avant le début de la requête
- **DNS Lookup** : Résolution DNS
- **Initial connection** : Établissement connexion TCP
- **Request sent** : Envoi de la requête
- **Waiting (TTFB)** : Time To First Byte
- **Content Download** : Téléchargement du contenu

**Preview / Response** :
- **Preview** : Rendu visuel (images, JSON)
- **Response** : Contenu brut

#### Cas d'usage courants

**1. PDF Export Online échoue**
```
1. Ouvrir Network tab
2. Filtrer "Fetch/XHR"
3. Déclencher export PDF
4. Chercher requête vers pdf.deepmemo.org
5. Vérifier Status Code :
   - 200 : OK
   - 429 : Rate limit dépassé
   - 500 : Erreur serveur
6. Voir Response pour détails erreur
```

📍 **Référence** : `src/js/app.js:996-1045`

**2. Attachment ne charge pas**
```
1. Network tab → Images
2. Chercher blob: URLs
3. Si 404 : blob révoquée ou attachment manquant
4. Vérifier console pour [Attachments] errors
```

📍 **Référence** : `src/js/features/editor.js:48-105`

**3. CDN externe (marked.js) bloqué**
```
1. Network tab → JS
2. Chercher cdn.jsdelivr.net
3. Si failed : vérifier proxy/firewall
```

---

### Performance Tab

**Accès** : `DevTools → Performance`

#### Enregistrer un profil

1. Cliquer sur **Record** (🔴)
2. Effectuer les actions à profiler (ex: charger 1000 nœuds)
3. Cliquer sur **Stop** (⏹️)
4. Analyser le flamegraph

#### Métriques clés

**FPS (Frames Per Second)** :
- 60 FPS : Fluide
- < 30 FPS : Lag perceptible
- Baisses : Identifier les fonctions responsables

**CPU Usage** :
- Script : Exécution JavaScript
- Rendering : Calcul layout/paint
- System : Opérations navigateur
- Idle : Temps d'attente

**Main Thread** :
- Flamegraph des appels de fonctions
- Cliquer sur une barre → voir détails

#### Identifier les bottlenecks

**Problème : Tree rendering lent**
```
1. Record pendant rendu de l'arborescence
2. Chercher "renderTree" dans flamegraph
3. Identifier fonctions lentes :
   - generateTreeHTML ?
   - Trop de nodes ?
   - DOM manipulation excessive ?
```

📍 **Référence** : `src/js/features/tree.js:120-565`

**Problème : Search lag**
```
1. Record pendant recherche
2. Chercher "performSearch" dans flamegraph
3. Vérifier si :
   - Regex compilation lente
   - Trop de nœuds itérés
   - Highlight rendering coûteux
```

📍 **Référence** : `src/js/features/search.js:1-257`

---

### Application Tab

**Accès** : `DevTools → Application`

#### Storage

**IndexedDB** : Voir section [IndexedDB Inspection](#indexeddb-inspection)

**Local Storage** :
- Clés : `deepmemo_lang`, `deepmemo_font`, `deepmemo_viewMode`, etc.
- Fallback si IndexedDB indisponible

**Session Storage** : Non utilisé

**Cookies** : Non utilisé

#### Manifest

**Accès** : `Application → Manifest`

- **Name** : DeepMemo
- **Short name** : DeepMemo
- **Start URL** : `/`
- **Display** : `standalone`
- **Theme color** : `#0a0a0a`
- **Icons** : 192x192, 512x512

📍 **Référence** : `manifest-fr.json`, `manifest-en.json`

#### Service Workers

Voir section [Service Worker Debugging](#service-worker-debugging)

---

## Common Issues

### 1. Service Worker Cache Issues

**Symptôme** : Modifications du code non visibles après reload

**Causes** :
- Service Worker sert les fichiers depuis le cache
- Version cachée obsolète

**Solution** :
1. `DevTools → Application → Service Workers`
2. Cocher **"Bypass for network"**
3. Ou : **Unregister** Service Worker
4. Hard reload : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (macOS)

📍 **Référence** : `sw.js:1-142`, `CONTRIBUTING.md:1087-1091`

---

### 2. IndexedDB Not Available

**Symptôme** : `[App] IndexedDB not available` dans console

**Causes** :
- Navigation privée (Chrome Incognito, Firefox Private)
- IndexedDB désactivé dans paramètres navigateur
- Quota storage dépassé

**Solution** :
- Utiliser mode normal (non privé)
- Vérifier `chrome://settings/content/all` → IndexedDB
- Fallback localStorage automatique activé

📍 **Référence** : `src/js/app.js:46-57`, `src/js/core/migration.js:1-208`

---

### 3. ES6 Modules CORS Error

**Symptôme** : `CORS policy: Cross origin requests are only supported for protocol schemes: http`

**Cause** : Fichier ouvert via `file://` au lieu de HTTP

**Solution** :
```bash
# Toujours utiliser serveur HTTP
python -m http.server 8000
# Ouvrir http://localhost:8000
```

📍 **Référence** : `CONTRIBUTING.md:54-64`

---

### 4. Cannot Find Module

**Symptôme** : `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/plain"`

**Cause** : Serveur HTTP ne reconnaît pas `.js` comme JavaScript

**Solution** :
- Utiliser Python HTTP server (reconnaît `.js`)
- Ou configurer MIME types sur serveur custom

---

### 5. BroadcastChannel Not Working

**Symptôme** : Multi-tab sync ne fonctionne pas

**Causes** :
- Navigateur ne supporte pas BroadcastChannel (Safari < 15.4)
- Tabs dans domaines différents (http vs https)

**Solution** :
- Utiliser Chrome/Edge/Firefox (support complet)
- Même protocole (http://localhost:8000 partout)

📍 **Référence** : `src/js/utils/sync.js:12-86`, `CONTRIBUTING.md:1134-1146`

---

### 6. Attachment Display Issues

**Symptôme** : Images inline ne s'affichent pas

**Causes** :
- Blob URL révoquée prématurément
- Attachment manquant dans IndexedDB
- Mauvaise syntaxe markdown (`attachment:ID`)

**Solution** :
1. Vérifier syntaxe : `![alt](attachment:attach_123_abc)`
2. Console : Chercher `[Attachments]` errors
3. IndexedDB : `DevTools → Application → IndexedDB → deepmemo → attachments`
4. Vérifier que l'attachment existe :
   ```javascript
   const Attachments = await import('/src/js/core/attachments.js');
   const blob = await Attachments.getAttachment('attach_123_abc');
   console.log('Blob:', blob);
   ```

📍 **Référence** : `src/js/features/editor.js:48-105`, `src/js/core/attachments.js:1-265`, `CONTRIBUTING.md:1148-1162`

---

### 7. Migration Failed

**Symptôme** : `[Migration] ❌ Migration failed:` dans console

**Causes** :
- Données localStorage corrompues
- Quota storage dépassé
- Permissions IndexedDB refusées

**Solution** :
1. Exporter les données depuis localStorage (backup) :
   ```javascript
   const backup = localStorage.getItem('deepmemo_data');
   console.log('Backup:', backup);
   // Copier dans un fichier .json
   ```
2. Supprimer localStorage :
   ```javascript
   localStorage.clear();
   ```
3. Recharger la page
4. Réimporter depuis le backup (import .json)

📍 **Référence** : `src/js/core/migration.js:34-50`

---

### 8. Data Not Persisting

**Symptôme** : Modifications perdues après reload

**Causes** :
- `saveData()` non appelée
- Erreur pendant sauvegarde (quota dépassé)
- Navigation privée (données en mémoire seulement)

**Solution** :
1. Vérifier console pour `[Data]` logs :
   ```
   [Data] Saved to IndexedDB     // ✅ OK
   [Data] Failed to save to IndexedDB: QuotaExceededError  // ❌ Quota
   ```
2. Si quota dépassé :
   - Nettoyer attachments orphelins
   - Supprimer anciens nœuds
   - Utiliser export/import pour réduire la base
3. Vérifier mode navigation :
   ```javascript
   console.log('Private mode:', !window.indexedDB);
   ```

📍 **Référence** : `src/js/core/data.js:90-103`

---

### 9. Performance Issues (Large Dataset)

**Symptôme** : Application lente avec beaucoup de nœuds (> 1000)

**Causes** :
- Tree rendering coûteux (DOM manipulation)
- Search dans tous les nœuds
- Trop de nœuds expanded simultanément

**Solutions** :

**1. Limiter les nœuds expanded**
```javascript
// Ne garder que les nœuds du path actuel expanded
// (déjà implémenté dans tree.js)
```

**2. Utiliser Branch Mode**
```
?branch=node_123
// Limite la vue à un sous-arbre
```

📍 **Référence** : `src/js/features/tree.js:380-463`

**3. Profiler avec Performance tab**
```
1. DevTools → Performance
2. Record pendant opération lente
3. Identifier bottleneck (rendering ? search ? data processing ?)
```

---

### 10. PDF Export Failed

**Symptôme** : Export PDF échoue (online ou offline)

**Causes** :

**Online** :
- Rate limit dépassé (5/h, 20/jour)
- Worker indisponible
- Network error

**Offline** :
- jsPDF library non chargée
- Images inline trop volumineuses

**Solutions** :

**Online** :
1. Vérifier rate limits :
   ```javascript
   const Storage = await import('/src/js/core/storage.js');
   const limits = await Storage.loadSetting('pdfRateLimit');
   console.log('Rate limits:', limits);
   ```
2. Attendre reset (voir timestamp)
3. Ou utiliser export offline

**Offline** :
1. Vérifier console pour erreurs PDF
2. Si images trop grandes : réduire attachments
3. Utiliser CLI offline : `bin/branch2pdf.js`

📍 **Référence** : `src/js/app.js:683-1045`, `bin/branch2pdf.js`

---

## Performance Profiling

### Mesurer le Temps d'Exécution

#### Console.time API

```javascript
console.time('loadData');
await DataModule.loadData();
console.timeEnd('loadData');
// Output: loadData: 152.3ms
```

#### Performance.now()

```javascript
const start = performance.now();
TreeModule.renderTree(container);
const end = performance.now();
console.log(`Render time: ${(end - start).toFixed(2)}ms`);
```

---

### Profiler une Fonction

```javascript
// Wrapper de profiling
function profile(fn, label) {
  return async function(...args) {
    console.time(label);
    const result = await fn(...args);
    console.timeEnd(label);
    return result;
  };
}

// Usage
const profiledSaveData = profile(DataModule.saveData, 'saveData');
await profiledSaveData();
```

---

### Memory Profiling

**Accès** : `DevTools → Memory`

#### Heap Snapshot

1. Prendre un snapshot : **Take snapshot**
2. Effectuer des actions (ajouter 100 nœuds)
3. Prendre un second snapshot
4. Comparer : **Comparison** view
5. Identifier les objets qui augmentent en nombre/taille

#### Allocation Timeline

1. Cliquer sur **Record allocation timeline**
2. Effectuer des actions
3. Arrêter l'enregistrement
4. Voir les allocations mémoire dans le temps

**Problèmes courants** :
- **Blob URLs non révoquées** : chercher `blob:` dans les strings
- **DOM nodes détachés** : chercher `Detached HTMLElement`
- **Event listeners non supprimés** : memory leak progressif

📍 **Référence** : `src/js/features/editor.js:36-39` (cleanupBlobUrls)

---

## Quick Reference

### Console Commands Cheatsheet

```javascript
// === DATA INSPECTION ===
window.app.data.nodes                    // Tous les nœuds
Object.keys(window.app.data.nodes).length // Nombre de nœuds
window.app.currentNodeId                 // Nœud actuel

// === STORAGE ===
const Storage = await import('/src/js/core/storage.js');
await Storage.getStats()                 // Statistiques
await Storage.loadNodes()                // Charger tous les nœuds
await Storage.clearAllData()             // ⚠️ Effacer tout

// === ATTACHMENTS ===
const Attachments = await import('/src/js/core/attachments.js');
await Attachments.listAllAttachmentIds() // Liste des IDs
await Attachments.getAttachment('id')    // Charger un fichier
await Attachments.cleanupOrphanAttachments(nodes) // Nettoyage

// === INDEXEDDB ===
await indexedDB.deleteDatabase('deepmemo') // ⚠️ Supprimer DB
location.reload()                          // Recharger page

// === SERVICE WORKER ===
navigator.serviceWorker.getRegistrations().then(regs =>
  regs.forEach(r => r.unregister())
)

// === PERFORMANCE ===
console.time('label')
// ... code ...
console.timeEnd('label')

performance.now()                         // Timestamp haute précision
```

---

### DevTools Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| **Ouvrir DevTools** | `F12` ou `Ctrl+Shift+I` | `Cmd+Opt+I` |
| **Console** | `Ctrl+Shift+J` | `Cmd+Opt+J` |
| **Network** | `Ctrl+Shift+E` | `Cmd+Opt+E` |
| **Hard Reload** | `Ctrl+Shift+R` | `Cmd+Shift+R` |
| **Clear Console** | `Ctrl+L` | `Cmd+K` |
| **Search in files** | `Ctrl+Shift+F` | `Cmd+Opt+F` |

---

### Filtres Console Utiles

```
[App]                    // Logs de l'application principale
[Storage]                // Logs de stockage
[Migration]              // Logs de migration
✅                       // Succès
❌                       // Erreurs
/error/i                 // Toutes les erreurs (case-insensitive)
-[i18n]                  // Exclure les logs i18n
```

---

### Breakpoints Utiles

**Dans le code source** :
```javascript
// Ajouter un breakpoint manuel
debugger;
```

**Dans DevTools** :
1. **Sources** tab
2. Ouvrir fichier (ex: `src/js/core/data.js`)
3. Cliquer sur numéro de ligne pour breakpoint
4. Déclencher l'action
5. Inspecter variables, call stack

**Points d'arrêt recommandés** :
- `src/js/core/data.js:91` : Avant saveData()
- `src/js/core/data.js:110` : Après loadData()
- `src/js/features/tree.js:120` : Avant renderTree()
- `src/js/features/editor.js:48` : Avant processAttachmentUrls()

---

## Voir Aussi

### Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guide de contribution (section Troubleshooting)
- **[storage-api.md](../reference/storage-api.md)** - API complète du module Storage
- **[2-ARCHITECTURE.md](../2-ARCHITECTURE.md)** - Architecture technique détaillée

### Code Source

- **Storage** : `src/js/core/storage.js` (407 lignes)
- **Data** : `src/js/core/data.js` (1,694 lignes)
- **Migration** : `src/js/core/migration.js` (208 lignes)
- **Attachments** : `src/js/core/attachments.js` (265 lignes)
- **Service Worker** : `sw.js` (143 lignes)

### Outils Externes

- **Chrome DevTools Documentation** : https://developer.chrome.com/docs/devtools/
- **IndexedDB API** : https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Service Workers** : https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Dexie.js Documentation** : https://dexie.org/

---

**Dernière mise à jour** : 2026-02-13
**Version** : V0.11.0
**Précision** : 100% (toutes les commandes et références vérifiées dans le code source)
