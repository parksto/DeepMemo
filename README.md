# 🌟 DeepMemo V0.8

> **Ton second cerveau, organisé et connecté**

Système de gestion de connaissances basé sur des **nœuds récursifs**, où tout (notes, projets, contacts, idées) est un nœud qui peut contenir d'autres nœuds à l'infini.

---

## 🚀 Démarrage rapide

```bash
cd DeepMemo
python3 -m http.server 8000
# Ouvrir http://localhost:8000
```

## ✨ Features V0.8

- 🌳 **Hiérarchie infinie** - Nœuds récursifs sans limite
- 🔗 **Liens symboliques** - Un nœud dans plusieurs endroits
- 📎 **Wiki-links** - `[[Titre]]` crée des liens automatiques
- 🏷️ **Tags intelligents** - Auto-complétion + tag cloud
- 🔍 **Recherche temps réel** - Dans titres, contenus et tags
- 🔗 **URLs bookmarkables** - Partage de nœuds ou branches
- 🎨 **Drag & Drop** - Déplacer, dupliquer, lier
- ⌨️ **Keyboard-first** - Navigation complète au clavier

## ⌨️ Raccourcis essentiels

| Raccourci | Action |
|-----------|--------|
| `Alt+N` | Nouveau nœud |
| `Alt+E` | Focus éditeur |
| `Ctrl+K` | Recherche |
| `Escape` | Remonter au parent |
| `↑↓←→` | Navigation arbre |

## 📚 Documentation complète

**→ [Documentation détaillée](docs/README.md)** - Concepts, architecture, features complètes

**Docs par thème** :
- [ROADMAP.md](docs/ROADMAP.md) - État actuel V0.8 et prochaines étapes
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Structure technique détaillée
- [Guide de développement.md](docs/Guide%20de%20développement.md) - Pour contribuer
- [VISION.md](docs/VISION.md) - Vision long-terme (nœuds actifs, types)
- [TODO.md](docs/TODO.md) - Backlog de développement

## 📝 Changelog

**V0.8** (Décembre 2025) - Symlinks & URLs dynamiques
- Refonte complète des liens symboliques (type dédié, titres indépendants)
- Système d'URL dynamiques (bookmarks, mode branche isolée)
- Auto-collapse intelligent de l'arborescence
- Détection de cycles et symlinks externes

**V0.7** - Restructuration multifile
**V0.6** - Version single-file de référence

[→ Voir ROADMAP.md pour l'historique complet](docs/ROADMAP.md)

## 🔧 Stack technique

**100% Vanilla** - HTML5, CSS3, JavaScript ES6+ (sans framework)
**Persistence** - LocalStorage (migration IndexedDB/Backend prévue)
**Architecture** - Multifile (HTML + CSS + JS séparés)

## 🤝 Contribution

Projet personnel en développement actif. Feedback et contributions bienvenues !

**GitHub** : [parksto/DeepMemo](https://github.com/parksto/DeepMemo)

---

**DeepMemo** - Développé par Fabien
*Conception mentale depuis 4 ans, développement actif depuis 2024*
