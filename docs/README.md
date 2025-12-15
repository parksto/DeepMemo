# 🌟 DeepMemo

> **Ton second cerveau, organisé et connecté**

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
- **Wiki-links** : `[[Nom du nœud]]` crée des liens automatiques
- **Liens symboliques** : Un nœud peut apparaître à plusieurs endroits (comme `ln -s` sous Linux)
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

### 🎨 Drag & Drop
- Déplacer des nœuds dans l'arborescence
- Dupliquer (Ctrl + drag)
- Créer des liens symboliques (Ctrl+Alt + drag)
- Réorganiser l'ordre (drag sur zones haut/bas)

### ⌨️ Raccourcis clavier
- `Alt+N` : Nouveau nœud (enfant si un nœud est sélectionné, racine sinon)
- `Alt+E` : Focus sur l'éditeur
- `Ctrl+K` : Recherche globale
- `Escape` : Remonter au parent
- `↑↓←→` : Navigation dans l'arbre

## 🏗️ Architecture actuelle (V0.7)

### Format
- **Multifile** : HTML + CSS + JS séparés
- `index.html` : Structure HTML minimale
- `src/css/style.css` : Tous les styles (~1180 lignes)
- `src/js/app.js` : Toute la logique (~2270 lignes)
- Vanilla JavaScript (pas de framework)
- CSS Variables pour le theming
- LocalStorage pour la persistence

### Structure des données
```javascript
{
  nodes: {
    "node_xxx": {
      id: "node_xxx",
      title: "Titre",
      content: "Contenu markdown",
      children: ["node_yyy", "node_zzz"],
      parent: "node_parent" | null,
      created: timestamp,
      modified: timestamp,
      links: ["Titre du nœud lié"],
      backlinks: ["node_qui_pointe_ici"],
      tags: ["tag1", "tag2"],
      symlinkedIn: ["node_parent_symlink"] // Où ce nœud apparait aussi
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

## 🚀 Prochaines étapes (V0.8)

### Features à implémenter
- [ ] Persistent tree state (améliorer)
- [ ] Vue liste nested (enfants = contenu principal)
- [ ] Export/Import amélioré (Markdown, Notion, Obsidian)
- [ ] Markdown rendering
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

**DeepMemo V0.7** - 15 Décembre 2025
