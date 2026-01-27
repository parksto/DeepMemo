# Référence des Formats de Fichiers DeepMemo

**Version :** 2.0
**Dernière mise à jour :** 2026-01-17

Ce document décrit tous les formats de fichiers utilisés par DeepMemo pour l'export et l'import de données.

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Format Archive .dm (Standard)](#format-archive-dm-standard)
3. [Format JSON d'Interchange](#format-json-dinterchange)
4. [Formats d'Export (Lecture Seule)](#formats-dexport-lecture-seule)
5. [Validation JSON Schema](#validation-json-schema)
6. [Migration depuis v1.0](#migration-depuis-v10)

---

## Vue d'ensemble

DeepMemo utilise **deux formats principaux** pour l'export/import de données :

### `.dm` (Archive DeepMemo) - **Format Standard**

Le format de fichier officiel DeepMemo. Pense au `.docx` pour Word ou `.psd` pour Photoshop.

- ✅ **Complet** : Inclut données + pièces jointes + métadonnées + icône
- ✅ **Pérenne** : Basé sur ZIP, extensible sans rupture de compatibilité
- ✅ **Intégration OS** : Extension personnalisée avec icône
- ✅ **Recommandé** pour tous les exports (globaux ou branches)

**Structure de fichier** : Archive ZIP contenant `data.json`, `metadata.json`, `icon.png`, et dossier `attachments/`.

### `.json` (Format d'Interchange) - **Usage Technique/LLM**

Un simple fichier JSON pour des cas d'usage techniques spécifiques.

- ✅ **Compatible LLM** : ChatGPT/Claude peuvent générer ce format directement
- ✅ **Éditable** : Texte brut, facile à modifier avec des scripts
- ✅ **Léger** : Pas de pièces jointes, pas de métadonnées
- ⚠️ **Limitation** : Ne peut pas inclure les fichiers joints (métadonnées uniquement)

**Utiliser quand** : Génération de données par IA, édition manuelle, partage ultra-léger.

---

## Format Archive .dm (Standard)

### Structure de Fichier

Un fichier `.dm` est une **archive ZIP** avec la structure suivante :

```
export.dm (archive ZIP)
├── metadata.json          # Métadonnées de l'export (version, type, date, etc.)
├── data.json             # Structure complète de l'arborescence
└── attachments/          # Fichiers joints (si présents)
    ├── attach_123_abc_document.pdf
    ├── attach_456_def_image.png
    └── ...
```

**Fichiers optionnels** (réservés pour usage futur) :
- `icon.png` - Icône visuelle (512×512) pour preview/app desktop
- `preview.html` - Preview HTML autonome

**Note** : Le fichier `.dm` est une archive ZIP standard - tu peux l'extraire avec n'importe quel outil ZIP (7zip, unzip, etc.).

### metadata.json

Contient les informations sur l'export lui-même :

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/metadata.json",
  "version": "1.0",
  "type": "branch",
  "title": "Documentation",
  "exported": 1737115200000,
  "branchRootId": "node_1234567890_abc",
  "nodeCount": 42,
  "attachmentCount": 5,
  "totalSize": 1048576,
  "generator": "DeepMemo v0.10.4"
}
```

**Champs** :
- `version` (string, requis) : Version du format (`"1.0"`)
- `type` (string, requis) : `"global"` ou `"branch"`
- `title` (string, optionnel) : Nom lisible de l'export
- `exported` (number, requis) : Timestamp d'export (Unix millisecondes)
- `branchRootId` (string, requis pour branch) : ID du nœud racine
- `nodeCount` (number, optionnel) : Nombre total de nœuds
- `attachmentCount` (number, optionnel) : Nombre total de fichiers joints
- `totalSize` (number, optionnel) : Taille totale des pièces jointes en octets
- `generator` (string, optionnel) : Identifiant du logiciel d'export

**Schema** : [`schemas/v1.0/metadata.json`](../schemas/v1.0/metadata.json)

### data.json

Contient l'arborescence complète. Le format dépend du type d'export.

#### Export Global

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123_abc": {
      "id": "node_123_abc",
      "title": "Mon Nœud",
      "content": "Contenu markdown...",
      "type": "note",
      "parent": null,
      "children": ["node_456_def"],
      "tags": ["important"],
      "attachments": [],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_456_def": { /* ... */ }
  },
  "rootNodes": ["node_123_abc"]
}
```

**Structure** :
- `nodes` (objet) : Dictionnaire de tous les nœuds, indexés par ID
- `rootNodes` (array) : IDs des nœuds racines

#### Export Branche

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123_abc",
  "exported": 1737115200000,
  "nodeCount": 2,
  "nodes": {
    "node_123_abc": { /* ... */ },
    "node_456_def": { /* ... */ }
  }
}
```

**Structure** :
- `type` (string) : Toujours `"deepmemo-branch"`
- `version` (string) : Version du format (`"1.0"`)
- `branchRootId` (string) : ID de la racine de la branche
- `exported` (number) : Timestamp d'export
- `nodeCount` (number) : Nombre de nœuds dans la branche
- `nodes` (objet) : Dictionnaire des nœuds de la branche uniquement

**Pas de tableau `rootNodes`** dans les exports de branche.

**Schema** : [`schemas/v1.0/deepmemo.json`](../schemas/v1.0/deepmemo.json)

### Structure d'un Nœud

Chaque nœud a la structure suivante :

```json
{
  "id": "node_1737115200000_abc",
  "title": "Titre du Nœud",
  "content": "Contenu markdown...",
  "type": "note",
  "parent": "parent_id",
  "children": ["child1_id", "child2_id"],
  "tags": ["tag1", "tag2"],
  "attachments": [
    {
      "id": "attach_1737115200456_xyz",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1234567
    }
  ],
  "created": 1737115200000,
  "modified": 1737115200000
}
```

**Champs requis** :
- `id` (string) : ID unique, format `node_{timestamp}_{random}`
- `title` (string) : Nom/titre du nœud (peut inclure des emojis)
- `type` (string) : `"note"` ou `"symlink"`
- `parent` (string|null) : ID du nœud parent, `null` pour les racines
- `children` (array) : IDs des nœuds enfants
- `created` (number) : Timestamp de création (Unix ms)
- `modified` (number) : Timestamp de dernière modification (Unix ms)

**Champs optionnels** :
- `content` (string) : Contenu texte en Markdown
- `tags` (array) : Chaînes de caractères de tags
- `attachments` (array) : Objets métadonnées des pièces jointes (voir ci-dessous)

#### Nœuds Symlink

Les symlinks ont un champ supplémentaire `targetId` :

```json
{
  "id": "symlink_1737115200000_xyz",
  "title": "Titre Personnalisé du Symlink",
  "type": "symlink",
  "targetId": "node_123_abc",
  "parent": "parent_id",
  "children": [],
  "created": 1737115200000,
  "modified": 1737115200000
}
```

**Important** :
- Le `title` est stocké sur le symlink lui-même (peut différer de la cible)
- Les symlinks n'ont généralement pas de `content` ou `children`
- `targetId` doit pointer vers un nœud existant dans le dataset

#### Objets Attachment (Pièces Jointes)

⚠️ **CRITIQUE** : Les attachments DOIVENT être un **tableau d'objets**, PAS de chaînes de caractères !

```json
{
  "id": "attach_1737115200456_xyz",
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 1234567
}
```

**Champs** :
- `id` (string) : ID unique, format `attach_{timestamp}_{random}`
- `name` (string) : Nom de fichier original avec extension
- `type` (string) : Type MIME (ex : `"image/png"`, `"application/pdf"`)
- `size` (number) : Taille du fichier en octets

**Séparation du stockage** :
- **Métadonnées** (id, name, type, size) : Stockées dans `data.json`
- **Blob** (fichier réel) : Stocké dans le dossier `attachments/`

### icon.png (Optionnel - Usage Futur)

**Statut** : Fichier optionnel, réservé pour fonctionnalité future

**Format** : Image PNG, 512×512 pixels recommandé

**Cas d'usage prévus** :
- Application desktop avec icônes personnalisées (nécessite app Tauri/Electron)
- Preview HTML embarquée (`preview.html`) avec icône visuelle
- Galerie UI DeepMemo des "exports récents"

**Implémentation actuelle** :
- ❌ Non généré à l'export
- ❌ Ignoré à l'import (si présent)
- ℹ️ La spécification réserve ce nom de fichier pour éviter les conflits dans les versions futures

**Génération future** (quand implémentée) :
- Extraire l'emoji du titre du nœud racine, rendre en PNG
- Fallback vers l'icône DeepMemo par défaut
- Icônes personnalisées uploadées par l'utilisateur

### Dossier attachments/

Contient les fichiers joints réels.

**Convention de nommage** : `{attachmentId}_{nomOriginal}`

Exemple :
```
attachments/
├── attach_1737115200456_xyz_document.pdf
└── attach_1737115300123_abc_screenshot.png
```

**Validation** :
- Les fichiers DOIVENT correspondre aux IDs référencés dans les tableaux `attachments` des nœuds
- Fichiers manquants : L'import réussit, mais les pièces jointes ne s'afficheront pas
- Fichiers extra : Ignorés (pas d'erreur)

### Comportement à l'Import

#### Import Global

- **Remplace TOUTES les données existantes** (opération destructive)
- Les IDs de nœuds sont **préservés** (pas de régénération)
- Les IDs de pièces jointes sont **préservés**
- L'utilisateur DOIT confirmer (toutes les données actuelles seront perdues)

#### Import Branche

- **Fusionne** avec les données existantes (non-destructif)
- Les IDs de nœuds sont **régénérés** pour éviter les conflits
- Les IDs de pièces jointes sont **régénérés**
- Les relations parent-enfant sont **remappées**
- La racine de la branche devient enfant du nœud parent sélectionné

---

## Format JSON d'Interchange

### Objectif

Un **simple fichier JSON** pour des cas d'usage techniques où le format `.dm` complet n'est pas nécessaire.

**Cas d'usage** :
- ✅ **Génération IA/LLM** : ChatGPT, Claude, etc. peuvent générer du JSON directement
- ✅ **Édition manuelle** : Modifier la structure dans un éditeur de texte
- ✅ **Scripting** : Parser/manipuler avec des outils JSON standard
- ✅ **Partage léger** : Branches sans pièces jointes

**Limitations** :
- ❌ **Pas de fichiers joints** (métadonnées uniquement)
- ❌ **Pas de métadonnées** (version, date d'export, icône, etc.)
- ❌ **Pas le format standard** (utiliser `.dm` pour les exports complets)

### Structure de Fichier

Le fichier `.json` contient **uniquement l'arborescence de données**, pas de métadonnées ni pièces jointes.

#### Format Global

```json
{
  "nodes": {
    "node_123_abc": { /* ... */ },
    "node_456_def": { /* ... */ }
  },
  "rootNodes": ["node_123_abc"]
}
```

#### Format Branche

```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_123_abc",
  "exported": 1737115200000,
  "nodeCount": 2,
  "nodes": {
    "node_123_abc": { /* ... */ },
    "node_456_def": { /* ... */ }
  }
}
```

**Schema** : Identique à `data.json` dans les archives `.dm` - [`schemas/v1.0/deepmemo.json`](schemas/v1.0/deepmemo.json)

### Génération avec IA/LLM

**Template de prompt pour ChatGPT/Claude** :

> Génère une branche DeepMemo au format JSON avec la structure suivante :
> - Nœud racine : "Machine Learning Basics"
> - Nœuds enfants : "Supervised Learning", "Unsupervised Learning", "Neural Networks"
> - Chaque nœud doit avoir du contenu markdown expliquant le concept
> - Utilise le format JSON d'interchange DeepMemo
>
> Suis cette structure :
> ```json
> {
>   "type": "deepmemo-branch",
>   "version": "1.0",
>   "branchRootId": "node_{timestamp}_{random}",
>   "exported": {current_timestamp_ms},
>   "nodeCount": {total_nodes},
>   "nodes": { /* ... */ }
> }
> ```

**Template de structure de nœud** :
```json
{
  "id": "node_{timestamp}_{random}",
  "title": "Titre du Nœud",
  "content": "Contenu markdown ici...",
  "type": "note",
  "parent": "parent_id_ou_null",
  "children": [],
  "tags": [],
  "created": {timestamp_ms},
  "modified": {timestamp_ms}
}
```

**Bonnes pratiques pour la génération LLM** :
1. Utiliser des timestamps réalistes (temps Unix actuel en millisecondes)
2. Assurer des liens parent-enfant bidirectionnels
3. Générer des IDs uniques (jamais réutiliser)
4. Utiliser `null` pour les parents des nœuds racines
5. Inclure du contenu markdown (supporte la spec CommonMark complète)
6. Peut référencer des pièces jointes dans les métadonnées, mais ne peut pas inclure les fichiers

### Import

DeepMemo **détecte automatiquement** et accepte les deux formats `.dm` et `.json` :

```javascript
// Auto-détection basée sur l'extension de fichier
if (file.name.endsWith('.dm')) {
  // Extraire le ZIP, lire data.json + attachments
} else if (file.name.endsWith('.json')) {
  // Parser le JSON directement
}
```

---

## Formats d'Export (Lecture Seule)

DeepMemo peut exporter vers des formats supplémentaires pour **usage externe** (non importables) :

### 1. FreeMind .mm (Mindmap)

Format mindmap basé XML compatible avec FreeMind/Freeplane/XMind.

**Fonctionnalités** :
- Structure hiérarchique préservée
- Symlinks rendus avec couleur orange + liens flèches
- Contenu des nœuds stocké dans éléments `<richcontent>`
- Emojis supprimés des titres pour compatibilité

**Cas d'usage** : Éditer/visualiser dans un logiciel de mindmap externe

**Détails** : Voir [file-formats/FREEMIND-FORMAT.md](file-formats/FREEMIND-FORMAT.md) (à créer)

### 2. Mermaid SVG (Diagramme Visuel)

Mindmap Mermaid rendu exporté en graphique vectoriel SVG.

**Fonctionnalités** :
- Représentation visuelle de l'arbre
- Entièrement rendu, prêt à visualiser
- Symlinks marqués avec préfixe 🔗
- Format vectoriel scalable

**Cas d'usage** : Inclure des diagrammes dans la documentation, présentations

**Détails** : Voir [file-formats/MERMAID-FORMAT.md](file-formats/MERMAID-FORMAT.md) (à créer)

### 3. Document PDF

Export PDF pour documentation imprimable et archivage long terme.

**Fonctionnalités** :
- Symlinks automatiquement résolus avec leur contenu
- Images inline (pièces jointes converties en base64)
- Table des matières hiérarchique
- Formatage responsive pour impression

**Deux implémentations** :
1. **En ligne** : CloudFlare Worker avec Browser Rendering API
   - Rate limiting (5 PDFs/heure, 20/jour) pour prévenir l'abus
   - IP hashée (SHA-256) pour la confidentialité
   - **Statut** : Code fonctionnel, pas encore déployé en production
2. **Offline** : Outil CLI avec Puppeteer (`bin/branch2pdf.js`)
   - Génération 100% locale
   - Pas de rate limits
   - Nécessite Node.js

**Détails** : Voir [`cloudflare-worker/README.md`](../cloudflare-worker/README.md)

---

## Validation JSON Schema

Toutes les structures JSON sont validées contre des JSON Schemas formels.

### Schemas Disponibles

1. **Structure de données** : [`schemas/v1.0/deepmemo.json`](schemas/v1.0/deepmemo.json)
   - Valide le contenu de `data.json`
   - Supporte les formats global et branche
   - Valide les nœuds, pièces jointes, relations

2. **Métadonnées** : [`schemas/v1.0/metadata.json`](schemas/v1.0/metadata.json)
   - Valide `metadata.json` dans les archives `.dm`
   - Assure que les champs requis sont présents

### Utilisation

**Exemple de validation (JavaScript)** :

```javascript
import Ajv from 'ajv';

// Charger le schema
const schema = await fetch('schemas/v1.0/deepmemo.json')
  .then(r => r.json());

// Compiler le validateur
const ajv = new Ajv();
const validate = ajv.compile(schema);

// Valider les données
const valid = validate(importedData);
if (!valid) {
  console.error('Erreurs de validation:', validate.errors);
  throw new Error('Format de données DeepMemo invalide');
}
```

**Exemple de validation (CLI)** :

```bash
# Utiliser ajv-cli
npm install -g ajv-cli
ajv validate -s schemas/v1.0/deepmemo.json -d export-data.json
```

### Règles de Validation

**Formats d'ID** :
- IDs de nœuds : `^(node|symlink)_\d+_[a-z0-9]+$`
- IDs de pièces jointes : `^attach_\d+_[a-z0-9]+$`

**Relations** :
- Si A a B dans `children`, B doit avoir A comme `parent`
- Les nœuds racines doivent avoir `parent === null`
- Les symlinks doivent avoir `targetId` pointant vers un nœud existant

**Timestamps** :
- Unix millisecondes (13 chiffres)
- Doit être >= 0

**Pièces jointes** :
- Doit être un tableau d'objets (pas de chaînes !)
- Chaque pièce jointe doit avoir `id`, `name`, `type`, `size`

---

## Migration depuis v1.0

**Changements dans v2.0** :

1. **Nouveau format standard** : `.dm` (archive ZIP) remplace le JSON autonome comme format d'export recommandé
2. **Fichier métadonnées** : Ajout de `metadata.json` à tous les exports `.dm`
3. **Support icône** : Ajout de `icon.png` aux archives
4. **JSON renommé** : Le JSON autonome est maintenant le "format d'interchange" (pas le format primaire)

**Rétrocompatibilité** :
- ✅ Les anciens exports `.json` fonctionnent toujours (auto-détectés à l'import)
- ✅ Les anciens exports ZIP sans métadonnées fonctionnent toujours (métadonnées optionnelles)
- ✅ Aucun changement cassant à la structure `data.json`

**Migration** :
- Aucune action requise - les exports existants continuent de fonctionner
- Les nouveaux exports utilisent le format `.dm` par défaut
- Les utilisateurs peuvent toujours exporter en `.json` pour les workflows LLM

---

## Exemples

### Archive .dm Complète (Branche)

**Fichier** : `documentation.dm`

**Contenu** :

**`metadata.json`** :
```json
{
  "version": "1.0",
  "type": "branch",
  "title": "Documentation",
  "exported": 1737115200000,
  "branchRootId": "node_abc",
  "nodeCount": 3,
  "attachmentCount": 1,
  "totalSize": 524288,
  "generator": "DeepMemo v0.10.4"
}
```

**`data.json`** :
```json
{
  "type": "deepmemo-branch",
  "version": "1.0",
  "branchRootId": "node_abc",
  "exported": 1737115200000,
  "nodeCount": 3,
  "nodes": {
    "node_abc": {
      "id": "node_abc",
      "title": "📚 Documentation",
      "content": "# Bienvenue\n\nHub principal de documentation.",
      "type": "note",
      "parent": null,
      "children": ["node_def", "symlink_ghi"],
      "tags": ["docs"],
      "attachments": [
        {
          "id": "attach_123",
          "name": "spec.pdf",
          "type": "application/pdf",
          "size": 524288
        }
      ],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "node_def": {
      "id": "node_def",
      "title": "Démarrage",
      "content": "## Installation\n\n...",
      "type": "note",
      "parent": "node_abc",
      "children": [],
      "tags": [],
      "attachments": [],
      "created": 1737115200000,
      "modified": 1737115200000
    },
    "symlink_ghi": {
      "id": "symlink_ghi",
      "title": "Référence Rapide",
      "type": "symlink",
      "targetId": "node_def",
      "parent": "node_abc",
      "children": [],
      "created": 1737115200000,
      "modified": 1737115200000
    }
  }
}
```

**`attachments/attach_123_spec.pdf`** : Fichier PDF binaire

---

## Voir Aussi

- [JSON Schema Specification](https://json-schema.org/)
- [SPEC-ATTACHMENTS.md](SPEC-ATTACHMENTS.md) - Système de pièces jointes détaillé
- [STORAGE.md](STORAGE.md) - Structure de stockage IndexedDB
- [I18N.md](I18N.md) - Internationalisation
- [CloudFlare Worker README](../cloudflare-worker/README.md) - Export PDF

---

## Historique des Versions

- **2.0** (2026-01-17) : Révision majeure
  - Format archive `.dm` comme nouveau standard
  - Ajout de la spécification `metadata.json`
  - Ajout de la validation JSON Schema
  - Renommage JSON en "format d'interchange"
  - Ajout du support icône
  - Clarification du workflow de génération LLM

- **1.0** (2026-01-02) : Spécification initiale
  - Format archive ZIP (global + branche)
  - Export FreeMind .mm
  - Export Mermaid SVG
  - Structure IndexedDB
  - Documentation complète du modèle de données
