# Documentation DeepMemo

**Documentation technique complète pour développeurs et contributeurs**

*[English version](README.en.md)*

---

Bienvenue dans la documentation de DeepMemo. Ce guide est organisé comme un livre technique : commencez au début si vous découvrez le projet, ou allez directement aux sections qui vous intéressent.

---

## 📖 Comment Lire Cette Documentation

Cette documentation suit une **structure narrative**, progressant des concepts fondamentaux aux détails d'implémentation avancés :

1. **Comprendre DeepMemo** (Partie 1) - Commencez ici pour découvrir ce qu'est DeepMemo et comment il fonctionne
2. **Fonctionnalités** (Partie 2) - Découvrez ce que vous pouvez faire avec DeepMemo
3. **Référence Technique** (Partie 3) - Spécifications détaillées pour développeurs
4. **Contribuer** (Partie 4) - Rejoindre le développement

**Nouveau sur DeepMemo ?** Lisez [1-CONCEPTS.md](1-CONCEPTS.md) en premier. Il explique les idées fondamentales qui donnent du sens à tout le reste.

**Vous cherchez quelque chose de précis ?** Utilisez l'index ci-dessous pour accéder directement à ce dont vous avez besoin.

---

## Partie 1 : Comprendre DeepMemo

**Commencez ici si vous découvrez DeepMemo ou souhaitez comprendre la philosophie de conception.**

### Concepts Fondamentaux
📘 **[1-CONCEPTS.md](1-CONCEPTS.md)** - Les fondamentaux

Apprenez :
- **Nœuds** : Le type de base unique qui permet tout
- **Hiérarchie** : Comment les relations parent-enfant créent la structure
- **Symlinks** : Transformer un arbre en réseau réticulaire
- **Clés d'Instance** : Suivre les chemins à travers le réseau
- **Mode Branche** : Sous-arbres isolés pour concentration et partage
- **Tags** : Métadonnées transversales

*Lisez ceci en premier. Tout le reste s'appuie sur ces concepts.*

### Architecture
🏗️ **[2-ARCHITECTURE.md](2-ARCHITECTURE.md)** - Conception technique

Découvrez :
- Architecture modulaire ES6
- Patterns de communication entre modules
- Système de navigation (URLs, routing, navigation navigateur avant/arrière)
- Rendu de l'arbre (pliage vs activation, auto-collapse)
- Approche de gestion d'état

### Modèle de Données
🗄️ **[3-DATA-MODEL.md](3-DATA-MODEL.md)** - Structure et stockage

Comprenez :
- Structure des nœuds (schéma JSON complet)
- Types : `node` vs `symlink`
- Relations : parent, children, targetId
- Métadonnées : timestamps, tags, pièces jointes
- Stockage IndexedDB avec Dexie.js

---

## Partie 2 : Fonctionnalités

**Découvrez ce que DeepMemo peut faire.**

### Vue d'Ensemble des Fonctionnalités
✨ **[4-FEATURES.md](4-FEATURES.md)** - Liste complète des fonctionnalités

Référence rapide de toutes les fonctionnalités avec liens vers guides détaillés :
- Navigation (arbre, mode branche, fil d'Ariane, URLs)
- Contenu (markdown, aperçu en direct, pièces jointes, tags)
- Export/Import (archives .dm, FS Sync, PDF)
- Avancé (glisser-déposer, sync multi-onglets, PWA, i18n)

### Guides Thématiques

#### Export et Import
📦 **[guides/FILE-FORMATS.md](guides/FILE-FORMATS.md)** - Formats d'export/import
- Archives `.dm` (ZIP avec métadonnées + pièces jointes)
- Format d'échange `.json` (compatible LLM)
- Export FreeMind `.mm` (lecture seule, voir [MM-FORMAT.md](reference/file-formats/MM-FORMAT.md))
- Workflows d'import (global vs branche)

#### Synchronisation Système de Fichiers
💾 **[guides/FS-SYNC.md](guides/FS-SYNC.md)** - Sync avec système de fichiers local
- Phase 1 (✅ implémenté) : Export vers dossier local + import avec régénération d'ID
- Phase 2 (📋 planifié) : Sync bidirectionnel avec détection de changements
- Phase 3 (🔮 futur) : Mode watch automatique avec sync temps réel
- Structure de fichiers : `index.md`, `.dmlink`, frontmatter YAML
- Chrome/Edge uniquement (File System Access API)
- Import gracieux depuis dossiers externes (Obsidian, Notion)

#### Export PDF
📄 **[guides/PDF-EXPORT.md](guides/PDF-EXPORT.md)** - Générer des documents PDF
- Pourquoi ça marche naturellement (hiérarchie → structure de document)
- Version en ligne (CloudFlare Worker, non déployé)
- CLI hors ligne (`bin/branch2pdf.js`)
- Résolution des symlinks (scope-aware en mode branche)
- Intégration d'images (base64)

#### Pièces Jointes
📎 **[guides/ATTACHMENTS.md](guides/ATTACHMENTS.md)** - Système de pièces jointes
- Stockage dans IndexedDB
- Images inline (`![](attachment:ID)`)
- Workflows upload/download/suppression
- Export/import avec archives `.dm`
- Limites de taille et quotas

#### Internationalisation
🌍 **[guides/I18N.md](guides/I18N.md)** - Support multi-langues
- FR/EN avec auto-détection
- Ajouter de nouvelles traductions
- Contenu de démo bilingue
- Manifestes PWA par langue

#### Progressive Web App
📱 **[guides/PWA.md](guides/PWA.md)** - Hors ligne et installable
- Stratégie de cache du Service Worker
- Installation sur desktop/mobile
- Mode hors ligne
- Configuration du manifest

---

## Partie 3 : Référence Technique

**Spécifications détaillées pour développeurs implémentant des fonctionnalités ou déboguant.**

### Formats de Fichiers

#### Format d'Archive .dm
🗜️ **[reference/file-formats/DM-FORMAT.md](reference/file-formats/DM-FORMAT.md)** - Spécification structure ZIP
- Structure d'archive (metadata.json, data.json, attachments/)
- Suivi de version et métadonnées
- Auto-détection import (magic number)
- Génération et remapping d'ID (global vs branche)
- Compression et encodage

#### Format d'Échange JSON
🔤 **[reference/file-formats/json-interchange.md](reference/file-formats/json-interchange.md)** - Format JSON portable
- Structure pour génération LLM
- Format minimal (métadonnées uniquement, pas de pièces jointes binaires)
- Export global vs export branche
- Workflows d'import (remplacer/fusionner, remapping d'ID)
- Cas d'usage (backup, migration, versioning Git)

