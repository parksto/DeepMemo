# 🚀 Démarrer avec Claude Code

## 📁 Contenu de ce dossier

```
v0.7-multifile/
  ├── README.md              (Vue d'ensemble du projet)
  ├── ROADMAP.md             (État actuel + prochaines étapes)
  ├── ARCHITECTURE.md        (Détails techniques)
  ├── deepmemo-v0.6.html     (Version actuelle qui fonctionne)
  └── START.md               (Ce fichier)
```

## 🎯 Objectif de cette session

**Transformer DeepMemo V0.6 (single-file) en V0.7 (multifile)**

Structure cible :
```
v0.7-multifile/
  ├── index.html
  ├── css/
  │   └── style.css
  ├── js/
  │   └── app.js
  └── deepmemo-v0.6.html (référence)
```

---

## 🐛 Bug prioritaire à corriger

**Sélection de nœud dans les modales ne fonctionne pas**
- Les flèches ▶/▼ fonctionnent (expand/collapse)
- Mais cliquer sur un nœud pour le sélectionner ne marche pas
- L'event ne passe pas correctement à `selectSymlinkTarget()` et `selectActionDestination()`

Voir `ROADMAP.md` section "Bugs connus" pour détails.

---

## 📝 Instructions pour Claude Code

### 1. Lire la documentation
Commence par lire dans l'ordre :
1. `README.md` - Comprendre le concept
2. `ROADMAP.md` - Savoir où on en est
3. `ARCHITECTURE.md` - Détails techniques

### 2. Analyser le code actuel
- Ouvre `deepmemo-v0.6.html`
- C'est un fichier de ~3600 lignes
- Structure : `<style>` + `<body>` + `<script>`

### 3. Plan de restructuration

#### Étape 1 : Extraire le CSS
- Créer `css/style.css`
- Copier tout le contenu de `<style>...</style>`
- Lier dans `index.html` : `<link rel="stylesheet" href="css/style.css">`

#### Étape 2 : Extraire le JavaScript
- Créer `js/app.js`
- Copier tout le contenu de `<script>...</script>`
- Ajuster si besoin (pas de wrapping dans IIFE nécessaire)
- Lier dans `index.html` : `<script src="js/app.js" defer></script>`

#### Étape 3 : Créer index.html minimal
- Garder uniquement la structure HTML
- Liens vers CSS et JS externes
- Tester que tout fonctionne

#### Étape 4 : Corriger le bug de sélection
Une fois la restructuration faite, fixer la sélection dans les modales.

---

## 🧪 Tester l'application

### Lancer un serveur local
```bash
cd v0.7-multifile
python3 -m http.server 8000
```

Puis ouvrir : http://localhost:8000

### Points à tester
- [ ] Création de nœuds
- [ ] Navigation dans l'arborescence
- [ ] Expand/collapse
- [ ] Drag & drop
- [ ] Recherche (Ctrl+K)
- [ ] Tags
- [ ] Modales (surtout la sélection de nœud !)
- [ ] Export/Import

---

## 💡 Conseils

### Approche progressive
1. **D'abord restructurer** (3 fichiers)
2. **Tester que tout marche** pareil
3. **Puis corriger les bugs**
4. **Enfin optimiser**

### Validation continue
Après chaque étape, lance le serveur et teste !

### Garder deepmemo-v0.6.html
C'est la référence qui marche. Si problème, on peut toujours comparer.

---

## 📚 Contexte utile

### Technologies utilisées
- Vanilla JavaScript (ES6+)
- CSS3 (Variables, Flexbox, Grid)
- LocalStorage API
- HTML5 Drag & Drop API

### Pas de dépendances
- Pas de framework (React, Vue, etc.)
- Pas de bibliothèque (jQuery, Lodash, etc.)
- Tout est natif

### Philosophie
- Keep it simple
- Keyboard-first
- Performance > Fancy UI
- User data sovereignty

---

## 🎨 Style de code actuel

### Conventions
- Indentation : 2 espaces
- Quotes : Simple quotes pour strings
- Noms de variables : camelCase
- Noms de classes CSS : kebab-case
- Commentaires : français OK, anglais OK

### Structure app
```javascript
const app = {
  data: {},
  currentNodeId: null,
  
  init() { ... },
  render() { ... },
  saveData() { ... },
  // ... méthodes
};

window.addEventListener('DOMContentLoaded', () => app.init());
```

---

## ❓ Questions fréquentes

**Q : Pourquoi pas de framework ?**  
A : Contrôle total, légèreté, pas de breaking changes à gérer.

**Q : Pourquoi LocalStorage et pas une vraie DB ?**  
A : MVP d'abord. Migration vers IndexedDB/Backend prévue en V1.0.

**Q : Le code est sale par endroits, c'est normal ?**  
A : Oui, c'est du prototype rapide. On va le nettoyer progressivement.

---

## 🎯 Critères de succès pour cette session

- [ ] Structure multifile créée (index.html + css/ + js/)
- [ ] Application fonctionne identiquement
- [ ] Bug de sélection dans modales corrigé
- [ ] Code plus propre et maintainable
- [ ] Documentation à jour

---

**Bonne chance ! 🚀**

*Fabien sera là pour valider et tester.*
