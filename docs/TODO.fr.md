# 📋 DeepMemo - État actuel et prochaines étapes

*[English version](TODO.md)*

**Dernière mise à jour** : 19 Janvier 2026 (V0.10.4 - IndexedDB & format .dm)

---

## ✅ V0.8 - 100% COMPLÉTÉE

DeepMemo V0.8 est **complète et déployée** avec toutes les fonctionnalités suivantes :

### Features principales
- ✅ Arborescence intelligente avec auto-collapse
- ✅ Liens symboliques renommables (système refactoré)
- ✅ URL dynamiques (`?branch=X#/node/Y`)
- ✅ Mode branche isolée
- ✅ Tags avec auto-complétion
- ✅ Recherche temps réel
- ✅ Drag & drop complet (Ctrl, Ctrl+Alt)
- ✅ Raccourcis clavier documentés
- ✅ Export/Import de branche (non-destructif)
- ✅ Contenu de démo pédagogique (26 nœuds)
- ✅ PWA installable (offline, desktop, mobile)
- ✅ Fichiers joints (IndexedDB, export ZIP)

### UI/UX
- ✅ Mode view par défaut
- ✅ Right panel masqué par défaut
- ✅ Scroll reset à la navigation
- ✅ Toggle police (Sto vs système)
- ✅ Breadcrumb intelligent
- ✅ Indicateur de stockage

### Documentation
- ✅ README.md (accueillant, MIT, Open Source)
- ✅ docs/README.md (features complètes)
- ✅ docs/ROADMAP.md (état V0.8, prévisions V0.9/V1.0)
- ✅ docs/ARCHITECTURE.md (modules ES6)
- ✅ docs/CONTRIBUTING.md (guide développement)
- ✅ docs/PWA.md (guide utilisation)
- ✅ docs/SPEC-ATTACHMENTS.md (référence architecture)
- ✅ docs/VISION.md (vision long-terme)
- ✅ CLAUDE.md (contexte développement)

---

## 🎯 V0.9 - Internationalisation (i18n) - ✅ COMPLÉTÉE

**Objectif** : Rendre DeepMemo accessible à une audience internationale

**Contexte** : DeepMemo est déjà utile et déployé en production sur deepmemo.org. La priorité est de permettre au plus grand nombre d'en bénéficier avant d'implémenter de nouvelles fonctionnalités complexes.

### Système i18n

**Features** :
- [x] Module `i18n.js` lightweight (pas de dépendance externe)
- [x] Support FR/EN minimum (ES optionnel)
- [x] Dictionnaires de traduction (UI, messages, erreurs)
- [x] Détection langue navigateur + sélecteur manuel
- [x] Persistence dans `localStorage.deepmemo_language`
- [x] Précache des dictionnaires dans Service Worker (PWA offline)

### Contenu à traduire

**Interface** :
- [x] Labels HTML statiques (`index.html`)
- [x] Labels dynamiques JS (boutons, modales, toasts)
- [x] Placeholders et attributs (`title`, `aria-label`)
- [x] Messages d'erreur et confirmations

**Contenu de démo** :
- [x] `default-data.js` - Version FR et EN complètes (26 nœuds pédagogiques)
- [x] Détection automatique selon langue du navigateur

**Documentation** :
- [x] Tous les docs publics traduits en anglais (README, PWA, etc.)
- [x] Documentation bilingue (EN prioritaire, FR secondaire)
- [x] Liens croisés dans tous les fichiers de doc

### Tests et validation

- [x] Tests sur navigateurs multilingues
- [x] Vérification fallback (langue non supportée → EN)
- [x] Documentation utilisateur (comment changer de langue)

### Améliorations tags (Optionnel - après i18n)

- [ ] Éviter duplication UI (center panel vs right panel)
- [ ] Création rapide via #hashtag dans le contenu
- [ ] Renommage de tags globalement
- [ ] Fusion de tags

### Export/Import formats externes (Optionnel - après i18n)

