# 🚀 Guide de développement DeepMemo

## 📁 Structure du projet

```
DeepMemo/
├── index.html              # Point d'entrée HTML
├── src/
│   ├── css/
│   │   └── style.css      # Tous les styles (~1180 lignes)
│   └── js/
│       └── app.js         # Toute la logique (~2270 lignes)
├── reference/
│   └── deepmemo-reference.html  # Version V0.6 single-file (référence)
├── docs/
│   ├── README.md                  # Concept et features
│   ├── ROADMAP.md                 # État actuel et prochaines étapes
│   ├── ARCHITECTURE.md            # Détails techniques
│   ├── Guide de développement.md  # Ce fichier
│   └── VISION.md                  # Vision long-terme
└── .gitignore
```

---

## 🛠️ Configuration de l'environnement

### Prérequis
- **Navigateur moderne** (Chrome, Firefox, Edge, Safari)
- **Serveur HTTP local** (Python, Node.js, ou autre)
- **Git** (pour le versioning)

### Lancer l'application

#### Depuis WSL Ubuntu
```bash
cd DeepMemo
python3 -m http.server 8000
```

#### Depuis Node.js
```bash
cd DeepMemo
npx http-server -p 8000
```

Puis ouvrir : **http://localhost:8000**

---

## 📚 Lire la documentation

Ordre recommandé pour bien comprendre le projet :

1. **[README.md](README.md)** - Concept général et features
2. **[ROADMAP.md](ROADMAP.md)** - État actuel et bugs connus
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Détails techniques
4. **[VISION.md](VISION.md)** - Vision long-terme

---

## 🧪 Tester l'application

### Fonctionnalités à tester

#### Gestion des nœuds
- [ ] Créer un nœud racine (`Alt+N`)
- [ ] Créer un nœud enfant
- [ ] Éditer le titre et le contenu
- [ ] Supprimer un nœud
- [ ] Auto-sélection du titre lors de la création

#### Navigation
- [ ] Breadcrumbs cliquables
- [ ] Navigation clavier dans l'arbre (`↑↓←→`)
- [ ] Expand/collapse des branches
- [ ] Persistence de l'état expand/collapse

#### Liens
- [ ] Créer un wiki-link `[[Nom du nœud]]`
- [ ] Cliquer sur un lien dans le preview
- [ ] Vérifier les backlinks dans le panel droit
- [ ] Créer un lien symbolique via la modal Actions

#### Tags
- [ ] Ajouter des tags
- [ ] Auto-complétion des tags
- [ ] Tag cloud dans le panel droit
- [ ] Recherche par tag

#### Recherche
- [ ] Ouvrir la recherche (`Ctrl+K`)
- [ ] Rechercher dans titres
- [ ] Rechercher dans contenus
- [ ] Rechercher dans tags
- [ ] Navigation clavier dans les résultats

#### Drag & Drop
- [ ] Déplacer un nœud (drag simple)
- [ ] Dupliquer un nœud (`Ctrl + drag`)
- [ ] Créer un lien symbolique (`Ctrl+Alt + drag`)
- [ ] Réorganiser l'ordre (zones before/after)
- [ ] Indicateurs visuels de position

#### Modales
- [ ] Modal Actions : sélectionner une action
- [ ] Modal Actions : sélectionner une destination ✅ **BUG CORRIGÉ en V0.7**
- [ ] Modal Actions : confirmer l'action
- [ ] Expand/collapse dans les modales

#### Export/Import
- [ ] Exporter en JSON
- [ ] Importer un JSON
- [ ] Vérifier l'intégrité des données

---

## 🐛 Debugging

### Console navigateur
Ouvre les DevTools (`F12`) pour :
- Voir les erreurs JavaScript
- Inspecter le LocalStorage
- Debugger le code

### LocalStorage
```javascript
// Dans la console :
localStorage.getItem('deepmemo_data')        // Voir les données
localStorage.getItem('deepmemo_expanded')    // Voir l'état des nœuds dépliés
localStorage.clear()                          // Reset complet
```

### Fichiers à vérifier en cas de bug
1. `src/js/app.js` - Toute la logique
2. `index.html` - Structure HTML et événements onclick
3. `src/css/style.css` - Styles et z-index

---

## 📝 Conventions de code

### Style JavaScript
- **Indentation** : 2 espaces
- **Quotes** : Simple quotes `'...'`
- **Noms de variables** : `camelCase`
- **Commentaires** : Français ou anglais

### Style CSS
- **Noms de classes** : `kebab-case`
- **Variables CSS** : `--nom-variable`
- **Ordre** : Utiliser les variables CSS autant que possible

### Structure app
```javascript
const app = {
  // État
  data: { nodes: {}, rootNodes: [] },
  currentNodeId: null,

  // Méthodes lifecycle
  init() { ... },
  render() { ... },

  // Méthodes métier
  createNode() { ... },
  deleteNode() { ... },

  // Méthodes persistence
  saveData() { ... },
  loadData() { ... }
};
```

---

## 🎯 Contribuer

### Workflow Git
```bash
# Créer une branche pour ta feature
git checkout -b feature/ma-feature

# Développer et tester

# Commit
git add .
git commit -m "✨ Add: ma feature"

# Push
git push origin feature/ma-feature
```

### Types de commits
- `✨ Add:` Nouvelle feature
- `🐛 Fix:` Correction de bug
- `📝 Docs:` Documentation
- `♻️ Refactor:` Refactoring
- `🎨 Style:` CSS/UI
- `⚡ Perf:` Performance

---

## 🔧 Technologies utilisées

### Frontend
- **HTML5**
- **CSS3** (Variables, Flexbox, Grid)
- **JavaScript ES6+** (Classes, Arrow functions, Template literals)

### APIs natives
- **LocalStorage API** - Persistence
- **Drag & Drop API** - Interactions
- **FileReader API** - Import/Export

### Pas de dépendances
- Pas de framework (React, Vue, etc.)
- Pas de bibliothèque (jQuery, Lodash, etc.)
- Tout est vanilla JavaScript

---

## 💡 Conseils

### Approche progressive
1. Lire la doc
2. Tester l'app manuellement
3. Comprendre le code existant
4. Faire des petites modifications
5. Tester à chaque étape

### Garder la simplicité
- Privilégier les solutions simples
- Éviter la sur-ingénierie
- Tester fréquemment

### Performance
- Utiliser la délégation d'événements
- Éviter les re-renders complets
- Optimiser les recherches

---

## 📚 Ressources

### Documentation externe
- [MDN Web Docs](https://developer.mozilla.org/)
- [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Drag & Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)

### Projet
- **Repo GitHub** : `git@github.com:parksto/DeepMemo.git`
- **Version actuelle** : V0.8
- **Statut** : Développement actif

---

**Bonne contribution ! 🚀**

*N'hésite pas à poser des questions ou proposer des améliorations.*
