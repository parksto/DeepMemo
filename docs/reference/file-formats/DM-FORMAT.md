# .dm Archive Format Reference

> Spécification complète du format d'archive DeepMemo
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-01-31
>
> 📍 **Sources** : `src/js/core/data.js` (lignes 523-1238), `schemas/v1.0/*.json`

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure d'Archive](#structure-darchive)
3. [Détection Automatique](#détection-automatique)
4. [metadata.json](#metadatajson)
5. [data.json](#datajson)
6. [Structure des Nœuds](#structure-des-nœuds)
7. [Attachments](#attachments)
8. [Versions et Schémas](#versions-et-schémas)
9. [Gestion des IDs](#gestion-des-ids)
10. [Compression et Encodage](#compression-et-encodage)
11. [Validation](#validation)
12. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe

Le format `.dm` est une **archive ZIP standard** contenant une structure complète DeepMemo avec métadonnées, données JSON et pièces jointes.

**Caractéristiques** :
- ✅ **Standard** : Archive ZIP (magic number `0x50 0x4B`)
- ✅ **Complet** : Métadonnées + données + fichiers binaires
- ✅ **Validable** : Schémas JSON formels
- ✅ **Réimportable** : Sans perte de données
- ✅ **Portable** : Compatible tous systèmes d'exploitation

📍 **Référence** : `data.js:558-620` (export global), `data.js:626-705` (export branche)

---

### Types d'Export

| Type | Description | Contenu |
|------|-------------|---------|
| **Global** | Export complet | Tous les nœuds racines + descendants |
| **Branch** | Export sous-arbre | Un nœud + tous ses descendants |

**Différences** :
- `metadata.json` : champ `type` = `"global"` ou `"branch"`
- Export branche : métadonnées `branchRootId` et `title` obligatoires

📍 **Référence** : `data.js:523-553` (generateMetadata)

---

## Structure d'Archive

### Arborescence

```
export.dm (fichier ZIP)
├── metadata.json          # Métadonnées de l'export
├── data.json              # Structure complète des nœuds
└── attachments/           # Dossier des fichiers (optionnel si pas d'attachments)
    ├── attach_1706123456789_abc123_screenshot.png
    ├── attach_1706123456790_def456_document.pdf
    └── ...
```

**Exactement 2 ou 3 fichiers racine** :
1. `metadata.json` (obligatoire)
2. `data.json` (obligatoire)
3. `attachments/` (optionnel)

📍 **Référence** : `data.js:591-609` (création archive export global), `data.js:675-693` (export branche)

---

### Nommage des Fichiers

#### Export Global

**Format** :
```
deepmemo-export-{timestamp}.dm
```

**Exemple** :
```
deepmemo-export-1706123456789.dm
```

**Génération du timestamp** :
```javascript
const timestamp = Date.now(); // Unix milliseconds
```

📍 **Référence** : `data.js:613`

---

#### Export de Branche

**Format** :
```
deepmemo-branch-{titre_sanitisé}-{timestamp}.dm
```

**Sanitisation du titre** :
- Espaces multiples normalisés en un seul espace
- Pattern ` - ` (espace-tiret-espace) → `-`
- Caractères non-alphanumériques → tirets `-`
- Tirets multiples consécutifs fusionnés en un seul
- Tirets en début/fin supprimés
- Limité à 50 caractères max

**Exemple** :
```
Titre original : "🚀 Mon Projet 2024"
Fichier : deepmemo-branch-Mon-Projet-2024-1706123456789.dm
```

📍 **Référence** : `data.js:698`

---

## Détection Automatique

### Magic Number (ZIP)

DeepMemo détecte les archives `.dm` via le **magic number ZIP** :

**Signature** :
- **Byte 0** : `0x50` (caractère 'P')
- **Byte 1** : `0x4B` (caractère 'K')

**Code de détection** :
```javascript
const header = new Uint8Array(arrayBuffer.slice(0, 2));
if (header[0] === 0x50 && header[1] === 0x4B) {
  // C'est un fichier ZIP
  zip = await JSZip.loadAsync(arrayBuffer);
}
```

📍 **Référence** : `data.js:724-735` (importDataZIP), `data.js:985-996` (importBranchZIP)

---

### Auto-détection de Format

DeepMemo supporte **3 formats simultanément** avec auto-détection :

| Format | Extension | Magic Number | Contenu |
|--------|-----------|--------------|---------|
| **Archive .dm moderne** | `.dm` | ZIP (`0x50 0x4B`) | metadata.json + data.json + attachments/ |
| **Archive .zip legacy** | `.zip` | ZIP (`0x50 0x4B`) | data.json + attachments/ (pas de metadata.json) |
| **JSON plain** | `.json` | JSON (`0x7B` = '{') | data.json uniquement |

**Algorithme** :
1. Lire les 2 premiers bytes
2. Si `0x50 0x4B` → ZIP → Tenter extraction `metadata.json`
   - Si présent → Format moderne `.dm`
   - Sinon → Format legacy `.zip`
3. Sinon → Tenter parse JSON direct

📍 **Référence** : `data.js:713-750` (importDataZIP), `data.js:974-1010` (importBranchZIP)

---

## metadata.json

### Schéma JSON

**Fichier schéma** : `schemas/v1.0/metadata.json`

**URL de validation** : `https://deepmemo.org/schemas/v1.0/metadata.json`

---

### Propriétés (Export Global)

#### Obligatoires

| Propriété | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `version` | string (pattern: `^\d+\.\d+$`) | Version du format | `"1.0"` |
| `type` | enum: `"global"` ou `"branch"` | Type d'export | `"global"` |
| `exported` | integer | Timestamp Unix (ms) | `1706123456789` |

#### Optionnelles

| Propriété | Type | Description |
|-----------|------|-------------|
| `nodeCount` | integer | Nombre de nœuds exportés |
| `attachmentCount` | integer | Nombre d'attachments |
| `totalSize` | integer | Taille totale des attachments (bytes) |
| `generator` | string | Générateur (ex: `"DeepMemo v0.10.5"`) |

---

### Propriétés (Export Branche)

**Obligatoire** :
- `branchRootId` (string, pattern: `^(node|symlink)_\d+_[a-z0-9]+$`) : ID du nœud racine

**Recommandée** :
- `title` (string) : Titre de la branche (toujours présent dans les exports DeepMemo, mais non requis par le schéma)

---

### Exemples

#### Export Global

```json
{
  "version": "1.0",
  "type": "global",
  "exported": 1706123456789,
  "nodeCount": 42,
  "attachmentCount": 8,
  "totalSize": 5242880,
  "generator": "DeepMemo v0.10.5"
}
```

#### Export Branche

```json
{
  "version": "1.0",
  "type": "branch",
  "title": "Mon Projet",
  "branchRootId": "node_1706123456789_abc123",
  "exported": 1706123456789,
  "nodeCount": 15,
  "attachmentCount": 3,
  "totalSize": 1048576,
  "generator": "DeepMemo v0.10.5"
}
```

📍 **Référence** : `data.js:523-553` (generateMetadata)

---

## data.json

### Schémas JSON

**Fichier schéma** : `schemas/v1.0/deepmemo.json`

**URL de validation** : `https://deepmemo.org/schemas/v1.0/deepmemo.json`

Le schéma définit **deux variantes** (oneOf) :

---

### Variante 1 : Global Export

**Propriétés obligatoires** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `nodes` | object | Dictionnaire de nœuds (clé = nodeId, valeur = node object) |
| `rootNodes` | array[string] | IDs des nœuds racines |

**Propriété optionnelle** :
- `$schema` (string) : URL du schéma

**Exemple minimal** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_1706123456789_abc123": { /* node object */ }
  },
  "rootNodes": ["node_1706123456789_abc123"]
}
```

---

### Variante 2 : Branch Export

**Propriétés obligatoires** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `type` | string (const: `"deepmemo-branch"`) | Type identifiant |
| `version` | string (pattern: `^\d+\.\d+$`) | Version du format |
| `branchRootId` | string | ID du nœud racine de la branche |
| `exported` | integer | Timestamp Unix (ms) |
| `nodeCount` | integer | Nombre de nœuds |
| `nodes` | object | Dictionnaire de nœuds |

**Propriétés optionnelles** :
- `$schema` (string) : URL du schéma
- `_documentation` (string) : URL de documentation (ex: `"https://deepmemo.org/docs"`)

**Exemple minimal** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_1706123456789_abc123",
  "exported": 1706123456789,
  "nodeCount": 5,
  "nodes": {
    "node_1706123456789_abc123": { /* node object */ }
  }
}
```

📍 **Référence** : `data.js:584-586, 663-665` (ajout du $schema)

---

## Structure des Nœuds

### Schéma Node Object

**Défini dans** : `schemas/v1.0/deepmemo.json` (definition "node")

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
| `attachments` | array[object] | Métadonnées des fichiers attachés |
| `targetId` | string | **Obligatoire si `type === "symlink"`** - ID du nœud cible |

---

### Format des IDs

#### Nœuds Réguliers (type: "node")

**Pattern** :
```
node_{timestamp}_{random}
```

**Composants** :
- `timestamp` : `Date.now()` (Unix milliseconds)
- `random` : 9 caractères alphanumériques lowercase (`[a-z0-9]`)

**Exemple** :
```
node_1706123456789_a1b2c3d4e
```

**Génération** :
```javascript
// src/js/utils/helpers.js:10
function generateId() {
  return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

📍 **Référence** : `utils/helpers.js:10`

---

#### Symlinks

**Pattern** :
```
symlink_{timestamp}_{random}
```

**Composants** :
- `timestamp` : `Date.now()` (Unix milliseconds)
- `random` : 9 caractères alphanumériques lowercase (`[a-z0-9]`)

**Exemple** :
```
symlink_1706123456789_a1b2c3d4e
```

**Génération** :
```javascript
// Même mécanisme que generateId() mais avec préfixe 'symlink_'
const symlinkId = `symlink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

📍 **Références** :
- `features/modals.js:358` (createSymlink)
- `features/drag-drop.js:300` (createSymlinkTo)

---

### Philosophie : Validation Permissive, Génération Stricte

**Principe fondamental** : DeepMemo adopte une approche **permissive pour la validation** et **stricte pour la génération**.

#### Génération (Stricte)

Le code DeepMemo génère **toujours** des IDs au format strict :
- **Nodes/Symlinks** : `(node|symlink)_{timestamp}_{random}` où `random` = `[a-z0-9]{9}`
- **Attachments** : `attach_{timestamp}_{random}` où `random` = `[a-z0-9]{9}`
- **Aucun underscore** dans la partie random générée par `Math.random().toString(36)`

**Exemples d'IDs générés** :
```
node_1706123456789_a1b2c3d4e      ✅ Généré par le code
symlink_1706123456789_xyz789abc   ✅ Généré par le code
attach_1706123456789_def456ghi    ✅ Généré par le code
```

#### Validation (Permissive)

Les schémas JSON **acceptent** des IDs avec underscores multiples dans la partie random :
- **Pattern schéma** : `^(node|symlink)_\\d+_[a-z0-9_]+$`
- **Permet** des IDs personnalisés ou créés par d'autres outils
- **Garantit** la compatibilité avec des imports de sources tierces

**Exemples d'IDs acceptés** :
```
node_1706123456789_a1b2c3d4e      ✅ Format standard (généré)
node_1706123456789_my_custom_id   ✅ ID personnalisé (accepté)
node_1706123456789_why_hierarchy  ✅ ID lisible (accepté)
symlink_1706123456789_test_link   ✅ Symlink personnalisé (accepté)
```

**Exemples d'IDs rejetés** :
```
node_abc_123                      ❌ Pas de timestamp numérique
mynode_1706123456789_abc          ❌ Mauvais préfixe
node_1706123456789                ❌ Pas de partie random
1706123456789_abc                 ❌ Pas de préfixe
```

#### Pourquoi cette approche ?

1. **Interopérabilité** : Accepter des exports de sources diverses (outils tiers, scripts personnalisés)
2. **Flexibilité** : Permettre des IDs lisibles pour du contenu de démo ou des tests
3. **Robustesse** : Éviter de rejeter des archives valides juste pour une convention de nommage
4. **Cohérence interne** : Le code génère toujours des IDs cohérents et sûrs

**Note importante** : Les IDs avec underscores multiples (ex: `node_123_a__b___c`) sont techniquement acceptés par le schéma pour maximiser la compatibilité, mais **ne sont jamais générés** par DeepMemo.

---

### Exemples de Nœuds

#### Nœud Régulier

```json
{
  "id": "node_1706123456789_abc123",
  "type": "node",
  "title": "🚀 Démarrage du projet",
  "content": "# Phase 1\n\nMise en place de l'infrastructure...",
  "parent": null,
  "children": [
    "node_1706123456790_def456",
    "symlink_1706123456791_ghi789"
  ],
  "tags": ["startup", "urgent"],
  "attachments": [
    {
      "id": "attach_1706123456789_xyz789",
      "name": "screenshot.png",
      "type": "image/png",
      "size": 102400
    }
  ],
  "created": 1706000000000,
  "modified": 1706100000000
}
```

#### Symlink

```json
{
  "id": "symlink_1706123456791_ghi789",
  "type": "symlink",
  "title": "→ Référence vers Tâche 1",
  "targetId": "node_1706123456790_def456",
  "parent": "node_1706123456789_abc123",
  "children": [],
  "created": 1706050000000,
  "modified": 1706050000000
}
```

**Contrainte importante** : `targetId` doit pointer vers un nœud existant dans le dictionnaire `nodes`.

---

## Attachments

### Métadonnées dans data.json

Chaque nœud peut avoir un tableau `attachments[]` contenant des **métadonnées uniquement** (pas les fichiers binaires).

**Schéma** (défini dans `schemas/v1.0/deepmemo.json`, definition "attachment") :

| Propriété | Type | Pattern | Description |
|-----------|------|---------|-------------|
| `id` | string | `^attach_\d+_[a-z0-9]+$` | Identifiant unique |
| `name` | string | - | Nom original du fichier |
| `type` | string | - | Type MIME (ex: `image/png`) |
| `size` | integer | - | Taille en bytes |

**Exemple** :
```json
{
  "id": "attach_1706123456789_abc123",
  "name": "screenshot.png",
  "type": "image/png",
  "size": 102400
}
```

**Génération de l'ID** :
```javascript
// src/js/core/attachments.js:79-83
function generateAttachmentId() {
  return `attach_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
```

📍 **Référence** : `core/attachments.js:79-83`

---

### Fichiers Binaires dans attachments/

Les fichiers réels sont stockés dans le dossier `attachments/` de l'archive ZIP.

**Format de nommage** :
```
{attachmentId}_{originalName}
```

**Structure du nom** :
- Prefixe : `attachmentId` complet
- Séparateur : underscore (`_`)
- Suffixe : nom original du fichier (avec extension)

**Exemples** :
```
attach_1706123456789_abc123_screenshot.png
attach_1706123456790_def456_document.pdf
attach_1706123456791_ghi789_diagram.svg
```

📍 **Référence** : `data.js:591-609, 675-693` (ajout des fichiers à l'archive)

---

### Parsing des Noms de Fichiers

**Algorithme** (lors de l'import) :
1. Extraire le nom du fichier depuis l'archive : `attach_123_abc_file.png`
2. Rechercher le premier underscore après `attach_` : position de l'ID
3. Extraire `attachmentId` : `attach_123_abc`
4. Mapper avec les métadonnées dans `data.json` via `attachment.id`
5. Récupérer le blob binaire

---

### Synchronisation lors de l'Import

**Processus** :
1. Parser `data.json` et collecter tous les `attachment.id`
2. Parcourir le dossier `attachments/` de l'archive ZIP
3. Pour chaque fichier :
   - Extraire l'`attachmentId` du nom
   - Trouver la métadonnée correspondante dans `data.json`
   - Restaurer le blob dans IndexedDB
4. Nettoyer les références orphelines

**Nettoyage automatique** :
- Références pointant vers fichiers inexistants → supprimées
- Fichiers dans `attachments/` non référencés → ignorés

📍 **Référence** : `data.js:758-893` (importFromArchive), `core/attachments.js:132-162` (cleanOrphanedReferences)

---

## Versions et Schémas

### Version du Format

**Version actuelle** : `1.0`

Tous les fichiers exportés utilisent :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/{file}.json",
  "version": "1.0"
}
```

**Champs de version** :
- `metadata.json` : propriété `version`
- `data.json` (branch export) : propriété `version`

📍 **Référence** : `data.js:525, 584-586, 663-665` (ajout des schémas)

---

### URLs des Schémas

| Fichier | URL du Schéma |
|---------|---------------|
| `data.json` | `https://deepmemo.org/schemas/v1.0/deepmemo.json` |
| `metadata.json` | `https://deepmemo.org/schemas/v1.0/metadata.json` |

**Validation** :
```bash
# Avec ajv-cli
ajv validate -s https://deepmemo.org/schemas/v1.0/deepmemo.json -d data.json
ajv validate -s https://deepmemo.org/schemas/v1.0/metadata.json -d metadata.json
```

---

### Generator

**Format** :
```
"DeepMemo v{VERSION}"
```

**Exemple** :
```json
{
  "generator": "DeepMemo v0.10.5"
}
```

**Génération** :
```javascript
generator: `DeepMemo v${VERSION}`
```

📍 **Référence** : `data.js:529`

---

## Gestion des IDs

### Import Global - Replace Mode

**Comportement** : Remplace toutes les données existantes

**IDs** : Conservation des IDs originaux de l'archive
- Pas de régénération
- Les IDs existants sont écrasés

📍 **Référence** : `data.js:758-893` (importFromArchive)

---

### Import Global - Merge Mode

**Comportement** : Fusionne avec les données existantes

**IDs** : Conservation des IDs originaux
- Les nœuds importés deviennent de nouvelles racines
- **Risque de collision** : Les IDs identiques écrasent les données existantes
- **Probabilité de collision** : Quasi nulle (timestamp 13 digits + random 9 chars)

---

### Import de Branche

**Tous les IDs sont RÉGÉNÉRÉS AUTOMATIQUEMENT** pour éviter les conflits.

**Processus complet** :

1. **Génération de nouveaux IDs pour tous les nœuds**
   ```javascript
   const oldToNewIds = {};
   Object.keys(branchData.nodes).forEach(oldId => {
     oldToNewIds[oldId] = generateId();
   });
   ```

2. **Génération de nouveaux IDs pour tous les attachments**
   ```javascript
   const oldToNewAttachIds = {};
   // Pour chaque attachment dans chaque nœud
   oldToNewAttachIds[oldAttachId] = generateAttachmentId();
   ```

3. **Remapping des références**
   - `parent` : ID remappé
   - `children[]` : tous les IDs remappés
   - `targetId` (symlinks) : ID remappé
   - Références markdown : `attachment:attach_old` → `attachment:attach_new`

**Exemple de transformation** :
```
Avant import :
  node_123 → attachment:attach_456

Après import (avec régénération) :
  node_789 → attachment:attach_012
```

📍 **Référence** : `data.js:1019-1238` (importBranchFromArchive complète), spécifiquement :
- `data.js:1137-1139` (génération nouveaux IDs de nœuds)
- `data.js:1142-1150` (génération nouveaux IDs d'attachments)
- `data.js:1201-1208` (remapping des références dans le contenu markdown)

---

## Compression et Encodage

### Format ZIP

**Bibliothèque** : JSZip (https://stuk.github.io/jszip/)

**Paramètres** :
- **Compression** : Défaut (généralement DEFLATE)
- **Encodage noms** : UTF-8
- **Niveau** : Non configuré (JSZip utilise défaut de la bibliothèque)

**Génération de l'archive** :
```javascript
const zip = new JSZip();
zip.file('metadata.json', JSON.stringify(metadata, null, 2));
zip.file('data.json', JSON.stringify(data, null, 2));
// Ajout des fichiers
const blob = await zip.generateAsync({ type: 'blob' });
```

📍 **Référence** : `data.js:560, 634` (new JSZip()), `data.js:612, 696` (generateAsync)

---

### Encodage Texte

**Fichiers JSON** :
- **Encodage** : UTF-8
- **Formatage** : Indentation 2 espaces (pretty-print)
- **Newline** : LF (`\n`)

**Code** :
```javascript
JSON.stringify(data, null, 2)
```

**Attachments** :
- **Format** : Binaire brut (pas de transformation)
- **Stockage** : Blobs natifs du navigateur

📍 **Référence** : `data.js:581, 660, 672` (JSON.stringify)

---

## Validation

### Checklist de Validation

Pour valider une archive `.dm` :

#### 1. Structure ZIP

- ✅ Magic number : Bytes 0-1 = `0x50 0x4B`
- ✅ Contient `metadata.json`
- ✅ Contient `data.json`
- ✅ Contient `attachments/` (si `attachmentCount > 0`)

---

#### 2. metadata.json

- ✅ Valide JSON
- ✅ Conforme au schéma `schemas/v1.0/metadata.json`
- ✅ `version` = `"1.0"`
- ✅ `type` = `"global"` ou `"branch"`
- ✅ Si `type === "branch"` : `branchRootId` et `title` présents

---

#### 3. data.json

- ✅ Valide JSON
- ✅ Conforme au schéma `schemas/v1.0/deepmemo.json`
- ✅ Si export global : `nodes` et `rootNodes` présents
- ✅ Si export branche : `type`, `version`, `branchRootId`, `nodes` présents

---

#### 4. Références

- ✅ **Parent** : Tous les `parent` (non-null) existent dans `nodes`
- ✅ **Children** : Tous les IDs dans `children[]` existent dans `nodes`
- ✅ **Symlinks** : Tous les `targetId` existent dans `nodes`
- ✅ **Attachments** : Tous les `attachment.id` ont un fichier correspondant dans `attachments/`
- ✅ **RootNodes** : Tous les IDs dans `rootNodes[]` existent dans `nodes`

---

#### 5. IDs

- ✅ **Nodes** : Pattern `^node_\d+_[a-z0-9]+$` (si `type === "node"`)
- ✅ **Symlinks** : Pattern `^symlink_\d+_[a-z0-9]+$` (si `type === "symlink"`)
- ✅ **Attachments** : Pattern `^attach_\d+_[a-z0-9]+$`
- ✅ **Unicité** : Tous les IDs de nœuds sont uniques
- ✅ **Unicité** : Tous les IDs d'attachments sont uniques
- ✅ **Cohérence type/ID** : Le préfixe de l'ID doit correspondre au type

---

#### 6. Hiérarchie

- ✅ **Arbres valides** : Pas de cycles (parent → child → parent)
- ✅ **Orphelins** : Tous les nœuds (sauf racines) ont un parent
- ✅ **Bidirectionnel** : Si `A.children` contient `B`, alors `B.parent === A`

---

### Script de Validation

Exemple avec Node.js :

```javascript
const JSZip = require('jszip');
const Ajv = require('ajv');
const fs = require('fs');

async function validateDM(filepath) {
  // 1. Lire le fichier
  const buffer = fs.readFileSync(filepath);

  // 2. Vérifier magic number
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
    throw new Error('Not a ZIP file');
  }

  // 3. Charger l'archive
  const zip = await JSZip.loadAsync(buffer);

  // 4. Extraire et valider metadata.json
  const metadataStr = await zip.file('metadata.json').async('string');
  const metadata = JSON.parse(metadataStr);

  const ajv = new Ajv();
  const metadataSchema = require('./schemas/v1.0/metadata.json');
  if (!ajv.validate(metadataSchema, metadata)) {
    throw new Error('Invalid metadata.json: ' + ajv.errorsText());
  }

  // 5. Extraire et valider data.json
  const dataStr = await zip.file('data.json').async('string');
  const data = JSON.parse(dataStr);

  const dataSchema = require('./schemas/v1.0/deepmemo.json');
  if (!ajv.validate(dataSchema, data)) {
    throw new Error('Invalid data.json: ' + ajv.errorsText());
  }

  // 6. Vérifier les références
  // ... (vérification parent, children, targetId, etc.)

  console.log('✅ Archive .dm valide');
}
```

---

## Référence Rapide

### Fichiers Source

| Aspect | Fichier | Lignes |
|--------|---------|--------|
| **Export global** | `src/js/core/data.js` | 558-620 |
| **Export branche** | `src/js/core/data.js` | 626-705 |
| **Import global (dispatch)** | `src/js/core/data.js` | 713-750 |
| **Import global (archive)** | `src/js/core/data.js` | 758-893 |
| **Import branche (dispatch)** | `src/js/core/data.js` | 974-1010 |
| **Import branche (archive)** | `src/js/core/data.js` | 1019-1238 |
| **Génération metadata** | `src/js/core/data.js` | 523-553 |
| **Génération ID node** | `src/js/utils/helpers.js` | 10 |
| **Génération ID attachment** | `src/js/core/attachments.js` | 79-83 |
| **Création symlink (modal)** | `src/js/features/modals.js` | 358 |
| **Création symlink (drag)** | `src/js/features/drag-drop.js` | 300 |
| **Nettoyage orphelins** | `src/js/core/attachments.js` | 132-162 |

---

### Schémas JSON

| Fichier | Chemin |
|---------|--------|
| **data.json schema** | `schemas/v1.0/deepmemo.json` |
| **metadata.json schema** | `schemas/v1.0/metadata.json` |

**URLs publiques** :
- `https://deepmemo.org/schemas/v1.0/deepmemo.json`
- `https://deepmemo.org/schemas/v1.0/metadata.json`

---

### Patterns d'IDs

| Type | Pattern Généré | Pattern Accepté | Exemple Généré | Exemple Personnalisé |
|------|----------------|-----------------|----------------|---------------------|
| **Node** | `node_{timestamp}_{random}` | `node_{timestamp}_{custom}` | `node_1706123456789_abc123def` | `node_1706123456789_my_node` |
| **Symlink** | `symlink_{timestamp}_{random}` | `symlink_{timestamp}_{custom}` | `symlink_1706123456789_ghi789jkl` | `symlink_1706123456789_my_link` |
| **Attachment** | `attach_{timestamp}_{random}` | `attach_{timestamp}_{custom}` | `attach_1706123456789_mno345pqr` | `attach_1706123456789_my_file` |

**Composants** :
- `timestamp` : 13 digits (Unix milliseconds)
- `random` : 9 caractères `[a-z0-9]` (généré par le code)
- `custom` : `[a-z0-9_]+` (accepté par le schéma, peut contenir des underscores)

**Validation du schéma (v1.0)** :
- **Pattern généré** : `^(node|symlink|attach)_\d+_[a-z0-9]+$` (strict, pas d'underscore dans random)
- **Pattern accepté** : `^(node|symlink|attach)_\d+_[a-z0-9_]+$` (permissif, underscores autorisés)
- Les nœuds réguliers (`type: "node"`) **doivent** avoir un ID commençant par `node_`
- Les symlinks (`type: "symlink"`) **doivent** avoir un ID commençant par `symlink_`
- Cette contrainte est validée par le schéma JSON via règles conditionnelles

**Approche** : **Validation permissive, génération stricte** (voir section dédiée ci-dessus)

---

### Limites Actuelles

| Limite | Valeur |
|--------|--------|
| **Taille maximale archive** | ~500MB - 1GB (selon navigateur) |
| **Taille fichier attachment** | Max 50MB par fichier |
| **Nombre de nœuds** | Illimité (limité par RAM) |
| **Nombre d'attachments** | Illimité (limité par taille totale) |

---

## Voir Aussi

- [Guide Formats de Fichiers](../../guides/FILE-FORMATS.md) - Guide utilisateur complet
- [Data Model](../../3-DATA-MODEL.md) - Modèle de données complet
- [Architecture](../../2-ARCHITECTURE.md) - Architecture du système

---

**Documentation vérifiée ligne par ligne** ✅

Toutes les références au code source ont été vérifiées dans DeepMemo V0.10.5 et sont exactes.

---

**Dernière mise à jour** : 2026-01-31 | **Version** : V0.10.5