- [ ] Export Markdown (avec structure préservée)
- [ ] Import depuis Notion
- [ ] Import depuis Obsidian

---

## 🐛 V0.9.1 - Corrections de bugs & Améliorations qualité - ✅ COMPLÉTÉ

**Date** : 31 décembre 2025
**Contexte** : Corrections post-lancement suite à l'annonce publique (449 sessions uniques sur Reddit)

### Corrections de bugs critiques

**Liens symboliques** :
- [x] Corrigé : Créer un enfant depuis un symlink ajoute maintenant l'enfant à la **cible** au lieu du symlink lui-même
- [x] Corrigé : Affichage du titre du symlink - montre le **titre propre du symlink** (pas celui de la cible) dans le panneau central
- [x] Ajouté : Indicateur visuel dans les métadonnées montrant le lien vers le nœud original (cliquable)

**Persistance des données** :
- [x] Corrigé : `Esc` (remonter au parent) **sauvegarde le nœud actuel** avant la navigation
- [x] Corrigé : `Alt+E` (basculer mode vue) **sauvegarde avant de basculer** (affiche les modifications immédiatement)
- [x] Corrigé : Toute navigation (clics arbre, flèches, breadcrumb) **sauvegarde automatiquement** avant de changer de nœud

**UI/i18n** :
- [x] Corrigé : Contenu vide dans la liste des enfants affichait `[labels.emptyContent]` → affiche maintenant le texte traduit
- [x] Corrigé : Arborescence du modal d'actions en mode branche affichait l'**arbre global** → affiche maintenant **seulement la branche**

### Nouvelles fonctionnalités

**Nettoyage des nœuds orphelins** :
- [x] Nouvelle fonction : `cleanOrphanNodes()` dans `data.js`
- [x] Détecte les nœuds non référencés (ni dans rootNodes, ni dans children, ni dans symlink targets)
- [x] Bouton UI dans la section stockage du panneau droit
- [x] Confirmation + retour toast
- [x] Traductions complètes FR/EN

**Synchronisation multi-onglets** :
- [x] Implémentation du listener d'événement `storage`
- [x] Synchronisation temps réel entre onglets quand localStorage change
- [x] Rechargement intelligent : préserve le nœud actuel s'il existe, va à la racine s'il est supprimé
- [x] Notifications toast : "Données rechargées" / "Données rechargées - nœud supprimé"
- [x] Parfait pour le workflow : branche dans nouvel onglet → auto-sync vers onglet principal

