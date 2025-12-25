# Guide PWA - DeepMemo

## 🎯 Qu'est-ce qu'une PWA ?

Une **Progressive Web App** permet d'installer DeepMemo comme une vraie application sur ton ordinateur ou mobile, avec :

✅ **Installation native** - Icône sur le bureau/menu démarrer
✅ **Mode offline** - Fonctionne sans connexion Internet
✅ **Ouverture en plein écran** - Sans barre d'adresse du navigateur
✅ **Démarrage rapide** - Cache intelligent pour performances optimales

## 📦 Fichiers ajoutés

```
DeepMemo/
├── manifest.json           # Configuration PWA
├── sw.js                   # Service Worker (cache offline)
├── generate-icons.html     # Générateur d'icônes
└── icons/                  # Icônes d'application
    ├── icon-192.png        # (à générer)
    └── icon-512.png        # (à générer)
```

## 🎨 Étape 1 : Générer les icônes

1. **Ouvre** `generate-icons.html` dans ton navigateur
2. **Clique** sur le bouton "✨ Générer les icônes"
3. **Télécharge** les deux icônes (`icon-192.png` et `icon-512.png`)
4. **Place-les** dans le dossier `icons/`

Les icônes sont basées sur le `favicon.svg` existant (étoile bleue sur fond noir).

## 🧪 Étape 2 : Tester la PWA localement

### Démarrer le serveur

```bash
cd C:\Users\parks\Documents\Dev\deepMemo\DeepMemo
python -m http.server 8000
```

### Ouvrir dans Chrome/Edge

1. Va sur `http://localhost:8000`
2. Ouvre les **DevTools** (`F12`)
3. Onglet **Application** → **Service Workers**
   - Tu devrais voir `sw.js` actif
4. Onglet **Application** → **Manifest**
   - Vérifie que tout est OK (nom, icônes, couleurs)

### Installer l'app

**Sur Desktop (Chrome/Edge) :**
- Icône ➕ dans la barre d'adresse → "Installer DeepMemo"
- Ou menu ⋮ → "Installer DeepMemo"

**Sur Mobile (Android) :**
- Menu ⋮ → "Ajouter à l'écran d'accueil"

**Sur iOS (Safari) :**
- Bouton partage → "Sur l'écran d'accueil"

## 🔍 Vérifier que ça marche

### Test 1 : Installation
✅ L'app s'ouvre dans une fenêtre séparée (sans barre d'adresse)
✅ L'icône apparaît dans le menu démarrer / écran d'accueil

### Test 2 : Mode offline
1. **Ouvre** l'app installée
2. **Coupe** le serveur Python (`Ctrl+C`)
3. **Rafraîchis** l'app (`Ctrl+R`)
4. ✅ L'app continue de fonctionner !

### Test 3 : Cache automatique
1. **Ouvre** DevTools → **Application** → **Cache Storage**
2. **Vérifie** que `deepmemo-v1.0.0` contient tous les fichiers
3. ✅ Fichiers CSS, JS, icônes cachés

## 🚀 Déploiement public

### HTTPS obligatoire

⚠️ Les PWA nécessitent **HTTPS** (sauf localhost). Pour déployer :

**Options gratuites :**
- **GitHub Pages** (HTTPS automatique)
- **Netlify** (Drag & drop, HTTPS auto)
- **Vercel** (Git integration)
- **Cloudflare Pages**

### Déploiement sur GitHub Pages (exemple)

```bash
# 1. Créer un repo GitHub
# 2. Push le code
git add .
git commit -m "🚀 PWA: Support installation native + mode offline"
git push origin main

# 3. Activer GitHub Pages (Settings → Pages → main branch)
# 4. Accéder à https://username.github.io/DeepMemo
# 5. Installer la PWA !
```

## 🔧 Maintenance

### Mettre à jour le cache

Quand tu modifies le code, **incrémente la version** dans `sw.js` :

```javascript
// sw.js (ligne 2)
const CACHE_VERSION = 'v1.0.1'; // 👈 Changer ici
```

Cela forcera le navigateur à télécharger les nouveaux fichiers.

### Débugger le Service Worker

**Console → erreurs** : Vérifier les logs `[SW]`
**Application → Service Workers** : Voir l'état (actif, en attente, erreur)
**Application → Clear storage** : Reset complet si besoin

## 📱 Comportement par plateforme

| Plateforme | Installation | Offline | Notifications* |
|------------|--------------|---------|----------------|
| **Chrome Desktop** | ✅ | ✅ | ✅ |
| **Edge Desktop** | ✅ | ✅ | ✅ |
| **Android Chrome** | ✅ | ✅ | ✅ |
| **iOS Safari** | ✅ | ✅ | ⚠️ Limité |
| **Firefox** | ⚠️ Partiel | ✅ | ✅ |

*Les notifications ne sont pas implémentées dans DeepMemo pour l'instant.

## 🎉 Prochaines étapes

**Fonctionnalités PWA avancées (optionnel) :**
- [ ] Partage natif (API Web Share)
- [ ] Notifications push (ex: rappels)
- [ ] Synchronisation en arrière-plan
- [ ] Détection de mise à jour automatique

---

**Enjoy ! DeepMemo est maintenant installable comme une vraie app !** 🌟
