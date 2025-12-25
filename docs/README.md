# 📖 DeepMemo - Documentation Complète

> **Concepts, architecture et features détaillées**

DeepMemo est un système de gestion de connaissances personnelles basé sur des nœuds récursifs, interconnectés et actifs. Tout (notes, projets, contacts, fichiers, idées) est un nœud qui peut contenir d'autres nœuds à l'infini.

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
- Structure arborescente
- Navigation par breadcrumbs
- Expansion/collapse de l'arborescence
- État persistant entre les sessions

### 🔗 Système de liens
- **Liens symboliques** : Un nœud peut apparaître à plusieurs endroits (comme `ln -s` sous Linux), renommables indépendamment
- **Backlinks** : Voir automatiquement tous les nœuds qui pointent vers le nœud actuel
- **Wiki-links** : ⚠️ `[[Nom du nœud]]` temporairement désactivé (V0.9+ - refonte avec IDs)

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
- **Toggle view/edit** : Bouton [Afficher]/[Éditer] + raccourci Alt+V
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
- **Icônes adaptatives** : Générateur d'icônes inclus (`generate-icons.html`)
- **Déploiement HTTPS** : Compatible GitHub Pages, Netlify, Vercel, etc.
- **Documentation complète** : Guide installation et test dans `docs/PWA.md`

### ⌨️ Raccourcis clavier
- `Alt+N` : Nouveau nœud (enfant si un nœud est sélectionné, racine sinon)
- `Alt+E` : Focus sur l'éditeur
- `Ctrl+K` : Recherche globale
- `Alt+V` : Alterner mode affichage/édition
- `Escape` : Remonter au parent
- `↑↓←→` : Navigation dans l'arbre

## 🏗️ Architecture actuelle (V0.8 - Modulaire ES6)

### Format
- **Multifile modulaire** : HTML + CSS + JS ES6 modules
- `index.html` : Structure HTML minimale
- `src/css/` : Styles organisés (base, layout, components, utilities)
- `src/js/app-new.js` : Point d'entrée principal
- `src/js/core/` : Gestion données
- `src/js/features/` : Modules fonctionnels (tree, editor, search, tags, drag-drop, modals)
- `src/js/ui/` : Composants UI (toast, panels)
- `src/js/utils/` : Utilitaires (routing, keyboard, helpers)
- **100% Vanilla** JavaScript ES6+ (pas de framework)
- CSS Variables pour le theming
- LocalStorage pour la persistence

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

## 🚀 Prochaines étapes (V0.9)

### Features à implémenter
- [ ] Navigation via liens `[[titre]]` cliquables
- [ ] Vue liste nested (enfants = contenu principal)
- [ ] Export/Import formats externes (Markdown, Notion, Obsidian)
- [ ] Thèmes personnalisables
- [ ] Permissions multi-user (chmod-style)
- [ ] Types de nœuds actifs (avec scripts)

## 💡 Vision long-terme

DeepMemo évolue vers :
- Un système distribué/fédéré
- Des nœuds "actifs" avec comportements scriptables
- Une interface vocale
- Multi-utilisateur avec permissions fines
- Un véritable "OS pour données personnelles"

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
- JavaScript ES6+ (Classes, Modules prévu en V0.7)
- LocalStorage API

## 👤 Auteur

**Fabien** - Développeur passionné travaillant sur DeepMemo depuis 4 ans (conception mentale), maintenant en développement actif.

## 📄 Licence

Projet personnel - Pas de licence définie pour le moment.

---

**DeepMemo V0.8** - 24 Décembre 2025
