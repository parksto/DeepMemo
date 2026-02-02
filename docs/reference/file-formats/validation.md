# Schema Validation Reference

> Spécification complète de la validation des formats DeepMemo
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-02-02 (fact-check complet, correction validateMetadata et références lignes)
>
> 📍 **Sources** : `schemas/v1.0/*.json`, `src/js/core/validation.js`, `src/js/core/data.js`

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Schémas JSON Disponibles](#schémas-json-disponibles)
3. [Validation Programmatique](#validation-programmatique)
4. [Validation Manuelle](#validation-manuelle)
5. [Outils de Validation](#outils-de-validation)
6. [Erreurs Courantes](#erreurs-courantes)
7. [Migration de Schémas](#migration-de-schémas)
8. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe

DeepMemo utilise des **JSON Schemas** (Draft-07) pour définir la structure des données d'export/import. La validation garantit l'intégrité des données lors des échanges.

**Caractéristiques** :
- ✅ **Standards** : JSON Schema Draft-07 (compatibilité universelle avec tous les validateurs)
- ✅ **Versionné** : Schémas v1.0 avec évolution prévue
- ✅ **Strict** : `additionalProperties: false` pour éviter les propriétés inconnues
- ✅ **Conditionnel** : Validation différente selon le type (node/symlink, global/branch)
- ✅ **Patterns flexibles** : Les IDs acceptent les underscores pour personnalisation
- ✅ **Validateur custom** : Module `validation.js` léger (~2KB) pour validation client-side
- ⚠️ **Offline-first** : Validation client uniquement (pas de serveur backend)

> **Pourquoi Draft-07 ?** Draft-07 est universellement supporté par tous les validateurs (AJV, Python jsonschema, validateurs en ligne, VSCode, etc.) sans nécessiter de configuration spéciale. Draft 2020-12 apporte peu d'avantages pour nos besoins et nécessite des flags supplémentaires.

---

## Schémas JSON Disponibles

### 1. deepmemo.json

**Chemin** : `schemas/v1.0/deepmemo.json`
**URL** : `https://deepmemo.org/schemas/v1.0/deepmemo.json`

**Description** : Schéma principal pour les fichiers de données (data.json dans archives .dm ou exports JSON standalone)

**Variantes** :
- **globalExport** : Export complet (propriétés `nodes`, `rootNodes`)
- **branchExport** : Export de sous-arbre (propriétés `type`, `version`, `branchRootId`, `exported`, `nodeCount`, `nodes`)

**Définitions** :
- **node** : Structure d'un nœud (regular node ou symlink)
- **attachment** : Métadonnées d'un fichier attaché

📍 **Référence** : `schemas/v1.0/deepmemo.json` (249 lignes)

---

#### Structure globalExport

**Propriétés requises** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `nodes` | object | patternProperties | Dictionnaire de nœuds (clé = nodeId) |
| `rootNodes` | array[string] | items: pattern | IDs des nœuds racines |

**Propriétés optionnelles** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `$schema` | string | URL du schéma JSON (toujours inclus dans les exports DeepMemo) |

**Exemple minimal** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_1706123456789_abc123": { ... }
  },
  "rootNodes": ["node_1706123456789_abc123"]
}
```

📍 **Référence** : `schemas/v1.0/deepmemo.json` lignes 11-39

---

#### Structure branchExport

**Propriétés requises** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `type` | string | `const: "deepmemo-branch"` | Identifiant de type |
| `version` | string | `pattern: "^\d+\.\d+$"` | Version format (ex: "1.0") |
| `branchRootId` | string | pattern node/symlink | ID du nœud racine |
| `exported` | integer | `minimum: 0` | Timestamp Unix (ms) |
| `nodeCount` | integer | `minimum: 1` | Nombre de nœuds |
| `nodes` | object | patternProperties | Dictionnaire de nœuds |

**Propriétés optionnelles** :

| Propriété | Type | Description |
|-----------|------|-------------|
| `$schema` | string | URL du schéma |
| `_documentation` | string | URL de documentation |

**Exemple minimal** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_1706123456789_abc123",
  "exported": 1706123456789,
  "nodeCount": 5,
  "nodes": { ... }
}
```

📍 **Référence** : `schemas/v1.0/deepmemo.json` lignes 41-86

---

#### Structure node

**Propriétés requises** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `id` | string | `^(node\|symlink)_\d+_[a-z0-9_]+$` | Identifiant unique |
| `title` | string | `minLength: 1` | Titre du nœud |
| `type` | enum | `"node"` ou `"symlink"` | Type de nœud |
| `parent` | string\|null | - | ID du parent (null pour racines) |
| `children` | array[string] | items: pattern | IDs des enfants |
| `created` | integer | `minimum: 0` | Timestamp création (ms) |
| `modified` | integer | `minimum: 0` | Timestamp modification (ms) |

**Propriétés optionnelles** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `content` | string | - | Contenu markdown |
| `tags` | array[string] | items: minLength 1 | Tags associés |
| `attachments` | array[object] | items: $ref attachment | Métadonnées attachments |
| `links` | array[string] | items: pattern | IDs des nodes liés (liens sortants) |
| `backlinks` | array[string] | items: pattern | IDs des nodes pointant vers ce node (calculés automatiquement) |
| `targetId` | string | pattern | **Obligatoire si type="symlink"** |

**Validation conditionnelle** :

**Si `type === "symlink"`** :
- ✅ `targetId` **requis**
- ✅ `id` doit commencer par `symlink_`
- ⚠️ `content` optionnel (non utilisé par l'application pour les symlinks)

**Si `type === "node"`** :
- ❌ `targetId` ne doit **pas** être présent
- ✅ `id` doit commencer par `node_`

📍 **Référence** : `schemas/v1.0/deepmemo.json` lignes 88-218

---

#### Structure attachment

**Propriétés requises** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `id` | string | `^attach_\d+_[a-z0-9_]+$` | Identifiant unique |
| `name` | string | `minLength: 1` | Nom du fichier original |
| `type` | string | `minLength: 1` | Type MIME (ex: `image/png`) |
| `size` | integer | `minimum: 0` | Taille en bytes |

**Exemple** :
```json
{
  "id": "attach_1706123456789_abc123",
  "name": "diagram.png",
  "type": "image/png",
  "size": 102400
}
```

📍 **Référence** : `schemas/v1.0/deepmemo.json` lignes 220-247

---

### 2. metadata.json

**Chemin** : `schemas/v1.0/metadata.json`
**URL** : `https://deepmemo.org/schemas/v1.0/metadata.json`

**Description** : Schéma pour le fichier `metadata.json` contenu dans les archives `.dm`

**Propriétés requises** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `version` | string | `pattern: "^\d+\.\d+$"` | Version format (ex: "1.0") |
| `type` | enum | `"global"` ou `"branch"` | Type d'export |
| `exported` | integer | `minimum: 0` | Timestamp export (ms) |

**Propriétés optionnelles** :

| Propriété | Type | Contrainte | Description |
|-----------|------|------------|-------------|
| `title` | string | `minLength: 1` | Titre lisible (nom de branche) |
| `branchRootId` | string | pattern | **Requis si type="branch"** |
| `nodeCount` | integer | `minimum: 1` | Nombre de nœuds |
| `attachmentCount` | integer | `minimum: 0` | Nombre de fichiers attachés |
| `totalSize` | integer | `minimum: 0` | Taille totale (bytes) |
| `generator` | string | - | Logiciel générateur |

**Exemple complet** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/metadata.json",
  "version": "1.0",
  "type": "branch",
  "title": "Ma Documentation",
  "exported": 1706123456789,
  "branchRootId": "node_1706123456789_abc123",
  "nodeCount": 42,
  "attachmentCount": 7,
  "totalSize": 5242880,
  "generator": "DeepMemo v0.10.5"
}
```

📍 **Référence** : `schemas/v1.0/metadata.json` (77 lignes), `data.js:523` (fonction `generateMetadata`)

---

## Validation Programmatique

### Dans le Code Source

DeepMemo utilise un **validateur JSON Schema custom** léger (~2KB) implémenté dans `src/js/core/validation.js`.

**Processus de validation** :
1. **Parsing JSON** : Vérification syntaxe (`JSON.parse()`)
2. **Validation schéma** : Structure et propriétés via `validation.js`
3. **Validation sémantique** : Références, cycles, cohérence hiérarchique
4. **Affichage erreurs** : Messages contextuels pour l'utilisateur

**Module de validation** : `src/js/core/validation.js`
- ✅ `validateGlobalExport(data)` - Valide exports globaux
- ✅ `validateBranchExport(data)` - Valide exports de branches
- ✅ `validateMetadata(metadata)` - Valide metadata.json (warnings uniquement)
- ✅ Validation références parent/children/targetId
- ✅ Détection de cycles dans la hiérarchie
- ✅ Limite de 50 erreurs max (évite surcharge)

---

### Module validation.js - Détails

**Fichier** : `src/js/core/validation.js` (~279 lignes)

**Architecture** :
1. **validateNode()** : Valide un nœud individuel
2. **validateReferences()** : Valide cohérence des références (parent/children/targetId)
3. **detectCycles()** : Détection cycles avec DFS (Depth-First Search)
4. **validateGlobalExport()** : Point d'entrée validation exports globaux
5. **validateBranchExport()** : Point d'entrée validation exports branches
6. **validateMetadata()** : Validation légère metadata.json

**Validations effectuées** :

#### validateNode(node, nodeId, allNodeIds, result)

```javascript
// Champs requis
['id', 'type', 'parent', 'children', 'created', 'modified']

// Validation type
type ∈ ['node', 'note', 'symlink']  // 'note' accepté (legacy)

// Règles conditionnelles
if (type === 'symlink') → targetId REQUIS
if (type === 'node' || 'note') → targetId INTERDIT (warning)

// Validation timestamps
created, modified : number >= 0

// Validation références
parent: null OU existe dans nodes
children[]: tous existent dans nodes
targetId: existe dans nodes (si symlink)

// Validation arrays optionnels
tags, attachments, links, backlinks : doivent être arrays si présents
```

#### detectCycles(nodes)

**Algorithme** : DFS avec recursive stack
- Détecte cycles dans la hiérarchie parent/children
- Retourne ID du premier nœud impliqué dans un cycle
- Utilisé pour éviter boucles infinies dans l'arborescence

#### validateGlobalExport(data)

```javascript
// Structure requise
data.nodes: object (requis)
data.rootNodes: array (requis)

// Validations sémantiques
- Tous les nodes sont validés individuellement
- Tous les rootNodes doivent exister et avoir parent === null
- Détection cycles globale

// Retour
{ valid: boolean, errors: string[], warnings: string[] }
```

#### validateBranchExport(data)

```javascript
// Structure requise
data.nodes: object (requis)
data.branchRootId: string (requis)

// Validations sémantiques
- branchRootId doit exister dans nodes
- Tous les nodes validés individuellement
- Détection cycles

// Retour
{ valid: boolean, errors: string[], warnings: string[] }
```

#### validateMetadata(metadata)

**Mode** : Warnings uniquement (non bloquant)

```javascript
// Champs recommandés (warnings si absents)
['version', 'exported', 'type', 'nodeCount']

// Validation type si présent
type ∈ ['global', 'branch']
```

**Limite de sécurité** : Validation s'arrête après **50 erreurs** pour éviter surcharge UI.

**Affichage des erreurs** : Fonction `showValidationErrors(validation)` dans `data.js:36`

```javascript
function showValidationErrors(validation) {
  const { errors, warnings } = validation;

  // Affiche alert avec résumé (3 premières erreurs)
  if (errors.length > 0) {
    alert(
      `❌ Import validation failed\n\n` +
      `Found ${errors.length} error(s):\n\n` +
      errors.slice(0, 3).map((e, i) => `${i + 1}. ${e}`).join('\n') +
      (errors.length > 3 ? `\n\n... and ${errors.length - 3} more` : '') +
      `\n\nCheck browser console for details.`
    );
    console.error('[Import] Validation errors:', errors);
  }

  // Warnings dans console uniquement
  if (warnings.length > 0) {
    console.warn('[Import] Validation warnings:', warnings);
  }
}
```

**Support Legacy** : Fonction `normalizeLegacyTypes(imported)` dans `data.js:62`

```javascript
// Conversion automatique "note" → "node"
// Permet compatibilité avec anciennes versions
function normalizeLegacyTypes(imported) {
  Object.values(imported.nodes).forEach(node => {
    if (node.type === 'note') {
      node.type = 'node';
    }
  });
}
```

---

### Import Global (JSON)

**Fonction** : `importFromJSONText()` (`data.js:900`)

**Validation effectuée** :

```javascript
// Étape 1 : Parsing JSON
const imported = JSON.parse(text); // Lève SyntaxError si invalide

// Étape 2 : Validation JSON Schema + sémantique
const validation = validateGlobalExport(imported);
if (!validation.valid) {
  showValidationErrors(validation);
  return;
}

// Étape 3 : Normalisation des types legacy ("note" → "node")
normalizeLegacyTypes(imported);

// Étape 4 : Import des données validées
```

**Validations effectuées** (via `validateGlobalExport()`) :
- ✅ Vérification structure : `nodes` (object) et `rootNodes` (array) requis
- ✅ Vérification champs requis : `id`, `title`, `type`, `parent`, `children`, `created`, `modified`
- ✅ Validation types : `type` doit être `"node"` ou `"symlink"`
- ✅ Validation symlinks : `targetId` requis pour symlinks, interdit pour nodes
- ✅ Validation timestamps : nombres positifs
- ✅ Validation références : parent/children/targetId doivent exister
- ✅ Validation rootNodes : parents doivent être `null`
- ✅ Détection cycles dans la hiérarchie
- ⚠️ Max 50 erreurs affichées (early exit)

📍 **Référence** : `data.js:900` (fonction `importFromJSONText`), `validation.js:167` (fonction `validateGlobalExport`)

---

### Import Branch (JSON)

**Fonction** : `importBranchFromJSONText()` (`data.js:1239`)

**Validation effectuée** :

```javascript
// Étape 1 : Parsing JSON
const imported = JSON.parse(text);

// Étape 2 : Détection format + validation
if (imported.type === 'deepmemo-branch' && imported.branchRootId) {
  // Format branch standard - VALIDATION stricte
  const validation = validateBranchExport(imported);
  if (!validation.valid) {
    showValidationErrors(validation);
    return;
  }
  branchRootId = imported.branchRootId;
} else if (imported.rootNodes && imported.nodes) {
  // Format global - VALIDATION + conversion automatique
  const validation = validateGlobalExport(imported);
  if (!validation.valid) {
    showValidationErrors(validation);
    return;
  }
  // Conversion : single root → direct, multiple roots → container node
} else {
  alert('Fichier invalide. Format non reconnu.');
  return;
}
```

**Particularité** : Import branch accepte **deux formats** :
- ✅ Format `branchExport` (type="deepmemo-branch") → validé avec `validateBranchExport()`
- ✅ Format `globalExport` (converti automatiquement) → validé avec `validateGlobalExport()`

**Validations spécifiques branch** (via `validateBranchExport()`) :
- ✅ `branchRootId` requis et doit exister dans `nodes`
- ✅ Validation hiérarchie complète à partir de branchRootId
- ✅ Détection cycles
- ✅ Validation références (mêmes règles que global)

📍 **Référence** : `data.js:1239` (fonction `importBranchFromJSONText`), `validation.js:206` (fonction `validateBranchExport`)

---

### Import Archive (.dm)

**Fonction** : `importFromArchive()` (`data.js:729`)

**Validation effectuée** :

```javascript
// Étape 1 : Extraction data.json
const dataJsonFile = zip.file('data.json');
if (!dataJsonFile) {
  i18nAlert('dataJsonNotFound');
  return;
}

const dataStr = await dataJsonFile.async('string');
const imported = JSON.parse(dataStr);

// Étape 2 : Validation metadata.json (si présent)
const metadataJsonFile = zip.file('metadata.json');
if (metadataJsonFile) {
  const metadata = JSON.parse(metadataStr);
  console.log(`[Import] Loading .dm archive (v${metadata.version}, type: ${metadata.type})`);

  // Validation metadata (warnings uniquement)
  const metaValidation = validateMetadata(metadata);
  if (metaValidation.warnings.length > 0) {
    console.warn('[Import] Metadata warnings:', metaValidation.warnings);
  }
}

// Étape 3 : Validation data.json (stricte)
const validation = validateGlobalExport(imported);
if (!validation.valid) {
  showValidationErrors(validation);
  return;
}

// Étape 4 : Normalisation types legacy + import
normalizeLegacyTypes(imported);
```

**Validations** :
- ✅ **data.json** : Validation **stricte** avec `validateGlobalExport()` (bloquante si erreur)
- ⚠️ **metadata.json** : Validation **warnings** avec `validateMetadata()` (non bloquante)
- ✅ Extraction et restauration attachments depuis dossier `attachments/`

📍 **Référence** : `data.js:729` (fonction `importFromArchive`), `validation.js:252` (fonction `validateMetadata`)

---

### Export : Génération avec $schema

**Tous les exports incluent la propriété `$schema`** pour indiquer le schéma à utiliser :

**Export global (JSON)** :
```javascript
const exportData = {
  $schema: 'https://deepmemo.org/schemas/v1.0/deepmemo.json',
  ...data
};
```
📍 **Référence** : `data.js:566` (fonction `exportData`)

**Export branch (JSON)** :
```javascript
const branchData = {
  $schema: 'https://deepmemo.org/schemas/v1.0/deepmemo.json',
  type: 'deepmemo-branch',
  version: '1.0',
  _documentation: 'https://raw.githubusercontent.com/parksto/DeepMemo/refs/heads/main/docs/reference/file-formats/json-interchange.md',
  branchRootId: nodeId,
  exported: Date.now(),
  nodeCount: nodeCount,
  nodes: branchNodes
};
```
📍 **Référence** : `data.js:603` (fonction `exportBranch`)

**Métadonnées archive** :
```javascript
const metadata = {
  $schema: 'https://deepmemo.org/schemas/v1.0/metadata.json',
  version: '1.0',
  type,
  exported: Date.now(),
  generator: 'DeepMemo v0.10.5'
};
```
📍 **Référence** : `data.js:523` (fonction `generateMetadata`)

---

## Validation Manuelle

### Outils en Ligne de Commande

#### 1. ajv-cli (Recommandé)

**Installation** :
```bash
npm install -g ajv-cli
```

**Validation d'un export global** :
```bash
ajv validate \
  -s https://deepmemo.org/schemas/v1.0/deepmemo.json \
  -d deepmemo-export-1706123456789.json
```

**Validation d'un export branch** :
```bash
ajv validate \
  -s https://deepmemo.org/schemas/v1.0/deepmemo.json \
  -d deepmemo-branch-Mon-Projet-1706123456789.json
```

**Validation des métadonnées** :
```bash
# Extraire metadata.json depuis l'archive .dm
unzip -p deepmemo-export-1706123456789.dm metadata.json > metadata.json

# Valider
ajv validate \
  -s https://deepmemo.org/schemas/v1.0/metadata.json \
  -d metadata.json
```

**Note** : Les schémas utilisent JSON Schema Draft-07 pour une meilleure compatibilité avec tous les validateurs.

---

#### 2. check-jsonschema

**Installation** :
```bash
pip install check-jsonschema
```

**Validation** :
```bash
check-jsonschema \
  --schemafile schemas/v1.0/deepmemo.json \
  deepmemo-export-1706123456789.json
```

---

### Validation en Ligne

#### JSONSchemaValidator.net

**URL** : https://www.jsonschemavalidator.net/

**Étapes** :
1. Ouvrir le validateur en ligne
2. **Volet gauche** : Coller le contenu de `schemas/v1.0/deepmemo.json`
3. **Volet droit** : Coller le contenu du fichier JSON à valider
4. Vérifier les erreurs affichées en bas

**Avantages** :
- ✅ Pas d'installation requise
- ✅ Erreurs détaillées avec localisation
- ✅ Validation en temps réel

**Limitations** :
- ⚠️ Ne supporte pas les `$ref` externes (mais OK pour DeepMemo car tout est dans un seul schéma)

---

#### JSON Schema Validator (VSCode)

**Extension** : "JSON Schema Validator" par Microsoft

**Configuration** : `.vscode/settings.json`
```json
{
  "json.schemas": [
    {
      "fileMatch": ["deepmemo-export-*.json", "deepmemo-branch-*.json"],
      "url": "./schemas/v1.0/deepmemo.json"
    },
    {
      "fileMatch": ["metadata.json"],
      "url": "./schemas/v1.0/metadata.json"
    }
  ]
}
```

**Avantages** :
- ✅ Validation en temps réel dans l'éditeur
- ✅ Autocomplete des propriétés
- ✅ Erreurs inline

---

## Outils de Validation

### Script Node.js Complet

**Fichier** : `scripts/validate-export.js`

```javascript
#!/usr/bin/env node

/**
 * Validation complète d'un fichier export DeepMemo
 * Usage: node scripts/validate-export.js <file.json>
 */

const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Configuration AJV
const ajv = new Ajv({
  allErrors: true,
  verbose: true
});
addFormats(ajv);

// Charger le schéma
const schemaPath = './schemas/v1.0/deepmemo.json';
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Compiler le schéma
const validate = ajv.compile(schema);

// Lire le fichier à valider
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node validate-export.js <file.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Valider
const valid = validate(data);

if (valid) {
  console.log('✅ Validation réussie');

  // Statistiques
  const isGlobal = !!data.rootNodes;
  const isBranch = data.type === 'deepmemo-branch';
  const nodeCount = Object.keys(data.nodes).length;

  console.log(`\nType: ${isGlobal ? 'Global Export' : 'Branch Export'}`);
  console.log(`Nodes: ${nodeCount}`);

  if (isBranch) {
    console.log(`Branch Root: ${data.branchRootId}`);
    console.log(`Exported: ${new Date(data.exported).toISOString()}`);
  }

  if (isGlobal) {
    console.log(`Root Nodes: ${data.rootNodes.length}`);
  }

  // Validation sémantique supplémentaire
  console.log('\n🔍 Validation sémantique...');
  const errors = validateSemantics(data);

  if (errors.length === 0) {
    console.log('✅ Aucune erreur sémantique');
  } else {
    console.error(`❌ ${errors.length} erreur(s) sémantique(s):`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

} else {
  console.error('❌ Validation échouée\n');
  validate.errors.forEach(err => {
    console.error(`  - ${err.instancePath || '/'}: ${err.message}`);
    if (err.params) {
      console.error(`    Params: ${JSON.stringify(err.params)}`);
    }
  });
  process.exit(1);
}

/**
 * Validation sémantique (au-delà du schéma JSON)
 */
function validateSemantics(data) {
  const errors = [];
  const nodeIds = Object.keys(data.nodes);

  // 1. Vérifier cohérence type/ID
  for (const [nodeId, node] of Object.entries(data.nodes)) {
    if (node.type === 'node' && !nodeId.startsWith('node_')) {
      errors.push(`Node ${nodeId}: type='node' but ID doesn't start with 'node_'`);
    }
    if (node.type === 'symlink' && !nodeId.startsWith('symlink_')) {
      errors.push(`Node ${nodeId}: type='symlink' but ID doesn't start with 'symlink_'`);
    }
  }

  // 2. Vérifier références parent/children
  for (const node of Object.values(data.nodes)) {
    // Parent existe
    if (node.parent && !data.nodes[node.parent]) {
      errors.push(`Node ${node.id}: parent ${node.parent} not found`);
    }

    // Children existent
    for (const childId of node.children) {
      if (!data.nodes[childId]) {
        errors.push(`Node ${node.id}: child ${childId} not found`);
      }
    }

    // TargetId existe (symlinks)
    if (node.type === 'symlink' && node.targetId && !data.nodes[node.targetId]) {
      errors.push(`Symlink ${node.id}: target ${node.targetId} not found`);
    }
  }

  // 3. Vérifier rootNodes (export global)
  if (data.rootNodes) {
    for (const rootId of data.rootNodes) {
      if (!data.nodes[rootId]) {
        errors.push(`Root node ${rootId} not found in nodes`);
      } else if (data.nodes[rootId].parent !== null) {
        errors.push(`Root node ${rootId} has a parent (should be null)`);
      }
    }
  }

  // 4. Vérifier branchRootId (export branch)
  if (data.type === 'deepmemo-branch') {
    if (!data.nodes[data.branchRootId]) {
      errors.push(`Branch root ${data.branchRootId} not found in nodes`);
    }
  }

  // 5. Détecter cycles
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
      errors.push(`Cycle detected involving node ${nodeId}`);
      break; // Un cycle suffit
    }
  }

  return errors;
}
```

**Installation** :
```bash
npm install ajv ajv-formats
```

**Usage** :
```bash
node scripts/validate-export.js deepmemo-export-1706123456789.json
```

**Sortie succès** :
```
✅ Validation réussie

Type: Global Export
Nodes: 42
Root Nodes: 3

🔍 Validation sémantique...
✅ Aucune erreur sémantique
```

**Sortie erreur** :
```
❌ Validation échouée

  - /nodes/node_123: missing property 'title'
    Params: {"missingProperty":"title"}
  - /nodes/symlink_456: must have required property 'targetId'
    Params: {"missingProperty":"targetId"}
```

---

## Erreurs Courantes

### Erreurs de Format

#### 1. ID invalide

**Erreur** :
```
/nodes/invalid_id: does not match pattern "^(node|symlink)_\d+_[a-z0-9_]+$"
```

**Cause** : Format d'ID incorrect

**Solutions** :
- ✅ IDs de nœuds : `node_{timestamp}_{random}` (caractères autorisés : `a-z`, `0-9`, `_`)
- ✅ IDs de symlinks : `symlink_{timestamp}_{random}` (caractères autorisés : `a-z`, `0-9`, `_`)
- ✅ IDs d'attachments : Format flexible (`a-z`, `0-9`, `_`)

**Exemples valides** :
```
node_1706123456789_abc123def
node_1706123456789_my_custom_node
symlink_1706123456790_ghi456jkl
attach_1706123456791_mno789pqr
demo_mindmap_svg
```

---

#### 2. Propriété manquante

**Erreur** :
```
/nodes/node_123: must have required property 'title'
```

**Cause** : Propriété obligatoire absente

**Solution** : Ajouter la propriété requise

**Propriétés obligatoires pour un node** :
- `id`, `title`, `type`, `parent`, `children`, `created`, `modified`

---

#### 3. Type invalide

**Erreur** :
```
/nodes/node_123/type: must be equal to one of the allowed values
Params: {"allowedValues":["node","symlink"]}
```

**Cause** : Valeur de `type` incorrecte

**Solution** :
```json
{
  "type": "node"  // ✅ Ou "symlink"
}
```

**Valeurs invalides** :
```json
{
  "type": "Node"     // ❌ Majuscule
  "type": "regular"  // ❌ Valeur non définie
  "type": ""         // ❌ Vide
}
```

---

#### 4. Symlink sans targetId

**Erreur** :
```
/nodes/symlink_123: must have required property 'targetId'
```

**Cause** : Symlink sans référence à la cible

**Solution** :
```json
{
  "id": "symlink_1706123456789_abc123",
  "type": "symlink",
  "title": "→ Ma Référence",
  "targetId": "node_1706123456790_def456",  // ✅ Requis
  "parent": null,
  "children": [],
  "created": 1706000000000,
  "modified": 1706000000000
}
```

---

#### 5. Node avec targetId

**Erreur** :
```
/nodes/node_123: must NOT have additional properties
Params: {"additionalProperty":"targetId"}
```

**Cause** : Node régulier avec `targetId` (réservé aux symlinks)

**Solution** : Retirer `targetId` ou changer `type` en `"symlink"`

---

### Erreurs de Structure

#### 6. Export global incomplet

**Erreur** :
```javascript
alert('Fichier JSON invalide');
```

**Cause** : Propriétés `nodes` ou `rootNodes` manquantes

**Solution** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": { /* ... */ },      // ✅ Requis
  "rootNodes": [ /* ... */ ]    // ✅ Requis
}
```

---

#### 7. Export branch incomplet

**Erreur** :
```javascript
alert('Fichier invalide. Format non reconnu.');
```

**Cause** : Propriétés requises manquantes pour un export branch

**Solution** :
```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",         // ✅ Requis
  "version": "1.0",                  // ✅ Requis
  "branchRootId": "node_...",        // ✅ Requis
  "exported": 1706123456789,         // ✅ Requis
  "nodeCount": 5,                    // ✅ Requis
  "nodes": { /* ... */ }             // ✅ Requis
}
```

---

### Erreurs Sémantiques

#### 8. Référence parent inexistante

**Détection** : Script de validation sémantique

**Erreur** :
```
Node node_123: parent node_999 not found
```

**Cause** : `node.parent` pointe vers un ID inexistant

**Solution** : Vérifier que tous les IDs de parents existent dans `nodes`

---

#### 9. Référence child inexistante

**Erreur** :
```
Node node_123: child node_456 not found
```

**Cause** : `node.children[]` contient un ID inexistant

**Solution** : Retirer l'ID ou ajouter le nœud manquant

---

#### 10. Cycle dans la hiérarchie

**Erreur** :
```
Cycle detected involving node node_123
```

**Cause** : Structure circulaire (A → B → C → A)

**Solution** : Briser le cycle en modifiant les références parent/children

---

#### 11. Racine avec parent

**Erreur** :
```
Root node node_123 has a parent (should be null)
```

**Cause** : Nœud dans `rootNodes[]` mais avec `parent !== null`

**Solution** :
```json
{
  "rootNodes": ["node_123"],
  "nodes": {
    "node_123": {
      "parent": null  // ✅ Doit être null pour les racines
    }
  }
}
```

---

## Migration de Schémas

### Versioning

**Version actuelle** : `v1.0`

**Stratégie de migration** :
1. Nouvelles versions dans `schemas/v{major}.{minor}/`
2. Propriété `version` dans les exports branch
3. Rétrocompatibilité garantie (lecture anciens formats)
4. Conversion automatique à l'import

---

### Format Futur (v2.0 - hypothétique)

**Changements potentiels** :
- Ajout de nouveaux types de nœuds (ex: `"folder"`, `"link"`)
- Propriétés supplémentaires (ex: `color`, `icon`)
- Métadonnées enrichies (ex: `author`, `contributors`)

**Migration** :
```javascript
// Détection version
if (imported.version === '1.0') {
  // Import v1.0 (actuel)
} else if (imported.version === '2.0') {
  // Import v2.0 avec conversion si nécessaire
}
```

📍 **Référence** : Migration planifiée (pas encore implémentée)

---

## Référence Rapide

### Schémas Disponibles

| Schéma | Chemin | Usage |
|--------|--------|-------|
| **deepmemo.json** | `schemas/v1.0/deepmemo.json` | Fichiers data.json (exports .json et .dm) |
| **metadata.json** | `schemas/v1.0/metadata.json` | Fichier metadata.json (archives .dm) |

---

### URLs Publiques

| Ressource | URL |
|-----------|-----|
| **Schéma données** | `https://deepmemo.org/schemas/v1.0/deepmemo.json` |
| **Schéma métadonnées** | `https://deepmemo.org/schemas/v1.0/metadata.json` |

---

### Validation Code Source

| Opération | Fonction | Fichier | Validation |
|-----------|----------|---------|------------|
| **Import global JSON** | `importFromJSONText()` | `data.js:900` | `validateGlobalExport()` + normalization |
| **Import branch JSON** | `importBranchFromJSONText()` | `data.js:1239` | `validateBranchExport()` ou `validateGlobalExport()` |
| **Import archive .dm** | `importFromArchive()` | `data.js:729` | `validateGlobalExport()` + `validateMetadata()` |
| **Validation global** | `validateGlobalExport()` | `validation.js:167` | Schéma + références + cycles |
| **Validation branch** | `validateBranchExport()` | `validation.js:206` | Schéma + références + cycles |
| **Validation metadata** | `validateMetadata()` | `validation.js:252` | Warnings uniquement |

---

### Commandes de Validation

**Validation avec ajv-cli** :
```bash
# Export global
ajv validate -s https://deepmemo.org/schemas/v1.0/deepmemo.json \
             -d deepmemo-export-*.json

# Export branch
ajv validate -s https://deepmemo.org/schemas/v1.0/deepmemo.json \
             -d deepmemo-branch-*.json

# Métadonnées
ajv validate -s https://deepmemo.org/schemas/v1.0/metadata.json \
             -d metadata.json
```

**Validation avec check-jsonschema** :
```bash
check-jsonschema --schemafile schemas/v1.0/deepmemo.json export.json
```

**Script Node.js** :
```bash
node scripts/validate-export.js deepmemo-export-*.json
```

---

### Patterns de Validation

| Élément | Pattern | Exemple |
|---------|---------|---------|
| **Node ID** | `^node_\d+_[a-z0-9_]+$` | `node_1706123456789_abc123def` ou `node_1234567890_my_node` |
| **Symlink ID** | `^symlink_\d+_[a-z0-9_]+$` | `symlink_1706123456790_ghi456jkl` |
| **Attachment ID** | `^attach_\d+_[a-z0-9_]+$` | `attach_1706123456791_abc123` |
| **Version** | `^\d+\.\d+$` | `1.0` |

---

## Voir Aussi

- [json-interchange.md](json-interchange.md) - Format JSON Interchange (structure complète)
- [DM-FORMAT.md](DM-FORMAT.md) - Format Archive .dm (ZIP avec attachments)
- [3-DATA-MODEL.md](../../3-DATA-MODEL.md) - Modèle de données complet

---

**Dernière mise à jour** : 2026-02-02 | **Version** : V0.10.5
