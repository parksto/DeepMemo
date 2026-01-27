# 📖 DeepMemo - Documentation Complète

> **Concepts, architecture et features détaillées**

*[English version](README.md)*

---

## 📚 Index de la Documentation

> **Index central de toute la documentation DeepMemo**. Utilise cette liste lors des mises à jour de documentation pour ne rien oublier.

### 🎯 Documentation Principale (Bilingue)

**Général**
- [`README.md`](README.md) / [`README.fr.md`](README.fr.md) - Vue d'ensemble principale (V0.10.4)
- [`ARCHITECTURE.md`](ARCHITECTURE.md) / [`ARCHITECTURE.fr.md`](ARCHITECTURE.fr.md) - Architecture technique
- [`VISION.md`](VISION.md) / [`VISION.fr.md`](VISION.fr.md) - Vision et philosophie du projet
- [`ROADMAP.md`](ROADMAP.md) / [`ROADMAP.fr.md`](ROADMAP.fr.md) - Feuille de route de développement

**Spécifications Techniques**
- [`FILE-FORMATS.md`](FILE-FORMATS.md) / [`FORMATS-FICHIERS.md`](FORMATS-FICHIERS.md) - Formats export/import (⚠️ EN: v2.0, FR: v1.0)
- [`SPEC-ATTACHMENTS.md`](SPEC-ATTACHMENTS.md) / [`SPEC-ATTACHMENTS.fr.md`](SPEC-ATTACHMENTS.fr.md) - Système de pièces jointes
- [`STORAGE.md`](STORAGE.md) / [`STORAGE.fr.md`](STORAGE.fr.md) - Stockage IndexedDB
- [`I18N.md`](I18N.md) / [`I18N.fr.md`](I18N.fr.md) - Internationalisation
- [`PWA.md`](PWA.md) / [`PWA.fr.md`](PWA.fr.md) - Progressive Web App

**Sujets Détaillés**
- [`HIERARCHICAL_STRUCTURES.md`](HIERARCHICAL_STRUCTURES.md) / [`HIERARCHICAL_STRUCTURES.fr.md`](HIERARCHICAL_STRUCTURES.fr.md) - Structures hiérarchiques
- [`TODO.md`](TODO.md) / [`TODO.fr.md`](TODO.fr.md) - Tâches de développement

**Contribution**
- [`CONTRIBUTING.md`](CONTRIBUTING.md) / [`CONTRIBUTING.fr.md`](CONTRIBUTING.fr.md) - Guide de contribution

### 📄 Détails des Formats de Fichiers

- [`file-formats/JSON-STRUCTURE.md`](file-formats/JSON-STRUCTURE.md) - Format JSON d'interchange
- [`file-formats/ZIP-FORMAT.md`](file-formats/ZIP-FORMAT.md) - Format archive .dm
- [`file-formats/SCHEMA-VALIDATION.md`](file-formats/SCHEMA-VALIDATION.md) - Validation JSON Schema

### 🔮 Prospective (Vision Future)

- [`Prospective/1-FUTURE-VISION.md`](Prospective/1-FUTURE-VISION.md) - Vision à long terme
- [`Prospective/2-DEEPMEMO-ACTIVE-NODES.md`](Prospective/2-DEEPMEMO-ACTIVE-NODES.md) - Concept de nœuds actifs
- [`Prospective/3-USE-CASES.md`](Prospective/3-USE-CASES.md) - Cas d'usage futurs
- [`Prospective/4-PARADOX.md`](Prospective/4-PARADOX.md) - Paradoxes philosophiques
- [`Prospective/5-ACTION.md`](Prospective/5-ACTION.md) - Plans d'action

### 🛠️ Développement

- [`CONTEXT-CLAUDE-PROJECTS.md`](CONTEXT-CLAUDE-PROJECTS.md) - Contexte pour Claude Code (⚠️ Devrait être CLAUDE.md à la racine)
- [`../cloudflare-worker/README.md`](../cloudflare-worker/README.md) - Worker export PDF
- [`../cloudflare-worker/PRIVACY-NOTICE.md`](../cloudflare-worker/PRIVACY-NOTICE.md) - Notice de confidentialité PDF

