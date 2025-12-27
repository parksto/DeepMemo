# DeepMemo

> **Ton second cerveau : notes, projets, idées interconnectés**

DeepMemo est un système de gestion de connaissances basé sur un **réseau hiérarchique** de nœuds. Chaque nœud peut contenir d'autres nœuds à l'infini, créant une structure arborescente enrichie de liens symboliques.

**Projet Open Source** (Licence MIT) - Tes données t'appartiennent, stockées localement dans ton navigateur.

---

## 🎯 Pourquoi DeepMemo ?

- **Hiérarchie naturelle** : Organise tes pensées comme tu les penses (projets → tâches → sous-tâches)
- **Liens symboliques** : Un nœud peut apparaître à plusieurs endroits (sans duplication)
- **Mode branche** : Concentre-toi sur une sous-arborescence isolée
- **Keyboard-first** : Navigation complète au clavier, raccourcis documentés
- **100% local** : Aucun serveur, aucun tracking, données dans ton navigateur

---

## 🚀 Essayer DeepMemo

### En ligne (démo instantanée)

→ **[deepmemo.org](https://deepmemo.org)** - Prêt à l'emploi avec contenu de démo

### Localement

```bash
# Clone le repo
git clone https://github.com/parksto/DeepMemo.git
cd DeepMemo

# Lance un serveur HTTP local (nécessaire pour ES6 modules)
python -m http.server 8000

# Ouvre http://localhost:8000
```

**Installable comme PWA** : Icône sur ton bureau, fonctionne offline.

---

## ✨ Features principales

**Organisation** :
- 🌳 Hiérarchie infinie de nœuds récursifs
- 🔗 Liens symboliques (renommables indépendamment)
- 🏷️ Tags avec auto-complétion et tag cloud par branche
- 📎 Fichiers attachés (images, PDFs, etc.) stockés localement

**Navigation** :
- 🔍 Recherche temps réel (titres, contenus, tags)
- ⌨️ Raccourcis clavier pour tout
- 🌲 Mode branche (isolation d'une sous-arborescence)
- 🔖 URLs bookmarkables (`?branch=X#/node/Y`)

**Partage & Collaboration** :
- 📤 Export/Import (global ou branche, format ZIP)
- 🌐 URLs partageables (lecture seule, données locales)
- 🔐 Souveraineté des données (LocalStorage + IndexedDB)

**UX** :
- 🎨 Drag & Drop complet (déplacer, dupliquer, lier)
- 📱 Progressive Web App (installable, offline)
- 📘 Contenu de démo pédagogique au premier lancement
- 🎨 Interface épurée, mode lecture/édition

---

## 🌍 Open Source

**Licence MIT** - Utilise, modifie, distribue librement.

**Contributions bienvenues** :
- Bugs et suggestions : [Issues GitHub](https://github.com/parksto/DeepMemo/issues)
- Code : [Pull Requests](https://github.com/parksto/DeepMemo/pulls)
- Documentation : Toujours améliorable !

**Vision long-terme** : Voir [ROADMAP.md](docs/ROADMAP.md) pour les directions explorées (nœuds actifs, automatisation, collaboration décentralisée).

---

## 📚 Documentation

**Pour utilisateurs** :
- [Guide complet d'utilisation](docs/README.md)
- [Installation PWA](docs/PWA.md)

**Pour développeurs** :
- [Architecture technique](docs/ARCHITECTURE.md)
- [Guide de développement](docs/CONTRIBUTING.md)
- [Historique et roadmap](docs/ROADMAP.md)

---

## 🔧 Stack technique

**100% Vanilla** : HTML5, CSS3, JavaScript ES6+ (aucun framework)

**Stockage** :
- LocalStorage (données structurées)
- IndexedDB (fichiers attachés)

**Architecture** : Modules ES6, structure multifile

**Compatible** : Chrome, Firefox, Safari, Edge (dernières versions)

---

## 📝 Version actuelle

**V0.8** (Décembre 2025) - Stable et complète

Fonctionnalités implémentées : hiérarchie infinie, symlinks renommables, tags intelligents, recherche temps réel, mode branche, drag & drop, export/import branche, attachments, PWA installable.

[→ Voir ROADMAP.md pour l'historique complet](docs/ROADMAP.md)

---

## 👤 Auteur

Développé par **Fabien** ([parksto](https://github.com/parksto))

*Conception mentale depuis 5 ans, développement actif depuis 2024*

---

**DeepMemo** - Ton second cerveau, organisé et connecté 🧠
