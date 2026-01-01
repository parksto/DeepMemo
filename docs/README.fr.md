# 📖 DeepMemo - Documentation Complète

> **Concepts, architecture et features détaillées**

*[English version](README.md)*

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

### ⌨️ Raccourcis clavier
- `Alt+N` : Nouveau nœud (enfant si un nœud est sélectionné, racine sinon)
- `Alt+E` : Passer en mode édition (avec focus automatique)
- `Ctrl+K` : Recherche globale
- `Escape` : Remonter au parent
- `↑↓←→` : Navigation dans l'arbre

## 🏗️ Architecture actuelle (V0.8 - Modulaire ES6)

### Format
- **Multifile modulaire** : HTML + CSS + JS ES6 modules
- `index.html` : Structure HTML minimale
- `src/css/` : Styles organisés (base, layout, components, utilities)
- `src/js/app.js` : Point d'entrée principal
- `src/js/core/` : Gestion données (data, attachments, default-data)
- `src/js/features/` : Modules fonctionnels (tree, editor, search, tags, drag-drop, modals)
- `src/js/ui/` : Composants UI (toast, panels)
- `src/js/utils/` : Utilitaires (routing, keyboard, helpers, i18n)
- **100% Vanilla** JavaScript ES6+ (pas de framework)
- CSS Variables pour le theming
- LocalStorage + IndexedDB pour la persistence

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
- LocalStorage + IndexedDB

## 👤 Auteur

**Fabien** - Développeur passionné travaillant sur DeepMemo depuis 5 ans (conception mentale), maintenant en développement actif.

## 📄 Licence

**MIT** - Logiciel libre et open source.

Tu peux utiliser, modifier et distribuer DeepMemo librement. Tes données t'appartiennent, stockées localement dans ton navigateur.

---

**DeepMemo V0.9.4** - Janvier 2026
