# JSON Interchange Format Reference

> Spécification complète du format JSON d'interchange DeepMemo
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-01-31
>
> 📍 **Sources** : `src/js/core/data.js` (lignes 182-292, 838-898, 1164-1280), `schemas/v1.0/deepmemo.json`

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Types d'Export](#types-dexport)
3. [Export Global](#export-global)
4. [Export de Branche](#export-de-branche)
5. [Structure des Nœuds](#structure-des-nœuds)
6. [Attachments](#attachments)
7. [Import](#import)
8. [Validation](#validation)
9. [Cas d'Usage](#cas-dusage)
10. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe

Le format **JSON Interchange** est un **fichier JSON pur** contenant la structure complète des données DeepMemo sans les fichiers binaires (attachments).

**Caractéristiques** :
- ✅ **Portable** : JSON standard, compatible tous systèmes
- ✅ **Léger** : Pas de fichiers binaires (métadonnées seulement)
- ✅ **Validable** : Schémas JSON formels
- ✅ **Lisible** : Format texte indenté (pretty-print)
- ✅ **Interopérable** : Compatible LLM, outils externes
- ⚠️ **Limitation** : Attachments non inclus (métadonnées uniquement)

📍 **Référence** : `data.js:182-195` (exportData), `data.js:263-292` (exportBranch)

---

### Différences avec le Format .dm

| Aspect | JSON Interchange | Archive .dm |
|--------|------------------|-------------|
| **Format** | Fichier JSON unique | Archive ZIP |
| **Extension** | `.json` | `.dm` |
| **Contenu** | Données + métadonnées | Données + métadonnées + fichiers binaires |
| **Attachments** | Métadonnées seulement | Fichiers complets dans `attachments/` |
| **Taille** | Léger (quelques KB) | Lourd (MB selon attachments) |
| **Usage** | Interchange, LLM, backup simple | Backup complet, migration |
| **Réimport** | ✅ Structure complète | ✅ Structure + fichiers |

📍 **Référence** : Voir [DM-FORMAT.md](DM-FORMAT.md) pour le format archive complet

---

## Types d'Export

### Export Global

**Description** : Export complet de toutes les données

**Fichier généré** :
```
deepmemo-export-{timestamp}.json
```

**Exemple** :
```
deepmemo-export-1706123456789.json
```

**Contenu** :
- Tous les nœuds (dictionary `nodes`)
- Tous les nœuds racines (array `rootNodes`)
- Métadonnées des attachments (pas les fichiers)

📍 **Référence** : `data.js:182-195`

---

### Export de Branche

**Description** : Export d'un sous-arbre (nœud + tous ses descendants)

**Fichier généré** :
```
deepmemo-branch-{titre_sanitisé}-{timestamp}.json
```

**Exemple** :
```
Titre original : "🚀 Mon Projet 2024"
Fichier : deepmemo-branch-Mon-Projet-2024-1706123456789.json
```

**Contenu** :
- Nœuds de la branche uniquement (dictionary `nodes`)
- Métadonnées de branche (`type`, `branchRootId`, etc.)
- Métadonnées des attachments de la branche

📍 **Référence** : `data.js:263-292`

---

## Export Global

### Structure JSON

**Schéma** : `schemas/v1.0/deepmemo.json` (variante "globalExport")

**Propriétés obligatoires** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `nodes` | object | Dictionnaire de nœuds (clé = nodeId, valeur = node object) |
| `rootNodes` | array[string] | IDs des nœuds racines (ordre préservé) |

**Propriété optionnelle** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `$schema` | string | URL du schéma JSON (toujours présent dans les exports DeepMemo) |

---

### Exemple Minimal

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_1706123456789_abc123": {
      "id": "node_1706123456789_abc123",
      "type": "node",
      "title": "Ma Note",
      "content": "Contenu markdown...",
      "parent": null,
      "children": [],
      "tags": [],
      "created": 1706000000000,
      "modified": 1706100000000
    }
  },
  "rootNodes": ["node_1706123456789_abc123"]
}
```

---

### Exemple Complet

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_1706123456789_abc123": {
      "id": "node_1706123456789_abc123",
      "type": "node",
      "title": "🚀 Projet Principal",
      "content": "# Vue d'ensemble\n\nDescription du projet...",
      "parent": null,
      "children": [
        "node_1706123456790_def456",
        "symlink_1706123456791_ghi789"
      ],
      "tags": ["projet", "urgent"],
      "attachments": [
        {
          "id": "attach_1706123456792_xyz123",
          "name": "diagram.png",
          "type": "image/png",
          "size": 102400
        }
      ],
      "created": 1706000000000,
      "modified": 1706100000000
    },
    "node_1706123456790_def456": {
      "id": "node_1706123456790_def456",
      "type": "node",
      "title": "Tâche 1",
      "content": "Description de la tâche...",
      "parent": "node_1706123456789_abc123",
      "children": [],
      "tags": ["todo"],
      "created": 1706010000000,
      "modified": 1706010000000
    },
    "symlink_1706123456791_ghi789": {
      "id": "symlink_1706123456791_ghi789",
      "type": "symlink",
      "title": "→ Référence vers Tâche 1",
      "targetId": "node_1706123456790_def456",
      "parent": "node_1706123456789_abc123",
      "children": [],
      "created": 1706020000000,
      "modified": 1706020000000
    }
  },
  "rootNodes": ["node_1706123456789_abc123"]
}
```

📍 **Référence** : `data.js:183-186` (ajout du $schema et spread de data)

---

## Export de Branche

### Structure JSON

**Schéma** : `schemas/v1.0/deepmemo.json` (variante "branchExport")

**Propriétés obligatoires** :

| Propriété | Type | Pattern/Contrainte | Description |
|-----------|------|-------------------|-------------|
| `type` | string | `"deepmemo-branch"` | Identifiant de type |
| `version` | string | `^\d+\.\d+$` | Version du format (ex: `"1.0"`) |
| `branchRootId` | string | `^(node\|symlink)_\d+_[a-z0-9]+$` | ID du nœud racine de la branche |
| `exported` | integer | minimum: 0 | Timestamp Unix export (milliseconds) |
| `nodeCount` | integer | minimum: 1 | Nombre de nœuds dans la branche |
| `nodes` | object | - | Dictionnaire de nœuds |

**Propriétés optionnelles** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `$schema` | string | URL du schéma JSON |
| `_documentation` | string | URL de documentation (ex: `"https://deepmemo.org/docs"`) |

---

### Exemple Minimal

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_1706123456789_abc123",
  "exported": 1706123456789,
  "nodeCount": 3,
  "nodes": {
    "node_1706123456789_abc123": {
      "id": "node_1706123456789_abc123",
      "type": "node",
      "title": "Branche Exportée",
      "content": "",
      "parent": null,
      "children": ["node_1706123456790_def456"],
      "created": 1706000000000,
      "modified": 1706000000000
    },
    "node_1706123456790_def456": {
      "id": "node_1706123456790_def456",
      "type": "node",
      "title": "Enfant",
      "content": "",
      "parent": "node_1706123456789_abc123",
      "children": [],
      "created": 1706010000000,
      "modified": 1706010000000
    }
  }
}
```

---

### Exemple Complet

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "_documentation": "https://raw.githubusercontent.com/parksto/DeepMemo/refs/heads/main/docs/reference/file-formats/json-interchange.md",
  "branchRootId": "node_1706123456789_abc123",
  "exported": 1706200000000,
  "nodeCount": 5,
  "nodes": {
    "node_1706123456789_abc123": {
      "id": "node_1706123456789_abc123",
      "type": "node",
      "title": "📚 Documentation",
      "content": "# Documentation du Projet\n\n...",
      "parent": null,
      "children": [
        "node_1706123456790_def456",
        "node_1706123456791_ghi789"
      ],
      "tags": ["docs", "guide"],
      "attachments": [
        {
          "id": "attach_1706123456792_jkl012",
          "name": "architecture.svg",
          "type": "image/svg+xml",
          "size": 245680
        }
      ],
      "created": 1706000000000,
      "modified": 1706100000000
    },
    "node_1706123456790_def456": {
      "id": "node_1706123456790_def456",
      "type": "node",
      "title": "Installation",
      "content": "## Étapes d'installation\n\n1. ...",
      "parent": "node_1706123456789_abc123",
      "children": [],
      "tags": ["guide"],
      "created": 1706010000000,
      "modified": 1706010000000
    },
    "node_1706123456791_ghi789": {
      "id": "node_1706123456791_ghi789",
      "type": "node",
      "title": "Configuration",
      "content": "## Configuration\n\n...",
      "parent": "node_1706123456789_abc123",
      "children": [],
      "tags": ["guide"],
      "created": 1706020000000,
      "modified": 1706020000000
    }
  }
}
```

📍 **Référence** : `data.js:273-282` (structure branchData)

---

## Structure des Nœuds

### Schéma Node Object

**Défini dans** : `schemas/v1.0/deepmemo.json` (definition "node")

Voir [DM-FORMAT.md - Structure des Nœuds](DM-FORMAT.md#structure-des-nœuds) pour la spécification complète.

---

### Propriétés Obligatoires

| Propriété | Type | Pattern/Contrainte | Description |
|-----------|------|-------------------|-------------|
| `id` | string | `^(node\|symlink)_\d+_[a-z0-9]+$` | Identifiant unique |
| `type` | enum | `"node"` ou `"symlink"` | Type de nœud |
| `title` | string | minLength: 1 | Titre (peut inclure emojis) |
| `parent` | string \| null | - | ID du parent (null pour racines) |
| `children` | array[string] | - | IDs des enfants (ordre préservé) |
| `created` | integer | - | Timestamp Unix création (ms) |
| `modified` | integer | - | Timestamp Unix modification (ms) |

---

### Propriétés Optionnelles

| Propriété | Type | Description |
|-----------|------|-------------|
| `content` | string | Contenu markdown (peut être vide ou absent) |
| `tags` | array[string] | Tags associés |
| `attachments` | array[object] | **Métadonnées seulement** (pas les fichiers) |
| `targetId` | string | **Obligatoire si `type === "symlink"`** - ID du nœud cible |

---

### Exemple Nœud Régulier

```json
{
  "id": "node_1706123456789_abc123",
  "type": "node",
  "title": "🎯 Objectifs du Sprint",
  "content": "## Objectifs\n\n- [ ] Tâche 1\n- [ ] Tâche 2",
  "parent": "node_parent_id",
  "children": ["node_child1_id", "node_child2_id"],
  "tags": ["sprint", "Q1-2024"],
  "attachments": [
    {
      "id": "attach_1706123456789_xyz789",
      "name": "planning.pdf",
      "type": "application/pdf",
      "size": 524288
    }
  ],
  "created": 1706000000000,
  "modified": 1706100000000
}
```

---

### Exemple Symlink

```json
{
  "id": "symlink_1706123456791_ghi789",
  "type": "symlink",
  "title": "→ Lien vers Documentation",
  "targetId": "node_1706123456790_def456",
  "parent": "node_parent_id",
  "children": [],
  "created": 1706050000000,
  "modified": 1706050000000
}
```

**Contraintes importantes** :
- `targetId` doit pointer vers un nœud existant dans `nodes`
- Symlinks n'ont **jamais** de propriété `content` (contenu vient du target)
- Symlinks peuvent avoir leur propre `title` (différent du target)

📍 **Référence** : Voir [DM-FORMAT.md - Exemples de Nœuds](DM-FORMAT.md#exemples-de-nœuds)

---

## Attachments

### Métadonnées Seulement

**Important** : Le format JSON Interchange contient **uniquement les métadonnées** des attachments, pas les fichiers binaires.

**Structure** (dans `node.attachments[]`) :

| Propriété | Type | Pattern | Description |
|-----------|------|---------|-------------|
| `id` | string | `^attach_\d+_[a-z0-9]+$` | Identifiant unique |
| `name` | string | - | Nom original du fichier |
| `type` | string | - | Type MIME (ex: `image/png`) |
| `size` | integer | - | Taille en bytes |

---

### Exemple

```json
{
  "id": "attach_1706123456789_abc123",
  "name": "screenshot.png",
  "type": "image/png",
  "size": 102400
}
```

---

### Comportement à l'Import

**Scénario 1** : Import d'un JSON sans réimport d'archive

- ✅ Les métadonnées d'attachments sont **conservées** dans les nœuds
- ⚠️ Les fichiers binaires ne sont **pas disponibles**
- ❌ Les références markdown `![](attachment:attach_id)` seront **cassées**
- ℹ️ L'utilisateur voit les attachments listés mais ne peut pas les télécharger

**Scénario 2** : Import JSON puis import archive .dm

- ✅ L'import de l'archive `.dm` **restaure** les fichiers binaires
- ✅ Les références markdown redeviennent fonctionnelles
- ✅ Les métadonnées sont synchronisées automatiquement

**Scénario 3** : Nettoyage des orphelins

- 🧹 La fonction `cleanOrphanedReferences()` supprime les métadonnées sans fichier
- ✅ Appel automatique après import
- 📍 **Référence** : `core/attachments.js:132-162`, `data.js:828-831, 890-893, 1146-1149, 1270-1273`

---

### Workflow Recommandé

**Pour un backup complet avec attachments** :
1. ✅ Exporter en format `.dm` (archive ZIP complète)
2. ❌ Ne pas utiliser `.json` seul

**Pour un interchange sans attachments** :
1. ✅ Exporter en format `.json`
2. ℹ️ Les métadonnées sont préservées (pour référence)
3. ⚠️ Informer que les fichiers ne seront pas importés

**Pour génération par LLM** :
1. ✅ Utiliser format `.json` (structure pure)
2. ✅ Les LLM peuvent générer des métadonnées d'attachments
3. ℹ️ Les fichiers doivent être ajoutés manuellement après import

---

## Import

### Import Global

**Fonction** : `importDataZIP()` (supporte auto-détection JSON)

**Comportement** :
- Détecte automatiquement le format (JSON vs ZIP)
- Propose **Replace** ou **Merge**

**Mode Replace** :
- ✅ Remplace toutes les données existantes
- ✅ Conservation des IDs originaux
- ⚠️ Perte des données actuelles (confirmation requise)

**Mode Merge** :
- ✅ Ajoute les nœuds importés comme nouvelles racines
- ✅ Conservation des IDs originaux
- ⚠️ Collision possible si même ID (écrasement)
- ℹ️ Probabilité de collision quasi nulle (timestamp + random)

📍 **Référence** : `data.js:666-703` (importDataZIP), `data.js:838-898` (importFromJSONText)

---

### Import de Branche

**Fonction** : `importBranchZIP()` (supporte auto-détection JSON)

**Comportement** :
- Détecte automatiquement le format (JSON vs ZIP)
- **Régénère TOUS les IDs** (nœuds et attachments)
- Remappe toutes les références internes
- Attache au parent spécifié (ou racine si `null`)

**Processus de remapping** :
1. Génération de nouveaux IDs pour tous les nœuds
2. Génération de nouveaux IDs pour tous les attachments
3. Remapping des références :
   - `parent` et `children[]`
   - `targetId` (symlinks)
   - Références markdown `attachment:attach_id`

**Exemple de transformation** :
```
Avant import :
  node_123_old → attachment:attach_456_old

Après import (avec régénération) :
  node_789_new → attachment:attach_012_new
```

📍 **Référence** : `data.js:913-949` (importBranchZIP), `data.js:1164-1280` (importBranchFromJSONText)

---

### Détection Automatique

**Magic Number** : Premier caractère du fichier

| Format | Magic Number | Détection |
|--------|--------------|-----------|
| **ZIP** | `0x50` (`P`) | Archive .dm ou .zip |
| **JSON** | `0x7B` (`{`) | Fichier JSON |

**Algorithme** :
```javascript
const arrayBuffer = await file.arrayBuffer();
const header = new Uint8Array(arrayBuffer.slice(0, 2));

if (header[0] === 0x50 && header[1] === 0x4B) {
  // Format ZIP → importFromArchive()
} else {
  // Format JSON → importFromJSONText()
  const text = new TextDecoder('utf-8').decode(arrayBuffer);
  const imported = JSON.parse(text);
}
```

📍 **Référence** : `data.js:671-696` (importDataZIP), `data.js:918-942` (importBranchZIP)

---

### Validation à l'Import

**Étape 1** : Validation JSON
```javascript
const imported = JSON.parse(text); // Lève une exception si invalide
```

**Étape 2** : Validation de structure
```javascript
if (!imported.nodes || !imported.rootNodes) {
  alert('Fichier JSON invalide');
  return;
}
```

**Étape 3** : Validation de branche (si applicable)
```javascript
if (imported.type !== 'deepmemo-branch' || !imported.branchRootId) {
  alert('Fichier invalide. Format non reconnu.');
  return;
}
```

📍 **Référence** : `data.js:844-850` (global), `data.js:1171-1217` (branche)

---

## Validation

### Schéma JSON

**URL** : `https://deepmemo.org/schemas/v1.0/deepmemo.json`

**Validation manuelle** :
```bash
# Avec ajv-cli
npm install -g ajv-cli
ajv validate -s https://deepmemo.org/schemas/v1.0/deepmemo.json -d export.json
```

**Validation en ligne** :
- [JSONSchemaValidator.net](https://www.jsonschemavalidator.net/)
- Coller le schéma depuis `schemas/v1.0/deepmemo.json`
- Coller le fichier JSON à valider

---

### Checklist de Validation

#### 1. Structure Racine

**Export Global** :
- ✅ Propriété `nodes` présente (object)
- ✅ Propriété `rootNodes` présente (array)
- ✅ `$schema` présent et correct (optionnel mais recommandé)

**Export Branche** :
- ✅ Propriété `type` = `"deepmemo-branch"`
- ✅ Propriété `version` = `"1.0"`
- ✅ Propriété `branchRootId` présente
- ✅ Propriété `exported` présente (integer)
- ✅ Propriété `nodeCount` présente (integer)
- ✅ Propriété `nodes` présente (object)

---

#### 2. Nœuds

**Pour chaque nœud dans `nodes`** :
- ✅ `id` : Pattern `^(node|symlink)_\d+_[a-z0-9]+$`
- ✅ `type` : Valeur `"node"` ou `"symlink"`
- ✅ `title` : String non vide
- ✅ `parent` : String ou null
- ✅ `children` : Array de strings
- ✅ `created` : Integer (timestamp)
- ✅ `modified` : Integer (timestamp)
- ✅ Si `type === "symlink"` : `targetId` présent

---

#### 3. Références

**Intégrité référentielle** :
- ✅ **Parent** : Tous les `parent` (non-null) existent dans `nodes`
- ✅ **Children** : Tous les IDs dans `children[]` existent dans `nodes`
- ✅ **Symlinks** : Tous les `targetId` existent dans `nodes`
- ✅ **RootNodes** : Tous les IDs dans `rootNodes[]` existent dans `nodes`

**Cohérence parent-enfant** :
- ✅ Si `A.children` contient `B`, alors `B.parent === A.id`
- ✅ Si `B.parent === A`, alors `A.children` contient `B.id`

---

#### 4. Hiérarchie

- ✅ **Pas de cycles** : Vérifier qu'il n'existe pas de chemin `A → B → ... → A`
- ✅ **Racines valides** : Tous les nœuds dans `rootNodes` ont `parent === null`
- ✅ **Orphelins** : Tous les nœuds (sauf racines) ont un parent valide

---

#### 5. IDs et Types

**Cohérence type/ID** :
- ✅ Si `type === "node"`, alors `id` commence par `"node_"`
- ✅ Si `type === "symlink"`, alors `id` commence par `"symlink_"`

**Unicité** :
- ✅ Tous les IDs de nœuds sont uniques dans `nodes`
- ✅ Tous les IDs d'attachments sont uniques (dans tous les nœuds)

---

### Script de Validation Complet

```javascript
/**
 * Valide un fichier JSON DeepMemo
 * @param {Object} data - Données JSON parsées
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateDeepMemoJSON(data) {
  const errors = [];

  // 1. Structure racine
  if (data.type === 'deepmemo-branch') {
    if (!data.version) errors.push('Missing version');
    if (!data.branchRootId) errors.push('Missing branchRootId');
    if (!data.exported) errors.push('Missing exported timestamp');
    if (!data.nodeCount) errors.push('Missing nodeCount');
  } else {
    if (!data.rootNodes || !Array.isArray(data.rootNodes)) {
      errors.push('Missing or invalid rootNodes array');
    }
  }

  if (!data.nodes || typeof data.nodes !== 'object') {
    errors.push('Missing or invalid nodes object');
    return { valid: false, errors };
  }

  // 2. Valider chaque nœud
  const nodeIds = Object.keys(data.nodes);
  for (const nodeId of nodeIds) {
    const node = data.nodes[nodeId];

    // ID format
    if (!/^(node|symlink)_\d+_[a-z0-9]+$/.test(node.id)) {
      errors.push(`Invalid ID format: ${node.id}`);
    }

    // ID cohérence avec type
    if (node.type === 'node' && !node.id.startsWith('node_')) {
      errors.push(`Node type mismatch: ${node.id} should start with 'node_'`);
    }
    if (node.type === 'symlink' && !node.id.startsWith('symlink_')) {
      errors.push(`Symlink type mismatch: ${node.id} should start with 'symlink_'`);
    }

    // Propriétés obligatoires
    if (!node.title) errors.push(`Missing title: ${node.id}`);
    if (!['node', 'symlink'].includes(node.type)) {
      errors.push(`Invalid type: ${node.id} (${node.type})`);
    }
    if (!Array.isArray(node.children)) {
      errors.push(`Invalid children: ${node.id}`);
    }

    // Symlink spécifique
    if (node.type === 'symlink' && !node.targetId) {
      errors.push(`Symlink missing targetId: ${node.id}`);
    }
  }

  // 3. Références
  for (const node of Object.values(data.nodes)) {
    // Parent existe
    if (node.parent && !data.nodes[node.parent]) {
      errors.push(`Parent not found: ${node.id} → ${node.parent}`);
    }

    // Children existent
    for (const childId of node.children) {
      if (!data.nodes[childId]) {
        errors.push(`Child not found: ${node.id} → ${childId}`);
      }
    }

    // TargetId existe (symlinks)
    if (node.type === 'symlink' && node.targetId && !data.nodes[node.targetId]) {
      errors.push(`Symlink target not found: ${node.id} → ${node.targetId}`);
    }
  }

  // 4. RootNodes (export global)
  if (data.rootNodes) {
    for (const rootId of data.rootNodes) {
      if (!data.nodes[rootId]) {
        errors.push(`Root node not found: ${rootId}`);
      } else if (data.nodes[rootId].parent !== null) {
        errors.push(`Root node has parent: ${rootId}`);
      }
    }
  }

  // 5. Cycles (détection basique)
  const visited = new Set();
  const recStack = new Set();

  function hasCycle(nodeId) {
    if (recStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recStack.add(nodeId);

    const node = data.nodes[nodeId];
    if (node && node.children) {
      for (const childId of node.children) {
        if (hasCycle(childId)) return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  for (const nodeId of nodeIds) {
    if (hasCycle(nodeId)) {
      errors.push(`Cycle detected involving: ${nodeId}`);
      break; // Un cycle suffit
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utilisation
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('export.json', 'utf8'));
const result = validateDeepMemoJSON(data);

if (result.valid) {
  console.log('✅ Fichier JSON valide');
} else {
  console.error('❌ Erreurs de validation:');
  result.errors.forEach(err => console.error(`  - ${err}`));
}
```

---

## Cas d'Usage

### 1. Backup Simple (Sans Attachments)

**Quand** : Backup rapide de la structure uniquement

**Workflow** :
1. Exporter en `.json` (Export → JSON)
2. Sauvegarder le fichier
3. Réimporter si besoin (Replace mode)

**Avantages** :
- ✅ Léger (quelques KB)
- ✅ Rapide à exporter/importer
- ✅ Compatible Git (texte, diffable)

**Limitations** :
- ❌ Pas de fichiers attachés

---

### 2. Migration Entre Instances

**Quand** : Transférer des données d'une instance DeepMemo à une autre

**Workflow** :
1. Instance A : Exporter en `.json`
2. Transférer le fichier (email, cloud, etc.)
3. Instance B : Importer (Merge mode)

**Avantages** :
- ✅ Portable
- ✅ Pas besoin d'archive complète si pas d'attachments

**Limitations** :
- ⚠️ Les attachments ne sont pas transférés (utiliser `.dm` si nécessaire)

---

### 3. Génération par LLM

**Quand** : Générer une structure DeepMemo via un LLM (ChatGPT, Claude, etc.)

**Workflow** :
1. Fournir le schéma JSON au LLM
2. Demander génération de structure (exemple : mindmap, cours, projet)
3. LLM génère un JSON conforme
4. Importer dans DeepMemo (Import Branch)

**Exemple de prompt** :
```
Génère une structure DeepMemo (format JSON) pour un cours de Python.
Utilise le schéma suivant : [coller schemas/v1.0/deepmemo.json]

Structure attendue :
- Nœud racine "Cours Python"
- 5 chapitres enfants
- Chaque chapitre avec 3-4 sous-sections
- Tags appropriés (cours, python, débutant)
```

**Avantages** :
- ✅ Génération rapide de structures complexes
- ✅ Format clair pour les LLM
- ✅ Validation automatique via schéma

**Limitations** :
- ⚠️ Les LLM ne peuvent pas générer de contenu markdown très long (limites de tokens)
- ℹ️ Affiner manuellement après import

---

### 4. Interchange avec Outils Externes

**Quand** : Intégration avec d'autres systèmes (Notion, Obsidian, scripts custom)

**Workflow** :
1. Exporter DeepMemo en `.json`
2. Parser le JSON avec outil externe
3. Transformer les données selon besoin
4. Optionnel : Réimporter le JSON modifié

**Exemples d'outils** :
- Script Python pour convertir en CSV
- Script Node.js pour générer un site statique
- Outil de conversion Notion ↔ DeepMemo

**Avantages** :
- ✅ Format standard (JSON)
- ✅ Facile à parser et transformer
- ✅ Schéma documenté

---

### 5. Versionning Git

**Quand** : Versionner la structure DeepMemo dans Git

**Workflow** :
1. Exporter régulièrement en `.json`
2. Commiter le fichier dans Git
3. Suivre l'évolution avec `git diff`
4. Restaurer versions antérieures si besoin

**Avantages** :
- ✅ Format texte (diffable)
- ✅ Historique complet
- ✅ Collaboration possible (merge de branches Git)

**Limitations** :
- ⚠️ Fichiers binaires (attachments) non versionnés
- ℹ️ Conflits possibles si plusieurs personnes modifient

---

### 6. Import Graceful (Obsidian, Notion)

**Quand** : Importer des notes depuis d'autres systèmes

**Workflow** :
1. Exporter depuis Obsidian/Notion en Markdown
2. Script de conversion → JSON DeepMemo
3. Importer dans DeepMemo

**Exemple de conversion** :
```javascript
// Convertir une hiérarchie de fichiers Markdown en JSON DeepMemo
function obsidianToDeepMemo(files) {
  const nodes = {};
  const rootNodes = [];

  files.forEach(file => {
    const nodeId = generateId();
    const node = {
      id: nodeId,
      type: 'node',
      title: file.title,
      content: file.content,
      parent: file.parent ? findNodeId(file.parent) : null,
      children: [],
      tags: file.tags || [],
      created: Date.now(),
      modified: Date.now()
    };

    nodes[nodeId] = node;
    if (!file.parent) rootNodes.push(nodeId);
  });

  return {
    $schema: 'https://deepmemo.org/schemas/v1.0/deepmemo.json',
    nodes,
    rootNodes
  };
}
```

**Avantages** :
- ✅ Migration facilitée
- ✅ Conservation de la structure hiérarchique
- ✅ Tags préservés

---

## Référence Rapide

### Fichiers Source

| Aspect | Fichier | Lignes |
|--------|---------|--------|
| **Export global JSON** | `src/js/core/data.js` | 182-195 |
| **Export branche JSON** | `src/js/core/data.js` | 263-292 |
| **Import auto-détection** | `src/js/core/data.js` | 666-703 |
| **Import JSON text (global)** | `src/js/core/data.js` | 838-898 |
| **Import JSON text (branche)** | `src/js/core/data.js` | 1164-1280 |
| **Validation structure** | `src/js/core/data.js` | 844-850, 1214-1217 |
| **Nettoyage orphelins** | `src/js/core/attachments.js` | 132-162 |

---

### Schéma JSON

| Fichier | Chemin |
|---------|--------|
| **Schéma complet** | `schemas/v1.0/deepmemo.json` |

**URL publique** :
- `https://deepmemo.org/schemas/v1.0/deepmemo.json`

---

### Patterns d'IDs

| Type | Pattern | Exemple |
|------|---------|---------|
| **Node** | `node_{timestamp}_{random}` | `node_1706123456789_abc123def` |
| **Symlink** | `symlink_{timestamp}_{random}` | `symlink_1706123456789_ghi789jkl` |
| **Attachment** | `attach_{timestamp}_{random}` | `attach_1706123456789_mno345pqr` |

**Composants** :
- `timestamp` : 13 digits (Unix milliseconds, `Date.now()`)
- `random` : 9 caractères `[a-z0-9]` (`Math.random().toString(36).substr(2, 9)`)

---

### Nommage des Fichiers

| Type | Format | Exemple |
|------|--------|---------|
| **Export global** | `deepmemo-export-{timestamp}.json` | `deepmemo-export-1706123456789.json` |
| **Export branche** | `deepmemo-branch-{titre}-{timestamp}.json` | `deepmemo-branch-Mon-Projet-2024-1706123456789.json` |

**Sanitisation du titre** :
- Espaces multiples normalisés en un seul espace
- Pattern ` - ` (espace-tiret-espace) → `-`
- Caractères non-alphanumériques → tirets `-`
- Tirets multiples consécutifs fusionnés en un seul
- Tirets en début/fin supprimés
- Limité à 50 caractères max

---

### Comparaison des Formats

| Critère | JSON Interchange | Archive .dm |
|---------|------------------|-------------|
| **Format fichier** | JSON pur | ZIP (JSON + binaires) |
| **Extension** | `.json` | `.dm` |
| **Taille typique** | 10-500 KB | 1-500 MB |
| **Attachments inclus** | ❌ Non (métadonnées seulement) | ✅ Oui (fichiers complets) |
| **Validable** | ✅ Schéma JSON | ✅ Schéma JSON + structure ZIP |
| **Diffable (Git)** | ✅ Oui (texte) | ❌ Non (binaire) |
| **Génération LLM** | ✅ Facile | ❌ Impossible |
| **Backup complet** | ❌ Non | ✅ Oui |
| **Import** | ✅ Replace/Merge | ✅ Replace/Merge |
| **Réimport** | ✅ Structure uniquement | ✅ Structure + fichiers |

---

## Voir Aussi

- [DM-FORMAT.md](DM-FORMAT.md) - Spécification archive .dm (ZIP)
- [validation.md](validation.md) - Outils et processus de validation
- [FILE-FORMATS.md](../../guides/FILE-FORMATS.md) - Guide utilisateur des formats
- [Data Model](../../3-DATA-MODEL.md) - Modèle de données complet

---

**Documentation vérifiée ligne par ligne** ✅

Toutes les références au code source ont été vérifiées dans DeepMemo V0.10.5 et sont exactes.

---

**Dernière mise à jour** : 2026-01-31 | **Version** : V0.10.5
