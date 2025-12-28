# Guide PWA - DeepMemo

*[English version](PWA.md)*

---

## 🎯 Qu'est-ce qu'une PWA ?

Une **Progressive Web App** permet d'installer DeepMemo comme une vraie application sur ton ordinateur ou mobile, avec :

✅ **Installation native** - Icône sur le bureau/menu démarrer
✅ **Mode offline** - Fonctionne sans connexion Internet
✅ **Ouverture en plein écran** - Sans barre d'adresse du navigateur
✅ **Démarrage rapide** - Cache intelligent pour performances optimales

---

## 📦 Installation

### Sur Desktop (Chrome, Edge, Brave)

1. **Ouvre** [deepmemo.org](https://deepmemo.org) dans ton navigateur
2. **Cherche l'icône d'installation** dans la barre d'adresse (➕ ou icône ordinateur)
3. **Clique** sur "Installer DeepMemo"
4. L'application s'ouvre dans une fenêtre dédiée !

**Alternative :**
- Menu ⋮ → "Installer DeepMemo"

### Sur Mobile (Android)

1. **Ouvre** [deepmemo.org](https://deepmemo.org) dans Chrome
2. **Menu** ⋮ → "Ajouter à l'écran d'accueil"
3. **Confirme** l'ajout
4. L'icône apparaît sur ton écran d'accueil !

### Sur iOS (Safari)

1. **Ouvre** [deepmemo.org](https://deepmemo.org) dans Safari
2. **Bouton partage** (icône ↑) → "Sur l'écran d'accueil"
3. **Nomme** l'application → "Ajouter"
4. L'icône apparaît sur ton écran d'accueil !

---

## 🔍 Vérifier que ça marche

### Test 1 : Installation
✅ L'app s'ouvre dans une fenêtre séparée (sans barre d'adresse)
✅ L'icône apparaît dans le menu démarrer / écran d'accueil

### Test 2 : Mode offline
1. **Ouvre** l'app installée
2. **Coupe** ta connexion Internet (Wi-Fi ou données)
3. **Rafraîchis** l'app (`Ctrl+R` ou `Cmd+R`)
4. ✅ L'app continue de fonctionner !

### Test 3 : Cache automatique
1. **Ouvre** DevTools (`F12`) → **Application** → **Cache Storage**
2. **Vérifie** que `deepmemo-v1.3.0` contient tous les fichiers
3. ✅ Fichiers CSS, JS, icônes cachés

---

## 🔄 Mises à jour

### L'application se met à jour automatiquement

Le Service Worker vérifie les mises à jour en arrière-plan. Quand une nouvelle version est disponible :

1. **Ferme complètement** l'application
2. **Rouvre-la**
3. ✅ La nouvelle version est installée !

**Note technique :** Les mises à jour sont appliquées lors de l'activation suivante du Service Worker (fermeture/ouverture de l'app).

---

## 🗑️ Désinstallation

### Sur Desktop (Chrome, Edge)

1. **Clique-droit** sur l'icône de l'app (barre des tâches ou menu démarrer)
2. **Sélectionne** "Désinstaller" ou "Supprimer"
3. **Confirme** la suppression

**Alternative :**
- Menu ⋮ dans l'app → "Désinstaller DeepMemo"

### Sur Mobile (Android)

1. **Appui long** sur l'icône
2. **Sélectionne** "Désinstaller" ou "Supprimer de l'écran d'accueil"

### Sur iOS

1. **Appui long** sur l'icône
2. **Sélectionne** "Supprimer l'app"

---

## 🔧 Notes techniques

### Service Worker

DeepMemo utilise une stratégie **Cache-First** :
- Fichiers servis depuis le cache en priorité (démarrage rapide)
- Mise à jour en arrière-plan quand le réseau est disponible
- Mode offline complet après la première visite

### Cache

**Fichiers mis en cache :**
- `index.html`
- Tous les CSS (`src/css/*.css`)
- Tous les JS (`src/js/**/*.js`)
- Icônes PWA
- Bibliothèques externes (marked.js, JSZip)
- Dictionnaires d'internationalisation (fr.js, en.js)

**Données utilisateur :**
- Stockées dans **LocalStorage** (données structurées)
- Stockées dans **IndexedDB** (fichiers attachés)
- **Jamais dans le cache Service Worker** (séparation données/code)

### Manifest

Le fichier `manifest.json` définit :
- **Nom** : "DeepMemo - Ton second cerveau" (FR) / "Your second brain" (EN)
- **Mode** : `standalone` (plein écran)
- **Thème** : Noir (#0a0a0a)
- **Icônes** : 192x192 et 512x512
- **Localisé** (manifest-fr.json, manifest-en.json)

---

## 📱 Compatibilité

| Plateforme | Installation | Offline | Notes |
|------------|--------------|---------|-------|
| **Chrome Desktop** | ✅ | ✅ | Support complet |
| **Edge Desktop** | ✅ | ✅ | Support complet |
| **Brave Desktop** | ✅ | ✅ | Support complet |
| **Android Chrome** | ✅ | ✅ | Support complet |
| **iOS Safari** | ✅ | ✅ | Support complet |
| **Firefox** | ⚠️ Partiel | ✅ | Installation limitée |

**Note :** Les notifications push ne sont pas implémentées dans DeepMemo (pas nécessaire pour une app de notes locales).

---

## 🎉 Avantages de la PWA

**Pour toi :**
- 📱 Application native sans téléchargement lourd
- ⚡ Démarrage instantané (cache local)
- ✈️ Fonctionne offline (avion, métro, etc.)
- 🔒 Données privées (pas de serveur distant)
- 🆓 Gratuit et open source (MIT)

**Pour le projet :**
- 🌍 Pas de stores (Apple, Google) à gérer
- 🚀 Déploiement instantané (un simple push)
- 💰 Zéro coût d'infrastructure
- 🔧 Mise à jour automatique sans action utilisateur

---

**Enjoy ! DeepMemo est maintenant installable comme une vraie app !** 🌟
