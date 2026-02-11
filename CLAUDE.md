# CLAUDE.md - AI Development Context

> ℹ️ **Note**: Fichier local (`.gitignore`) - Directives pour Claude Code

---

## 🎯 Documentation du Projet

**IMPORTANT** : Toute la documentation technique se trouve dans `/docs`

📚 **Point d'entrée** : [docs/README.md](docs/README.md)

Avant toute action, consulter la documentation complète :
- **Concepts** : [docs/1-CONCEPTS.md](docs/1-CONCEPTS.md) - Fondamentaux (nodes, hiérarchie, symlinks, instance keys, branch mode, tags)
- **Architecture** : [docs/2-ARCHITECTURE.md](docs/2-ARCHITECTURE.md) - Stack technique, modules, flux de données
- **Data Model** : [docs/3-DATA-MODEL.md](docs/3-DATA-MODEL.md) - Structure des données, IndexedDB, formats export
- **Features** : [docs/4-FEATURES.md](docs/4-FEATURES.md) - Fonctionnalités complètes

---

## ⚡ Infos Rapides

**Version** : V0.10.5
**License** : MIT
**Author** : Fabien

**URLs** :
- Production : https://deepmemo.org/
- Dev local : https://deepmemo.ydns.eu/ (Apache2)

---

## 🧠 Directives Cognitives

**Principe fondamental** : **"Cognitivement pertinent"**

Tout ce qui est documenté doit être :
1. ✅ **Vérifiable** dans le code source
2. ✅ **Référencé** : `fichier:ligne` ou sélecteur UI
3. ✅ **Traçable** : Exemples réels (pas inventés)
4. ✅ **Navigable** : Tables, liens, structure claire

### Pour toute documentation

**Avant d'écrire** :
1. Lire le code source
2. Vérifier chaque affirmation
3. Citer les références exactes

**Format des références** :
```markdown
📍 **Référence** : `src/js/app.js:40-100`
📍 **Référence** : `index.html:124` (bouton "New Node")
```

**Tables de navigation** :
- Toujours inclure des tables récapitulatives
- Liens vers sections et code source
- Exemples de code avec contexte

### Pour toute modification de code

1. **Lire la doc** avant de modifier
2. **Mettre à jour la doc** si le code change
3. **Tester dans l'UI** si UI concern
4. **Vérifier les références** restent valides

---

## 🚀 Dev Local

```bash
# Start local server (ES6 modules require HTTP)
python -m http.server 8000

# Open
http://localhost:8000
```

**Navigateur recommandé** : Chrome/Edge (pour File System Access API)

**Service Worker** : Désactiver cache en dev (DevTools → Application → Service Workers → Bypass)

---

## 📁 Structure du Projet

```
/
├── src/js/               # Code source (12,300 lignes)
│   ├── app.js           # Point d'entrée
│   ├── core/            # Logique métier (data, storage, attachments)
│   ├── features/        # Fonctionnalités (tree, editor, search, tags, etc.)
│   ├── ui/              # Composants UI (panels, toast)
│   └── utils/           # Utilitaires (routing, keyboard, i18n, etc.)
├── docs/                # Documentation complète
├── index.html           # SPA
├── sw.js               # Service Worker
└── CLAUDE.md           # Ce fichier
```

Voir [docs/2-ARCHITECTURE.md](docs/2-ARCHITECTURE.md) pour détails complets.

---

**Version du contexte** : 2026-01-28