**Banner d'avertissement mobile** :
- [x] Détection appareils mobiles (Android, iOS, iPad, etc.)
- [x] Banner orange non-intrusif en haut
- [x] Message professionnel sur l'expérience mobile en cours d'amélioration
- [x] Fermeture (×) avec persistance localStorage (s'affiche une fois)
- [x] Animation slide-down, design responsive
- [x] Traductions complètes FR/EN

### Améliorations techniques

**Qualité du code** :
- [x] Version Service Worker mise à jour v1.4.0
- [x] Toutes les nouvelles fonctionnalités entièrement compatibles i18n
- [x] Gestion d'erreurs cohérente et retours utilisateur

**Expérience utilisateur** :
- [x] Plus de modifications perdues lors de la navigation
- [x] Retour clair pour toutes les opérations
- [x] Gestion professionnelle des utilisateurs mobiles
- [x] Workflow multi-onglets fluide

---

## 📘 V0.9.2+ - Modal aide Markdown - ✅ COMPLÉTÉ

**Date** : 31 décembre 2025
**Contexte** : Amélioration UX - rendre Markdown plus accessible et clarifier qu'il est optionnel

### Modal aide Markdown

**Nouvelle fonctionnalité** :
- [x] Cheatsheet Markdown accessible via raccourci clavier **Alt+H**
- [x] Guide complet avec 9 sections : titres, formatage, listes, liens, images, code, citations, séparateurs horizontaux, tableaux
- [x] Modal responsive avec support du scroll
- [x] 100% traduit (FR/EN) avec système i18n
- [x] Compatible hors-ligne (Service Worker précache)

**Contenu de démo mis à jour** :
- [x] Ajout section "✍️ Le Markdown : optionnel et accessible" dans le nœud "📝 Le panneau central" (FR + EN)
- [x] Précise que le texte brut est parfaitement acceptable
- [x] Mentionne le raccourci Alt+H pour l'aide

**Raccourcis clavier** :
- [x] **Alt+H** : Ouvrir modal aide Markdown (évite conflit historique navigateur avec Ctrl+H)
- [x] Raccourci affiché dans la liste des raccourcis du panneau droit
- [x] Cohérent avec les autres raccourcis Alt (Alt+N, Alt+E)

### Corrections de bugs

**Problèmes i18n** :
- [x] Corrigé : Erreur `result.replace is not a function` dans `generateMarkdownHelpContent()`
  - Cause : `t('modals.markdown.examples')` retournait un objet, pas une string
  - Solution : Appeler `t()` individuellement pour chaque clé imbriquée
- [x] Corrigé : Sections `meta:` dupliquées dans fr.js et en.js
  - Cause : Deux définitions `meta:`, la seconde écrasait la première
  - Solution : Suppression des doublons, conservation des définitions complètes avec toutes les clés (ogTitle, keywords)

**Console propre** :
- [x] Tous les avertissements i18n éliminés
- [x] Plus d'erreurs de clés manquantes
- [x] Console propre prête pour la production

### Améliorations techniques

**Service Worker** :
- [x] Version incrémentée : v1.5.0 → v1.5.1
- [x] Tous les fichiers modifiés déjà dans la liste de précache

**Qualité du code** :
- [x] Structure correcte des clés i18n pour objets imbriqués
- [x] Aucun doublon dans les dictionnaires
- [x] Architecture modale propre et réutilisable

---

## 🗺️ V0.9.3 - Export Mindmap (FreeMind + Mermaid) - ✅ COMPLÉTÉ

**Date** : 1er Janvier 2026
**Contexte** : Permettre aux utilisateurs d'exporter et partager leur structure de connaissances visuellement

### Modal d'export avec 3 formats

**Nouvelle fonctionnalité** :
- [x] Modal de choix d'export remplaçant les boutons d'export directs
- [x] 3 formats d'export disponibles pour exports globaux et branches :
  - **📦 Archive ZIP** : Export complet avec données et fichiers joints (existant)
  - **🧠 Mindmap FreeMind** : Fichier .mm éditable dans Freeplane/FreeMind/XMind
  - **📊 Diagramme Mermaid** : Export de diagramme SVG

### Export FreeMind .mm

**Implémentation** :
- [x] `exportFreeMindMM(branchRootId)` dans data.js
- [x] Génération XML FreeMind valide (version 1.0.1)
- [x] Support des symlinks avec distinction visuelle :
  - Couleur orange (`COLOR="#ff9900"`)
  - Style bulle (`STYLE="bubble"`)
  - Arrowlinks vers nœuds cibles (`<arrowlink DESTINATION="..."/>`)
- [x] Échappement XML correct (quotes, caractères spéciaux)
- [x] Fonctionne avec export global et export branche
- [x] Compatible avec Freeplane, FreeMind et XMind

### Export Mermaid SVG

**Implémentation** :
- [x] Mermaid.js v10 chargé via CDN (module ES)
- [x] `exportMermaidSVG(branchRootId)` dans data.js
- [x] Génération syntaxe mindmap depuis structure d'arbre
- [x] Symlinks marqués avec emoji 🔗
- [x] Échappement caractères pour parser Mermaid :
  - Parenthèses, crochets, accolades supprimés/remplacés
  - Espaces multiples réduits
  - Sauts de ligne gérés
- [x] Téléchargement SVG avec nom de fichier approprié
- [x] Fonctionne hors ligne (Mermaid.js précaché par Service Worker)

### Corrections de bugs

**Modal d'export** :
- [x] Corrigé : Bug de reset `exportType` - sauvegarde type avant fermeture modal
  - Cause : `closeExportModal()` mettait `exportType = null` avant utilisation
  - Solution : Stockage dans variable locale avant fermeture

**Parser Mermaid** :
- [x] Corrigé : Erreur de parsing avec titres contenant parenthèses
  - Exemple : "Version (trop) optimiste" → erreur de parsing
  - Solution : Supprimer/remplacer caractères spéciaux dans `escapeMermaid()`

### Améliorations techniques

**Service Worker** :
- [x] URL CDN Mermaid.js ajoutée au précache (support hors ligne)
- [x] Suivi de version pour invalidation cache

**i18n** :
- [x] Traductions complètes pour les 3 formats d'export (FR/EN)
- [x] Notifications toast : `freemindExported`, `mermaidExported`, etc.
- [x] Messages d'alerte : `mermaidNotAvailable` si échec CDN

**Qualité du code** :
- [x] Console propre (logs de debug supprimés)
- [x] Gestion d'erreur appropriée pour tous types d'export
- [x] Pattern modal réutilisable pour futures fonctionnalités

### Expérience utilisateur

**Bénéfices** :
- ✅ Représentation visuelle de la structure de connaissances
- ✅ Édition des mindmaps exportées dans outils dédiés (Freeplane)
- ✅ Partage de diagrammes sous forme d'images (SVG)
- ✅ UX cohérente avec choix modal
- ✅ Fonctionne pour exports globaux ET branches

---

## 🎨 V0.9.4 - Polish, Corrections de bugs & Améliorations UI - ✅ COMPLÉTÉ

**Date** : 1er Janvier 2026
**Contexte** : Polissage interface, corrections de bugs et améliorations UX après V0.9.3 export mindmap

### Améliorations UI

**Nouvelle palette de couleurs** :
- [x] Couleur accent mise à jour vers bleu foncé (#0a376c)
- [x] État hover : #1155aa
- [x] Texte accent : #4a9eff
- [x] Apparence plus professionnelle et cohérente

**Police par défaut** :
- [x] Police par défaut changée de Sto vers police système
- [x] L'utilisateur peut toujours basculer vers Sto via le sélecteur
- [x] Meilleures performances et aspect natif

### Corrections de bugs

**Symlinks cassés et externes** :
- [x] Affichage spécial pour symlinks cassés (cible supprimée)
  - Badge "(LIEN CASSÉ)" avec icône d'avertissement ⚠️
  - Message explicatif dans l'éditeur
  - Opacité 0.5, non-cliquable dans l'arbre
- [x] Affichage spécial pour symlinks externes (en mode branche, cible hors branche)
  - Badge "(EXTERNE)" avec icône 🔗🚫
  - Message explicatif dans l'éditeur
  - Opacité 0.4, sélectionnable pour suppression
  - Toast d'avertissement à la sélection
- [x] Critique : Vérifier cassé AVANT externe (nœud cassé n'est pas externe !)

**Protection des données** :
- [x] Corrigé : `saveNode()` ne sauvegarde plus quand l'éditeur est désactivé
  - Empêche les messages d'erreur d'être sauvegardés dans les données
  - Bug critique : afficher un lien cassé/externe corrompait les données !
  - Éditeur désactivé pour symlinks cassés et externes

**Export en mode branche** :
- [x] Corrigé : Export "global" en mode branche exporte maintenant seulement la branche active
- [x] Comportement plus intuitif correspondant aux attentes utilisateur

**Suppression de nœuds** :
- [x] Navigation post-suppression améliorée
  - Va au parent si existe
  - Va au premier frère si pas de parent
  - Fallback intelligent vers racine

**Boutons désactivés** :
- [x] Bouton "Nouveau nœud" désactivé en mode branche (UX plus claire)
- [x] Bouton "Confirmer" dans les modales désactivé sans sélection

### Améliorations export FreeMind

**Gestion du contenu** :
- [x] Contenu du nœud déplacé dans richcontent NOTE (format FreeMind correct)
- [x] Emojis filtrés des titres (compatibilité XMind/Freeplane)
- [x] Meilleure structure pour édition dans outils mindmap

### Améliorations techniques

**Qualité du code** :
- [x] Gestion d'erreur cohérente à travers les features
- [x] Séparation des responsabilités plus propre
- [x] Meilleure gestion d'état pour les cas limites

**Expérience utilisateur** :
- [x] Plus de corruption de données avec les types spéciaux de symlinks
- [x] Feedback visuel clair pour tous les états de nœuds
- [x] Palette de couleurs professionnelle
- [x] Workflow d'export amélioré

---

## 🔮 V1.0 - Types actifs et système avancé

### Types de nœuds actifs (Fondations)

**Objectif** : Permettre aux nœuds de définir leur propre comportement via scripts

**Features** :
- [ ] Système d'`implements` basique
- [ ] Propriété `implements: ["node_type_X"]` sur les nœuds
- [ ] Scripts simples (`onSave`, `onRender`)
- [ ] Sandbox JavaScript sécurisé
- [ ] Nœuds descripteurs de types (voir docs/VISION.md)
- [ ] Exemples concrets dans le contenu de démo

**Références** :
- `docs/VISION.md` - Spécification complète des types actifs
- Contenu de démo - Section "🔮 Directions explorées"

---

## 💾 V0.10 - Migration IndexedDB & Format .dm - ✅ COMPLÉTÉ

**Date** : 19 Janvier 2026
**Contexte** : Stockage scalable avec IndexedDB, format officiel d'archive .dm, et export PDF

### IndexedDB avec Dexie.js
- [x] Migration de localStorage vers IndexedDB (automatique, non-destructif)
- [x] Trois object stores : `nodes`, `settings`, `attachments`
- [x] Capacité 500 MB - 1 GB (vs ~5-10 MB avec localStorage)
- [x] Structure modulaire : `storage.js` (couche Dexie), `migration.js` (logique migration)
- [x] Préservation backup : Données localStorage originales conservées après migration
- [x] Flag de migration : `deepmemo_migrated_to_indexeddb` dans localStorage

### Format Archive .dm
- [x] Extension officielle `.dm` (archive ZIP avec extension personnalisée)
- [x] `metadata.json` : Version, type (global/branch), titre, date, stats, info générateur
- [x] `data.json` : Structure arborescence (inchangée depuis V0.9)
- [x] Dossier `attachments/` : Fichiers joints avec convention de nommage
- [x] Auto-détection : Détection par magic number (PK = ZIP, sinon JSON)
- [x] Filtres fichiers : `.dm,.zip,.json` dans sélecteur natif
- [x] Rétrocompatible : Supporte imports legacy .json et .zip
- [x] Documentation : Spec complète dans `docs/FORMATS-FICHIERS.md` v2.0

### Import Amélioré
- [x] Choix import global : "Tout remplacer" (destructif) ou "Fusionner" (ajout racines)
- [x] Import branche depuis global : Accepte exports globaux
  - Racine unique → importe comme branche
  - Racines multiples → crée nœud container avec titre export
- [x] Validation JSON Schema : Contre `docs/schemas/deepmemo-v1.0.json`
- [x] Dégradation gracieuse : Fichiers manquants tolérés, avertissements affichés

### Export PDF
- [x] CloudFlare Worker : Génération en ligne avec Browser Rendering API
  - Rate limiting : 5 PDFs/heure, 20/jour par IP
  - Hashing IP (SHA-256) pour confidentialité
  - Headers CORS pour exposition quotas
  - Protection referer/origin
  - **Statut** : Code complet, pas encore déployé en production
- [x] Outil CLI : `bin/branch2pdf.js` pour génération 100% offline
  - Node.js + Puppeteer
  - Supporte archives .dm (extraction ZIP)
  - Pas de rate limiting
- [x] Résolution symlinks : Contenu inclus, descendants exclus si externe au scope
- [x] Images inline : Pièces jointes converties en data URLs base64
- [x] Détection cycles : Prévient boucles infinies
- [x] Table des matières : Structure hiérarchique simplifiée
- [x] Modale confidentialité : Notice première utilisation (persistence localStorage)
- [x] Affichage quotas : Info quotas temps réel dans panneau droit

### Mise à Jour Contenu Démo
- [x] Nettoyage contenu spéculatif : Supprimé nœuds "types actifs", "triggers", "automatisation"
- [x] Mise à jour "Collaboration & Partage" : Focus workflow export/import .dm actuel
- [x] Ajout section PDF : Documentation options export PDF en ligne et offline
- [x] Simplification "Directions Explorées" : Mention vague sync future sans promesses
- [x] Ajustement ton : "On explore, on verra" - pas de teasing features non implémentées
- [x] Corrections template literals : Backticks échappés dans contenu markdown (`.dm` → `\`.dm\``)

### Documentation
- [x] FILE-FORMATS.md v2.0 : Spécification complète format .dm
- [x] FORMATS-FICHIERS.md v2.0 : Version française synchronisée
- [x] file-formats/ZIP-FORMAT.md : Référence rapide structure .dm
- [x] file-formats/JSON-STRUCTURE.md : Guide JSON compatible LLM
- [x] file-formats/SCHEMA-VALIDATION.md : Documentation validation
- [x] docs/schemas/ : Fichiers JSON Schema pour validation
- [x] cloudflare-worker/README.md : Guide déploiement Worker PDF
- [x] cloudflare-worker/PRIVACY-NOTICE.md : Notice confidentialité utilisateur

### Corrections de Bugs
- [x] Erreurs template literals : Backticks échappés corrigés dans `default-data.js`
- [x] Clés i18n manquantes : Ajout toutes clés traduction liées PDF
- [x] Format attachments : Assuré format array-d'objets (pas strings)

---

## 💭 Idées backlog (V1.1+)

Voir `docs/ROADMAP.md` section "V1.0 - Système complet" et `docs/VISION.md` pour :
- Triggers multi-nœuds (API externe, automatisation)
- Vues multiples (card, list, kanban, calendar)
- Collaboration et partage (multi-user, permissions)
- Interface vocale (commandes, dictée)

---

## 📊 État du projet

**Version actuelle** : V0.10.4 (Janvier 2026)
**Statut** : ✅ Stable, documentée, déployée localement (production à V0.10.3)
**Déploiement** : 🟡 **deepmemo.org** (V0.10.3 - V0.10.4 en attente de déploiement)
**Licence** : MIT (Open Source)

**Codebase** :
- ~13.2K lignes JS (architecture modulaire ES6)
- ~1.8K lignes CSS (organisé en 6 fichiers)
- ~20 modules JS (core, features, ui, utils, locales)
- 100% Vanilla JavaScript (pas de framework)
- **Total** : ~42.6K lignes / 2.3M caractères (code + docs)

**Données** :
- IndexedDB avec Dexie.js (données structurées + fichiers, 500 MB - 1 GB)
- Migration automatique depuis localStorage (V0.9 → V0.10)
- Formats export : `.dm` (archive ZIP), `.json` (interchange), FreeMind, Mermaid, PDF

---

## 🔧 Maintenance

### Avant déploiement public

- [ ] Tests navigateurs complets (Chrome, Firefox, Safari, Edge)
- [ ] Tests mobile (iOS Safari, Android Chrome)
- [ ] Vérification accessibilité (navigation clavier, screen readers)
- [ ] Optimisation performances (grandes arborescences >500 nœuds)

### Documentation restante

- [x] Mise à jour complète de tous les docs/ (28 déc 2025)
- [ ] Guide de contribution détaillé (si besoin)
- [ ] FAQ utilisateurs (après feedback beta)

---

**Prochaine session** : Préparation V1.0 (Types de nœuds actifs - fondations)

**Référence historique** : Pour l'historique complet du développement V0.8, voir les commits Git et `CLAUDE.md`.
