# DeepMemo

> **Ton second cerveau : notes, projets, idées interconnectés**

*[English version](README.md) • [Documentation](docs/README.md) • [Démo en ligne](https://deepmemo.org)*

---

DeepMemo est un système de gestion de connaissances basé sur un **réseau hiérarchique** de nœuds. Chaque nœud peut contenir d'autres nœuds à l'infini, créant une structure arborescente enrichie de liens symboliques—reflétant comment ton cerveau organise naturellement l'information.

**Projet Open Source** (Licence MIT) - Tes données t'appartiennent, stockées localement dans ton navigateur.

---

## 🧠 Pourquoi des structures hiérarchiques ?

**Les arbres et réseaux ne sont pas qu'un choix de design—ils sont câblés dans notre façon de penser.**

Des neurones de ton cerveau à la syntaxe du langage, des arbres évolutifs aux cartes mentales, **les structures hiérarchiques et réticulées apparaissent partout**. DeepMemo embrasse ce motif universel pour t'aider à organiser la connaissance comme ton esprit le fait déjà.

→ En savoir plus : [Pourquoi les structures hiérarchiques sont universelles](docs/HIERARCHICAL_STRUCTURES.md)

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
- 🌍 Interface bilingue (français/anglais)
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
- [Pourquoi des structures hiérarchiques ?](docs/HIERARCHICAL_STRUCTURES.md)

**Pour développeurs** :
- [Architecture technique](docs/ARCHITECTURE.md)
- [Guide de développement](docs/CONTRIBUTING.md)
- [Historique et roadmap](docs/ROADMAP.md)
- [Internationalisation (i18n)](docs/I18N.md)

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

**V0.9** (Décembre 2025) - Stable et complète

Derniers ajouts : Internationalisation complète (FR/EN), contenu de démo bilingue, interface mobile améliorée.

Fonctionnalités implémentées : hiérarchie infinie, symlinks renommables, tags intelligents, recherche temps réel, mode branche, drag & drop, export/import branche, attachments, PWA installable.

[→ Voir ROADMAP.md pour l'historique complet](docs/ROADMAP.md)

---

## 👤 Auteur

Développé par **Fabien** ([parksto](https://github.com/parksto))

*Conception mentale depuis 5 ans, développement actif depuis 2024*

---

**DeepMemo** - Ton second cerveau, organisé et connecté 🧠
