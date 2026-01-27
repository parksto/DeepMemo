# 📋 Plan de Refactoring Documentation DeepMemo

**Date de création** : 2026-01-27
**Objectif** : Restructurer la documentation pour la rendre claire, cohérente, sans redondances
**Principe** : Comme un bon livre technique - clarté cognitive, pas de suspense, tout est retrouvable

---

## 🎯 Principes Directeurs

1. ✅ **Une langue par contexte** : EN dans `docs/`, FR dans `README.md` racine
2. ✅ **Hiérarchie narrative** : Du général au spécifique, comme un livre
3. ✅ **Zéro redondance** : Chaque information à un seul endroit
4. ✅ **Nettoyer le futur** : Retirer nœuds actifs, types spéciaux, softlinks
5. ✅ **Clarté cognitive** : Chaque feature découle logiquement de l'architecture

---

## 📚 Structure Cible

```
/
├── README.md (FR)              # Vue d'ensemble utilisateur final (~150L)
├── README.en.md (EN)           # English user overview (~150L)
├── CLAUDE.md                   # Contexte LLM concis (~300L)
│
└── docs/                       # Documentation technique (EN uniquement)
    ├── README.md               # Table des matières narrative (~200L)
    │
    ├── 1-CONCEPTS.md           # Fondamentaux (~200L)
    ├── 2-ARCHITECTURE.md       # Architecture technique (~300L)
    ├── 3-DATA-MODEL.md         # Structure de données + storage (~200L)
    ├── 4-FEATURES.md           # Features principales (~150L)
    │
    ├── guides/                 # Guides thématiques
    │   ├── FILE-FORMATS.md     # Formats export/import (~250L)
    │   ├── ATTACHMENTS.md      # Système d'attachments (~150L)
    │   ├── FS-SYNC.md          # File System Sync (~400L)
    │   ├── PDF-EXPORT.md       # Export PDF (~200L)
    │   ├── I18N.md             # Internationalisation (~150L)
    │   └── PWA.md              # Progressive Web App (~200L)
    │
    ├── reference/              # Références techniques
    │   ├── file-formats/
    │   │   ├── dm-archive.md   # Format .dm
    │   │   ├── json-interchange.md
    │   │   └── validation.md   # JSON Schemas
    │   ├── storage-api.md      # API IndexedDB/Dexie (~200L)
    │   └── keyboard-shortcuts.md (~100L)
    │
    ├── development/            # Pour contributeurs
    │   ├── CONTRIBUTING.md
    │   ├── ROADMAP.md
    │   └── debugging.md        # Console tricks, bugs courants (~150L)
    │
    └── CHANGELOG.md            # Historique des versions
```

---

## 📋 Plan d'Exécution (Phases)

### Phase 0 : Préparation ✅

- [x] Analyser l'existant
- [x] Définir les principes directeurs
- [x] Créer le plan de refactoring
- [ ] Créer la structure de dossiers
- [ ] Décider du workflow git (branche dédiée ?)

**Décisions** :
- Travailler fichier par fichier pour garder la qualité
- Utiliser ce plan comme checklist de session en session
- Valider le ton/style sur un fichier exemple avant de continuer

---

### Phase 1 : Nouveaux Fichiers Structurants

**Objectif** : Créer l'ossature de la nouvelle documentation

#### 1.1 docs/README.md - Table des matières narrative
- [ ] Rédiger l'introduction "How to read this documentation"
- [ ] Structurer en 4 parties (Understanding / Features / Reference / Contributing)
- [ ] Ajouter liens vers tous les fichiers
- [ ] Ton : Introduction de livre technique

**Estimation** : 200 lignes
**Dépendances** : Aucune (peut être fait en premier)

#### 1.2 docs/1-CONCEPTS.md - Fondamentaux
- [ ] Section 1 : Le Nœud (unité de base)
- [ ] Section 2 : Hiérarchie (parent/enfants)
- [ ] Section 3 : Symlinks (structure réticulée avec schéma ASCII)
- [ ] Section 4 : Instance Keys (pourquoi nécessaires)
- [ ] Section 5 : Mode Branche (isolation)
- [ ] Section 6 : Tags (métadonnées transversales)

**Estimation** : 200 lignes
**Dépendances** : Aucune
**Sources** : CLAUDE.md (sections navigation, branch mode), ARCHITECTURE.md