### 📋 Checklist de Mise à Jour

Lors de changements significatifs à DeepMemo, assure-toi de mettre à jour :
1. ✅ Les deux versions linguistiques (EN + FR) des fichiers concernés
2. ✅ Les numéros de version dans les fichiers README
3. ✅ ROADMAP pour les nouvelles features ou items complétés
4. ✅ ARCHITECTURE pour les changements structurels
5. ✅ FILE-FORMATS / FORMATS-FICHIERS pour les changements de format de données
6. ✅ SPEC-ATTACHMENTS pour les changements liés aux pièces jointes
7. ✅ Les fichiers pertinents dans le sous-dossier file-formats/
8. ✅ Cet index si une nouvelle documentation est ajoutée

---

DeepMemo est un système de gestion de connaissances personnelles basé sur un **réseau hiérarchique** de nœuds récursifs, interconnectés et actifs. Tout (notes, projets, contacts, fichiers, idées) est un nœud qui peut contenir d'autres nœuds à l'infini.

## 🎯 Concept central

**Un seul type de base : le Nœud**

Chaque nœud possède :
- Un titre
- Du contenu (texte, markdown)
- Des enfants (autres nœuds)
- Des liens vers d'autres nœuds
- Des tags
- Des propriétés personnalisables

## ✨ Caractéristiques principales

### 🌳 Hiérarchie flexible
- Navigation par breadcrumbs
- Expansion/collapse de l'arborescence
- État persistant entre les sessions

### 🔗 Système de liens
- **Structure arborescente réticulée** : L'arborescence hiérarchique devient un réseau maillé grâce aux symlinks
- **Liens symboliques** : Un nœud peut apparaître à plusieurs endroits (comme `ln -s` sous Linux), renommables indépendamment
- **Backlinks** : Voir automatiquement tous les nœuds qui pointent vers le nœud actuel

### 🏷️ Tags
- Système de tags dédié
- Auto-complétion intelligente (tags de la branche + tags globaux)
- Tag cloud par branche
- Recherche par tag

### 🔍 Recherche globale
- Recherche temps réel (Ctrl+K)
- Recherche dans titres, contenus et tags
- Navigation clavier
- Highlights des résultats

### 🔗 URL Dynamiques (V0.8)
- **URLs bookmarkables** : `#/node/nodeId`
- **Persistence après refresh** : Rester sur le nœud actif
- **Mode branche isolée** : `?branch=nodeId` pour afficher uniquement un sous-arbre
- **Partage facile** : Icônes 🔗 (nœud) et 🌳 (branche)
- **Navigation navigateur** : Support des boutons précédent/suivant

### 📦 Export/Import de Branche (V0.8)
- **Export local** : Exporter un nœud + tous ses descendants
- **Import non-destructif** : Importer comme enfants du nœud actuel
- **Régénération des IDs** : Évite les conflits avec les nœuds existants
- **Conservation des symlinks** : Relations préservées dans la branche importée
- **Partage collaboratif** : Première étape pour utilisation multi-utilisateurs

### 🌍 Internationalisation (V0.9)
- **Interface bilingue** : Support complet français/anglais
- **Détection automatique** : Langue détectée depuis les paramètres du navigateur
- **Sélecteur manuel** : Basculer FR/EN dans le panneau droit
- **Contenu de démo bilingue** : 26 nœuds pédagogiques dans les deux langues
- **Manifests PWA** : Noms et descriptions d'app localisés
- **Compatible offline** : Tous les dictionnaires pré-cachés

### 📘 Contenu de Démonstration (V0.8)
- **Tutoriel interactif** : 26 nœuds pédagogiques au premier lancement
- **Structure progressive** : Découverte par l'exploration de l'arborescence
- **Fonctionnalités actuelles** : Nœuds, symlinks, tags, branche, export/import, raccourcis
- **Vision future** : Types actifs, triggers multi-nœuds, API externe, multi-user
- **Format pédagogique** : [Fonctionnalité → Ce que ça permet → Exemple concret]
- **Suppressible** : Instructions pour supprimer le contenu de démo incluses

