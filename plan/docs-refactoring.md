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
    │   └── PWA.md              # Progressive Web App - Offline first (~200L)
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

## 📋 Plan d'Exécution
à définir