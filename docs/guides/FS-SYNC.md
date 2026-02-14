# Synchronisation File System (FS)

> Guide utilisateur pour exporter et importer vos branches vers/depuis votre système de fichiers local
>
> **Version** : V0.11.0
> **Mise à jour** : 2026-02-13

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Exporter vers le système de fichiers](#exporter-vers-le-système-de-fichiers)
3. [Importer depuis le système de fichiers](#importer-depuis-le-système-de-fichiers)
4. [Structure des fichiers sur disque](#structure-des-fichiers-sur-disque)
5. [Gestion des IDs et conflits](#gestion-des-ids-et-conflits)
6. [Workflows pratiques](#workflows-pratiques)
7. [Limitations et compatibilité](#limitations-et-compatibilité)

---

## Vue d'ensemble

### Qu'est-ce que File System Sync ?

**File System Sync** (FS Sync) permet d'exporter et d'importer des branches DeepMemo vers/depuis votre système de fichiers local. Vos nœuds deviennent des fichiers Markdown éditables avec n'importe quel éditeur de texte.

### État actuel de la fonctionnalité

| Fonctionnalité | Status | Description |
|----------------|--------|-------------|
| ✅ **Export FS** | Fonctionnel | Export one-shot d'une branche vers un dossier local |
| ✅ **Import FS** | Fonctionnel | Import one-shot d'un dossier local vers DeepMemo |
| ⚠️ **Synchro bidirectionnelle** | En développement | Détection automatique des changements |
| ⚠️ **Merge de conflits** | En développement | Fusion intelligente des modifications |

### Cas d'usage

- **📦 Backup local** : Sauvegarder vos données hors du navigateur
- **✏️ Édition externe** : Modifier vos notes avec Obsidian, VSCode, Typora, etc.
- **🔄 Migration** : Importer des notes depuis d'autres systèmes (Obsidian, Notion)
- **🤝 Partage** : Partager une branche via Git, Dropbox, clé USB
- **📚 Archivage** : Archiver des projets terminés en format ouvert (Markdown)

### Compatibilité navigateurs

| Navigateur | Support | Notes |
|------------|---------|-------|
| **Chrome** | ✅ | Pleinement supporté (File System Access API) |
| **Edge** | ✅ | Pleinement supporté (File System Access API) |
| **Firefox** | ❌ | Pas supporté (API non implémentée) |
| **Safari** | ❌ | Pas supporté (API non implémentée) |

📍 **Référence** : `fs-sync.js:23-25`

**Alternative pour Firefox/Safari** : Utilisez l'export/import ZIP (📦 Archive ZIP) qui fonctionne sur tous les navigateurs.

---

## Exporter vers le système de fichiers

### Comment exporter une branche ?

1. **Sélectionner le nœud** que vous souhaitez exporter (racine de la branche)
2. Cliquer sur **"💾 Export FS"** (en bas à droite de l'éditeur)
3. Une fenêtre s'ouvre : choisir le **dossier de destination**
4. Autoriser l'accès au système de fichiers
5. L'export démarre automatiquement

📍 **Référence UI** : `index.html:226` (bouton "💾 Export FS")
📍 **Référence code** : `fs-sync.js:135-169` (fonction `exportBranchToFS`)

**Toast de confirmation** : ✅ "Exporté X nœuds (Y fichiers)"

### Que se passe-t-il lors de l'export ?

1. **Collecte des nœuds** : Tous les descendants du nœud sélectionné sont collectés récursivement
2. **Création de la structure** : Les dossiers et fichiers sont créés selon la hiérarchie
3. **Export des contenus** : Chaque nœud devient un fichier `.md` avec frontmatter YAML
4. **Export des attachments** : Les fichiers attachés sont copiés avec un format spécial (voir ci-dessous)
5. **Export des symlinks** : Les liens symboliques deviennent des fichiers `.dmlink`

📍 **Référence** : `fs-sync.js:180-247` (fonction `exportNodeRecursive`)

### Structure exportée

DeepMemo utilise une structure spécifique pour représenter la hiérarchie :

```
📂 Dossier choisi/
  ├── 📂 Nœud Parent/             ← Nœud avec enfants (BRANCH)
  │   ├── index.md                 ← Contenu du parent
  │   ├── photo__attach_123.jpg    ← Attachment du parent
  │   ├── 📂 Enfant A/             ← Sous-branche
  │   │   ├── index.md
  │   │   └── doc__attach_456.pdf
  │   └── Enfant Leaf.md           ← Nœud sans enfants (LEAF)
  ├── Lien.dmlink                  ← Lien symbolique
  └── Autre Leaf.md                ← Nœud racine sans enfants
```

**Règles de structure** :

| Type de nœud | Représentation | Contenu |
|--------------|----------------|---------|
| **Branch** (avec enfants) | 📂 Dossier/ | `index.md` + sous-fichiers/dossiers |
| **Leaf** (sans enfants) | 📄 `Title.md` | Fichier markdown unique |
| **Symlink** | 📄 `Title.dmlink` | Fichier YAML avec référence à la cible |

📍 **Référence** : `fs-sync.js:210-246` (logique branches vs leaves)

### Gestion des collisions de noms

Si un fichier/dossier avec le même nom existe déjà, DeepMemo ajoute automatiquement un suffixe numérique :

```
📂 Export/
  ├── Projet.md
  ├── Projet (2).md     ← Collision résolue
  └── Projet (3).md     ← Nouvelle collision
```

📍 **Référence** : `fs-sync.js:66-88` (fonction `resolveNameCollision`)

**Note** : Les suffixes accumulés sont nettoyés avant ajout pour éviter `Projet (2) (2) (2).md`

---

## Importer depuis le système de fichiers

### Comment importer un dossier ?

1. **Sélectionner le nœud parent** où vous souhaitez importer (les nœuds importés seront ajoutés comme enfants)
2. Cliquer sur **"📂 Import FS"** (en bas à droite de l'éditeur)
3. Une fenêtre s'ouvre : choisir le **dossier à importer**
4. Autoriser l'accès au système de fichiers
5. L'import démarre automatiquement

📍 **Référence UI** : `index.html:229` (bouton "📂 Import FS")
📍 **Référence code** : `fs-sync.js:473-519` (fonction `importBranchFromFS`)

**Toast de confirmation** : ✅ "Importé X nœuds"

### Que se passe-t-il lors de l'import ?

1. **Parsing récursif** : Le dossier est parcouru récursivement
2. **Lecture du frontmatter** : Les métadonnées YAML sont extraites de chaque fichier `.md`
3. **⚠️ RÉGÉNÉRATION DES IDs** : **TOUS les IDs sont régénérés** pour éviter les collisions
4. **Remapping des références** : Les références `attachment:oldId` et `[[liens]]` sont mises à jour
5. **Import des attachments** : Les fichiers joints sont détectés et importés dans IndexedDB
6. **Insertion dans l'arbre** : Les nœuds importés sont ajoutés comme enfants du nœud parent

📍 **Référence** : `fs-sync.js:529-583` (fonction `parseDirectoryRecursive`)

### Détection des types de fichiers

| Fichier | Type détecté | Action |
|---------|--------------|--------|
| `index.md` | Nœud branch | Contenu du dossier parent |
| `Titre.md` | Nœud leaf | Nœud sans enfants |
| `Lien.dmlink` | Symlink | Lien symbolique |
| `photo.jpg`, `doc.pdf` | Attachment | Fichier attaché au nœud du même dossier |
| Fichiers commençant par `.` | Fichiers cachés (ex: `.DS_Store`, `.git`) | Ignorés automatiquement |
| `Thumbs.db`, `desktop.ini` | Fichiers système Windows | Ignorés automatiquement |

📍 **Référence** : `fs-sync.js:532-580` (logique de parsing)

### Import des attachments

Les attachments sont automatiquement détectés et importés s'ils respectent ces critères :

- **Extensions supportées** : `.pdf`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.txt`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.zip`, `.mp3`, `.mp4`
- **Taille maximale** : 50 MB par fichier
- **Localisation** : Même dossier que le fichier `.md` correspondant

📍 **Référence** : `fs-sync.js:705-765` (fonction `importAttachmentsForNode`)

**Format spécial avec ID** : Si le fichier suit le format `{nom}__{attachId}{ext}`, l'ancien ID est détecté et remappé automatiquement dans le contenu.

**Exemple** :
```
📂 Mon Projet/
  ├── index.md                      ← Contenu : "![](attachment:attach_123)"
  └── photo__attach_123.jpg         ← ID détecté : attach_123
```

Après import :
- Nouveau ID généré : `attach_789`
- Contenu mis à jour : `"![](attachment:attach_789)"`
- Fichier renommé mentalement (reste `photo__attach_123.jpg` sur disque)

📍 **Référence** : `fs-sync.js:730-756` (parsing du format `{nom}__{id}{ext}`)

---

## Structure des fichiers sur disque

### Format Markdown avec frontmatter YAML

Tous les fichiers `.md` exportés contiennent un **frontmatter YAML** avec les métadonnées du nœud :

```markdown
---
id: node_1706123456789_abc123
title: Mon Projet
tags:
  - important
  - 2024
created: 2024-01-25T10:30:00.000Z
modified: 2024-01-28T15:45:00.000Z
---

Ceci est le contenu du nœud en Markdown.

## Section 1

Vous pouvez utiliser tout le Markdown standard ici.

![Capture d'écran](attachment:attach_1706123456789_def456)
```

📍 **Référence** : `frontmatter.js:11-21` (génération du frontmatter)

### Champs du frontmatter

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `id` | string | ✅ | Identifiant unique du nœud (format : `node_timestamp_random`) |
| `title` | string | ✅ | Titre du nœud |
| `tags` | array | ❌ | Liste des tags (peut être vide) |
| `created` | ISO 8601 | ✅ | Date de création (format : `YYYY-MM-DDTHH:mm:ss.sssZ`) |
| `modified` | ISO 8601 | ✅ | Date de dernière modification |

📍 **Référence** : `frontmatter.js:12-18` (structure des métadonnées)

**Validation à l'import** : Le frontmatter est validé pour s'assurer qu'il contient au minimum `id` et `title`.

📍 **Référence** : `frontmatter.js:50-60` (fonction `validateFrontmatter`)

### Format des symlinks (fichiers `.dmlink`)

Les liens symboliques sont exportés sous forme de fichiers `.dmlink` avec ce format :

```yaml
---
id: node_1706123456789_xyz
title: Lien vers Documentation
type: symlink
targetId: node_1706100000000_abc
created: 2024-01-25T10:30:00.000Z
modified: 2024-01-28T15:45:00.000Z
---
```

📍 **Référence** : `fs-sync.js:277-298` (fonction `writeSymlinkFile`)

**Champs spécifiques aux symlinks** :
- `type: symlink` (obligatoire)
- `targetId` (obligatoire) : ID du nœud cible

À l'import, si le `targetId` ne correspond à aucun nœud existant, le symlink sera créé mais cassé (⚠️ lien brisé).

📍 **Référence** : `fs-sync.js:667-698` (parsing des symlinks)

### Nommage des attachments

Les attachments exportés suivent le format : `{nom}__{attachId}{ext}`

**Exemples** :
```
photo__attach_1706123456789_abc.jpg
document__attach_1706123456789_def.pdf
schema__attach_1706123456789_ghi.svg
```

**Pourquoi ce format ?**
- Permet de **remapper automatiquement** les IDs à l'import
- Évite les collisions de noms entre attachments de différents nœuds
- Préserve le nom original lisible (`photo`) + ID unique

📍 **Référence** : `fs-sync.js:326-328` (format avec ID)

**À l'import**, le format est détecté et parsé :

```javascript
// Regex de détection : ^(.+)__([^.]+)(\.[^.]+)$
//                       nom     ID     extension
```

📍 **Référence** : `fs-sync.js:735-739` (parsing du format)

---

## Gestion des IDs et conflits

### ⚠️ Comportement critique : Régénération systématique des IDs

**IMPORTANT** : À l'import, **tous les IDs sont systématiquement régénérés**, même si le frontmatter contient des IDs valides.

📍 **Référence** : `fs-sync.js:359-406` (fonction `remapAllIds`)

#### Pourquoi régénérer les IDs ?

Pour **éviter les collisions** avec vos données existantes :
- Les IDs dans les fichiers exportés peuvent déjà exister dans votre base actuelle
- Import multiple du même dossier → doublons sans régénération
- Import de branches de différentes sources → risque de collision

#### Conséquences pour l'utilisateur

| Scénario | Résultat | Explication |
|----------|----------|-------------|
| Export puis Import immédiat | ❌ Nouveaux IDs générés | Pas une "restauration à l'identique" |
| Export branche A, export branche B séparément, import des deux | ❌ Liens entre A et B cassés | Les IDs sont régénérés indépendamment |
| Export d'une branche, modification externe, import | ❌ Création de doublons | Import = ajout de nouveaux nœuds |

#### Remapping automatique des références

Pour compenser la régénération des IDs, DeepMemo **remappe automatiquement** toutes les références internes :

**1. Références aux attachments**

Avant import (fichier sur disque) :
```markdown
![Capture](attachment:attach_OLD_123)
[Télécharger PDF](attachment:attach_OLD_456)
```

Après import (dans DeepMemo) :
```markdown
![Capture](attachment:attach_NEW_789)
[Télécharger PDF](attachment:attach_NEW_012)
```

📍 **Référence** : `fs-sync.js:415-436` (fonction `remapReferences`)

**2. TargetIds des symlinks**

Si un symlink pointe vers un nœud importé dans la même opération, le `targetId` est automatiquement mis à jour.

```yaml
# Avant import
targetId: node_OLD_123

# Après import
targetId: node_NEW_789
```

📍 **Référence** : `fs-sync.js:398-401` (remapping des targetIds)

**3. Tables de mapping**

Deux tables de mapping sont maintenues pendant l'import :

```javascript
const nodeIdMapping = {
  'node_OLD_123': 'node_NEW_789',
  'node_OLD_456': 'node_NEW_012',
  // ...
};

const attachmentIdMapping = {
  'attach_OLD_123': 'attach_NEW_789',
  'attach_OLD_456': 'attach_NEW_012',
  // ...
};
```

📍 **Référence** : `fs-sync.js:361-368` (génération du mapping)

### Limitations actuelles (pas de synchro)

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Pas de détection de modifications** | Export puis modification externe puis import = doublons | Supprimer la branche avant import |
| **Pas de merge automatique** | Impossible de fusionner des modifications concurrentes | Export → modifier → supprimer → import |
| **Régénération des IDs** | Perte des liens entre branches exportées séparément | Exporter tout ensemble |
| **Pas de marqueurs de conflits** | Modifications conflictuelles non détectées | Travailler sur des branches disjointes |

### Future synchronisation bidirectionnelle (roadmap)

Les fonctionnalités suivantes sont prévues pour une future version :

- 🔄 **Synchro auto** : Détection automatique des changements sur disque
- 🔍 **Détection de conflits** : Identification des modifications concurrentes
- 🤝 **Merge intelligent** : Fusion automatique ou assistée des conflits
- 🔗 **Préservation des IDs** : Mode "sync" préservant les IDs au lieu de les régénérer
- 📊 **Diff visuel** : Visualisation des changements avant import

---

## Workflows pratiques

### 1. Backup local régulier

**Cas d'usage** : Sauvegarder vos données hors du navigateur en cas de crash ou de réinstallation.

**Workflow** :
1. Sélectionner le **nœud racine** de votre base
2. Cliquer sur **"💾 Export FS"**
3. Choisir un dossier de backup (ex: `~/Backups/DeepMemo/2024-01-28/`)
4. L'export crée une arborescence de fichiers Markdown + attachments
5. **Automatiser** : Exporter régulièrement (1x par semaine recommandé)

**Restauration** :
1. Créer un nouveau nœud "🔄 Restauration 2024-01-28"
2. Cliquer sur **"📂 Import FS"**
3. Sélectionner le dossier de backup
4. Les nœuds sont importés comme enfants du nœud de restauration

**Note** : Les IDs seront régénérés, donc considérez l'export comme un **backup de contenu**, pas une sauvegarde bit-à-bit.

---

### 2. Édition externe avec Obsidian

**Cas d'usage** : Éditer vos notes DeepMemo dans Obsidian pour profiter de ses plugins (graphes, canvas, etc.).

**Workflow** :
1. **Export depuis DeepMemo**
   - Exporter la branche souhaitée vers `~/Obsidian/Vault/DeepMemo-Export/`

2. **Édition dans Obsidian**
   - Ouvrir le dossier comme vault Obsidian
   - Éditer les fichiers `.md` normalement
   - Les attachments sont visibles et utilisables
   - **⚠️ Ne pas modifier les IDs dans le frontmatter** (ils seront ignorés à l'import)

3. **Import dans DeepMemo**
   - Supprimer l'ancienne branche dans DeepMemo (ou créer un nouveau parent)
   - Import FS depuis `~/Obsidian/Vault/DeepMemo-Export/`
   - Les modifications sont intégrées avec de nouveaux IDs

**Limitations** :
- Les liens Obsidian `[[Wikilinks]]` ne sont pas convertis automatiquement
- Les graphes Obsidian ne sont pas préservés à l'import
- Modifications = nouveaux IDs = perte des liens externes

---

### 3. Migration depuis Obsidian/Notion

**Cas d'usage** : Importer une bibliothèque de notes Markdown existante.

**Workflow** :

**Depuis Obsidian** :
1. Votre vault Obsidian contient déjà des fichiers `.md`
2. Dans DeepMemo, créer un nœud "📚 Import Obsidian"
3. Import FS depuis le dossier du vault
4. Les fichiers `.md` deviennent des nœuds DeepMemo
5. Les images locales deviennent des attachments automatiquement

**Depuis Notion** :
1. Exporter depuis Notion : **Markdown & CSV**
2. Décompresser l'archive exportée
3. Dans DeepMemo, créer un nœud "📚 Import Notion"
4. Import FS depuis le dossier décompressé
5. La hiérarchie des pages Notion est préservée

**Note** : Le frontmatter DeepMemo sera généré automatiquement pour les fichiers qui n'en ont pas.

📍 **Référence** : `fs-sync.js:612-626` (fallback sans frontmatter)

---

### 4. Partage de branches via Git

**Cas d'usage** : Collaborer sur une branche avec d'autres utilisateurs via Git.

**Workflow** :

**Setup initial** :
```bash
# Créer un repo Git
mkdir ~/DeepMemo-Shared
cd ~/DeepMemo-Shared
git init
```

**Partage** :
1. Export FS vers `~/DeepMemo-Shared/`
2. Commit et push :
   ```bash
   git add .
   git commit -m "feat: add project documentation"
   git push origin main
   ```

**Réception** :
1. Clone ou pull :
   ```bash
   git pull origin main
   ```
2. Import FS depuis `~/DeepMemo-Shared/`

**⚠️ Conflits Git** :
- Les modifications concurrentes sur le même fichier créent des conflits Git classiques
- Résolvez les conflits dans les fichiers `.md` avant import
- DeepMemo ne détecte pas les marqueurs de conflits Git (`<<<<<<< HEAD`)

---

### 5. Archivage de projets terminés

**Cas d'usage** : Archiver des projets terminés en format ouvert (Markdown), libérer de l'espace.

**Workflow** :
1. Sélectionner la branche du projet terminé
2. Export FS vers `~/Archives/Projet-ABC/`
3. Vérifier l'export (ouvrir avec un éditeur Markdown)
4. Supprimer la branche dans DeepMemo
5. Nettoyer les attachments orphelins (panneau de droite → "🧹 Nettoyer les fichiers orphelins")

**Restauration ultérieure** :
1. Import FS depuis `~/Archives/Projet-ABC/`
2. La branche est restaurée avec de nouveaux IDs

**Alternative** : Exporter en **ZIP** (📦) pour une archive complète avec préservation stricte des IDs.

---

### 6. Édition rapide avec VSCode

**Cas d'usage** : Éditer plusieurs nœuds rapidement avec recherche/remplacement global.

**Workflow** :
1. Export FS vers `~/Temp/DeepMemo-Edit/`
2. Ouvrir le dossier dans VSCode : `code ~/Temp/DeepMemo-Edit/`
3. Utiliser la recherche globale (Ctrl+Shift+F) pour modifier plusieurs fichiers
4. Exemple : Remplacer tous les `TODO` par `✅ DONE`
5. Sauvegarder tous les fichiers
6. Supprimer la branche dans DeepMemo
7. Import FS depuis `~/Temp/DeepMemo-Edit/`

**Avantages** :
- Recherche/remplacement puissant (regex)
- Édition multi-curseur
- Extensions Markdown (preview, linter, etc.)

---

## Limitations et compatibilité

### Compatibilité navigateurs

| Navigateur | Version minimale | Support FS Sync |
|------------|------------------|-----------------|
| **Google Chrome** | 86+ (Oct 2020) | ✅ Pleinement supporté |
| **Microsoft Edge** | 86+ (Oct 2020) | ✅ Pleinement supporté |
| **Firefox** | Toutes versions | ❌ API non implémentée |
| **Safari** | Toutes versions | ❌ API non implémentée |

**Technologie utilisée** : [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

📍 **Référence** : `fs-sync.js:23-25` (détection de support)

**Alternative pour autres navigateurs** :
- Utilisez l'export/import **ZIP** (📦 Archive ZIP) qui fonctionne partout
- Le format interne du ZIP est identique (Markdown + frontmatter)

---

### Limitations actuelles

| Limitation | Détail | Impact | Solution de contournement |
|------------|--------|--------|---------------------------|
| **Chrome/Edge uniquement** | File System Access API non disponible ailleurs | Pas de FS Sync sur Firefox/Safari | Export/import ZIP |
| **Régénération des IDs** | Tous les IDs changent à l'import | Perte des liens externes entre branches | Exporter tout ensemble |
| **Pas de synchro bidirectionnelle** | Export et import sont one-shot | Modifications externes = doublons | Supprimer avant import |
| **Pas de détection de conflits** | Modifications concurrentes non gérées | Risque d'écrasement | Backups réguliers |
| **Attachments 50MB max** | Limite de taille par fichier | Gros fichiers ignorés | Compresser ou découper |
| **Extensions limitées** | Seules certaines extensions importées | Fichiers `.rar`, `.7z` ignorés | Convertir en `.zip` |

### Sécurité et permissions

**Permissions requises** :
- **Lecture** (import) : Lire les fichiers du dossier sélectionné
- **Écriture** (export) : Créer et écrire des fichiers dans le dossier sélectionné

**Contrôle utilisateur** :
- Le navigateur demande **explicitement** l'autorisation à chaque export/import
- Vous pouvez révoquer l'accès à tout moment (paramètres du navigateur)
- DeepMemo ne conserve **aucune** permission persistante

**Confidentialité** :
- Aucune donnée n'est envoyée sur Internet
- Toutes les opérations sont **locales** (navigateur ↔ disque)
- Les fichiers restent sur votre ordinateur

---

### Performances et quotas

| Aspect | Limite | Notes |
|--------|--------|-------|
| **Nombre de nœuds** | Pas de limite théorique | Limité par la RAM disponible |
| **Taille des attachments** | 50 MB par fichier | Vérification à l'import |
| **Quota disque** | Dépend de l'espace libre | Erreur si disque plein |
| **Vitesse d'export** | ~100 nœuds/seconde | Dépend du CPU et du disque |
| **Vitesse d'import** | ~50 nœuds/seconde | Plus lent (parsing + remapping) |

**Toast d'erreur si disque plein** : ❌ "Disque plein. Export annulé."

📍 **Référence** : `locales/fr.js:423` (message d'erreur)

---

### Comparaison avec export ZIP

| Critère | Export FS | Export ZIP |
|---------|-----------|------------|
| **Compatibilité navigateurs** | Chrome/Edge uniquement | Tous navigateurs |
| **Édition externe** | ✅ Facile (fichiers sur disque) | ⚠️ Décompresser → éditer → compresser |
| **Préservation des IDs** | ❌ Régénérés à l'import | ✅ Préservés |
| **Vitesse** | ⚡ Rapide (pas de compression) | 🐌 Plus lent (compression) |
| **Taille sur disque** | Plus grande (fichiers non compressés) | Plus petite (archive compressée) |
| **Synchro avec Git** | ✅ Possible (fichiers séparés) | ❌ Impossible (binaire) |
| **Backup simple** | ⚠️ Nécessite dossier dédié | ✅ Un seul fichier `.zip` |

**Recommandation** :
- **FS Sync** : Édition externe, collaboration Git, workflows avancés
- **ZIP** : Backups simples, partage, archivage, compatibilité maximale

---

## Voir aussi

- [Formats d'export/import](FILE-FORMATS.md) : Détails techniques des formats
- [Pièces jointes](ATTACHMENTS.md) : Gestion des attachments dans DeepMemo
- [Data Model](../3-DATA-MODEL.md) : Structure des données et métadonnées

---

## Bonnes pratiques

### ✅ À faire

- **Exporter régulièrement** (1x par semaine minimum) pour backup
- **Tester l'import** après modifications externes importantes
- **Utiliser des noms de fichiers clairs** (éviter caractères spéciaux)
- **Exporter des branches complètes** (pas des morceaux isolés)
- **Vérifier le frontmatter** avant import manuel (valider YAML)

### ❌ À éviter

- Modifier les IDs dans le frontmatter manuellement (ignorés à l'import)
- Exporter puis importer immédiatement (génère doublons avec nouveaux IDs)
- Importer des fichiers `.md` sans frontmatter valide (titre = nom de fichier)
- Modifier la structure des dossiers manuellement (risque de casser la hiérarchie)
- Supprimer les fichiers d'attachments (références cassées dans le contenu)

---

## Troubleshooting

### "File System Sync nécessite Chrome ou Edge"

**Cause** : Vous utilisez Firefox, Safari ou un navigateur non supporté.

**Solution** : Utilisez Chrome ou Edge, ou passez à l'export/import ZIP.

📍 **Référence** : `locales/fr.js:414` (message d'erreur)

---

### "Permission refusée"

**Cause** : Vous avez cliqué sur "Annuler" ou refusé l'autorisation d'accès au système de fichiers.

**Solution** : Relancez l'opération et cliquez sur "Autoriser" dans la popup du navigateur.

📍 **Référence** : `locales/fr.js:422` (message d'erreur)

---

### "Échec de l'import"

**Causes possibles** :
- Frontmatter YAML invalide (erreur de syntaxe)
- Fichiers corrompus
- Dossier vide

**Solution** :
1. Vérifier que le dossier contient des fichiers `.md`
2. Ouvrir un fichier `.md` et vérifier le frontmatter (doit être entre `---`)
3. Valider le YAML avec un outil en ligne (yamllint.com)

---

### Les attachments ne s'importent pas

**Causes possibles** :
- Extension non supportée (ex: `.rar`, `.7z`, `.exe`)
- Fichiers trop volumineux (> 50 MB)
- Fichiers dans un sous-dossier non détecté

**Solution** :
1. Vérifier les extensions supportées (voir section "Import des attachments")
2. Compresser les gros fichiers ou découper
3. Déplacer les attachments au même niveau que le fichier `.md` correspondant

---

### Les liens entre nœuds sont cassés après import

**Cause** : Vous avez exporté des branches séparément, et les IDs ont été régénérés indépendamment.

**Solution** : Exportez **toute la hiérarchie** en une seule fois pour préserver les liens internes.

---

**Dernière mise à jour** : 2026-02-13 | **Version** : V0.11.0