#### 1.3 docs/3-DATA-MODEL.md - Structure de données
- [ ] Section 1 : Structure Node (schéma JSON annoté)
- [ ] Section 2 : Types (note vs symlink uniquement)
- [ ] Section 3 : Relations (parent, children, targetId)
- [ ] Section 4 : Metadata (created, modified, tags, attachments)
- [ ] Section 5 : Storage (IndexedDB stores)
- [ ] Section 6 : Migration (localStorage → IndexedDB V0.10)

**Estimation** : 200 lignes
**Dépendances** : Aucune
**Sources** : STORAGE.md, CLAUDE.md (section "Structure de données")

#### 1.4 docs/4-FEATURES.md - Vue d'ensemble features
- [ ] Section Navigation (tree, branch, breadcrumb, routing)
- [ ] Section Content (markdown, preview, attachments, tags)
- [ ] Section Export/Import (.dm, FS Sync, PDF, FreeMind, Mermaid)
- [ ] Section Advanced (drag & drop, multi-tab, PWA, i18n)
- [ ] Chaque feature : 2-3 lignes + lien vers guide détaillé

**Estimation** : 150 lignes
**Dépendances** : Guides créés (mais peut être fait avec liens brisés temporaires)
**Sources** : README.md actuel

---

### Phase 2 : Guides Thématiques

**Objectif** : Créer les guides pratiques pour chaque feature majeure

#### 2.1 docs/guides/FS-SYNC.md
- [ ] Extraire contenu de CLAUDE.md (sections FS Sync)
- [ ] Restructurer en guide pratique
- [ ] Section 1 : Concept et browser support
- [ ] Section 2 : File structure (index.md, .dmlink, frontmatter)
- [ ] Section 3 : Export workflow
- [ ] Section 4 : Import workflow (ID regen, mapping)
- [ ] Section 5 : Edge cases (collisions, sanitization)
- [ ] Section 6 : Future (Phase 2-3)

**Estimation** : 400 lignes
**Dépendances** : Aucune
**Sources** : CLAUDE.md (sections File System Sync)

#### 2.2 docs/guides/PDF-EXPORT.md
- [ ] Section 1 : Why it works naturally (hiérarchie → document)
- [ ] Section 2 : Online version (CloudFlare Worker)
- [ ] Section 3 : Offline CLI (bin/branch2pdf.js)
- [ ] Section 4 : Symlink resolution (scope-aware)
- [ ] Section 5 : Images (base64 embedding)
- [ ] Section 6 : TOC generation

**Estimation** : 200 lignes
**Dépendances** : Aucune
**Sources** : CLAUDE.md (section Export PDF), cloudflare-worker/README.md

#### 2.3 docs/guides/FILE-FORMATS.md
- [ ] Refonte du FILE-FORMATS.md actuel
- [ ] Expliquer le "pourquoi" : .dm vs .json
- [ ] Workflow export/import (global vs branche)
- [ ] Exemples concrets
- [ ] Références vers reference/file-formats/ pour détails techniques

**Estimation** : 250 lignes
**Dépendances** : reference/file-formats/ créés
**Sources** : docs/FILE-FORMATS.md actuel

#### 2.4 docs/guides/ATTACHMENTS.md
- [ ] Renommer SPEC-ATTACHMENTS.md → guides/ATTACHMENTS.md
- [ ] Simplifier : moins de spec, plus de guide
- [ ] Section 1 : Concept et limits
- [ ] Section 2 : Storage (IndexedDB)
- [ ] Section 3 : Inline display (markdown syntax)
- [ ] Section 4 : Upload/download/delete
- [ ] Section 5 : Export/import with .dm

**Estimation** : 150 lignes
**Dépendances** : Aucune
**Sources** : docs/SPEC-ATTACHMENTS.md

#### 2.5 docs/guides/I18N.md
- [ ] Simplifier I18N.md actuel
- [ ] Ton : Guide pratique pour contributeurs
- [ ] Supprimer version FR (garder EN uniquement)

**Estimation** : 150 lignes
**Dépendances** : Aucune
**Sources** : docs/I18N.md actuel

#### 2.6 docs/guides/PWA.md
- [ ] Simplifier PWA.md actuel
- [ ] Supprimer version FR
- [ ] Focus sur installation et offline mode

**Estimation** : 200 lignes
**Dépendances** : Aucune
**Sources** : docs/PWA.md actuel

---

### Phase 3 : Architecture et Références

#### 3.1 docs/2-ARCHITECTURE.md
- [ ] Refonte de ARCHITECTURE.md actuel
- [ ] Section 1 : Principes de design (modularité, vanilla JS)
- [ ] Section 2 : Structure modules (core/, features/, ui/, utils/)
- [ ] Section 3 : Communication inter-modules
- [ ] Section 4 : Navigation système (routing, URLs)
- [ ] Section 5 : Arborescence (pliage vs activation, auto-collapse)
- [ ] Nettoyer toute mention de nœuds actifs, types spéciaux

