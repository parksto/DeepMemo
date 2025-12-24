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

## ✨ Features V0.8 (✅ 100% complété)

- 🌳 **Hiérarchie infinie** - Nœuds récursifs sans limite
- 🔗 **Liens symboliques** - Un nœud dans plusieurs endroits, renommables indépendamment
- 🏷️ **Tags intelligents** - Auto-complétion contextuelle + tag cloud par branche
- 🔍 **Recherche temps réel** - Dans titres, contenus et tags (Ctrl+K)
- 🔗 **URLs bookmarkables** - Partage de nœuds ou branches isolées (`?branch=X#/node/Y`)
- 🎨 **Drag & Drop complet** - Déplacer, dupliquer (Ctrl), lier (Ctrl+Alt), réorganiser
- ⌨️ **Keyboard-first** - Navigation complète au clavier avec raccourcis documentés
- 🌲 **Mode branche** - Isolation d'une sous-arborescence avec symlinks externes désactivés
- 🎯 **Auto-collapse intelligent** - Arborescence se replie automatiquement sur le chemin actif
- 📘 **Contenu de démo** - Tutoriel interactif au premier lancement (26 nœuds pédagogiques)
- 🎨 **UX polish** - Mode lecture par défaut, scroll reset, panneau droit masqué, choix de police

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

**V0.8** (24 Décembre 2025) - ✅ COMPLÈTE
- 🔗 Refonte complète des liens symboliques (type dédié, renommables indépendamment)
- 🌐 Système d'URL dynamiques (bookmarks, mode branche isolée)
- 🎯 Auto-collapse intelligent de l'arborescence avec focus visuel symlinks
- 🎨 **Drag & Drop complet** (arbre + enfants, Ctrl/Ctrl+Alt, prévention cycles)
- 📤 **Export/Import de branche** (partage local, régénération IDs, merge non-destructif)
- 📘 **Contenu de démo par défaut** (26 nœuds pédagogiques, tutoriel interactif)
- 🎨 **UX polish** (mode lecture par défaut, scroll reset, right panel masqué, toggle police)
- 🐛 Corrections bugs (renommage symlinks, focus visuel après navigation)

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