#### Format Mind Map FreeMind
🧠 **[reference/file-formats/MM-FORMAT.md](reference/file-formats/MM-FORMAT.md)** - Export XML pour mind mapping
- Format compatible FreeMind/Freeplane/XMind
- Structure XML (standard 1.0.1)
- Conversion des nœuds (titres, contenu en notes HTML)
- Visualisation des symlinks (flèches et styling)
- Limitations (pas de tags, pas de pièces jointes, pas de réimport)
- Cas d'usage (visualisation externe, collaboration)

#### Validation de Schéma
✅ **[reference/file-formats/validation.md](reference/file-formats/validation.md)** - Référence validation de formats
- Spécifications JSON Schema (v1.0)
- Processus de validation (côté client avec validation.js)
- Outils de validation manuelle (ajv-cli, validateurs en ligne)
- Erreurs courantes et solutions
- Stratégie de migration de schémas

### API de Stockage
💽 **[reference/storage-api.md](reference/storage-api.md)** - Opérations IndexedDB/Dexie
- Opérations CRUD
- Référence API Dexie.js
- Commandes console de debug
- Stats et quotas

### Raccourcis Clavier
⌨️ **[reference/keyboard-shortcuts.md](reference/keyboard-shortcuts.md)** - Liste complète des raccourcis
- Raccourcis de navigation
- Raccourcis d'édition
- Raccourcis de recherche
- Raccourcis contextuels

---

## Partie 4 : Contribuer

**Rejoignez le développement de DeepMemo.**

### Guide de Contribution
🤝 **[development/CONTRIBUTING.md](development/CONTRIBUTING.md)** - Comment contribuer
- Directives de style de code
- Processus de pull request
- Exigences de tests
- Canaux de communication

### Feuille de Route
🗺️ **[development/ROADMAP.md](development/ROADMAP.md)** - Plan de développement
- Fonctionnalités planifiées
- Jalons de versions
- Vision long terme

### Guide de Débogage
🔧 **[development/debugging.md](development/debugging.md)** - Dépannage
- Bugs courants et solutions
- Commandes console
- Inspection IndexedDB
- Rechargement forcé et nettoyage du cache

### Changelog
📅 **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions
- Notes de version par version
- Breaking changes
- Corrections de bugs et améliorations

---

## Ressources Supplémentaires


### CloudFlare Worker
☁️ **[../cloudflare-worker/README.md](../cloudflare-worker/README.md)** - Worker de génération PDF
- Guide de déploiement
- Documentation API
- Détails de limitation de débit

☁️ **[../cloudflare-worker/PRIVACY-NOTICE.md](../cloudflare-worker/PRIVACY-NOTICE.md)** - Politique de confidentialité
- Hachage IP (SHA-256)
- Gestion des données
- Notice utilisateur

---

## Philosophie

Cette documentation suit ces principes :

1. **Pas de suspense** : Chaque section commence par vous dire ce que vous allez apprendre
2. **Pas de redondance** : Chaque information existe à un seul endroit
3. **Trouvable** : Hiérarchie claire et références croisées
4. **Clarté cognitive** : Comme l'export PDF de DeepMemo, la structure découle naturellement du contenu

**Inspiré par** : La façon dont la structure hiérarchique de DeepMemo devient naturellement une structure de document dans l'export PDF. La documentation reflète cette clarté cognitive.

---

**DeepMemo V0.11.0** - Open Source (Licence MIT)

Construit avec : Vanilla JavaScript ES6+, IndexedDB (Dexie.js), Service Workers

Auteur : Fabien | Site web : https://deepmemo.org/