### 📄 Affichage et Rendu (V0.7+)
- **Markdown rendering** : Affichage formaté du contenu
- **Mode view par défaut** : Lecture prioritaire sur édition (V0.8)
- **Toggle view/edit** : Bouton [Afficher]/[Éditer] + raccourci Alt+E
- **Sidebar redimensionnable** : Ajustable à la souris
- **Auto-collapse** : Arborescence repliée sauf chemin actif
- **Scroll reset** : Retour en haut du contenu à chaque navigation (V0.8)
- **Right panel masqué** : Interface épurée par défaut, ouverture via [i] (V0.8)
- **Choix de police** : Toggle Sto (personnalisée) vs système (V0.8)

### 🎨 Drag & Drop (V0.8 - Complet)
- **Déplacer** : Glisser-déposer pour changer de parent ou réorganiser
- **Dupliquer** : Ctrl + drag pour copier avec descendants
- **Lier** : Ctrl+Alt + drag pour créer un lien symbolique
- **Zones précises** : Indicateurs visuels before/after/inside
- **Prévention cycles** : Détection automatique des références circulaires
- **Support complet** : Fonctionne dans arbre ET liste enfants

### 📱 Progressive Web App (V0.8)
- **Installation native** : Installable comme une vraie application sur desktop/mobile
- **Mode offline** : Fonctionne sans connexion Internet (cache intelligent)
- **Service Worker** : Cache automatique de tous les fichiers statiques
- **Ouverture standalone** : Lance en fenêtre dédiée (sans barre d'adresse)
- **Icônes adaptatives** : Générateur d'icônes (utilisé une fois, supprimé après génération)
- **Déploiement HTTPS** : Compatible GitHub Pages, Netlify, Vercel, etc.
- **Documentation complète** : Guide installation et test dans `docs/PWA.md`

### 📎 Fichiers joints (V0.8)
- **Upload de fichiers** : Attache des fichiers (images, PDFs, documents) à n'importe quel nœud
- **Stockage IndexedDB** : Limite ~500 MB selon navigateur (vs localStorage limité à ~5-10 MB)
- **Affichage inline** : Images affichées directement avec syntaxe markdown `![](attachment:ID)`
- **Liens de téléchargement** : Autres fichiers téléchargeables avec `[nom](attachment:ID)`
- **Export/Import ZIP** : Format ZIP systématique incluant fichiers + données JSON
- **Gestion complète** : Upload, download, delete, copie syntaxe, garbage collection
- **Indicateur stockage** : Barre de progression temps réel dans panneau droit
- **Types supportés** : Images, PDFs, vidéos, audio, documents (50 MB max par fichier)
- **Documentation** : Spec complète dans `docs/SPEC-ATTACHMENTS.md`

### 💾 Stockage IndexedDB (V0.10)
- **Stockage scalable** : Migration de localStorage vers IndexedDB avec Dexie.js
- **Capacité augmentée** : 500 MB - 1 GB de stockage (vs ~5-10 MB avec localStorage)
- **Performance** : Meilleure gestion des grands ensembles de données et pièces jointes
- **Migration automatique** : Mise à niveau transparente depuis V0.9 en préservant toutes les données
- **Support backup** : Données localStorage originales préservées après migration

### 📦 Format Archive .dm (V0.10)
- **Format d'export standard** : Fichiers `.dm` (archives ZIP avec extension personnalisée)
- **Packaging complet** : Inclut metadata.json, data.json, et dossier attachments
- **Suivi de version** : Métadonnées d'export avec version, date, nombre de nœuds, info générateur
- **Rétrocompatible** : Supporte toujours les formats .json et ZIP legacy
- **Compatible LLM** : Format d'interchange .json toujours disponible pour génération IA
- **Documentation** : Spec complète dans `docs/FORMATS-FICHIERS.md`

### 📄 Export PDF (V0.10)
- **Génération de documents** : Exporter des branches en documents PDF formatés
- **Résolution des symlinks** : Inclut automatiquement le contenu lié
- **Images inline** : Pièces jointes converties en base64 pour intégration
- **Table des matières** : TOC hiérarchique pour la navigation
- **Deux implémentations** :
  - **CloudFlare Worker** : Génération en ligne avec rate limiting (code prêt, pas encore déployé)
  - **Outil CLI** : 100% offline avec `bin/branch2pdf.js` (Node.js + Puppeteer)
- **Focus confidentialité** : Hashing IP (SHA-256) pour la version en ligne
- **Documentation** : `cloudflare-worker/README.md`

### ⌨️ Raccourcis clavier
- `Alt+N` : Nouveau nœud (enfant si un nœud est sélectionné, racine sinon)
- `Alt+E` : Passer en mode édition (avec focus automatique)
- `Ctrl+K` : Recherche globale
- `Escape` : Remonter au parent
- `↑↓←→` : Navigation dans l'arbre

## 🏗️ Architecture actuelle (V0.10 - Modulaire ES6)

### Format
- **Multifile modulaire** : HTML + CSS + JS ES6 modules
- `index.html` : Structure HTML minimale
- `src/css/` : Styles organisés (base, layout, components, utilities, mobile)
- `src/js/app.js` : Point d'entrée principal
- `src/js/core/` : Gestion données (data, storage, migration, attachments, default-data)
- `src/js/features/` : Modules fonctionnels (tree, editor, search, tags, drag-drop, modals)
- `src/js/ui/` : Composants UI (toast, panels, mobile-tabs)
- `src/js/utils/` : Utilitaires (routing, keyboard, helpers, i18n, sync)
- **100% Vanilla** JavaScript ES6+ (pas de framework)
- CSS Variables pour le theming
- **IndexedDB avec Dexie.js** pour la persistence (V0.10)

### Structure des données
```javascript
{
  nodes: {
    "node_xxx": {
      id: "node_xxx",
      type: "node",  // "node" (normal) ou "symlink" (V0.8)
      title: "Titre",
      content: "Contenu markdown",
      children: ["node_yyy", "node_zzz"],
      parent: "node_parent" | null,
      created: timestamp,
      modified: timestamp,
      links: ["Titre du nœud lié"],
      backlinks: ["node_qui_pointe_ici"],
      tags: ["tag1", "tag2"],
      attachments: ["attach_123_abc"],  // IDs IndexedDB (V0.8)
      targetId: "node_target"  // Si type === "symlink" (V0.8)
    }
  },
  rootNodes: ["node_aaa", "node_bbb"]
}
```

## 🎨 Interface

- **Sidebar gauche** : Arborescence complète
- **Zone centrale** : Éditeur du nœud actuel + enfants en cartes
- **Panel droit** : Métadonnées, liens, backlinks, tags cloud
- **Dark theme** par défaut

## 🚀 Prochaines étapes (V1.0)

### Features à implémenter
- [ ] Navigation via liens `[[titre]]` cliquables
- [ ] Vue liste nested (enfants = contenu principal)
- [ ] Export/Import formats externes (Markdown, Notion, Obsidian)
- [ ] Thèmes personnalisables
- [ ] Permissions multi-user (chmod-style)
- [ ] Types de nœuds actifs (avec scripts)

## 💡 Vision long-terme

Pour découvrir les directions explorées (nœuds actifs, automatisation, collaboration décentralisée), consulte la section **"🔮 Directions explorées"** dans le contenu de démo de l'application.

**Ton humble et ouvert** : Ces idées sont des pistes de réflexion, pas des promesses. DeepMemo est Open Source (MIT), contributions bienvenues !

## 🛠️ Développement

### Serveur local
```bash
cd deepMemo
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000
```

### Technologies
- HTML5
- CSS3 (Variables, Flexbox, Grid)
- JavaScript ES6+ (Classes, Modules)
- IndexedDB avec Dexie.js (V0.10)
- Service Worker (PWA)

## 👤 Auteur

**Fabien** - Développeur passionné travaillant sur DeepMemo depuis 5 ans (conception mentale), maintenant en développement actif.

## 📄 Licence

**MIT** - Logiciel libre et open source.

Tu peux utiliser, modifier et distribuer DeepMemo librement. Tes données t'appartiennent, stockées localement dans ton navigateur.

---

**DeepMemo V0.10.4** - Janvier 2026
