# DeepMemo

> **Votre second cerveau numérique : notes interconnectées, projets et idées**

*[English version](README.md) • [Documentation](docs/README.fr.md) • [Démo en ligne](https://deepmemo.org)*

---

DeepMemo est un système de gestion des connaissances basé sur un **réseau hiérarchique** de nœuds. Chaque nœud peut contenir un nombre infini de nœuds enfants, créant une structure arborescente enrichie de liens symboliques — à l'image de la manière dont votre cerveau organise naturellement l'information.

**Projet Open Source** (Licence MIT) - Vos données vous appartiennent, stockées localement dans votre navigateur.

---

## 🧠 Pourquoi des Structures Hiérarchiques ?

**Les arbres et les réseaux ne sont pas qu'un choix de design — ils sont inscrits dans notre façon de penser.**

Des neurones de votre cerveau à la syntaxe du langage, des arbres évolutifs aux cartes mentales, **les structures hiérarchiques et en réseau apparaissent partout**. DeepMemo adopte ce modèle universel pour vous aider à organiser vos connaissances comme votre esprit le fait déjà.

→ En savoir plus : [Pourquoi les structures hiérarchiques sont universelles](docs/HIERARCHICAL_STRUCTURES.md)

---

## 🎯 Pourquoi DeepMemo ?

- **Hiérarchie naturelle** : Organisez vos pensées comme vous les pensez (projets → tâches → sous-tâches)
- **Liens symboliques** : Un nœud peut apparaître à plusieurs endroits (sans duplication)
- **Mode branche** : Concentrez-vous sur une sous-arborescence isolée tout en préservant le contexte
- **Navigation au clavier** : Navigation complète au clavier, raccourcis documentés
- **100% local** : Pas de serveur, pas de tracking, les données restent dans votre navigateur
- **Vraiment à vous** : LocalStorage + IndexedDB, exportez à tout moment

---

## 🚀 Essayer DeepMemo

### En ligne (démo instantanée)

→ **[deepmemo.org](https://deepmemo.org)** - Prêt à l'emploi avec du contenu de démonstration

### Localement

```bash
# Cloner le dépôt
git clone https://github.com/parksto/DeepMemo.git
cd DeepMemo

# Démarrer un serveur HTTP local (requis pour les modules ES6)
python -m http.server 8000

# Ouvrir http://localhost:8000
```

**Installable en PWA** : Icône sur le bureau, fonctionne hors ligne.

---

## ✨ Fonctionnalités Clés

**Organisation** :
- 🌳 Hiérarchie infinie de nœuds récursifs
- 🔗 Liens symboliques (renommables indépendamment)
- 🏷️ Tags avec auto-complétion et nuage de tags par branche
- 📎 Pièces jointes (images, PDFs, etc.) stockées localement

**Navigation** :
- 🔍 Recherche en temps réel (titres, contenu, tags)
- ⌨️ Raccourcis clavier pour tout
- 🌲 Mode branche (isolation de sous-arborescence)
- 🔖 URLs partageables (`?branch=X#/node/Y`)

**Partage & Collaboration** :
- 📤 Export/Import : .dm (archive), .json (compatible LLM), fichier Mind map, image Mind map, PDF, système de fichiers (contenu markdown, dossiers hiérarchiques, pièces jointes)
- 🔐 Souveraineté des données (LocalStorage + IndexedDB)
- 📄 Génération PDF (en ligne avec limitation ou CLI hors ligne)

**UX** :
- 🎨 Glisser-Déposer complet (déplacer, dupliquer, lier)
- 📱 Progressive Web App (installable, hors ligne)
- 📘 Contenu de démonstration éducatif au premier lancement
- 🌍 Interface bilingue (Français/Anglais)
- 🎨 Interface épurée, modes lecture/édition

---

## 🌍 Open Source

**Licence MIT** - Utilisez, modifiez, distribuez librement.

**Contributions bienvenues** :
- Bugs et suggestions : [GitHub Issues](https://github.com/parksto/DeepMemo/issues)
- Code : [Pull Requests](https://github.com/parksto/DeepMemo/pulls)
- Documentation : Toujours améliorable !

---

## 📚 Documentation

**Pour les utilisateurs** :
- [Guide d'utilisation complet](docs/README.fr.md)
- [Pourquoi les structures hiérarchiques ?](docs/HIERARCHICAL_STRUCTURES.md)

**Pour les développeurs** :
- [Architecture technique](docs/2-ARCHITECTURE.md)
- [Guide de développement](docs/development/CONTRIBUTING.md)
- [Historique et feuille de route](docs/development/ROADMAP.md)
- [Internationalisation (i18n)](docs/guides/I18N.md)

---

## 🔧 Stack Technique

**100% Vanilla** : HTML5, CSS3, JavaScript ES6+ (pas de framework)

**Stockage** :
- IndexedDB avec Dexie.js (nœuds, paramètres, pièces jointes)
- LocalStorage (legacy, support migration)

**Architecture** : Modules ES6, structure multi-fichiers

**Compatible** : Chrome, Firefox, Safari, Edge (dernières versions)

---

## 📝 Version Actuelle

**V0.10.5** (Janvier 2026) - Stable et complet

Derniers ajouts :
- Stockage IndexedDB avec Dexie.js (capacité 500MB-1GB)
- Format d'archive .dm (basé sur ZIP avec métadonnées)
- Export PDF (en ligne via CloudFlare Worker ou CLI hors ligne)
- Améliorations import (choix remplacer/fusionner, support export global dans import branche)
- Images inline dans PDFs, gestion de la portée des symlinks

Fonctionnalités implémentées : hiérarchie infinie, symlinks renommables, tags intelligents, recherche temps réel, mode branche, glisser-déposer, export/import multi-formats (.dm, .json, FreeMind, Mermaid, PDF), pièces jointes avec IndexedDB, PWA installable, interface bilingue.

[→ Voir ROADMAP.md pour l'historique complet](docs/development/ROADMAP.md)

---

## 🤝 Contribuer

Nous accueillons les contributions ! Que ce soit :
- 🐛 Rapports de bugs
- 💡 Suggestions de fonctionnalités
- 🌍 Traductions (nouvelles langues)
- 📝 Améliorations de documentation
- 💻 Contributions de code

Veuillez lire [CONTRIBUTING.md](docs/development/CONTRIBUTING.md) pour les directives.

---

## 👤 Auteur

Développé par **Fabien** ([parksto](https://github.com/parksto))

*Conceptualisé pendant 5 ans, développement actif depuis 2024*


---

**DeepMemo** - Votre second cerveau, organisé et connecté 🧠

*Travailler avec votre esprit, pas contre lui.*
