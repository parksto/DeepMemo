# 🔍 Audit Pré-Production - DeepMemo

**Date** : 2026-02-11
**Objectif** : Identifier tous les points à corriger avant mise en production

---

## ❌ Problèmes Identifiés

### 1. Liens Cassés et Incohérents

#### 1.1 index.html
- **Ligne 73** : `"releaseNotes": "https://deepmemo.org/docs/ROADMAP.md"`
  - ✅ Fichier existe mais...
  - ⚠️ Devrait pointer vers `docs/development/ROADMAP.md` (nouvelle structure)
  - **Action** : Changer en `"https://deepmemo.org/docs/development/ROADMAP.md"`

#### 1.2 README.md (racine)
- Liens vers `docs/ROADMAP.md` ou `docs/development/ROADMAP.md`
- **À vérifier** : Cohérence avec nouvelle structure

#### 1.3 README.en.md et README.fr.md
- Même problème que README.md
- **À vérifier** et harmoniser

### 2. Fichiers Legacy à Nettoyer

#### 2.1 Fichiers redondants dans docs/
Ces fichiers sont **remplacés** par la nouvelle structure et créent de la confusion :

**Remplacés par docs/development/** :
- `docs/ROADMAP.md` → `docs/development/ROADMAP.md` ✅ existe déjà
- `docs/ROADMAP.fr.md` → À supprimer ou migrer
- `docs/CONTRIBUTING.md` → `docs/development/CONTRIBUTING.md` ✅ existe déjà
- `docs/CONTRIBUTING.fr.md` → À supprimer ou migrer

**Remplacés par docs/guides/** :
- `docs/FILE-FORMATS.md` → `docs/guides/FILE-FORMATS.md` ✅ existe déjà
- `docs/FORMATS-FICHIERS.md` → À supprimer
- `docs/I18N.md` → `docs/guides/I18N.md` ✅ existe déjà
- `docs/I18N.fr.md` → À supprimer
- `docs/PWA.md` → `docs/guides/PWA.md` ✅ existe déjà
- `docs/PWA.fr.md` → À supprimer

**Remplacés par docs/2-ARCHITECTURE.md** :
- `docs/ARCHITECTURE.md` → À supprimer
- `docs/ARCHITECTURE.fr.md` → À supprimer

**Remplacés par docs/reference/storage-api.md** :
- `docs/STORAGE.md` → À supprimer
- `docs/STORAGE.fr.md` → À supprimer

**Remplacés par docs/guides/ATTACHMENTS.md** :
- `docs/SPEC-ATTACHMENTS.md` → À supprimer
- `docs/SPEC-ATTACHMENTS.fr.md` → À supprimer

**À évaluer** (pas clairs dans nouvelle structure) :
- `docs/TODO.md` → Obsolète ? Migrer vers GitHub Issues ?
- `docs/TODO.fr.md` → Idem
- `docs/VISION.md` → Intégrer dans ROADMAP ou garder séparé ?
- `docs/VISION.fr.md` → Idem
- `docs/HIERARCHICAL_STRUCTURES.md` → Déjà couvert dans 1-CONCEPTS.md ?
- `docs/HIERARCHICAL_STRUCTURES.en.md` → Idem
- `docs/HIERARCHICAL_STRUCTURES.fr.md` → Idem
- `docs/README.fr.md` → Version française du README principal
- `docs/README.en.md` → Version anglaise du README principal

#### 2.2 Dossier docs/file-formats/ (ancien)
**Contenu** :
- `JSON-STRUCTURE.md` → Remplacé par `docs/reference/file-formats/json-interchange.md`
- `SCHEMA-VALIDATION.md` → Remplacé par `docs/reference/file-formats/validation.md`
- `ZIP-FORMAT.md` → Remplacé par `docs/reference/file-formats/dm-archive.md`

**Action** : Supprimer tout le dossier `docs/file-formats/`

#### 2.3 Dossier docs/schemas/ (mauvais emplacement)
**Contenu** :
- `deepmemo-v1.0.json`
- `metadata-v1.0.json`

**Problème** : Les schémas existent déjà à la racine dans `/schemas/v1.0/`
**Action** : Supprimer `docs/schemas/` (doublon)

### 3. Versions et Dates à Mettre à Jour

#### 3.1 Version Actuelle
**Version dans le code** : `V0.10.5`
**Date de cette version** : Janvier 2026
**Question** : Quelle version pour cette refonte ?
- `V0.10.6` (patch - corrections mineures) ?
- `V0.11.0` (minor - nouvelles features/doc) ? ✅ **Recommandé**
- `V1.0.0` (major - première version stable) ?

#### 3.2 Fichiers contenant la version (48 fichiers)

**Fichiers critiques à mettre à jour** :
- ✅ `sw.js` ligne 2 : `CACHE_VERSION = 'v1.10.5'` + commentaire
- ✅ `index.html` ligne 72 : `"softwareVersion": "0.10.5"`
- ✅ `docs/README.md` ligne 246 : `DeepMemo V0.10.5`
- ✅ `README.md` (à vérifier)
- ✅ `README.en.md` (à vérifier)
- ✅ `README.fr.md` (à vérifier)
- ✅ `docs/CHANGELOG.md` : Ajouter nouvelle version
- ✅ `CLAUDE.md` ligne 23 : `Version : V0.10.5`

**Autres fichiers** (références dans doc) :
- Tous les fichiers dans `docs/` mentionnant V0.10.x
- Schémas JSON (`schemas/v1.0/metadata.json` - version du schéma, pas de l'app)

#### 3.3 Dates à Mettre à Jour

**Fichiers critiques** :
- ✅ `sitemap.xml` ligne 7 : `<lastmod>2026-01-09</lastmod>` → `2026-02-11` ou date de déploiement
- ✅ `sw.js` ligne 2 : Commentaire `(Jan 2026)` → `(Fév 2026)` ou date appropriée
- ✅ `docs/CHANGELOG.md` : Ajouter entrée pour nouvelle version avec date
- Headers de documentation (si présents)

### 4. Cohérence de la Structure docs/

#### 4.1 Navigation dans docs/README.md
✅ **Vérification** : docs/README.md semble bien structuré et cohérent
- Références vers bons fichiers (1-CONCEPTS.md, guides/, reference/, development/)
- Pas de liens cassés apparents dans la structure principale

#### 4.2 Liens Croisés
**À vérifier** : Tous les liens internes dans les fichiers de doc pointent vers les bons emplacements
- Grep pour tous les liens Markdown `[...](...)`
- Vérifier que les cibles existent

### 5. Autres Vérifications

#### 5.1 CLAUDE.md
**État** : Fichier existe, à vérifier :
- ✅ Version mise à jour
- ✅ Références vers la nouvelle structure docs/
- ✅ Instructions toujours valides après refonte

#### 5.2 README racine
**À vérifier** :
- Liens vers documentation
- Version affichée
- Captures d'écran à jour
- Badges (si présents)

#### 5.3 Tests
**État** : Dossier `tests/` existe avec :
- `tests/FS/` : Tests File System Sync
- `tests/validation/` : Tests validation de schémas

**Question** : Tests fonctionnels ? À exécuter avant prod ?

---

## ✅ Actions Recommandées (par ordre de priorité)

### Phase 1 : Nettoyage (Critique)
1. **Supprimer fichiers redondants** dans `docs/`
2. **Supprimer dossier** `docs/file-formats/`
3. **Supprimer dossier** `docs/schemas/`
4. **Décider du sort** de TODO.md, VISION.md, HIERARCHICAL_STRUCTURES.md

### Phase 2 : Mise à Jour Version (Critique)
5. **Décider de la nouvelle version** (V0.10.6 vs V0.11.0)
6. **Mettre à jour sw.js** (CACHE_VERSION + commentaire)
7. **Mettre à jour index.html** (softwareVersion)
8. **Mettre à jour tous les README** (version)
9. **Mettre à jour docs/README.md** (version en footer)
10. **Mettre à jour CLAUDE.md** (version)
11. **Créer entrée dans CHANGELOG.md**

### Phase 3 : Mise à Jour Dates (Important)
12. **Mettre à jour sitemap.xml** (lastmod = date de déploiement)
13. **Mettre à jour commentaire dans sw.js** (date)
14. **Mettre à jour CHANGELOG.md** (date de version)

### Phase 4 : Correction Liens (Important)
15. **Corriger index.html** ligne 73 (releaseNotes)
16. **Vérifier et corriger README.md** (liens vers docs/)
17. **Vérifier et corriger README.en.md**
18. **Vérifier et corriger README.fr.md**

### Phase 5 : Vérification Complète (Avant Prod)
19. **Tester tous les liens** dans la doc (script ou manuel)
20. **Tester l'application** localement
21. **Vérifier PWA** (installation, offline, cache)
22. **Vérifier toutes les features** critiques

---

## 📊 Statistiques

- **Fichiers à supprimer** : ~20-25 fichiers legacy
- **Fichiers à mettre à jour** : ~15-20 fichiers (version/dates)
- **Liens à corriger** : ~10-15 liens
- **Dossiers à supprimer** : 2 (docs/file-formats/, docs/schemas/)

---

## 🎯 Décisions Nécessaires

**Pour l'utilisateur** :
1. **Version** : V0.10.6, V0.11.0, ou V1.0.0 ?
2. **Fichiers à garder** : TODO.md, VISION.md, HIERARCHICAL_STRUCTURES.md - supprimer ou migrer ?
3. **Stratégie i18n doc** : Garder fichiers FR séparés ou tout angliciser ?
4. **Date de déploiement** : Pour sitemap.xml et CHANGELOG.md

---

**Prochaine étape** : Validation de ce rapport et décisions utilisateur, puis exécution systématique des actions.
