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

→ En savoir plus : [Pourquoi les structures hiérarchiques sont universelles](docs/1-CONCEPTS.md)

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
- 📤 Export/Import : .dm (archive), .json (LLM-friendly), FreeMind, Mermaid, PDF
- 🌐 URLs partageables (lecture seule, données locales)
- 🔐 Souveraineté des données (IndexedDB)
- 📄 Génération PDF (en ligne avec rate limiting ou CLI offline)

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

**Vision long-terme** : Voir [ROADMAP.md](docs/development/ROADMAP.md) pour l'historique du projet et les directions explorées (collaboration décentralisée, synchronisation).

---

## 📚 Documentation

**Pour utilisateurs** :
- [Guide complet d'utilisation](docs/README.md)
- [Installation PWA](docs/guides/PWA.md)
- [Pourquoi des structures hiérarchiques ?](docs/1-CONCEPTS.md)

**Pour développeurs** :
- [Architecture technique](docs/2-ARCHITECTURE.md)
- [Guide de développement](docs/development/CONTRIBUTING.md)
- [Historique et roadmap](docs/development/ROADMAP.md)
- [Internationalisation (i18n)](docs/guides/I18N.md)

---

## 🔧 Stack technique

**100% Vanilla** : HTML5, CSS3, JavaScript ES6+ (aucun framework)

**Stockage** :
- IndexedDB avec Dexie.js (nœuds, paramètres, attachments)
- LocalStorage (legacy, support migration)

**Architecture** : Modules ES6, structure multifile

**Compatible** : Chrome, Firefox, Safari, Edge (dernières versions)

---

## 📝 Version actuelle

**V0.11.0** (Février 2026) - Documentation refactorée et corrections

Cette version apporte une refonte complète de la documentation :
- Documentation restructurée et vérifiée (1-CONCEPTS, 2-ARCHITECTURE, 3-DATA-MODEL, 4-FEATURES)
- Schémas JSON pour validation des imports/exports
- Corrections de bugs et harmonisation du vocabulaire
- Tests de validation ajoutés
- Francisation complète de la documentation

Fonctionnalités principales : hiérarchie infinie, symlinks renommables, tags intelligents, recherche temps réel, mode branche, glisser-déposer, export/import multi-formats (.dm, .json, FreeMind, PDF), pièces jointes avec IndexedDB, synchronisation système de fichiers (Phase 1), PWA installable, interface bilingue.

[→ Voir ROADMAP.md pour l'historique complet](docs/development/ROADMAP.md)

---

## 👤 Auteur

Développé par **Fabien** ([parksto](https://github.com/parksto))

*Conception mentale depuis 5 ans, développement actif depuis 2024*

---

**DeepMemo** - Ton second cerveau, organisé et connecté 🧠
