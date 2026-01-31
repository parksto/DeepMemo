# 3. Data Model

> **Version** : V0.10.5
> **Dernière mise à jour** : 2026-01-28
> **Sources vérifiées** : Toutes les structures référencent le code et les schémas JSON

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure Node](#structure-node)
3. [Types de Nodes](#types-de-nodes)
4. [Génération des IDs](#génération-des-ids)
5. [Timestamps](#timestamps)
6. [Relations Hiérarchiques](#relations-hiérarchiques)
7. [Tags](#tags)
8. [Attachments](#attachments)
9. [IndexedDB Schema](#indexeddb-schema)
10. [Formats d'Export](#formats-dexport)
11. [Validation](#validation)
12. [Contraintes et Règles](#contraintes-et-règles)

---

## Vue d'ensemble

Le modèle de données de DeepMemo repose sur **un seul type de base : le Node**.

### Principes Fondamentaux

1. **Unité de base** : Tout est un "node" (note régulière ou symlink)
2. **Hiérarchie** : Relations parent-child via IDs
3. **Types** : `'node'` (regular) ou `'symlink'` (lien)
4. **Storage** : IndexedDB (tables : nodes, settings, attachments)
5. **Format** : JSON (schémas validés)

📍 **Référence** :
- Schema JSON : `schemas/v1.0/deepmemo.json`
- État en mémoire : `src/js/core/data.js:34-37`
- Storage : `src/js/core/storage.js:26-36`

---

### ⚠️ Bugs Connus à Corriger

**Symlinks - Tags et Children** :

Le code actuel contient un bug concernant les symlinks :

1. **Tags** : Les symlinks ont actuellement leur propre array `tags: []`, mais ils **devraient afficher les tags du nœud cible**. Un symlink n'a pas de tags propres, il affiche ceux de sa référence.

2. **Children** : Les symlinks peuvent techniquement avoir des children dans le code actuel, mais ils **ne devraient pas pouvoir en avoir**. Un symlink est uniquement une référence vers un autre nœud avec un titre personnalisable.

**Comportement correct attendu** :
- Un symlink affiche les tags de son `targetId`
- Un symlink ne peut jamais avoir d'enfants (`children: []` toujours vide)

Ce document décrit le comportement **correct** (ce qui devrait être), tout en notant le bug actuel dans le code.

---

## Structure Node

### Schema Complet

Un node est un objet JavaScript avec les propriétés suivantes :

```javascript
{
  // Identification
  id: string,                    // Unique ID (required)
  type: 'node' | 'symlink',      // Node type (required)
  title: string,                 // Title (required, min 1 char)

  // Content
  content: string,               // Markdown content (optional)

  // Hierarchy
  parent: string | null,         // Parent ID or null (required)
  children: string[],            // Array of child IDs (required)

  // Metadata
  tags: string[],                // Tags array (optional)
  attachments: Attachment[],     // Attachments metadata (optional)
  created: number,               // Creation timestamp (required)
  modified: number,              // Last modification timestamp (required)

  // Symlink-specific
  targetId: string               // Target node ID (required if type='symlink')
}
```

📍 **Référence** : `schemas/v1.0/deepmemo.json:80-176` (définition complète avec contraintes)

---

### Propriétés Détaillées

#### id (string, required)

**Format** : `(node|symlink)_<timestamp>_<random>`

**Pattern** : `^(node|symlink)_\d+_[a-z0-9]+$`

**Exemples** :
```javascript
'node_1705000000000_abc123def'
'symlink_1705100000000_xyz789ghi'
```

**Génération** :
```javascript
function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

📍 **Référence** :
- Génération : `src/js/utils/helpers.js:9-11`
- Regex : `schemas/v1.0/deepmemo.json:87-88`

#### type (string, required)

**Values** : `'node'` | `'symlink'`

**Description** :
- `'node'` : Nœud régulier (container avec contenu)
- `'symlink'` : Lien symbolique vers un autre nœud

**Contrainte** : Si `type='symlink'`, `targetId` est **required**

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:99-102`
- Validation : `schemas/v1.0/deepmemo.json:153-174`

#### title (string, required)

**Contrainte** : `minLength: 1`

**Description** : Nom/titre du nœud, peut contenir emojis

**Exemples** :
```javascript
'My Project'
'🔥 Important Task'
'📚 Reading List'
```

**Extraction emoji** :

Le module `tree.js` extrait automatiquement l'emoji du début du titre pour affichage séparé :

```javascript
'🔥 My Title' → { emoji: '🔥', title: 'My Title' }
```

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:90-93`
- Extraction : `src/js/features/tree.js:24-71` (extractEmojiFromTitle)

#### content (string, optional)

**Description** : Contenu markdown du nœud

**Default** : `''` (empty string)

**Format** : Markdown avec support :
- Headers (`#`, `##`, etc.)
- Lists (`-`, `*`, `1.`)
- Links (`[text](url)`)
- Images (`![alt](url)` ou `![alt](attachment:id)`)
- Code blocks (` ``` `)
- etc.

**Parsing** : Marked.js pour conversion Markdown → HTML

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:95-98`
- Rendering : `src/js/features/editor.js:402-451` (renderMarkdownWithAttachments)

#### parent (string | null, required)

**Description** : ID du nœud parent, ou `null` pour root nodes

**Pattern** : `^(node|symlink)_\d+_[a-z0-9]+$` (si non-null)

**Exemples** :
```javascript
null                           // Root node
'node_1705000000000_abc123'    // Child of this node
```

**Contrainte** : Les root nodes ont `parent: null` ET sont listés dans `data.rootNodes[]`

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:104-112`
- État : `src/js/core/data.js:34-37`

#### children (string[], required)

**Description** : Array des IDs des nœuds enfants

**Default** : `[]` (empty array)

**Pattern items** : `^(node|symlink)_\d+_[a-z0-9]+$`

**Ordre** : L'ordre dans le array définit l'ordre d'affichage

**Exemples** :
```javascript
[]                                           // No children
['node_123', 'symlink_456']                  // 2 children
['node_123', 'node_456', 'node_789']         // 3 children
```

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:114-121`
- Rendering : `src/js/features/tree.js` (ordre d'affichage respecté)

#### tags (string[], optional)

**Description** : Array de tags (mots-clés)

**Default** : `[]` (si omis)

**Contraintes** :
- Items : `minLength: 1`
- Sensible à la casse (mais recherche case-insensitive)

**Exemples** :
```javascript
[]                              // No tags
['work', 'urgent']              // 2 tags
['project', 'javascript', 'v2'] // 3 tags
```

**Autocomplete** : Suggestions basées sur tags existants

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:122-129`
- Autocomplete : `src/js/features/tags.js:78-118`
- Search : `src/js/features/search.js` (match par tags)

#### attachments (Attachment[], optional)

**Description** : Array de metadata des pièces jointes

**Default** : `[]` (si omis)

**Structure Attachment** :
```javascript
{
  id: string,        // attach_<timestamp>_<random>
  name: string,      // Filename with extension
  type: string,      // MIME type
  size: number       // Size in bytes
}
```

**Stockage** : Metadata dans node, blob dans IndexedDB table `attachments`

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:130-136, 177-204`
- Storage : `src/js/core/attachments.js`
- Inline images : `src/js/features/editor.js:402-451`

#### created (number, required)

**Description** : Timestamp de création (Unix milliseconds)

**Type** : `integer`, `minimum: 0`

**Génération** : `Date.now()` à la création

**Exemples** :
```javascript
1705000000000   // 2024-01-11T16:53:20.000Z
1705100000000   // 2024-01-12T20:40:00.000Z
```

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:137-141`
- Génération : Tous les `addNode()` utilisent `Date.now()`

#### modified (number, required)

**Description** : Timestamp dernière modification (Unix milliseconds)

**Type** : `integer`, `minimum: 0`

**Update** : Automatique à chaque modification de title/content/tags

**Exemples** :
```javascript
1705000000000   // Initial = created
1705200000000   // Updated later
```

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:142-146`
- Update : `src/js/core/data.js:updateNode()` (met à jour modified)

#### targetId (string, required for symlinks)

**Description** : ID du nœud cible (pour symlinks seulement)

**Pattern** : `^(node|symlink)_\d+_[a-z0-9]+$`

**Contrainte** : **Required** si `type='symlink'`, **forbidden** si `type='node'`

**Résolution** :
- Le contenu affiché est celui du target
- Le title est indépendant (renameable)

**Exemples** :
```javascript
// Symlink
{
  id: 'symlink_123',
  type: 'symlink',
  title: 'Link to Project A',      // Custom title
  targetId: 'node_456',             // Points to this node
  content: '',                      // Ignored (uses target's)
  ...
}

// Target
{
  id: 'node_456',
  type: 'node',
  title: 'Project A',
  content: 'Actual content here',
  ...
}
```

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:147-161`
- Résolution : `src/js/features/editor.js` (affiche contenu du target)

---

## Types de Nodes

### Regular Node

**Caractéristiques** :
- `type: 'node'`
- Peut avoir du contenu (markdown)
- Peut avoir des enfants (children)
- Peut avoir des tags
- Peut avoir des attachments
- **Ne peut PAS avoir** de `targetId`

**Création** :
```javascript
const newNode = {
  id: generateId(),
  type: 'node',
  title: 'My Note',
  content: '',
  parent: parentId || null,
  children: [],
  tags: [],
  attachments: [],
  created: Date.now(),
  modified: Date.now()
};
```

📍 **Référence** : Multiples endroits dans `src/js/core/data.js` créent des nodes réguliers

### Symlink

**Caractéristiques** :
- `type: 'symlink'`
- **Doit avoir** un `targetId`
- `title` indépendant (renameable)
- `content` ignoré (affiche celui du target)
- `children` **TOUJOURS vide** (ne peut pas avoir d'enfants)
- `tags` **ceux du target** (affiche les tags du nœud cible)
- `attachments` ceux du target (pas de stockage propre)

> ⚠️ **Bug connu** : Le code actuel permet aux symlinks d'avoir leurs propres tags (`tags: []` indépendants). Ce comportement est incorrect et sera corrigé. Les tags affichés doivent être ceux du nœud cible.

**Création** :
```javascript
const symlink = {
  id: generateId().replace('node_', 'symlink_'),
  type: 'symlink',
  title: originalNode.title,  // Initial = target title
  targetId: originalNode.id,
  parent: newParentId,
  children: [],                // Always empty (cannot have children)
  tags: [],                    // ⚠️ Bug: should display target's tags
  attachments: [],             // No own attachments
  created: Date.now(),
  modified: Date.now()
};
```

📍 **Référence** : `src/js/core/data.js:142-151` (migration symlinks)

### Différences Clés

| Propriété | Regular Node | Symlink |
|-----------|--------------|---------|
| `type` | `'node'` | `'symlink'` |
| `targetId` | ❌ Forbidden | ✅ Required |
| `content` | Own content | Target's content |
| `title` | Own title | Independent title |
| `tags` | Own tags | **Target's tags** ⚠️ |
| `attachments` | Own attachments | Target's attachments |
| `children` | Can have many | **Cannot have children** |

⚠️ = Bug à corriger dans le code

---

## Génération des IDs

### Format Standard

**Pattern** : `<prefix>_<timestamp>_<random>`

**Composants** :
1. **Prefix** : `'node'` ou `'symlink'`
2. **Timestamp** : `Date.now()` (13 digits)
3. **Random** : Base36 random string (9 chars)

### Fonction generateId()

```javascript
export function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

📍 **Référence** : `src/js/utils/helpers.js:9-11`

**Génère** : `'node_1705000000000_abc123def'`

### Conversion Node → Symlink

Pour créer un symlink, le préfixe est changé :

```javascript
const symlinkId = generateId().replace('node_', 'symlink_');
// → 'symlink_1705000000000_abc123def'
```

📍 **Référence** : Utilisé dans plusieurs endroits de `data.js` et `modals.js`

### Attachments IDs

**Pattern** : `attach_<timestamp>_<random>`

**Génération** : Similaire mais avec préfixe `'attach_'`

📍 **Référence** :
- Schema : `schemas/v1.0/deepmemo.json:182-185`
- Génération : `src/js/core/attachments.js` (uploadAttachment)

### Unicité

**Garantie** :
- Timestamp (milliseconds) + Random → Collision quasi-impossible
- Aucun check de duplicates (assumé unique)

**Collision théorique** :
- Si 2 nodes créés exactement à la même milliseconde
- ET même valeur random (9 chars base36 = 36^9 = 1.01 × 10^14 possibilités)
- Probabilité : ~0%

---

## Timestamps

### Format

**Type** : Unix timestamp en **milliseconds**

**Range** : `integer`, `minimum: 0`

**JavaScript** : `Date.now()` retourne directement ce format

### created

**Quand** : À la création du node (jamais modifié ensuite)

**Usage** :
- Tri chronologique
- Affichage "created at"
- IndexedDB index pour queries

### modified

**Quand** : Mis à jour à chaque modification de :
- title
- content
- tags
- attachments

**Pas mis à jour** si :
- Changement de parent (move)
- Changement children order (reorder)
- Expansion/collapse (UI state)

### Affichage

**Format** : Converti en date lisible via JavaScript `Date`

**Exemple** :
```javascript
const created = 1705000000000;
new Date(created).toLocaleDateString('fr-FR');
// → "11/01/2024"

new Date(created).toLocaleString('fr-FR');
// → "11/01/2024 à 17:53:20"
```

📍 **Référence** : `src/js/features/editor.js` (renderRightPanel affiche created/modified)

---

## Relations Hiérarchiques

### Parent-Child

**Bidirectionnelle** : Chaque node stocke :
- `parent` : ID du parent (ou null)
- `children` : Array des IDs enfants

**Contrainte de cohérence** :
```
Si A.children contient B.id
→ Alors B.parent doit être A.id
```

**Vérification** : Pas de validation automatique, assumée cohérente

### Root Nodes

**Définition** : Nodes avec `parent: null`

**Liste** : `data.rootNodes` (array séparé)

**Structure** :
```javascript
{
  nodes: {
    'node_123': { id: 'node_123', parent: null, ... },
    'node_456': { id: 'node_456', parent: null, ... }
  },
  rootNodes: ['node_123', 'node_456']  // Order matters
}
```

📍 **Référence** :
- État : `src/js/core/data.js:34-37`
- Schema : `schemas/v1.0/deepmemo.json:26-33`

### Instance Keys

**Format** : `nodeId@parent@grandparent@root`

**Utilité** :
- Afficher le même node plusieurs fois dans l'arbre
- Tracking path pour breadcrumb
- Expansion/collapse state

**Exemple** :
```
node_123@node_root
  → node_456@node_123@node_root
    → symlink_789@node_456@node_123@node_root (pointe vers node_123)
      → node_123@symlink_789@node_456@node_123@node_root (affichage récursif)
```

📍 **Référence** :
- Génération : `src/js/features/tree.js:79-94` (buildInstanceKey)
- Concept : `docs/1-CONCEPTS.md` (section Instance Keys)

### Cycle Detection

**Fonction** : `wouldCreateCycle(nodeId, newParentId)`

**Algorithme** :
1. Remonte la chaîne des parents depuis `newParentId`
2. Si on rencontre `nodeId` → Cycle détecté
3. Si on arrive à root (parent: null) → Pas de cycle

**Cas symlinks** :
- Si parent est symlink → Suit le target
- Continue remontée jusqu'à root ou cycle

📍 **Référence** :
- Implémentation : `src/js/core/data.js:280-323`
- Documentation : `docs/2-ARCHITECTURE.md` (section Détection de cycles)

---

## Tags

### Structure

**Type** : `string[]` (array de strings)

**Contraintes** :
- Items : `minLength: 1`
- Pas de duplicates (géré par UI)
- Case-sensitive storage, case-insensitive search

**Exemples** :
```javascript
tags: []                              // No tags
tags: ['work']                        // Single tag
tags: ['work', 'urgent', 'project']  // Multiple tags
```

### Storage

**Où** : Dans chaque node individuellement

**IndexedDB** : Index multi-entry `*tags` pour recherche rapide

```javascript
db.version(1).stores({
  nodes: 'id, parent, *tags, created, modified'
  //                   ^ Multi-entry index
});
```

📍 **Référence** : `src/js/core/storage.js:26-36`

### Autocomplete

**Source** : Tous les tags existants dans `data.nodes`

**Algorithme** :
1. Collecte tous les tags de tous les nodes
2. Déduplique (Set)
3. Filtre par préfixe (case-insensitive)
4. Limite à 10 suggestions

📍 **Référence** : `src/js/features/tags.js:78-118` (showTagSuggestions)

### Scope

**Branch Mode** : Tags visibles seulement dans la branche actuelle

**Global** : Sinon, tous les tags de tous les nodes

---

## Attachments

### Structure Metadata

**Stockage** : Metadata dans node, blob dans IndexedDB

**Format** :
```javascript
{
  id: 'attach_1705000000000_abc123',
  name: 'image.png',
  type: 'image/png',
  size: 12345
}
```

📍 **Référence** : `schemas/v1.0/deepmemo.json:177-204` (définition Attachment)

### ID Generation

**Format** : `attach_<timestamp>_<random>`

**Pattern** : `^attach_\d+_[a-z0-9]+$`

**Exemple** : `'attach_1705000000000_xyz789'`

### MIME Types

**Type** : `string`, `minLength: 1`

**Exemples** :
```javascript
'image/png'
'image/jpeg'
'application/pdf'
'text/plain'
'video/mp4'
```

**Usage** : Déterminer affichage (inline image vs download link)

### Size

**Type** : `integer`, `minimum: 0`

**Unit** : Bytes

**Limite** : 50MB par fichier (hardcoded)

```javascript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

📍 **Référence** : `src/js/app.js:1402` (vérification dans uploadAttachment)

### Storage

**IndexedDB Table** : `attachments`

**Schema** :
```javascript
db.version(1).stores({
  attachments: 'id'  // Key-value: { id: Blob }
});
```

**Save** :
```javascript
await Storage.saveAttachment(attachmentId, blob);
```

**Retrieve** :
```javascript
const blob = await Storage.getAttachment(attachmentId);
const blobUrl = URL.createObjectURL(blob);
```

📍 **Référence** :
- Schema : `src/js/core/storage.js:26-36`
- API : `src/js/core/storage.js:155-193`

### Inline Images

**Syntax** : `![alt](attachment:attach_id)`

**Rendering** :
1. Parse markdown avec Marked.js
2. Détecte `attachment:*` URLs
3. Génère blob URLs depuis IndexedDB
4. Remplace dans HTML final

**Exemple** :
```markdown
![My Image](attachment:attach_1705000000000_abc123)
```

→ Converti en :
```html
<img src="blob:http://localhost:8000/abc-def-ghi" alt="My Image">
```

📍 **Référence** : `src/js/features/editor.js:402-451` (renderMarkdownWithAttachments)

### Cleanup

**Orphans** : Attachments sans node propriétaire

**Détection** :
1. Liste tous les attachment IDs dans IndexedDB
2. Liste tous les attachment IDs référencés dans nodes
3. Diff → orphans
4. Delete orphans

📍 **Référence** : `src/js/core/attachments.js:159-209` (cleanOrphanedAttachments)

---

## IndexedDB Schema

### Database

**Name** : `'deepmemo'`

**Version** : `1` (V0.10)

### Tables

#### nodes

**Definition** :
```javascript
nodes: 'id, parent, *tags, created, modified'
```

**Indexes** :
- `id` : Primary key (unique)
- `parent` : Single-entry index (queries "all children of X")
- `*tags` : **Multi-entry index** (un node peut avoir plusieurs tags)
- `created` : Single-entry index (tri chronologique)
- `modified` : Single-entry index (tri par modification)

**Data** : Tous les nodes (regular + symlinks)

📍 **Référence** : `src/js/core/storage.js:26-36`

#### settings

**Definition** :
```javascript
settings: 'key'
```

**Structure** : Key-value pairs

**Keys utilisées** :
- `'rootNodes'` : Array des IDs root nodes
- `'pdfRateLimit'` : Timestamp dernier export PDF
- `'migrationCompleted'` : Boolean (true si migré depuis localStorage)

**Storage** :
```javascript
await Storage.saveSetting('rootNodes', data.rootNodes);
const rootNodes = await Storage.loadSetting('rootNodes');
```

📍 **Référence** :
- Schema : `src/js/core/storage.js:31`
- API : `src/js/core/storage.js:123-153`

#### attachments

**Definition** :
```javascript
attachments: 'id'
```

**Structure** : Key = attachment ID, Value = Blob

**Storage** :
```javascript
await Storage.saveAttachment('attach_123', blobObject);
const blob = await Storage.getAttachment('attach_123');
```

📍 **Référence** :
- Schema : `src/js/core/storage.js:35`
- API : `src/js/core/storage.js:155-193`

### Quotas

**Capacité** : 500MB - 1GB (dépend navigateur)

**Estimation** :
```javascript
const estimate = await Storage.getStorageEstimate();
// Returns: { usage: 12345678, quota: 1000000000 }
```

📍 **Référence** : `src/js/core/storage.js:224-242` (getStorageEstimate)

---

## Formats d'Export

### JSON Simple

**Usage** : Export rapide pour debug ou LLM

**Structure** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123": { /* node object */ },
    "node_456": { /* node object */ }
  },
  "rootNodes": ["node_123", "node_456"]
}
```

**Limite** : Pas d'attachments (metadata seulement, pas de blobs)

📍 **Référence** :
- Export : `src/js/core/data.js:182-195` (exportData)
- Schema : `schemas/v1.0/deepmemo.json:11-36` (globalExport)

### JSON Branch

**Usage** : Export d'une branche (sous-arbre)

**Structure** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123",
  "exported": 1705000000000,
  "nodeCount": 42,
  "nodes": {
    "node_123": { /* root node */ },
    "node_456": { /* child node */ }
  }
}
```

**Contrainte** : Doit inclure `branchRootId` et `nodeCount`

📍 **Référence** :
- Export : `src/js/core/data.js:263-292` (exportBranch)
- Schema : `schemas/v1.0/deepmemo.json:37-79` (branchExport)

### .dm Archive (ZIP)

**Usage** : Export complet avec attachments

**Structure** :
```
deepmemo-export.dm (ZIP file)
├── metadata.json          # Metadata (version, type, timestamps, stats)
├── data.json              # Nodes data
└── attachments/           # Folder
    ├── attach_123.png
    ├── attach_456.pdf
    └── ...
```

#### metadata.json

**Schema** : `schemas/v1.0/metadata.json`

**Structure** :
```json
{
  "version": "1.0",
  "type": "global",
  "exported": 1705000000000,
  "nodeCount": 42,
  "attachmentCount": 5,
  "totalSize": 12345678,
  "generator": "DeepMemo v0.10.5"
}
```

📍 **Référence** : `schemas/v1.0/metadata.json:1-67`

#### data.json

**Identique** au JSON simple ou branch (selon type export)

#### attachments/

**Fichiers** : Blobs extraits de IndexedDB, nommés par ID

**Exemple** :
```
attachments/attach_1705000000000_abc123.png
attachments/attach_1705000000000_xyz789.pdf
```

### Import

**Auto-détection** : Extension `.dm`, `.zip`, ou `.json`

**Processus** :
1. Détecte format (ZIP ou JSON)
2. Si ZIP → Extrait metadata.json, data.json, attachments/
3. Parse data
4. Régénère IDs (optional)
5. Merge ou Replace (choix utilisateur)
6. Sauvegarde dans IndexedDB

📍 **Référence** : `src/js/core/data.js:690-880` (importFromFile)

---

## Validation

### JSON Schema

**Version** : JSON Schema Draft 2020-12

**Schemas** :
- `schemas/v1.0/deepmemo.json` - Structure complète
- `schemas/v1.0/metadata.json` - Metadata .dm

**Validation** : Pas de validation automatique côté client (à implémenter?)

### Pattern Validation

**IDs** :
- Nodes : `^(node|symlink)_\d+_[a-z0-9]+$`
- Attachments : `^attach_\d+_[a-z0-9]+$`

**Version** : `^\d+\.\d+$` (exemple : "1.0")

### Type Constraints

**Symlinks** :
```json
{
  "if": { "properties": { "type": { "const": "symlink" } } },
  "then": { "required": ["targetId"] }
}
```

**Regular Nodes** :
```json
{
  "if": { "properties": { "type": { "const": "node" } } },
  "then": { "not": { "required": ["targetId"] } }
}
```

📍 **Référence** : `schemas/v1.0/deepmemo.json:153-174` (conditional validation)

---

## Contraintes et Règles

### Business Rules

#### 1. Cycle Detection

**Rule** : Un node ne peut pas être son propre ancêtre

**Validation** : Avant move ou link, appel à `wouldCreateCycle()`

**Exemple forbidden** :
```
A
└── B
    └── C

Move A sous C → FORBIDDEN (créerait cycle A → B → C → A)
```

📍 **Référence** : `src/js/core/data.js:280-323`

#### 2. Unique IDs

**Rule** : Chaque node/attachment doit avoir un ID unique

**Garantie** : Timestamp + Random (collision quasi-impossible)

**Pas de check** : Assumé unique, pas de validation

#### 3. Root Nodes Consistency

**Rule** : Si `node.parent === null` → node doit être dans `rootNodes[]`

**Maintenance** : Automatique lors de création/suppression

#### 4. Parent-Child Consistency

**Rule** : Si `A.children` contient `B.id` → `B.parent === A.id`

**Maintenance** : Automatique lors de move/link/delete

#### 5. Attachment Size

**Rule** : Max 50MB par fichier

**Validation** : Avant upload

```javascript
if (file.size > 50 * 1024 * 1024) {
  alert('File too large (max 50MB)');
  return;
}
```

📍 **Référence** : `src/js/app.js:1402`

#### 6. Symlink Target Existence

**Rule** : Un symlink doit pointer vers un node existant

**Validation** : Pas de check automatique

**Comportement** : Si target supprimé → symlink devient orphelin (affichage "Target not found")

#### 7. Branch Export External Symlinks

**Rule** : Les symlinks vers nodes hors de la branche sont marqués "external"

**Comportement** : Pas de descendants affichés pour external symlinks

📍 **Référence** : `src/js/features/editor.js` (isNodeInBranch check)

### Migrations

#### localStorage → IndexedDB

**Trigger** : Automatique au premier lancement V0.10

**Processus** :
1. Détecte `deepmemo_nodes` dans localStorage
2. Parse JSON
3. Migre vers IndexedDB
4. Marque `migrationCompleted: true`
5. Conserve localStorage (backup)

📍 **Référence** : `src/js/core/migration.js:22-82`

#### Old Symlinks Format

**Trigger** : Automatique si `node.symlinkedIn[]` détecté

**Processus** :
1. Convertit `symlinkedIn[]` en vrais nodes symlink
2. Delete `symlinkedIn` property
3. Sauvegarde

📍 **Référence** : `src/js/core/data.js:126-177` (migrateSymlinks)

---

## Exemples Complets

### Node Regular

```json
{
  "id": "node_1705000000000_abc123def",
  "type": "node",
  "title": "🚀 My Project",
  "content": "# Project Description\n\nThis is a markdown note.\n\n![Screenshot](attachment:attach_1705000000001_xyz789)",
  "parent": null,
  "children": [
    "node_1705000000002_child001",
    "symlink_1705000000003_link001"
  ],
  "tags": ["work", "important", "v2"],
  "attachments": [
    {
      "id": "attach_1705000000001_xyz789",
      "name": "screenshot.png",
      "type": "image/png",
      "size": 245678
    }
  ],
  "created": 1705000000000,
  "modified": 1705100000000
}
```

### Symlink

```json
{
  "id": "symlink_1705000000003_link001",
  "type": "symlink",
  "title": "Link to Project A",
  "targetId": "node_1705000000000_abc123def",
  "parent": "node_1705000000004_parent",
  "children": [],
  "tags": [],
  "created": 1705000000003,
  "modified": 1705000000003
}
```

### Export Global (.dm archive)

**metadata.json** :
```json
{
  "version": "1.0",
  "type": "global",
  "exported": 1705200000000,
  "nodeCount": 42,
  "attachmentCount": 5,
  "totalSize": 1234567,
  "generator": "DeepMemo v0.10.5"
}
```

**data.json** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_1705000000000_abc123def": { /* node 1 */ },
    "node_1705000000001_def456ghi": { /* node 2 */ }
  },
  "rootNodes": ["node_1705000000000_abc123def"]
}
```

**attachments/** :
```
attachments/attach_1705000000001_xyz789.png
attachments/attach_1705000000002_abc123.pdf
```

---

## Voir Aussi

- [1-CONCEPTS.md](1-CONCEPTS.md) - Concepts fondamentaux (nodes, hiérarchie, symlinks)
- [2-ARCHITECTURE.md](2-ARCHITECTURE.md) - Architecture technique (storage, modules)
- [4-FEATURES.md](4-FEATURES.md) - Fonctionnalités complètes
- [reference/file-formats/dm-archive.md](reference/file-formats/dm-archive.md) - Format .dm détaillé
- [reference/file-formats/json-interchange.md](reference/file-formats/json-interchange.md) - Format JSON détaillé

---

**Document complet et vérifié** ✅
Toutes les structures référencent le code source et les schémas JSON validés.