**Estimation** : 300 lignes
**Dépendances** : 1-CONCEPTS.md créé (pour références)
**Sources** : docs/ARCHITECTURE.md actuel, CLAUDE.md

#### 3.2 docs/reference/storage-api.md
- [ ] Extraire de STORAGE.md actuel
- [ ] Section 1 : Dexie.js API
- [ ] Section 2 : CRUD operations
- [ ] Section 3 : Debug console commands
- [ ] Section 4 : Stats et quotas

**Estimation** : 200 lignes
**Dépendances** : 3-DATA-MODEL.md créé
**Sources** : docs/STORAGE.md

#### 3.3 docs/reference/keyboard-shortcuts.md
- [ ] Extraire des différents fichiers
- [ ] Table complète des raccourcis
- [ ] Groupés par contexte (navigation, édition, search)

**Estimation** : 100 lignes
**Dépendances** : Aucune
**Sources** : README.md, docs/ divers

#### 3.4 docs/reference/file-formats/
- [ ] Renommer ZIP-FORMAT.md → dm-archive.md
- [ ] Renommer JSON-STRUCTURE.md → json-interchange.md
- [ ] Renommer SCHEMA-VALIDATION.md → validation.md
- [ ] Nettoyer et standardiser le format

**Estimation** : Conservation des fichiers actuels avec renommage
**Dépendances** : guides/FILE-FORMATS.md créé
**Sources** : docs/file-formats/ actuel

---

### Phase 4 : Fichiers Racine

#### 4.1 CLAUDE.md - Contexte LLM concis
- [ ] Réduire de 1349 → ~300 lignes
- [ ] Section 1 : Vue d'ensemble (1 paragraphe)
- [ ] Section 2 : Structure fichiers (arbre commenté)
- [ ] Section 3 : Conventions de code
- [ ] Section 4 : Concepts critiques (instance keys, branch mode, symlinks)
- [ ] Section 5 : Points d'attention (bugs courants, pièges)
- [ ] Section 6 : Features principales (1 ligne + fichier concerné)
- [ ] Section 7 : État actuel
- [ ] Supprimer toute redondance avec docs/

**Estimation** : 300 lignes (réduction de 77%)
**Dépendances** : Tous les docs/ créés (pour référencer)
**Sources** : CLAUDE.md actuel

#### 4.2 README.md (racine, FR)
- [ ] Vue d'ensemble utilisateur final
- [ ] Installation/démarrage rapide
- [ ] Features principales (liste concise)
- [ ] Liens vers docs/
- [ ] Licence

**Estimation** : 150 lignes
**Dépendances** : docs/README.md créé
**Sources** : README.md actuel

#### 4.3 README.en.md (racine, EN)
- [ ] Traduction de README.md
- [ ] Synchroniser avec version FR

**Estimation** : 150 lignes
**Dépendances** : README.md (FR) créé

---

### Phase 5 : Development & Maintenance

#### 5.1 docs/development/CONTRIBUTING.md
- [ ] Déplacer CONTRIBUTING.md → docs/development/
- [ ] Supprimer version FR
- [ ] Mettre à jour références

**Estimation** : Conservation avec déplacement
**Sources** : docs/CONTRIBUTING.md actuel

#### 5.2 docs/development/ROADMAP.md
- [ ] Déplacer ROADMAP.md → docs/development/
- [ ] Supprimer version FR
- [ ] Nettoyer items obsolètes
- [ ] Retirer mentions nœuds actifs, types spéciaux

**Estimation** : Conservation avec nettoyage
**Sources** : docs/ROADMAP.md actuel

#### 5.3 docs/development/debugging.md
- [ ] Extraire section debug de CLAUDE.md
- [ ] Console commands
- [ ] Common bugs et solutions
- [ ] Hard refresh, cache clearing
- [ ] IndexedDB inspection

**Estimation** : 150 lignes
**Dépendances** : Aucune
**Sources** : CLAUDE.md (section Debugging)

#### 5.4 docs/CHANGELOG.md
- [ ] Créer historique structuré par version
- [ ] Rétro-documenter V0.10.0 → V0.10.5
- [ ] Format standard : Version / Date / Added / Changed / Fixed

**Estimation** : 200 lignes (croît au fil du temps)
**Dépendances** : Aucune
**Sources** : Git history, ROADMAP.md

