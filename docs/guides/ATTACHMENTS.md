# Pièces Jointes (Attachments)

> Guide utilisateur pour gérer vos fichiers dans DeepMemo
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-01-29

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Ajouter des fichiers](#ajouter-des-fichiers)
3. [Utiliser vos fichiers dans le contenu](#utiliser-vos-fichiers-dans-le-contenu)
4. [Gérer vos fichiers attachés](#gérer-vos-fichiers-attachés)
5. [Stockage et quotas](#stockage-et-quotas)
6. [Workflows pratiques](#workflows-pratiques)

---

## Vue d'ensemble

DeepMemo vous permet d'attacher des fichiers à vos nœuds : images, PDF, documents, etc. Ces fichiers sont stockés localement dans votre navigateur et voyagent avec vos nœuds lors des exports.

### Qu'est-ce qu'un attachment ?

Un **attachment** est un fichier lié à un nœud. Vous pouvez :
- Afficher des images directement dans vos notes (inline)
- Joindre des PDF, documents, vidéos
- Télécharger vos fichiers à tout moment
- Les exporter avec vos données

### Où sont stockés les fichiers ?

Les fichiers sont stockés **localement** dans votre navigateur (IndexedDB), jamais sur un serveur. Ils restent privés et accessibles hors ligne.

### Limites importantes

| Aspect | Limite |
|--------|--------|
| **Taille par fichier** | 50 MB maximum |
| **Stockage total** | ~500 MB (selon navigateur) |
| **Types supportés** | Tous (images, PDF, vidéos, etc.) |

---

## Ajouter des fichiers

### Comment attacher un fichier ?

1. Sélectionner le nœud où vous souhaitez ajouter un fichier
2. Descendre jusqu'à la section "📎 Fichiers attachés"
3. Cliquer sur le bouton **"📎 Ajouter un fichier"**
4. Sélectionner votre fichier depuis votre ordinateur
5. Le fichier apparaît immédiatement dans la liste

**Note** : Si vous ajoutez un fichier à un **lien symbolique**, le fichier sera attaché au nœud cible (l'original), pas au lien.

### Validation automatique

DeepMemo vérifie automatiquement :
- **Taille du fichier** : Si > 50 MB → ❌ Refusé avec message d'erreur
- **Espace disponible** : Vérification avant sauvegarde

### Que se passe-t-il après l'upload ?

1. Le fichier est sauvegardé localement (IndexedDB)
2. Un identifiant unique lui est attribué (ex: `attach_1706123456789_abc123`)
3. Les métadonnées sont enregistrées (nom, type, taille, date)
4. Le fichier apparaît dans la liste des attachments du nœud

---

## Utiliser vos fichiers dans le contenu

### Syntaxe Markdown

Vous pouvez référencer vos fichiers directement dans le contenu de vos nœuds avec la syntaxe :

```markdown
attachment:ID_DU_FICHIER
```

**Exemples** :

```markdown
<!-- Pour une image (affichage inline) -->
![Capture d'écran](attachment:attach_1706123456789_abc123)

<!-- Pour un fichier à télécharger (lien cliquable) -->
[Télécharger le PDF](attachment:attach_1706123456789_def456)
```

### Copier la syntaxe automatiquement

Pas besoin de taper l'ID manuellement ! Pour chaque fichier attaché :

1. Cliquer sur le bouton **📋** (copier syntaxe)
2. La syntaxe complète est copiée dans le presse-papier
3. Coller dans votre contenu markdown

**Ce qui est copié** :
- Pour une **image** : `![nom-du-fichier.png](attachment:attach_123...)`
- Pour un **autre type** : `[nom-du-fichier.pdf](attachment:attach_123...)`

### Affichage des images inline

Lorsque vous utilisez la syntaxe `![...]` pour une image, celle-ci s'affiche directement dans votre contenu en **mode vue** (👁️ Afficher).

**Types d'images supportés** :
- PNG, JPG, JPEG, GIF
- SVG (images vectorielles)
- WebP

**Exemple dans une note** :

```markdown
# Mon analyse

Voici la capture d'écran du problème :

![Capture du bug](attachment:attach_1706123456789_abc)

Comme on peut le voir, le bouton est mal aligné.
```

En mode vue, l'image s'affichera directement dans le texte.

---

## Gérer vos fichiers attachés

### Liste des attachments

Tous vos fichiers attachés sont visibles dans la section **"📎 Fichiers attachés"** en bas de l'éditeur.

**Informations affichées** :
- 🖼️ **Icône** : Type de fichier (image, PDF, vidéo, etc.)
- **Nom** : Nom original du fichier
- **ID** : Identifiant unique (pour référence dans markdown)
- **Taille** : Taille du fichier (ex: 1.2 MB)

### Icônes par type de fichier

| Type | Icône | Exemples |
|------|-------|----------|
| **Images** | 🖼️ | .png, .jpg, .svg, .gif |
| **Vidéos** | 🎬 | .mp4, .webm, .mov |
| **Audio** | 🎵 | .mp3, .wav, .ogg |
| **PDF** | 📄 | .pdf |
| **Documents** | 📝 | .docx, .odt |
| **Tableurs** | 📊 | .xlsx, .ods |
| **Présentations** | 📽️ | .pptx, .odp |
| **Archives** | 📦 | .zip, .tar.gz |
| **Texte** | 📃 | .txt, .md |
| **Autres** | 📎 | Tout le reste |

### Actions disponibles

Pour chaque fichier, trois boutons sont disponibles :

#### 1. 📋 Copier la syntaxe Markdown

**Fonction** : Copie la syntaxe complète dans le presse-papier.

**Utilisation** :
1. Cliquer sur 📋
2. Aller dans votre contenu markdown
3. Coller (Ctrl+V / Cmd+V)
4. La syntaxe correcte apparaît automatiquement

**Toast de confirmation** : ✅ "Syntaxe copiée dans le presse-papier"

#### 2. ⬇️ Télécharger le fichier

**Fonction** : Télécharge le fichier sur votre ordinateur.

**Utilisation** :
1. Cliquer sur ⬇️
2. Le fichier se télécharge avec son nom original
3. Vous pouvez l'ouvrir ou le sauvegarder ailleurs

**Toast de confirmation** : ✅ "Téléchargement : nom-du-fichier.ext"

#### 3. 🗑️ Supprimer le fichier

**Fonction** : Supprime définitivement le fichier.

**Utilisation** :
1. Cliquer sur 🗑️
2. Confirmer la suppression dans la popup
3. Le fichier est supprimé de la base de données locale

**Attention** : Cette action est **irréversible** !

**Toast de confirmation** : ✅ "Fichier supprimé : nom-du-fichier.ext"

---

## Stockage et quotas

### Voir l'espace utilisé

Dans le **panneau de droite** (ℹ️ Informations), la section **"📦 Stockage"** affiche :

```
📦 Stockage
Fichiers : 42.3 MB / ~500 MB
[████████░░░░░░░░░░░] 8%
6 fichier(s) attaché(s)
```

**Informations** :
- **Taille totale** : Espace utilisé par tous vos attachments
- **Limite estimée** : ~500 MB (varie selon le navigateur)
- **Barre de progression** : Visualisation rapide
- **Nombre de fichiers** : Total d'attachments stockés

### Limite de stockage

Chaque navigateur impose une limite de stockage local (IndexedDB) :

| Navigateur | Limite typique |
|------------|----------------|
| **Chrome/Edge** | ~500 MB - 1 GB |
| **Firefox** | ~500 MB |
| **Safari** | ~500 MB |

**Note** : La limite exacte dépend de l'espace disque disponible sur votre appareil.

### Nettoyer les fichiers orphelins

Un fichier **orphelin** est un fichier qui existe dans la base de données mais n'est plus référencé par aucun nœud (supprimé par erreur, import corrompu, etc.).

#### Comment nettoyer ?

1. Ouvrir le panneau de droite (ℹ️)
2. Descendre à la section "📦 Stockage"
3. Cliquer sur **"🧹 Nettoyer les fichiers orphelins"**
4. Confirmer l'action
5. Les fichiers non utilisés sont supprimés

**Toast de confirmation** :
- ✅ "X fichier(s) orphelin(s) supprimé(s)" (si fichiers trouvés)
- ✅ "Aucun fichier orphelin trouvé" (si rien à nettoyer)

**Conseil** : Exécutez ce nettoyage régulièrement (tous les 1-2 mois) pour optimiser l'espace.

### Que faire si le quota est atteint ?

Si vous atteignez la limite de stockage :

1. **Nettoyer les orphelins** (voir ci-dessus)
2. **Supprimer les fichiers volumineux non utilisés**
   - Regarder la liste des attachments
   - Identifier les gros fichiers (vidéos, archives)
   - Supprimer ceux qui ne sont plus nécessaires
3. **Exporter et archiver**
   - Exporter votre base en .dm (avec attachments)
   - Sauvegarder l'archive ailleurs
   - Supprimer les vieux projets de DeepMemo
   - Réimporter plus tard si besoin

---

## Workflows pratiques

### 1. Documentation technique avec captures d'écran

**Cas d'usage** : Documenter un bug ou une procédure avec images.

**Workflow** :
1. Prendre une capture d'écran (Outil système)
2. Dans DeepMemo, créer un nœud "Bug #123"
3. Attacher la capture via "📎 Ajouter un fichier"
4. Cliquer sur 📋 pour copier la syntaxe
5. Écrire dans le contenu :
   ```markdown
   # Bug #123 : Bouton mal aligné

   ![Capture du bug](attachment:attach_...)

   Comme on peut voir, le bouton "Valider" dépasse...
   ```
6. Passer en mode vue (👁️) pour voir l'image inline

### 2. Bibliothèque de ressources

**Cas d'usage** : Centraliser des PDF, documents de référence.

**Workflow** :
1. Créer un nœud "📚 Ressources"
2. Créer des enfants par catégorie ("Guides", "Docs officielles")
3. Attacher les PDF à chaque nœud
4. Dans le contenu, lister les fichiers :
   ```markdown
   # Guides Python

   - [Guide officiel Python 3.12](attachment:attach_123)
   - [Best practices PEP8](attachment:attach_456)
   - [Tutorial Django](attachment:attach_789)
   ```
5. Cliquer sur les liens pour télécharger les PDF

### 3. Notes de cours avec schémas

**Cas d'usage** : Prendre des notes avec diagrammes dessinés.

**Workflow** :
1. Dessiner un schéma (tablette, papier scanné, outil de dessin)
2. Exporter en PNG/JPG
3. Créer un nœud "Cours : Architecture MVC"
4. Attacher le schéma
5. Copier la syntaxe et l'insérer :
   ```markdown
   # Architecture MVC

   ![Schéma MVC](attachment:attach_...)

   **Modèle** : Gère les données et la logique métier...
   ```

### 4. Portfolio de projets

**Cas d'usage** : Archiver des projets avec screenshots, maquettes.

**Workflow** :
1. Un nœud par projet
2. Attacher : mockups, captures finales, diagrammes d'architecture
3. Export en .dm pour backup complet (avec images)
4. Export en PDF pour présentation client (images incluses)

### 5. Migration depuis Obsidian/Notion

**Cas d'usage** : Importer des notes existantes avec leurs images.

**Workflow** :
1. Exporter depuis Obsidian/Notion
2. Utiliser "📂 Import FS" (File System)
3. DeepMemo détecte les images dans les markdown
4. Les images sont automatiquement converties en attachments
5. Les références `![](image.png)` deviennent `![](attachment:...)`

---

## Bonnes Pratiques

### ✅ À faire

- **Nommer clairement** vos fichiers avant upload (ex: `bug-login-2024.png`)
- **Nettoyer régulièrement** les fichiers orphelins
- **Exporter régulièrement** en .dm pour backup avec attachments
- **Optimiser les images** avant upload (compresser les gros PNG)
- **Utiliser SVG** pour les schémas (poids léger, qualité infinie)

### ❌ À éviter

- Attacher des vidéos 4K non compressées (limite 50MB)
- Dupliquer les mêmes fichiers dans plusieurs nœuds (préférer les liens symboliques)
- Oublier de nettoyer après avoir supprimé de nombreux nœuds
- Uploader des archives sans les décompresser (préférer les fichiers individuels)

---

## Limitations connues

| Limitation | Détail | Solution |
|------------|--------|----------|
| **Taille max par fichier** | 50 MB | Compresser ou découper le fichier |
| **Stockage total** | ~500 MB | Nettoyer, exporter et archiver |
| **Pas de drag & drop** | Upload via bouton seulement | Cliquer sur "📎 Ajouter un fichier" |
| **Stockage local** | Fichiers uniquement dans le navigateur | Exporter en .dm pour sauvegarde externe |

---

## Voir aussi

- [Formats d'export/import](FILE-FORMATS.md) : Comment exporter vos attachments
- [Export Filesystem](FS-SYNC.md) : Synchroniser avec un dossier local
- [Export PDF](PDF-EXPORT.md) : Générer un PDF avec images inline
- [Data Model](../3-DATA-MODEL.md) : Structure technique des attachments

---

**Dernière mise à jour** : 2026-01-29 | **Version** : V0.10.5
