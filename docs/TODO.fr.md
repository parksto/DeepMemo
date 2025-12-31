# 📋 DeepMemo - État actuel et prochaines étapes

*[English version](TODO.md)*

**Dernière mise à jour** : 31 Décembre 2025 (V0.9.2+ - Modal aide Markdown)

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

## 💭 Idées backlog (V1.1+)

Voir `docs/ROADMAP.md` section "V1.0 - Système complet" et `docs/VISION.md` pour :
- Triggers multi-nœuds (API externe, automatisation)
- Vues multiples (card, list, kanban, calendar)
- Collaboration et partage (multi-user, permissions)
- Interface vocale (commandes, dictée)

---

## 📊 État du projet

**Version actuelle** : V0.9 (Décembre 2025)
**Statut** : ✅ Stable, documentée, déployée en production
**Déploiement** : ✅ **deepmemo.org** (EN PRODUCTION)
**Licence** : MIT (Open Source)

**Codebase** :
- ~5500 lignes JS (architecture modulaire ES6)
- ~1400 lignes CSS (organisé en 5 fichiers)
- 12 modules JS (core, features, ui, utils)
- 100% Vanilla JavaScript (pas de framework)

**Données** :
- LocalStorage (données structurées, ~5-10 MB)
- IndexedDB (fichiers attachés, ~500 MB)
- Format export : ZIP (data.json + attachments/)

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
