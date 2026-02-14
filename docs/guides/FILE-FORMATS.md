# Export/Import File Formats

> Guide utilisateur des formats supportés par DeepMemo
>
> **Version** : V0.11.0
> **Mise à jour** : 2026-02-13

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Export Global vs Export de Branche](#export-global-vs-export-de-branche)
3. [Formats d'Export](#formats-dexport)
   - [Archive .dm (Export complet)](#1-archive-dm-export-complet)
   - [Fichier Mind Map (.mm)](#2-fichier-mind-map-mm)
   - [Image Mind map (.svg)](#3-image-mind-map-svg)
   - [Export PDF](#4-export-pdf)
   - [Export Filesystem](#5-export-filesystem)
4. [Extraction du JSON](#extraction-du-json)
5. [Import](#import)
6. [Workflows Pratiques](#workflows-pratiques)

---

## Vue d'ensemble

DeepMemo propose plusieurs formats d'export pour répondre à différents besoins. Voici un aperçu rapide :

| Format | Extension | Attachments | Cas d'usage |
|--------|-----------|-------------|-------------|
| **Archive .dm** | `.dm` | ✅ Inclus | Backup complet, migration, partage avec fichiers |
| **Fichier Mind Map** | `.mm` | ❌ | Ouvrir dans Freeplane, XMind, FreeMind |
| **Image Mind map** | `.svg` | ❌ | Visualisation graphique, présentation |
| **Export PDF** | `.pdf` | ⚠️ Limité | Document imprimable avec table des matières |
| **Export Filesystem** | Dossier | ✅ Phase 1 | Synchronisation avec Obsidian, éditeurs markdown |

**Quand utiliser chaque format ?**

- **Backup régulier** → Archive .dm (complet avec attachments)
- **Partage avec collègues** → PDF (lecture seule) ou Archive .dm (collaboratif)
- **Migration vers autre outil** → Fichier Mind Map (.mm) ou Filesystem
- **Visualisation** → Image Mind map (.svg)
- **Analyse par LLM** → Extraction JSON depuis .dm

---

## Export Global vs Export de Branche

DeepMemo permet d'exporter soit **toute votre structure**, soit **une branche spécifique**.

### Export Global

**Contenu** : Tous les nœuds racines et leurs descendants.

**Quand l'utiliser ?**
- Backup complet
- Migration vers nouvelle installation
- Partage de toute votre base de connaissances

**Comment faire ?**
1. Cliquer sur "⬇️ Export" dans la barre d'outils
2. Choisir le format souhaité
3. Le fichier contiendra tous vos nœuds

### Export de Branche

**Contenu** : Un nœud sélectionné et tous ses descendants.

**Quand l'utiliser ?**
- Partage d'un projet spécifique
- Export d'une section pour un collègue
- Génération de documentation d'un module

**Comment faire ?**
1. Sélectionner le nœud racine de la branche
2. Cliquer sur "⬇️ Export branche" dans le panneau de droite
3. Choisir le format souhaité
4. Le fichier contiendra uniquement cette branche

**Note importante** : Si vous êtes en **Branch Mode** (mode focus sur une branche), l'export global exportera uniquement la branche affichée, pas toute votre structure.

---

## Formats d'Export

### 1. Archive .dm (Export complet)

**Format** : Fichier ZIP avec extension `.dm`

**Contenu** : Structure complète avec métadonnées, données JSON et fichiers attachés.

#### Structure de l'archive

Quand vous ouvrez un fichier `.dm` avec un outil ZIP, vous trouverez :

```
deepmemo-export-1706123456789.dm
├── metadata.json          # Informations sur l'export
├── data.json              # Vos nœuds et leur structure
└── attachments/           # Dossier des pièces jointes
    ├── attach_123_screenshot.png
    ├── attach_456_document.pdf
    └── ...
```

#### metadata.json

Ce fichier contient des informations sur l'export :

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

- `type` : `"global"` (export complet) ou `"branch"` (sous-arbre uniquement)
- `exported` : Date/heure de l'export (timestamp Unix)
- `nodeCount` : Nombre de nœuds exportés
- `attachmentCount` : Nombre de fichiers attachés
- `totalSize` : Taille totale en octets

#### data.json

Contient la structure complète de vos données :

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123": {
      "id": "node_123",
      "title": "Mon projet",
      "content": "# Description\n\nContenu markdown...",
      "type": "node",
      "parent": null,
      "children": ["node_456", "node_789"],
      "tags": ["work", "important"],
      "attachments": [...],
      "created": 1705000000000,
      "modified": 1705100000000
    }
  },
  "rootNodes": ["node_123"]
}
```

#### Dossier attachments/

Les fichiers sont nommés : `{attachmentId}_{filename}`

Exemple : `attach_1706123456789_abc123_screenshot.png`

#### Comment exporter ?

**Export global** :
1. Cliquer sur "⬇️ Export" dans la barre d'outils
2. Choisir "📦 Archive ZIP (.dm)"
3. Le fichier `deepmemo-export-{timestamp}.dm` se télécharge

**Export de branche** :
1. Sélectionner un nœud
2. Cliquer sur "⬇️ Export branche" dans le panneau de droite
3. Choisir "📦 Archive ZIP (.dm)"
4. Le fichier `deepmemo-branch-{titre}-{timestamp}.dm` se télécharge

#### Avantages

✅ **Complet** : Inclut tous les attachments (images, PDF, etc.)
✅ **Réimportable** : Peut être réimporté dans DeepMemo sans perte
✅ **Portable** : Archive autonome, facile à partager
✅ **Analysable** : JSON lisible, schéma validé

#### Limites

⚠️ Taille limitée par le navigateur (généralement 500MB - 1GB)

---

### 2. Fichier Mind Map (.mm)

**Format** : XML FreeMind compatible avec Freeplane, XMind, FreeMind.

**Contenu** : Structure hiérarchique uniquement (titres des nœuds).

> 📖 **Pour les détails techniques complets** : Voir [MM-FORMAT.md](../reference/file-formats/MM-FORMAT.md) (spécification XML, conversion, limitations)

#### À quoi ça ressemble ?

```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Mon projet" ID="node_123">
    <node TEXT="Tache 1" ID="node_456">
      <node TEXT="Sous-tache" ID="node_789"/>
    </node>
  </node>
</map>
```

#### Comment exporter ?

1. Ouvrir la modale d'export (bouton "⬇️ Export" ou "⬇️ Export branche")
2. Choisir "🧠 Fichier Mind Map (.mm)"
3. Le fichier `.mm` se télécharge

#### Ouvrir le fichier

Le fichier `.mm` peut être ouvert dans :
- **Freeplane** (recommandé, gratuit, open-source)
- **XMind** (version complète recommandée)
- **FreeMind** (ancien mais compatible)

#### Ce qui est exporté

✅ Titres des nœuds
✅ Structure hiérarchique (parent-child)
✅ IDs des nœuds (pour référence)
✅ Contenu markdown (exporté comme note HTML via `<richcontent TYPE="NOTE">`)

#### Ce qui n'est PAS exporté

❌ Tags
❌ Attachments
❌ Dates de création/modification
❌ Emojis (supprimés pour compatibilité)

#### Pourquoi les emojis sont supprimés ?

Certains logiciels Mind Map anciens ne supportent pas bien les emojis. Pour assurer une compatibilité maximale, DeepMemo les retire automatiquement du titre lors de l'export.

**Exemple** :
- Dans DeepMemo : `🚀 Mon projet`
- Dans le .mm : `Mon projet`

#### Cas d'usage

- **Migration** vers Freeplane/XMind
- **Visualisation** dans un autre outil
- **Collaboration** avec des utilisateurs de mindmapping traditionnel

---

### 3. Image Mind map (.svg)

**Format** : SVG (Scalable Vector Graphics) généré via Mermaid.

**Contenu** : Diagramme graphique de votre structure.

#### À quoi ça ressemble ?

L'export génère une image vectorielle représentant votre arborescence sous forme de diagramme :

```
┌─────────────┐
│ Mon projet  │
└──────┬──────┘
       │
       ├─── Tâche 1
       │     └─── Sous-tâche
       │
       └─── Tâche 2
```

(Mais en version graphique vectorielle, avec couleurs et style Mermaid)

#### Comment exporter ?

1. Ouvrir la modale d'export
2. Choisir "📊 Image Mind map (.svg)"
3. L'image SVG se télécharge

**Note** : Nécessite que la bibliothèque Mermaid soit chargée (disponible par défaut dans DeepMemo).

#### Caractéristiques

✅ **Vectoriel** : Qualité parfaite quel que soit le zoom
✅ **Léger** : Fichier SVG compact
✅ **Modifiable** : Peut être édité dans Inkscape, Illustrator, etc.
✅ **Universel** : Affichable dans tout navigateur web

#### Limites

❌ **Lecture seule** : Pas réimportable dans DeepMemo
❌ **Contenu limité** : Uniquement les titres, pas le contenu markdown
❌ **Arbres larges** : Peut être difficile à lire pour de très grandes structures

#### Cas d'usage

- **Présentation** : Inclure dans slides PowerPoint/Google Slides
- **Documentation** : Ajouter à un wiki ou README
- **Vue d'ensemble** : Visualiser rapidement une branche complexe
- **Impression** : Format idéal pour l'impression haute qualité

---

### 4. Export PDF

**Format** : Document PDF avec table des matières cliquable.

**Contenu** : Titres + contenu markdown converti en HTML, hiérarchie préservée.

DeepMemo propose **deux méthodes** pour générer des PDFs :

#### Méthode 1 : Génération en ligne (CloudFlare Worker)

**URL** : `https://pdf.deepmemo.org/generate`

**Comment ça marche ?**

1. DeepMemo envoie votre branche à un serveur CloudFlare
2. Le serveur génère le PDF avec Puppeteer (Chromium headless)
3. Le PDF vous est retourné
4. **Rien n'est sauvegardé** sur le serveur

**Limites de taux** (Rate limits) :
- ⏱️ **5 PDFs par heure**
- 📅 **20 PDFs par jour**

Les limites sont calculées par adresse IP (hashée pour confidentialité, conservée 24h maximum).

**Notice de confidentialité**

Lors du premier export PDF, DeepMemo affiche une notice vous informant que :
- Votre contenu est envoyé à un serveur CloudFlare
- Seul un hash de votre IP est conservé (24h pour rate limiting)
- Aucune donnée de contenu n'est sauvegardée
- Le serveur vérifie l'origine de la requête (anti-abus)

**Statut actuel** : ✅ Le worker CloudFlare est **déployé en production** et disponible à l'adresse `https://pdf.deepmemo.org/generate`.

#### Méthode 2 : Génération locale (CLI)

**Installation** :

```bash
cd bin
npm install
```

Sur Linux, pour le support des emojis couleur :
```bash
sudo apt-get install fonts-noto-color-emoji
```

**Usage** :

1. Exporter une branche en format `.dm` ou JSON depuis DeepMemo
2. Générer le PDF avec le CLI :

```bash
node branch2pdf.js mon_export.dm output.pdf
```

**Fonctionnalités** :

✅ **Table des matières** hiérarchique avec liens cliquables
✅ **Markdown complet** : Titres, listes, code, citations, tableaux
✅ **Symlinks** : Affiche le contenu du nœud cible
✅ **Pagination** : Saut de page après chaque nœud
✅ **Emojis couleur** (avec fonts sur Linux)
✅ **Debug HTML** : Génère `debug.html` pour prévisualiser

**Limites actuelles** :
⚠️ **Images** : Les attachments inline ne sont pas encore inclus
⚠️ **Symlinks** : Résolution simple uniquement (pas récursive)

#### Comparaison des deux méthodes

| Critère | En ligne (CloudFlare) | Local (CLI) |
|---------|----------------------|-------------|
| **Installation** | Aucune | Node.js + npm install |
| **Limites** | 5/h, 20/j | ∞ Illimité |
| **Confidentialité** | Envoi serveur | 100% local |
| **Qualité** | Identique | Identique |
| **Emojis** | ✅ | ✅ (avec fonts) |
| **Offline** | ❌ Nécessite connexion | ✅ Fonctionne offline |
| **Images inline** | ⚠️ Limité | ✅ Base64 embedded |
| **Symlinks** | ⚠️ À vérifier | ✅ Résolution auto |
| **Statut** | ✅ Déployé | ✅ Fonctionnel |

**Recommandation** :
- Pour un usage occasionnel → Version en ligne
- Pour un usage fréquent ou sensible → Version locale CLI

---

### 5. Export Filesystem

**Format** : Hiérarchie de dossiers et fichiers Markdown.

**Contenu** : Structure de répertoires miroir avec fichiers `.md` + attachments.

#### Structure générée

```
Export Mon Projet/
├── Mon projet.md               # Nœud racine
├── Tache 1/                    # Dossier pour enfants de Tache 1
│   ├── index.md                # Contenu de Tache 1
│   ├── Sous tache.md           # Enfant 1.1
│   └── screenshot_attach_123.png  # Attachment (à côté du .md)
└── Tache 2.md                  # Enfant 2
```

**Note** : La sanitisation utilise la fonction unifiée `sanitizeFilename()` (`helpers.js`) avec différentes options selon le contexte :
- **Export FS** : `{ preserveSpaces: true, maxLength: 200 }` → Espaces préservés, noms lisibles
- **Export archives/PDF** : `{ maxLength: 50 }` → Tirets, compact, web-friendly

Seuls les caractères interdits Windows (`/:*?"<>|`) et points en début de nom sont remplacés par `_` en mode FS.

#### Format des fichiers Markdown

Chaque nœud devient un fichier `.md` avec **frontmatter YAML** :

```markdown
---
id: node_1706123456789_abc123
title: Ma tâche
tags:
  - work
  - important
created: 2024-01-25T10:30:00.000Z
modified: 2024-01-26T15:45:00.000Z
---

# Ma tâche

Contenu markdown ici...

![Screenshot](screenshot__attach_123.png)
```

> **Note** : Les références `attachment:` de DeepMemo sont converties en chemins relatifs vers les fichiers exportés.

#### Frontmatter YAML

Les métadonnées sont stockées en en-tête :

- `id` : ID unique du nœud (pour réimport)
- `title` : Titre du nœud
- `tags` : Liste des tags (format YAML array)
- `created` : Date de création (ISO 8601)
- `modified` : Date de dernière modification (ISO 8601)

#### Attachments

Les pièces jointes sont copiées **à côté du fichier `.md`** avec un nom qui inclut l'ID :

**Format de nommage** : `{nom_fichier}__{attachment_id}.{extension}`

**Exemples** :
- `screenshot__attach_123.png`
- `document__attach_456.pdf`

Les références dans le markdown sont converties :
- DeepMemo : `![Screenshot](attachment:attach_123_screenshot.png)`
- Filesystem : `![Screenshot](screenshot__attach_123.png)`

#### Compatibilité

**Obsidian** : ✅ Compatible (frontmatter YAML reconnu)
**Notion** : ⚠️ Import markdown supporté, mais frontmatter peut nécessiter traitement
**Logseq** : ⚠️ Format différent, conversion nécessaire
**VSCode + extensions** : ✅ Compatible

#### Statut actuel : Phase 1 complète

L'export/import Filesystem est en **Phase 1**, ce qui signifie :

✅ **Export** : Export vers dossier local fonctionnel
✅ **Import** : Import depuis dossier local fonctionnel (avec régénération des IDs)
✅ **Structure** : Hiérarchie préservée à l'export et import
✅ **Attachments** : Inclus et référencés correctement
⚠️ **Sync bidirectionnel** : Pas encore disponible (prévu Phase 2)
⚠️ **Watch mode** : Pas encore disponible (prévu Phase 3)

#### Comment exporter ?

**Prérequis** : Navigateur compatible File System Access API (Chrome/Edge).

1. Sélectionner un nœud (ou exporter la racine)
2. Cliquer sur "💾 Export to Filesystem" dans les options
3. Choisir un dossier de destination
4. Confirmer l'écriture des fichiers

**Note** : Firefox et Safari ne supportent pas encore cette API. Une alternative (export ZIP puis extraction manuelle) sera proposée ultérieurement.

#### Comment importer ?

**Prérequis** : Navigateur compatible File System Access API (Chrome/Edge).

1. Cliquer sur "📥 Import from Filesystem" dans les options
2. Sélectionner le dossier contenant les fichiers `.md`
3. DeepMemo scanne récursivement la structure
4. Les IDs sont **régénérés automatiquement** pour éviter les conflits
5. Les attachments sont importés et références mises à jour

**Import gracieux** : Compatible avec exports Obsidian, Notion, ou tout dossier markdown avec frontmatter YAML.

**Régénération des IDs** : Tous les IDs de nodes et attachments sont recréés, garantissant l'unicité.

#### Cas d'usage

- **Backup lisible** : Archive en format standard markdown
- **Édition externe** : Modifier dans VSCode, Obsidian, etc.
- **Versioning Git** : Tracker les changements avec Git
- **Collaboration** : Partager via GitHub/GitLab

---

## Extraction du JSON

**Objectif** : Extraire le fichier `data.json` d'une archive `.dm` pour analyse.

### Pourquoi extraire le JSON ?

Le JSON est un format universel lisible par :
- **LLMs** (Claude, GPT) pour analyse de contenu
- **Scripts** Python/Node.js pour traitement automatique
- **Outils d'analyse** de données
- **Validateurs** de schéma JSON

### Comment extraire ?

#### Méthode 1 : Outil ZIP

L'archive `.dm` est un fichier ZIP standard :

1. Renommer `mon_export.dm` en `mon_export.zip`
2. Ouvrir avec WinZip, 7-Zip, ou l'outil natif de votre OS
3. Extraire `data.json`

#### Méthode 2 : Ligne de commande

**Linux/Mac** :
```bash
unzip deepmemo-export.dm data.json
```

**Windows PowerShell** :
```powershell
Expand-Archive -Path deepmemo-export.dm -DestinationPath extracted
```

### Structure du JSON

Le fichier `data.json` contient :

```json
{
  "$schema": "https://deepmemo.org/schemas/v1.0/deepmemo.json",
  "nodes": {
    "node_123": { /* nœud 1 */ },
    "node_456": { /* nœud 2 */ }
  },
  "rootNodes": ["node_123"]
}
```

**Schéma validé** : Le JSON respecte le schéma officiel disponible à l'URL indiquée dans `$schema`.

### Cas d'usage

**Analyse par LLM** :
```
Prompt : "Analyse ce JSON DeepMemo et génère un résumé des tâches par tag"
```

**Script d'analyse** :
```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Compter les nœuds par tag
const tagCounts = {};
Object.values(data.nodes).forEach(node => {
  node.tags?.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
});
console.log(tagCounts);
```

**Validation** :
```bash
# Avec ajv-cli
ajv validate -s https://deepmemo.org/schemas/v1.0/deepmemo.json -d data.json
```

### Note importante

Le JSON extrait ne contient **que les métadonnées** des attachments, pas les fichiers binaires. Pour les fichiers, extraire le dossier `attachments/` de l'archive.

---

## Import

DeepMemo permet d'importer des données depuis plusieurs formats.

### Import Global

**Effet** : Remplace ou fusionne avec votre structure actuelle.

#### Formats supportés

- Archive `.dm` (recommandé)
- Fichier JSON (format DeepMemo)
- Archive `.zip` (legacy)

**Auto-détection** : DeepMemo détecte automatiquement le format.

#### Comment importer ?

1. Cliquer sur "📥 Import" dans la barre d'outils
2. Sélectionner le fichier (`.dm`, `.json`, ou `.zip`)
3. Une confirmation apparaît

#### Confirmation utilisateur

DeepMemo affiche une modale avec deux choix :

**"OK" (Remplacer)** :
- ⚠️ **Destructif** : Supprime toutes vos données actuelles
- Remplace par les données importées
- **À utiliser pour** : Restaurer un backup, migration complète

**"Cancel" (Fusionner)** :
- ✅ **Sûr** : Conserve vos données actuelles
- Ajoute les nœuds importés comme nouvelles racines
- **À utiliser pour** : Importer un projet supplémentaire

**Exemple de message** :
```
Import 42 nodes.

Click OK to REPLACE all current data.
Click Cancel to ADD to current roots (merge).
```

#### Import avec attachments

Si l'archive contient des fichiers (`.dm`), une seconde confirmation précise le nombre de fichiers :

```
Replace all your data with 42 nodes and 8 files?
```

Les attachments sont restaurés dans IndexedDB et réassociés automatiquement.

#### Gestion des conflits d'IDs

**Comportement** :
- En **mode Remplacer** : Pas de conflit (tout est remplacé)
- En **mode Fusionner** : Les IDs identiques sont **écrasés** (nœud importé prioritaire)

**Prévention** : DeepMemo génère des IDs avec timestamp + random, les collisions sont quasi-impossibles.

### Import de Branche

**Effet** : Ajoute une branche comme enfant d'un nœud existant.

#### Comment importer ?

1. Sélectionner le nœud parent (où attacher la branche)
2. Cliquer sur "📤 Import branche" dans le panneau de droite
3. Sélectionner le fichier (`.dm`, `.json`)
4. Confirmer

#### Régénération des IDs

Pour éviter les conflits, DeepMemo **régénère automatiquement tous les IDs** de la branche importée :

1. Génère de nouveaux IDs pour tous les nœuds
2. Met à jour toutes les références (parent, children, targetId)
3. Remplace les IDs dans les contenus markdown (`attachment:xxx`)
4. Préserve les relations hiérarchiques

**Exemple** :
```
Import → node_123 devient node_789 (nouveau)
Références mises à jour → attachment:node_123 → attachment:node_789
```

#### Import d'export global comme branche

Si vous importez un **export global** en tant que branche :

**Cas 1 : Une seule racine**
- La racine devient enfant du nœud parent

**Cas 2 : Plusieurs racines**
- DeepMemo crée un **nœud conteneur** :
  - Titre : `Imported: {nom_fichier}`
  - Enfants : Toutes les racines importées
- Ce conteneur devient enfant du nœud parent

#### Restauration des attachments

Les fichiers du dossier `attachments/` sont :
1. Restaurés dans IndexedDB avec nouveaux IDs (remapping)
2. Références mises à jour dans les métadonnées
3. Références markdown converties automatiquement

---

## Workflows Pratiques

### 1. Backup régulier

**Objectif** : Sauvegarder régulièrement votre travail.

**Workflow** :
1. Export Global → Archive .dm
2. Renommer : `deepmemo-backup-2024-01-29.dm`
3. Conserver plusieurs versions (rotation 7 derniers jours)
4. Stocker sur cloud (Dropbox, Google Drive, etc.)

**Fréquence recommandée** : Hebdomadaire minimum, quotidien pour usage intensif.

**Automatisation** : Créer un rappel calendrier pour ne pas oublier.

### 2. Partage de projet avec collègue

**Objectif** : Partager une branche spécifique.

**Workflow** :
1. Sélectionner le nœud racine du projet
2. Export de branche → Archive .dm
3. Envoyer par email/Slack
4. Votre collègue : Import de branche → Choisir nœud parent

**Avantages** :
- IDs régénérés automatiquement (pas de conflit)
- Attachments inclus
- Peut être réimporté plusieurs fois

### 3. Documentation technique

**Objectif** : Générer une doc PDF pour distribution.

**Workflow** :
1. Organiser la branche documentation
2. Export de branche → PDF (CLI local)
3. Personnaliser CSS si nécessaire (`branch2pdf.js`)
4. Distribuer le PDF

**Alternative** :
- Export → Image Mind map (.svg) pour vue d'ensemble
- Inclure dans présentation PowerPoint

### 4. Migration vers Obsidian

**Objectif** : Migrer une branche vers Obsidian.

**Workflow** :
1. Sélectionner la branche
2. Export de branche → Filesystem
3. Choisir le vault Obsidian comme destination
4. Ouvrir Obsidian : Structure et attachments préservés

**Note** : Le frontmatter YAML est compatible Obsidian.

### 5. Analyse par LLM

**Objectif** : Faire analyser votre contenu par Claude/GPT.

**Workflow** :
1. Export Global ou Branche → Archive .dm
2. Extraire `data.json`
3. Coller dans Claude/GPT avec prompt :
   ```
   Voici ma structure DeepMemo en JSON.
   Génère un résumé par tag avec priorités.
   ```

**Alternative** : Utiliser l'API Claude directement dans un script.

### 6. Versioning Git

**Objectif** : Tracker les changements avec Git.

**Workflow** :
1. Export → Filesystem dans un dossier Git
2. Commit réguliers :
   ```bash
   git add .
   git commit -m "Update: ajout section X"
   git push
   ```
3. Historique complet disponible via `git log`

**Avantage** : Possibilité de revenir en arrière, branches Git pour expérimentation.

### 7. Visualisation pour présentation

**Objectif** : Inclure une visualisation dans des slides.

**Workflow** :
1. Export de branche → Image Mind map (.svg)
2. Ouvrir dans Inkscape/Illustrator (optionnel : ajustements)
3. Importer dans PowerPoint/Google Slides
4. Qualité vectorielle préservée au zoom

---

## Références

**Code source** :
- Export/Import : `src/js/core/data.js:182-949`
- Export Filesystem : `src/js/features/fs-sync.js`
- CLI PDF : `bin/branch2pdf.js`
- CloudFlare Worker : `cloudflare-worker/worker.js`

**Schémas JSON** :
- Format data : `schemas/v1.0/deepmemo.json`
- Metadata : `schemas/v1.0/metadata.json`

**Documentation technique** :
- Data Model : [docs/3-DATA-MODEL.md](../3-DATA-MODEL.md) (section Export Formats)
- Features : [docs/4-FEATURES.md](../4-FEATURES.md) (section Export/Import)
- Architecture : [docs/2-ARCHITECTURE.md](../2-ARCHITECTURE.md)

---

**Guide complet et vérifié** ✅

Tous les formats et workflows sont documentés avec références au code source.
Pour toute question ou suggestion d'amélioration, consulter la documentation technique ou ouvrir une issue sur GitHub.
