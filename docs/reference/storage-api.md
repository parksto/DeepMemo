# Storage API Reference

> Guide complet de l'API de stockage DeepMemo
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-01-30
>
> 📍 **Sources** : `src/js/core/storage.js` (408 lignes), `src/js/core/migration.js` (209 lignes)

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture IndexedDB](#architecture-indexeddb)
3. [Initialisation](#initialisation)
4. [API Nodes](#api-nodes)
5. [API Settings](#api-settings)
6. [API Attachments](#api-attachments)
7. [Migration localStorage](#migration-localstorage)
8. [Utilitaires](#utilitaires)
9. [Console Debugging](#console-debugging)
10. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe de Fonctionnement

DeepMemo utilise **IndexedDB** via **Dexie.js** pour stocker toutes les données localement dans le navigateur. Ce système remplace l'ancien stockage `localStorage` (trop limité en taille).

**Architecture** :
```
┌─────────────────────────────────────┐
│   Application (data.js)             │
│   État en mémoire (synchrone)       │
└──────────────┬──────────────────────┘
               │ async save/load
┌──────────────▼──────────────────────┐
│   Storage API (storage.js)          │
│   Wrapper Dexie.js (async)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   IndexedDB (navigateur)            │
│   Base de données "deepmemo"        │
│   - Table "nodes"                   │
│   - Table "settings"                │
│   - Table "attachments"             │
└─────────────────────────────────────┘
```

📍 **Référence** : `storage.js:1-408` (module complet)

---

### Caractéristiques

| Fonctionnalité | Description |
|----------------|-------------|
| **Storage** | IndexedDB via Dexie.js v3.2.4 |
| **Capacité** | ~500 MB à plusieurs GB (selon navigateur) |
| **Performance** | Opérations asynchrones optimisées (bulkPut) |
| **Migration** | Automatique depuis localStorage |
| **Fallback** | localStorage en cas d'erreur critique |
| **Versioning** | Schema v1, migrations additives futures |

📍 **Référence** : `storage.js:23` (database name "deepmemo")

---

### Avantages vs localStorage

| Critère | localStorage | IndexedDB (DeepMemo) |
|---------|--------------|----------------------|
| **Taille max** | ~5-10 MB | ~500 MB - plusieurs GB |
| **Type de données** | Strings seulement | Objects, Blobs, Arrays |
| **Performance** | Synchrone (bloquant) | Asynchrone (non-bloquant) |
| **Indexation** | Aucune | Indexes multiples (tags, parent, dates) |
| **Requêtes** | Impossible | Queries complexes (WHERE, ORDER BY) |
| **Transactions** | Aucune | Transactions ACID |

---

## Architecture IndexedDB

### Schéma de la Base de Données

**Nom de la base** : `deepmemo`
**Version** : 1
**Engine** : Dexie.js

```javascript
db.version(1).stores({
  nodes: 'id, parent, *tags, created, modified',
  settings: 'key',
  attachments: 'id'
});
```

📍 **Référence** : `storage.js:26-36` (schema definition)

---

### Table `nodes`

Stocke tous les nœuds (notes) et symlinks.

| Champ | Type | Index | Description |
|-------|------|-------|-------------|
| **id** | `string` | ✅ Primary Key | ID unique du nœud (`node_timestamp_random`) |
| **parent** | `string|null` | ✅ Index | ID du parent (null si root node) |
| **tags** | `Array<string>` | ✅ Multi-entry | Tags du nœud (indexés individuellement) |
| **created** | `number` | ✅ Index | Timestamp de création (millisecondes) |
| **modified** | `number` | ✅ Index | Timestamp de dernière modification |
| type | `string` | ❌ | "node" ou "symlink" |
| title | `string` | ❌ | Titre du nœud |
| content | `string` | ❌ | Contenu Markdown |
| children | `Array<string>` | ❌ | IDs des enfants directs |
| attachments | `Array<Object>` | ❌ | Métadonnées des fichiers attachés |
| targetId | `string` | ❌ | ID cible (symlinks seulement) |

**Exemples** :

```javascript
// Nœud regular
{
  id: "node_1738238400000_abc123",
  type: "node",
  title: "My Note",
  content: "# Hello\nMarkdown content...",
  parent: null,
  children: ["node_child1", "node_child2"],
  tags: ["important", "work"],
  attachments: [
    {
      id: "attach_1738238401000_xyz",
      name: "image.png",
      type: "image/png",
      size: 245789,
      created: 1738238401000,
      modified: 1738238401000
    }
  ],
  created: 1738238400000,
  modified: 1738238450000
}

// Symlink
{
  id: "symlink_1738238500000_def456",
  type: "symlink",
  title: "Link to My Note",
  targetId: "node_1738238400000_abc123",
  parent: "node_parent_id",
  children: [],
  tags: [],
  created: 1738238500000,
  modified: 1738238500000
}
```

📍 **Référence** : `storage.js:28` (nodes table schema)

---

### Table `settings`

Stocke les préférences et métadonnées globales (clé-valeur).

| Champ | Type | Index | Description |
|-------|------|-------|-------------|
| **key** | `string` | ✅ Primary Key | Nom du paramètre |
| **value** | `any` | ❌ | Valeur du paramètre (JSON-serializable) |

**Clés utilisées** :

| Clé | Type | Description |
|-----|------|-------------|
| `rootNodes` | `Array<string>` | Liste des IDs des nœuds racines |
| `viewMode` | `string` | Mode d'affichage ("edit" ou "view") |
| `fontPreference` | `string` | Police préférée ("sans-serif", "serif", "mono") |
| `language` | `string` | Langue de l'interface ("fr" ou "en") |
| `pdfRateLimit` | `Object` | État du rate limiting PDF export |

**Exemple** :

```javascript
{
  key: "rootNodes",
  value: ["node_1738238400000_abc123", "node_1738238410000_def456"]
}
```

📍 **Référence** : `storage.js:31` (settings table schema)

---

### Table `attachments`

Stocke les fichiers attachés comme blobs binaires.

| Champ | Type | Index | Description |
|-------|------|-------|-------------|
| **id** | `string` | ✅ Primary Key | ID unique de l'attachment |
| **blob** | `Blob` | ❌ | Données binaires du fichier |

**Exemple** :

```javascript
{
  id: "attach_1738238401000_xyz",
  blob: Blob { size: 245789, type: "image/png" }
}
```

📍 **Référence** : `storage.js:35` (attachments table schema)

---

## Initialisation

### `initStorage()`

Initialise la base de données IndexedDB. Doit être appelée **une seule fois** au démarrage de l'application.

**Signature** :
```javascript
async function initStorage(): Promise<Dexie>
```

**Comportement** :
1. Crée/ouvre la database `deepmemo` (version 1)
2. Définit le schéma (tables + indexes)
3. Gère les conflits de version (backup + restore)
4. Retourne l'instance Dexie

**Exemple** :
```javascript
import * as Storage from './core/storage.js';

// Au démarrage de l'app
await Storage.initStorage();
console.log('Database ready');
```

📍 **Référence** : `storage.js:17-93` (fonction complète)

**Gestion des conflits de version** :

Si l'utilisateur a une version plus récente de la DB (tests, dev), DeepMemo :
1. Ouvre la DB existante
2. Sauvegarde toutes les données (`nodes`, `settings`, `attachments`)
3. Supprime l'ancienne DB
4. Recrée la DB avec le schéma correct (v1)
5. Restaure les données

📍 **Référence** : `storage.js:44-90` (version conflict handling)

---

### `getDB()`

Retourne l'instance Dexie. À utiliser après `initStorage()`.

**Signature** :
```javascript
function getDB(): Dexie
```

**Erreur** : Throw si `initStorage()` n'a pas été appelée.

**Exemple** :
```javascript
const db = Storage.getDB();
const nodesCount = await db.nodes.count();
```

📍 **Référence** : `storage.js:98-103`

---

## API Nodes

Toutes les opérations sur les nœuds (notes et symlinks).

### `saveNodes(nodes)`

Sauvegarde **tous** les nœuds en une seule transaction (upsert bulk).

**Signature** :
```javascript
async function saveNodes(nodes: Object): Promise<void>
```

**Paramètres** :
- `nodes` : Objet `{nodeId: nodeData}` (format data.js)

**Performance** : Utilise `bulkPut()` pour optimiser l'écriture.

**Exemple** :
```javascript
import * as Storage from './core/storage.js';
import { data } from './core/data.js';

// Sauvegarder tous les nœuds
await Storage.saveNodes(data.nodes);
console.log('All nodes saved');
```

📍 **Référence** : `storage.js:113-120`

---

### `loadNodes()`

Charge **tous** les nœuds depuis IndexedDB.

**Signature** :
```javascript
async function loadNodes(): Promise<Object>
```

**Retour** : Objet `{nodeId: nodeData}`

**Exemple** :
```javascript
const nodes = await Storage.loadNodes();
console.log(`Loaded ${Object.keys(nodes).length} nodes`);

// Accéder à un nœud spécifique
const myNode = nodes['node_1738238400000_abc123'];
```

📍 **Référence** : `storage.js:126-138`

---

### `saveNode(node)`

Sauvegarde **un seul** nœud (upsert).

**Signature** :
```javascript
async function saveNode(node: Object): Promise<void>
```

**Paramètres** :
- `node` : Objet nœud complet (avec `id`)

**Usage** : Optimisation pour modifications ponctuelles (évite de sauvegarder tous les nœuds).

**Exemple** :
```javascript
const node = {
  id: 'node_1738238400000_abc123',
  title: 'Updated Title',
  content: 'New content',
  modified: Date.now()
};

await Storage.saveNode(node);
```

📍 **Référence** : `storage.js:144-147`

---

### `deleteNode(nodeId)`

Supprime un nœud.

**Signature** :
```javascript
async function deleteNode(nodeId: string): Promise<void>
```

**Paramètres** :
- `nodeId` : ID du nœud à supprimer

**⚠️ Attention** : Ne supprime **pas** automatiquement les enfants ni les attachments. Gérer manuellement.

**Exemple** :
```javascript
await Storage.deleteNode('node_1738238400000_abc123');
console.log('Node deleted');
```

📍 **Référence** : `storage.js:153-156`

---

### `getNode(nodeId)`

Récupère un seul nœud par son ID.

**Signature** :
```javascript
async function getNode(nodeId: string): Promise<Object|undefined>
```

**Retour** :
- Objet nœud si trouvé
- `undefined` si non trouvé

**Exemple** :
```javascript
const node = await Storage.getNode('node_1738238400000_abc123');

if (node) {
  console.log(`Found: ${node.title}`);
} else {
  console.log('Node not found');
}
```

📍 **Référence** : `storage.js:163-166`

---

### `getNodesByTag(tag)`

Recherche tous les nœuds avec un tag spécifique.

**Signature** :
```javascript
async function getNodesByTag(tag: string): Promise<Array<Object>>
```

**Paramètres** :
- `tag` : Tag à rechercher (case-sensitive)

**Retour** : Array de nœuds

**Performance** : Utilise l'index multi-entry `tags` pour une recherche rapide.

**Exemple** :
```javascript
const workNodes = await Storage.getNodesByTag('work');
console.log(`Found ${workNodes.length} work-related nodes`);

workNodes.forEach(node => {
  console.log(`- ${node.title}`);
});
```

📍 **Référence** : `storage.js:173-176`

---

### `getNodesByParent(parentId)`

Récupère tous les enfants directs d'un nœud.

**Signature** :
```javascript
async function getNodesByParent(parentId: string|null): Promise<Array<Object>>
```

**Paramètres** :
- `parentId` : ID du parent (`null` pour les root nodes)

**Retour** : Array de nœuds enfants

**Performance** : Utilise l'index `parent`.

**Exemple** :
```javascript
// Root nodes
const rootNodes = await Storage.getNodesByParent(null);
console.log(`${rootNodes.length} root nodes`);

// Children of a specific node
const children = await Storage.getNodesByParent('node_1738238400000_abc123');
console.log(`${children.length} children`);
```

📍 **Référence** : `storage.js:183-186`

---

## API Settings

Gestion des paramètres globaux (clé-valeur).

### `saveSetting(key, value)`

Sauvegarde un paramètre.

**Signature** :
```javascript
async function saveSetting(key: string, value: any): Promise<void>
```

**Paramètres** :
- `key` : Nom du paramètre
- `value` : Valeur (doit être JSON-serializable)

**Exemple** :
```javascript
// Sauvegarder rootNodes
await Storage.saveSetting('rootNodes', ['node_123', 'node_456']);

// Sauvegarder language
await Storage.saveSetting('language', 'fr');

// Sauvegarder objet complexe
await Storage.saveSetting('userPreferences', {
  theme: 'dark',
  fontSize: 14,
  notifications: true
});
```

📍 **Référence** : `storage.js:197-200`

---

### `loadSetting(key, defaultValue)`

Charge un paramètre.

**Signature** :
```javascript
async function loadSetting(key: string, defaultValue: any = null): Promise<any>
```

**Paramètres** :
- `key` : Nom du paramètre
- `defaultValue` : Valeur par défaut si non trouvé

**Retour** : Valeur du paramètre ou `defaultValue`

**Exemple** :
```javascript
// Avec valeur par défaut
const lang = await Storage.loadSetting('language', 'en');

// Sans valeur par défaut
const rootNodes = await Storage.loadSetting('rootNodes', []);

// Paramètre inexistant
const custom = await Storage.loadSetting('nonExistent', 'fallback');
console.log(custom); // "fallback"
```

📍 **Référence** : `storage.js:208-212`

---

### `loadAllSettings()`

Charge **tous** les paramètres en un seul objet.

**Signature** :
```javascript
async function loadAllSettings(): Promise<Object>
```

**Retour** : Objet `{key: value}`

**Exemple** :
```javascript
const settings = await Storage.loadAllSettings();

console.log(settings);
// {
//   rootNodes: ['node_123', 'node_456'],
//   language: 'fr',
//   viewMode: 'edit',
//   fontPreference: 'sans-serif'
// }

// Accès direct
console.log(settings.language); // "fr"
```

📍 **Référence** : `storage.js:218-228`

---

## API Attachments

Gestion des fichiers attachés (stockage blob).

### `saveAttachment(id, blob)`

Sauvegarde un fichier.

**Signature** :
```javascript
async function saveAttachment(id: string, blob: Blob): Promise<void>
```

**Paramètres** :
- `id` : ID unique de l'attachment (généré par `attachments.js`)
- `blob` : Données binaires du fichier

**Exemple** :
```javascript
// Upload depuis un input file
const file = document.getElementById('fileInput').files[0];
const attachmentId = `attach_${Date.now()}_${generateId()}`;

await Storage.saveAttachment(attachmentId, file);
console.log(`Saved: ${file.name} (${file.size} bytes)`);
```

📍 **Référence** : `storage.js:239-243`

---

### `loadAttachment(id)`

Charge un fichier.

**Signature** :
```javascript
async function loadAttachment(id: string): Promise<Blob|undefined>
```

**Paramètres** :
- `id` : ID de l'attachment

**Retour** :
- `Blob` si trouvé
- `undefined` si non trouvé

**Exemple** :
```javascript
const blob = await Storage.loadAttachment('attach_1738238401000_xyz');

if (blob) {
  // Créer un Object URL pour affichage
  const url = URL.createObjectURL(blob);
  document.getElementById('preview').src = url;

  // Ou télécharger
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image.png';
  a.click();
}
```

📍 **Référence** : `storage.js:250-254`

---

### `deleteAttachment(id)`

Supprime un fichier.

**Signature** :
```javascript
async function deleteAttachment(id: string): Promise<void>
```

**Paramètres** :
- `id` : ID de l'attachment

**Exemple** :
```javascript
await Storage.deleteAttachment('attach_1738238401000_xyz');
console.log('Attachment deleted');
```

📍 **Référence** : `storage.js:260-264`

---

### `listAttachments()`

Liste tous les IDs d'attachments.

**Signature** :
```javascript
async function listAttachments(): Promise<Array<string>>
```

**Retour** : Array d'IDs

**Exemple** :
```javascript
const attachmentIds = await Storage.listAttachments();
console.log(`Total attachments: ${attachmentIds.length}`);

attachmentIds.forEach(id => {
  console.log(`- ${id}`);
});
```

📍 **Référence** : `storage.js:270-274`

---

### `getTotalAttachmentsSize()`

Calcule la taille totale de tous les attachments.

**Signature** :
```javascript
async function getTotalAttachmentsSize(): Promise<number>
```

**Retour** : Taille en bytes

**Exemple** :
```javascript
const totalBytes = await Storage.getTotalAttachmentsSize();
const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

console.log(`Total attachments size: ${totalMB} MB`);

// Afficher dans l'UI
document.getElementById('storage-usage').textContent = `${totalMB} MB used`;
```

📍 **Référence** : `storage.js:280-284`

---

## Migration localStorage

Système de migration automatique depuis l'ancien stockage localStorage.

### Migration des Données

#### `migrateFromLocalStorage()`

Migre les données depuis localStorage vers IndexedDB.

**Signature** :
```javascript
async function migrateFromLocalStorage(): Promise<boolean>
```

**Retour** : `true` si migration effectuée, `false` sinon

**Processus** :
1. Lit `deepmemo_data` depuis localStorage
2. Parse le JSON (`nodes`, `rootNodes`)
3. Sauvegarde dans IndexedDB
4. Migre les paramètres (`viewMode`, `fontPreference`, `language`)
5. Marque comme migré (`deepmemo_migrated_to_indexeddb`)
6. **Conserve** localStorage comme backup

**Exemple** :
```javascript
const migrated = await Storage.migrateFromLocalStorage();

if (migrated) {
  console.log('✅ Data migrated from localStorage');
} else {
  console.log('No localStorage data found');
}
```

📍 **Référence** : `storage.js:295-346`

---

#### `isMigrated()`

Vérifie si la migration a déjà été effectuée.

**Signature** :
```javascript
function isMigrated(): boolean
```

**Retour** : `true` si déjà migré

**Exemple** :
```javascript
if (Storage.isMigrated()) {
  console.log('Already migrated, skipping');
} else {
  await Storage.migrateFromLocalStorage();
}
```

📍 **Référence** : `storage.js:352-354`

---

#### `clearLocalStorageBackup()`

Supprime le backup localStorage après migration réussie.

**Signature** :
```javascript
function clearLocalStorageBackup(): void
```

**⚠️ Attention** : Ne pas appeler tant que l'utilisateur n'a pas confirmé que tout fonctionne.

**Clés supprimées** :
- `deepmemo_data`
- `deepmemo_viewMode`
- `deepmemo_fontPreference`
- `deepmemo_language`

**Exemple** :
```javascript
// Après confirmation de l'utilisateur
if (confirm('Clear localStorage backup? (Data is safely stored in IndexedDB)')) {
  Storage.clearLocalStorageBackup();
  console.log('✅ Backup cleared');
}
```

📍 **Référence** : `storage.js:360-367`

---

### Migration des Attachments

#### `migrateAttachmentsDB()` (migration.js)

Migre les attachments depuis l'ancienne structure IndexedDB (`deepmemo-files`) vers la nouvelle (`deepmemo`).

**Signature** :
```javascript
async function migrateAttachmentsDB(): Promise<boolean>
```

**Retour** : `true` si migration effectuée

**Ancienne structure** :
- Database: `deepmemo-files`
- Store: `attachments`
- Format: `{key: id, value: blob}` (blob directement)

**Nouvelle structure** :
- Database: `deepmemo`
- Store: `attachments`
- Format: `{id: id, blob: blob}` (objet avec propriété blob)

**Processus** :
1. Ouvre l'ancienne DB `deepmemo-files`
2. Lit tous les attachments avec un curseur
3. Sauvegarde dans la nouvelle structure
4. Marque comme migré (`deepmemo_attachments_migrated`)

**Exemple** :
```javascript
import * as Migration from './core/migration.js';

const migrated = await Migration.migrateAttachmentsDB();

if (migrated) {
  console.log('✅ Attachments migrated to new structure');
}
```

📍 **Référence** : `migration.js:65-167`

---

#### `areAttachmentsMigrated()` (migration.js)

Vérifie si les attachments ont été migrés.

**Signature** :
```javascript
function areAttachmentsMigrated(): boolean
```

**Retour** : `true` si déjà migrés

📍 **Référence** : `migration.js:173-175`

---

#### `completeMigration()` (migration.js)

Effectue la migration **complète** (données + attachments).

**Signature** :
```javascript
async function completeMigration(): Promise<Object>
```

**Retour** : Objet résultat
```javascript
{
  dataMigrated: boolean,
  attachmentsMigrated: boolean,
  errors: Array<string>
}
```

**Processus** :
1. Migration des données (`runMigrationIfNeeded()`)
2. Migration des attachments (si nécessaire)
3. Affichage des stats

**Exemple** :
```javascript
import * as Migration from './core/migration.js';

const result = await Migration.completeMigration();

console.log('Migration result:', result);
// {
//   dataMigrated: true,
//   attachmentsMigrated: true,
//   errors: []
// }
```

📍 **Référence** : `migration.js:182-208`

**Usage dans l'app** :

La migration est appelée automatiquement au démarrage de l'application :

```javascript
// src/js/core/data.js:66
const migrationResult = await Migration.completeMigration();

if (migrationResult.dataMigrated) {
  console.log('[Data] ✅ Data migrated from localStorage to IndexedDB');
}
```

📍 **Référence** : `data.js:66-74`

---

## Utilitaires

### `getStats()`

Retourne les statistiques de la base de données.

**Signature** :
```javascript
async function getStats(): Promise<Object>
```

**Retour** : Objet avec statistiques
```javascript
{
  nodes: number,              // Nombre de nœuds
  attachments: number,        // Nombre d'attachments
  settings: number,           // Nombre de paramètres
  totalAttachmentsSize: number,     // Taille totale (bytes)
  totalAttachmentsSizeMB: string    // Taille formatée (MB)
}
```

**Exemple** :
```javascript
const stats = await Storage.getStats();

console.log(`
📊 Database Statistics:
- Nodes: ${stats.nodes}
- Attachments: ${stats.attachments} (${stats.totalAttachmentsSizeMB} MB)
- Settings: ${stats.settings}
`);
```

📍 **Référence** : `storage.js:377-395`

---

### `clearAllData()`

Supprime **toutes** les données de la base.

**Signature** :
```javascript
async function clearAllData(): Promise<void>
```

**⚠️ DANGER** : Irréversible. À utiliser uniquement pour :
- Tests / développement
- Reset complet demandé par l'utilisateur

**Tables vidées** :
- `nodes`
- `settings`
- `attachments`

**Exemple** :
```javascript
// Avec confirmation obligatoire
if (confirm('⚠️ DELETE ALL DATA? This cannot be undone!')) {
  await Storage.clearAllData();
  console.log('🗑️ All data cleared');

  // Recharger la page
  window.location.reload();
}
```

📍 **Référence** : `storage.js:401-407`

---

## Console Debugging

### Commandes utiles dans la console du navigateur

Ouvrez les DevTools (F12) et utilisez ces commandes pour debugger :

#### Afficher les stats

```javascript
const stats = await Storage.getStats();
console.table(stats);
```

#### Lister tous les nœuds

```javascript
const nodes = await Storage.loadNodes();
console.log(`Total nodes: ${Object.keys(nodes).length}`);

// Afficher les titres
Object.values(nodes).forEach(node => {
  console.log(`${node.id}: ${node.title}`);
});
```

#### Rechercher par tag

```javascript
const workNodes = await Storage.getNodesByTag('work');
console.table(workNodes.map(n => ({ id: n.id, title: n.title })));
```

#### Afficher les root nodes

```javascript
const rootNodes = await Storage.getNodesByParent(null);
console.log('Root nodes:', rootNodes.map(n => n.title));
```

#### Lister les attachments

```javascript
const attachmentIds = await Storage.listAttachments();
console.log(`${attachmentIds.length} attachments:`);
attachmentIds.forEach(id => console.log(`- ${id}`));

// Taille totale
const totalBytes = await Storage.getTotalAttachmentsSize();
console.log(`Total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
```

#### Exporter toutes les données (JSON)

```javascript
const nodes = await Storage.loadNodes();
const settings = await Storage.loadAllSettings();

const exportData = {
  nodes,
  settings,
  exportDate: new Date().toISOString()
};

// Copier dans le presse-papier
copy(JSON.stringify(exportData, null, 2));
console.log('✅ Data copied to clipboard');
```

#### Vérifier la migration

```javascript
console.log('Migrated:', Storage.isMigrated());
console.log('Attachments migrated:', Migration.areAttachmentsMigrated());

// localStorage backup présent ?
const hasBackup = !!localStorage.getItem('deepmemo_data');
console.log('localStorage backup exists:', hasBackup);
```

#### Inspector la base Dexie directement

```javascript
const db = Storage.getDB();

// Compter les enregistrements
console.log('Nodes:', await db.nodes.count());
console.log('Settings:', await db.settings.count());
console.log('Attachments:', await db.attachments.count());

// Lister les tables
console.log('Tables:', db.tables.map(t => t.name));

// Version de la DB
console.log('DB version:', db.verno);
```

#### Forcer une sauvegarde

```javascript
import { data, saveData } from './core/data.js';

// Modifier les données
data.nodes['node_123'].title = 'New Title';

// Sauvegarder
await saveData();
console.log('✅ Data saved');
```

---

### DevTools IndexedDB Inspector

**Accès** : DevTools → Application → Storage → IndexedDB → deepmemo

**Tables visibles** :
- `nodes` : Clic pour voir tous les nœuds
- `settings` : Clic pour voir les paramètres
- `attachments` : Clic pour voir les fichiers (blobs)

**Actions** :
- 🔍 **Inspect** : Clic sur une entrée pour voir le JSON complet
- 🗑️ **Delete** : Clic droit → Delete (supprimer une entrée)
- ⚠️ **Clear** : Clic droit sur table → Clear (vider toute la table)
- 🔄 **Refresh** : Clic droit → Refresh (recharger)

---

## Référence Rapide

### Imports

```javascript
// Storage API
import * as Storage from './core/storage.js';

// Migration
import * as Migration from './core/migration.js';

// Data state
import { data, saveData, loadData } from './core/data.js';
```

---

### Initialisation (app startup)

```javascript
// 1. Initialize storage
await Storage.initStorage();

// 2. Run migrations (if needed)
const migrationResult = await Migration.completeMigration();

// 3. Load data
const nodes = await Storage.loadNodes();
const rootNodes = await Storage.loadSetting('rootNodes', []);
```

📍 **Référence** : `data.js:64-80` (loadData function)

---

### CRUD Nodes

| Opération | Fonction | Usage |
|-----------|----------|-------|
| **Create/Update (bulk)** | `saveNodes(nodes)` | Sauvegarde tous les nœuds |
| **Create/Update (single)** | `saveNode(node)` | Sauvegarde un seul nœud |
| **Read (all)** | `loadNodes()` | Charge tous les nœuds |
| **Read (single)** | `getNode(nodeId)` | Charge un nœud par ID |
| **Read (by parent)** | `getNodesByParent(parentId)` | Charge les enfants d'un nœud |
| **Read (by tag)** | `getNodesByTag(tag)` | Charge les nœuds avec un tag |
| **Delete** | `deleteNode(nodeId)` | Supprime un nœud |

---

### CRUD Settings

| Opération | Fonction | Usage |
|-----------|----------|-------|
| **Create/Update** | `saveSetting(key, value)` | Sauvegarde un paramètre |
| **Read (single)** | `loadSetting(key, defaultValue)` | Charge un paramètre |
| **Read (all)** | `loadAllSettings()` | Charge tous les paramètres |

---

### CRUD Attachments

| Opération | Fonction | Usage |
|-----------|----------|-------|
| **Create/Update** | `saveAttachment(id, blob)` | Sauvegarde un fichier |
| **Read** | `loadAttachment(id)` | Charge un fichier |
| **Delete** | `deleteAttachment(id)` | Supprime un fichier |
| **List** | `listAttachments()` | Liste tous les IDs |
| **Stats** | `getTotalAttachmentsSize()` | Taille totale |

---

### Migration

| Fonction | Usage |
|----------|-------|
| `migrateFromLocalStorage()` | Migre données localStorage → IndexedDB |
| `isMigrated()` | Vérifie si migration données effectuée |
| `clearLocalStorageBackup()` | Supprime backup localStorage |
| `migrateAttachmentsDB()` | Migre ancienne DB attachments |
| `areAttachmentsMigrated()` | Vérifie si migration attachments effectuée |
| `completeMigration()` | Migration complète (données + attachments) |

---

### Utilitaires

| Fonction | Usage |
|----------|-------|
| `getStats()` | Statistiques de la DB |
| `clearAllData()` | ⚠️ Supprime toutes les données |
| `getDB()` | Instance Dexie |

---

## Exemples d'Usage Complets

### Exemple 1 : Créer et sauvegarder un nœud

```javascript
import * as Storage from './core/storage.js';
import { generateId } from './utils/helpers.js';

// Créer un nouveau nœud
const newNode = {
  id: `node_${Date.now()}_${generateId()}`,
  type: 'node',
  title: 'My New Note',
  content: '# Hello World\n\nThis is my first note.',
  parent: null,
  children: [],
  tags: ['important', 'work'],
  attachments: [],
  created: Date.now(),
  modified: Date.now()
};

// Sauvegarder
await Storage.saveNode(newNode);

// Ajouter aux rootNodes
const rootNodes = await Storage.loadSetting('rootNodes', []);
rootNodes.push(newNode.id);
await Storage.saveSetting('rootNodes', rootNodes);

console.log('✅ Node created and saved');
```

---

### Exemple 2 : Rechercher et modifier des nœuds par tag

```javascript
import * as Storage from './core/storage.js';

// Rechercher tous les nœuds "urgent"
const urgentNodes = await Storage.getNodesByTag('urgent');

console.log(`Found ${urgentNodes.length} urgent nodes`);

// Ajouter un nouveau tag à tous
for (const node of urgentNodes) {
  if (!node.tags.includes('priority')) {
    node.tags.push('priority');
    node.modified = Date.now();
    await Storage.saveNode(node);
  }
}

console.log('✅ All urgent nodes tagged with "priority"');
```

---

### Exemple 3 : Upload et affichage d'un fichier

```javascript
import * as Storage from './core/storage.js';
import { generateId } from './utils/helpers.js';

// Upload depuis input
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

// Générer ID
const attachmentId = `attach_${Date.now()}_${generateId()}`;

// Sauvegarder blob
await Storage.saveAttachment(attachmentId, file);

// Créer metadata pour le nœud
const attachmentMeta = {
  id: attachmentId,
  name: file.name,
  type: file.type,
  size: file.size,
  created: Date.now(),
  modified: Date.now()
};

// Ajouter au nœud courant
const node = await Storage.getNode('node_current_id');
node.attachments.push(attachmentMeta);
node.modified = Date.now();
await Storage.saveNode(node);

console.log(`✅ File uploaded: ${file.name}`);

// Afficher dans l'UI
const blob = await Storage.loadAttachment(attachmentId);
const url = URL.createObjectURL(blob);
document.getElementById('preview').src = url;
```

---

### Exemple 4 : Export des données pour backup

```javascript
import * as Storage from './core/storage.js';

async function exportBackup() {
  // Charger toutes les données
  const nodes = await Storage.loadNodes();
  const settings = await Storage.loadAllSettings();
  const attachmentIds = await Storage.listAttachments();

  // Créer structure d'export
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    nodes,
    settings,
    attachmentIds,
    stats: await Storage.getStats()
  };

  // Convertir en JSON
  const json = JSON.stringify(backup, null, 2);

  // Télécharger
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `deepmemo-backup-${Date.now()}.json`;
  a.click();

  console.log('✅ Backup downloaded');
}

// Exécuter
await exportBackup();
```

---

## Voir Aussi

- [Data Model](../3-DATA-MODEL.md) - Structure complète des données
- [Architecture](../2-ARCHITECTURE.md#storage) - Rôle dans l'architecture globale
- [Migration Guide](../guides/MIGRATION.md) - Guide migration localStorage (à créer)
- [Dexie.js Documentation](https://dexie.org/) - Documentation officielle

---

## Statistiques

### Fichiers Analysés

| Fichier | Lignes | Contenu |
|---------|--------|---------|
| `src/js/core/storage.js` | 408 | API complète IndexedDB (Dexie.js) |
| `src/js/core/migration.js` | 209 | Migration localStorage et attachments |
| `src/js/core/data.js` | Lignes 1-80 | Usage de l'API storage |

**Total** : ~600 lignes de code analysées

**Fonctions documentées** : 24 fonctions

---

**Dernière mise à jour** : 2026-01-30 | **Version** : V0.10.5