---

### Phase 6 : Nettoyage et Suppression

#### 6.1 Supprimer fichiers obsolètes
- [ ] Supprimer docs/*.fr.md (tous les fichiers FR sauf README.fr.md racine)
- [ ] Supprimer docs/Prospective/ (nœuds actifs)
- [ ] Supprimer docs/VISION.md (contenu spéculatif)
- [ ] Supprimer docs/TODO.md (items réels → ROADMAP)
- [ ] Supprimer docs/CONTEXT-CLAUDE-PROJECTS.md (remplacé par CLAUDE.md racine)
- [ ] Supprimer docs/HIERARCHICAL_STRUCTURES.md (intégré dans 1-CONCEPTS.md)
- [ ] Vérifier qu'aucun lien brisé ne subsiste

**Estimation** : ~15 fichiers à supprimer
**Dépendances** : Toutes les phases précédentes terminées

#### 6.2 Mise à jour des liens
- [ ] Vérifier tous les liens internes dans docs/
- [ ] Mettre à jour références dans code source (commentaires)
- [ ] Tester tous les liens dans README.md racine

---

### Phase 7 : Validation Finale

#### 7.1 Relecture complète
- [ ] Vérifier cohérence du ton (technique mais accessible)
- [ ] Vérifier hiérarchie narrative (général → spécifique)
- [ ] Vérifier zéro redondance
- [ ] Vérifier tous les cross-refs fonctionnent

#### 7.2 Validation structure
- [ ] Parcours complet depuis docs/README.md
- [ ] Vérifier qu'on peut tout retrouver en suivant les liens
- [ ] Vérifier tailles approximatives (pas de fichiers >500L sauf exceptions)

#### 7.3 Test avec LLM
- [ ] Tester CLAUDE.md avec Claude Code (moi !)
- [ ] Vérifier que je comprends le contexte rapidement
- [ ] Vérifier que je trouve les infos techniques nécessaires

---

## 📊 Progression Globale

**Phases complétées** : 0 / 7

- [ ] Phase 0 : Préparation
- [ ] Phase 1 : Nouveaux Fichiers Structurants (4 fichiers)
- [ ] Phase 2 : Guides Thématiques (6 fichiers)
- [ ] Phase 3 : Architecture et Références (4 items)
- [ ] Phase 4 : Fichiers Racine (3 fichiers)
- [ ] Phase 5 : Development & Maintenance (4 fichiers)
- [ ] Phase 6 : Nettoyage et Suppression
- [ ] Phase 7 : Validation Finale

**Fichiers à créer** : 17
**Fichiers à migrer/refactoriser** : 8
**Fichiers à supprimer** : ~15

---

## 🎯 Workflow de Session

### Début de session
1. Lire ce plan
2. Identifier la prochaine tâche non cochée
3. Vérifier les dépendances
4. Démarrer le travail

### Pendant le travail
1. Cocher [ ] → [x] au fur et à mesure
2. Noter les décisions importantes dans "Décisions & Notes"
3. Ajouter références croisées découvertes

### Fin de session
1. Commit le plan mis à jour
2. Noter dans "Sessions Log" ce qui a été fait
3. Identifier la prochaine tâche pour next session

---

## 📝 Décisions & Notes

### Session 2026-01-27
- **Décision** : Pas de versions FR dans docs/ (seulement EN)
  - Raison : Trop lourd à maintenir, audience technique internationale
  - Exception : README.md et README.fr.md à la racine pour les users

- **Décision** : Retirer toute mention de nœuds actifs, types spéciaux, softlinks
  - Raison : Features non implémentées, créent confusion
  - Exception : docs/Prospective/ (archive pour référence future)

- **Décision** : Structure en 4 parties (Understanding / Features / Reference / Contributing)
  - Raison : Hiérarchie narrative claire, comme un livre technique
  - Inspiration : La clarté de l'export PDF qui découle naturellement de l'archi

---

## 📅 Sessions Log

### 2026-01-27 - Session 1
- Analyse de l'existant (CLAUDE.md 1349L)
- Création du plan de refactoring
- Définition de la structure cible
- **Next** : Valider le workflow git (branche dédiée ?)

---

## 🔗 Références Utiles

- Structure actuelle : `find docs -type f -name "*.md" | sort`
- Tailles fichiers : `wc -l docs/**/*.md`
- Liens cassés : Vérifier manuellement ou avec outil markdown lint

---

**Note** : Ce plan est un document vivant. N'hésite pas à l'ajuster au fil du travail si on découvre de meilleures approches.
