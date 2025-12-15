# 🌟 DeepMemo V0.7

> **Ton second cerveau, organisé et connecté**

DeepMemo est un système de gestion de connaissances personnelles basé sur des nœuds récursifs, interconnectés et actifs.

## 🚀 Démarrage rapide

### Lancer l'application

```bash
# Depuis WSL Ubuntu ou tout terminal bash
cd DeepMemo
python3 -m http.server 8000
```

Puis ouvrir dans ton navigateur : **http://localhost:8000**

### Structure du projet

```
DeepMemo/
├── index.html              # Point d'entrée
├── src/
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       └── app.js          # Logique
├── reference/
│   └── deepmemo-reference.html  # Version single-file (référence)
├── docs/
│   ├── README.md           # Présentation du concept
│   ├── ROADMAP.md          # État et prochaines étapes
│   ├── ARCHITECTURE.md     # Détails techniques
│   ├── START.md            # Guide de démarrage
│   └── VISION.md           # Vision long-terme
└── .gitignore
```

## 📚 Documentation

- **[Concept et features](docs/README.md)** - Comprendre DeepMemo
- **[Roadmap](docs/ROADMAP.md)** - État actuel et bugs connus
- **[Architecture](docs/ARCHITECTURE.md)** - Détails techniques
- **[Vision](docs/VISION.md)** - Concepts avancés

## ⌨️ Raccourcis clavier

- `Alt+N` : Nouveau nœud
- `Alt+E` : Focus éditeur
- `Ctrl+K` : Recherche globale
- `Escape` : Remonter au parent
- `↑↓←→` : Navigation dans l'arbre

## ✨ Features principales

- 🌳 **Hiérarchie flexible** - Structure arborescente infinie
- 🔗 **Liens intelligents** - Wiki-links `[[...]]` + backlinks automatiques
- 🏷️ **Tags** - Auto-complétion + tag cloud
- 🔍 **Recherche** - Temps réel, dans tout le contenu
- 🎨 **Drag & Drop** - Déplacer, dupliquer, créer des liens symboliques
- ⌨️ **Keyboard-first** - Navigation complète au clavier

## 🔧 Technologies

- HTML5
- CSS3 (Variables, Flexbox, Grid)
- JavaScript ES6+ (Vanilla, pas de framework)
- LocalStorage pour la persistence

## 📝 Notes de version

**V0.7** (Décembre 2025)
- ✅ Restructuration en multifile (HTML + CSS + JS séparés)
- ✅ Structure de projet propre et évolutive
- ✅ Fix bug de sélection dans les modales
- ✅ Repo GitHub créé

**V0.6** (Version de référence)
- Single-file HTML fonctionnel
- Toutes les features de base implémentées

## 🐛 Bugs connus

Voir [ROADMAP.md](docs/ROADMAP.md) pour la liste complète des bugs et features à venir.

## 🤝 Contribution

Projet personnel en développement actif. Feedback bienvenu !

---

**DeepMemo** - Développé par Fabien
