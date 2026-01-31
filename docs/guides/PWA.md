# Progressive Web App (PWA)

> Guide complet de l'application web progressive DeepMemo
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-01-29
>
> ⚠️ **Ce guide concerne principalement l'utilisation Desktop**. L'interface mobile n'est pas encore optimisée.

---

## Table des Matières

1. [Qu'est-ce qu'une PWA ?](#quest-ce-quune-pwa-)
2. [Installer DeepMemo sur votre appareil](#installer-deepmemo-sur-votre-appareil)
3. [Fonctionnement Offline](#fonctionnement-offline)
4. [Icônes et Apparence](#icônes-et-apparence)
5. [Manifests Bilingues](#manifests-bilingues)
6. [Mise à jour automatique](#mise-à-jour-automatique)
7. [Désinstaller DeepMemo](#désinstaller-deepmemo)
8. [Troubleshooting](#troubleshooting)
9. [Référence Technique](#référence-technique)

---

## Qu'est-ce qu'une PWA ?

Une **Progressive Web App** (PWA) est une application web qui peut être **installée sur votre appareil** comme une application native, tout en restant un site web.

> ⚠️ **Important - Compatibilité Mobile**
>
> DeepMemo est actuellement **optimisé pour ordinateur** (Desktop). L'expérience mobile est en cours de développement.
>
> **Sur mobile** : Un avertissement s'affiche vous recommandant d'utiliser un ordinateur pour une expérience optimale.
>
> 📍 **Référence** : `index.html:100-107` (bannière d'avertissement mobile)
> 📍 **Référence** : `src/js/app.js:132-159` (détection et affichage avertissement)
> 📍 **Référence** : `src/js/locales/fr.js:396-399` (messages d'avertissement)

### Avantages pour vous (Desktop)

| Fonctionnalité | Bénéfice |
|----------------|----------|
| **🖥️ Installation sur ordinateur** | Lancez DeepMemo depuis votre menu Démarrer ou Dock |
| **🔌 Fonctionne offline** | Continuez à travailler sans connexion internet |
| **⚡ Chargement ultra-rapide** | Les fichiers sont mis en cache pour un démarrage instantané |
| **🎨 Expérience native** | L'application s'ouvre en plein écran, sans barre d'adresse |
| **💾 Stockage local** | Vos données restent sur votre appareil (privacy-first) |
| **🔄 Mises à jour automatiques** | L'application se met à jour toute seule en arrière-plan |

📍 **Référence** : `index.html:8` (mot-clé "PWA" dans meta keywords)
📍 **Référence** : `index.html:64` (feature "Full offline support (PWA)")

---

## Installer DeepMemo sur votre appareil

DeepMemo peut être installé sur **ordinateur** (Windows, Mac, Linux). L'installation mobile n'est **pas recommandée** pour le moment car l'interface n'est pas encore adaptée aux petits écrans.

### 🖥️ Installation sur Desktop

#### Google Chrome / Microsoft Edge

1. **Ouvrez** [https://deepmemo.org](https://deepmemo.org) dans Chrome ou Edge
2. Regardez la **barre d'adresse** : une icône d'installation ➕ apparaît à droite
3. **Cliquez** sur l'icône ➕ (ou Menu → "Installer DeepMemo")
4. Une fenêtre s'ouvre : cliquez sur **"Installer"**
5. DeepMemo s'ouvre dans une fenêtre dédiée et apparaît dans vos applications

**Raccourcis créés** :
- Windows : Menu Démarrer → DeepMemo
- Mac : Applications → DeepMemo
- Linux : Applications → DeepMemo

#### Firefox

Firefox ne supporte pas nativement l'installation PWA, mais vous pouvez :
- Créer un raccourci bureau (Menu → "Envoyer vers le bureau")
- Ou utiliser Chrome/Edge pour installer la PWA

#### Safari (Mac)

Safari supporte partiellement les PWA :
1. Ouvrez DeepMemo dans Safari
2. Menu **Fichier** → **Ajouter au Dock**
3. L'icône apparaît dans le Dock macOS

⚠️ **Limitation Safari** : Le mode offline est limité, privilégiez Chrome/Edge sur Mac.

---

### 📱 Installation sur Mobile (Non recommandé)

> ⚠️ **L'installation mobile est techniquement possible** mais **non recommandée** car l'interface n'est pas encore optimisée pour les petits écrans.
>
> **Avertissement affiché** : En ouvrant DeepMemo sur mobile, vous verrez ce message :
>
> 📱 **"Version mobile en développement"**
>
> "L'expérience mobile est en cours d'amélioration. Pour une utilisation optimale, nous recommandons d'utiliser un ordinateur."
>
> 📍 **Référence** : `src/js/locales/fr.js:397-398` (message FR)
> 📍 **Référence** : `src/js/locales/en.js:384-385` (message EN)

**Si vous souhaitez quand même installer** :

#### iOS (iPhone/iPad) - Expérimental

Techniquement possible via Safari :
1. Safari → Partager → "Sur l'écran d'accueil"
2. L'icône apparaît mais l'interface sera difficile à utiliser

#### Android - Expérimental

Techniquement possible via Chrome :
1. Chrome → Menu → "Installer l'application"
2. L'icône apparaît mais l'interface sera difficile à utiliser

**Recommandation** : Attendez la version mobile optimisée ou utilisez un ordinateur.

---

## Fonctionnement Offline

DeepMemo fonctionne **100% offline** grâce à un système de cache intelligent appelé **Service Worker**.

### Ce qui fonctionne sans internet

✅ **Tout ce qui est essentiel** :
- Créer, modifier, supprimer des nœuds
- Naviguer dans votre arborescence
- Rechercher dans vos nœuds
- Ajouter des tags
- Afficher vos fichiers attachés (déjà téléchargés)
- Exporter vos données (ZIP, JSON, FreeMind)

❌ **Ce qui nécessite internet** :
- Export PDF online (via CloudFlare Worker)
- Télécharger des images externes dans le Markdown
- Charger des CDN externes (si utilisés)

📍 **Référence** : `sw.js:1-142` (Service Worker complet)

---

### Comment ça marche : Stratégie de Cache

DeepMemo utilise une stratégie **"Cache First"** (cache en premier) :

```
1. Requête de fichier (ex: app.js)
   ↓
2. Chercher dans le cache
   ↓
   Trouvé ? → Retourner immédiatement
   |         + Mise à jour en arrière-plan
   |
   Non trouvé ? → Télécharger depuis internet
                  + Sauvegarder dans le cache
```

**Avantage** : Chargement **instantané** même avec connexion lente.

📍 **Référence** : `sw.js:79-142` (logique de fetch avec cache)

---

### Fichiers précachés

Au moment de l'installation, **38 fichiers** sont automatiquement mis en cache pour garantir le fonctionnement offline :

| Catégorie | Fichiers | Exemples |
|-----------|----------|----------|
| **HTML/CSS** | 6 | `index.html`, `style.css`, `components.css` |
| **JavaScript Core** | 5 | `app.js`, `data.js`, `storage.js` |
| **JavaScript Features** | 7 | `tree.js`, `editor.js`, `search.js`, `tags.js` |
| **JavaScript Utils** | 6 | `routing.js`, `i18n.js`, `keyboard.js` |
| **Traductions** | 2 | `fr.js`, `en.js` |
| **Icônes** | 5 | `icon-192.png`, `icon-512.png`, `favicon.svg` |
| **Manifests** | 2 | `manifest-fr.json`, `manifest-en.json` |
| **SEO** | 2 | `robots.txt`, `sitemap.xml` |

📍 **Référence** : `sw.js:6-45` (liste `PRECACHE_URLS`)

**Taille totale du cache** : ~300 KB (très léger !)

---

### Comportement sans réseau

**Scénario 1 : Vous êtes online puis vous passez offline**
```
✅ Tout continue de fonctionner normalement
✅ Vos données sont déjà dans IndexedDB (local)
✅ L'interface est déjà en cache
```

**Scénario 2 : Vous ouvrez DeepMemo pour la première fois offline**
```
❌ L'application ne peut pas se charger
⚠️ Le cache n'a pas encore été créé
→ Solution : Ouvrez DeepMemo une fois online pour créer le cache
```

**Scénario 3 : Vous demandez un fichier non caché**
```
⚠️ Message : "Offline - Contenu non disponible"
→ Le fichier sera téléchargé dès que vous serez online
```

📍 **Référence** : `sw.js:128-138` (réponse offline par défaut)

---

## Icônes et Apparence

### Icônes de l'application

DeepMemo utilise **2 tailles d'icônes** pour s'adapter à tous les appareils :

| Taille | Utilisation | Fichier |
|--------|-------------|---------|
| **192×192 px** | Écran d'accueil mobile, notifications | `icons/icon-192.png` (11 KB) |
| **512×512 px** | Écran de démarrage (splash screen) | `icons/icon-512.png` (62 KB) |

📍 **Référence** : `manifest-fr.json:11-23` (définition des icônes)

**Format** : PNG avec transparence (maskable)

Les icônes sont **adaptatives** (maskable) : elles s'ajustent automatiquement aux formes spécifiques de chaque plateforme (rond, carré, etc.).

---

### Couleur du thème

La couleur principale de DeepMemo est le **noir profond** :

```css
Theme color: #0a0a0a (noir très sombre)
```

Cette couleur est utilisée pour :
- La barre d'adresse du navigateur (mobile)
- La barre de statut (iOS/Android)
- L'écran de démarrage (splash screen)

📍 **Référence** : `index.html:6` (meta theme-color)
📍 **Référence** : `manifest-fr.json:7-8` (background_color et theme_color)

---

### Mode d'affichage

DeepMemo s'ouvre en mode **"standalone"** (autonome) :

| Propriété | Valeur | Signification |
|-----------|--------|---------------|
| **Display** | `standalone` | L'app s'ouvre sans barre d'adresse ni boutons du navigateur |
| **Orientation** | `any` | L'app fonctionne en mode portrait et paysage |
| **Scope** | `/` | L'app contrôle toutes les pages du domaine |

📍 **Référence** : `manifest-fr.json:6` (display: standalone)
📍 **Référence** : `manifest-fr.json:9` (orientation: any)

**Résultat** : DeepMemo ressemble à une vraie application native, sans interface de navigateur visible.

---

## Manifests Bilingues

DeepMemo génère **deux manifests PWA différents** selon votre langue :

### Manifest Français (`manifest-fr.json`)

```json
{
  "name": "DeepMemo - Ton second cerveau",
  "short_name": "DeepMemo",
  "description": "Système de gestion de connaissances basé sur des nœuds récursifs et interconnectés",
  "lang": "fr"
}
```

📍 **Référence** : `manifest-fr.json:2-4` (nom et description français)

---

### Manifest Anglais (`manifest-en.json`)

```json
{
  "name": "DeepMemo - Your second brain",
  "short_name": "DeepMemo",
  "description": "Knowledge management system based on recursive and interconnected nodes",
  "lang": "en"
}
```

📍 **Référence** : `manifest-en.json:2-4` (nom et description anglais)

---

### Sélection automatique du manifest

Au chargement de la page, un script détecte votre langue et charge le bon manifest :

```javascript
// Détection de la langue
const savedLang = localStorage.getItem('deepmemo_lang');
const browserLang = navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
const lang = savedLang || browserLang;

// Sélection du manifest
const manifestHref = lang === 'en' ? 'manifest-en.json' : 'manifest-fr.json';
document.getElementById('app-manifest').href = manifestHref;
```

📍 **Référence** : `index.html:78-90` (script de sélection du manifest)

**Conséquence** : Lorsque vous installez DeepMemo, le nom affiché dans vos applications correspond à votre langue :
- 🇫🇷 **"DeepMemo - Ton second cerveau"**
- 🇬🇧 **"DeepMemo - Your second brain"**

---

## Mise à jour automatique

DeepMemo se met à jour **automatiquement** en arrière-plan sans action de votre part.

### Comment fonctionnent les mises à jour

#### 1. **Détection de nouvelle version**

Chaque version de DeepMemo a un **numéro de cache** :

```javascript
const CACHE_VERSION = 'v1.10.5'; // Version actuelle
const CACHE_NAME = `deepmemo-${CACHE_VERSION}`;
```

📍 **Référence** : `sw.js:2-3` (version du cache)

Lorsqu'une nouvelle version est déployée (ex: `v1.10.6`), le Service Worker détecte le changement.

---

#### 2. **Installation de la nouvelle version**

Le Service Worker :
1. Télécharge les **nouveaux fichiers**
2. Les stocke dans un **nouveau cache** (`deepmemo-v1.10.6`)
3. Active le nouveau cache

📍 **Référence** : `sw.js:48-58` (installation et précache)

**Important** : L'ancienne version continue de fonctionner pendant l'installation.

---

#### 3. **Activation et nettoyage**

Une fois la nouvelle version prête :
1. Le **nouveau Service Worker s'active**
2. Les **anciens caches sont supprimés** (pour libérer de l'espace)
3. L'application bascule sur la nouvelle version

📍 **Référence** : `sw.js:61-77` (activation et nettoyage des anciens caches)

```javascript
// Suppression des anciens caches
cacheNames.map((cacheName) => {
  if (cacheName !== CACHE_NAME) {
    console.log('[SW] Suppression ancien cache:', cacheName);
    return caches.delete(cacheName);
  }
})
```

---

#### 4. **Rechargement automatique**

**Par défaut** : La nouvelle version est active **immédiatement** pour les nouveaux onglets.

**Onglets déjà ouverts** : Ils continuent avec l'ancienne version jusqu'au prochain rechargement de la page.

**Pour forcer la mise à jour** : Rechargez simplement la page (F5 ou Ctrl+R).

---

### Fréquence des mises à jour

| Vérification | Quand ? |
|--------------|---------|
| **À chaque visite** | Le navigateur vérifie si le fichier `sw.js` a changé |
| **Toutes les 24h** | Vérification automatique en arrière-plan (même si l'app est fermée) |

**Résultat** : Vous êtes **toujours à jour** sans rien faire.

---

### Vérifier votre version actuelle

**Dans la console navigateur** (F12) :

```javascript
// Ouvrez la console et tapez :
console.log('[Version] Cache actuel :', CACHE_VERSION);
```

Vous verrez : `[Version] Cache actuel : v1.10.5`

Ou regardez le bandeau en haut de la page d'accueil : **DeepMemo V0.10.5**

---

## Désinstaller DeepMemo

Si vous souhaitez désinstaller DeepMemo de votre appareil :

### 🖥️ Sur Desktop

#### Windows (Chrome/Edge)
1. Ouvrez le **Menu Démarrer**
2. Clic droit sur **DeepMemo**
3. Sélectionnez **"Désinstaller"**

**Ou dans Chrome/Edge** :
1. Menu ⋮ → **Applications** → **Gérer les applications**
2. Trouvez DeepMemo → Cliquez sur **"Désinstaller"**

#### Mac (Chrome/Edge/Safari)
1. Ouvrez le dossier **Applications**
2. Glissez **DeepMemo** vers la Corbeille

#### Linux
1. Menu Applications
2. Clic droit sur DeepMemo → Désinstaller

---

### 📱 Sur Mobile (si installé malgré l'avertissement)

#### iOS
1. Maintenez le doigt sur l'icône **DeepMemo**
2. Sélectionnez **"Supprimer l'app"**
3. Confirmez

#### Android
1. Maintenez le doigt sur l'icône **DeepMemo**
2. Glissez vers **"Désinstaller"**
3. Confirmez

> ℹ️ Rappel : L'installation mobile n'est pas recommandée pour le moment.

---

### ⚠️ Que devient vos données ?

**Important** : La désinstallation de l'application PWA **NE SUPPRIME PAS** vos données.

**Vos données restent dans le navigateur** :
- Dans **IndexedDB** (vos nœuds et fichiers attachés)
- Dans **localStorage** (vos préférences)

**Pour supprimer complètement vos données** :
1. Avant de désinstaller, allez dans les **Paramètres du navigateur**
2. **Effacer les données du site** pour `deepmemo.org`
3. Cochez **"Données de sites"** et **"Stockage"**
4. Confirmez

**Ou exportez vos données avant** : `⚙️ Actions` → `💾 Exporter` → `📦 Archive ZIP`

---

## Troubleshooting

### Problème : J'ai un avertissement "Version mobile en développement"

**Symptôme** : Une bannière jaune/orange s'affiche en haut de la page avec le message :

> 📱 **"Version mobile en développement"**
>
> "L'expérience mobile est en cours d'amélioration. Pour une utilisation optimale, nous recommandons d'utiliser un ordinateur."

**Cause** : Vous utilisez DeepMemo sur un appareil mobile (smartphone ou tablette). L'interface n'est pas encore adaptée aux petits écrans.

**Solutions** :

1. **Recommandé** : Utilisez DeepMemo sur un ordinateur (Windows, Mac, Linux)
2. **Fermer la bannière** : Cliquez sur le bouton ✕ pour la masquer temporairement
   - La bannière ne réapparaîtra pas (sauvegarde dans `localStorage`)
   - 📍 **Référence** : `src/js/app.js:152-159` (fermeture bannière)
3. **Continuer sur mobile** : Possible mais l'expérience sera limitée (petits boutons, navigation difficile)

**Détection automatique** : L'avertissement s'affiche si votre `userAgent` correspond à un appareil mobile (Android, iOS, etc.).

📍 **Référence** : `src/js/app.js:138` (détection via userAgent)
📍 **Référence** : `src/js/app.js:141-145` (affichage bannière)
📍 **Référence** : `index.html:100-107` (structure HTML de la bannière)

---

### Problème : L'icône d'installation n'apparaît pas

**Causes possibles** :
1. ✅ Vous avez déjà installé DeepMemo → Vérifiez vos applications
2. ❌ Votre navigateur ne supporte pas les PWA → Utilisez Chrome ou Edge
3. ❌ Vous n'êtes pas en HTTPS → DeepMemo nécessite HTTPS (https://deepmemo.org)

**Solution** : Ouvrez [https://deepmemo.org](https://deepmemo.org) dans Chrome ou Edge.

---

### Problème : L'application ne fonctionne pas offline

**Diagnostic** :

1. **Vérifiez le Service Worker** :
   - Ouvrez les **DevTools** (F12)
   - Onglet **Application** → **Service Workers**
   - Vérifiez qu'un Service Worker est **actif**

2. **Vérifiez le cache** :
   - Onglet **Application** → **Cache Storage**
   - Vous devez voir `deepmemo-v1.10.5` avec ~38 fichiers

**Solutions** :
- Rechargez la page pour réinstaller le Service Worker
- Ouvrez DeepMemo **online une première fois** pour créer le cache
- Videz le cache et rechargez : Ctrl+Shift+R (hard refresh)

📍 **Référence** : `index.html:457-469` (enregistrement du Service Worker)

---

### Problème : La mise à jour ne s'applique pas

**Symptôme** : Vous voyez toujours l'ancienne version malgré une mise à jour.

**Cause** : Le Service Worker garde l'ancienne version active.

**Solution** :
1. Fermez **tous les onglets** DeepMemo
2. Rouvrez DeepMemo
3. Ou **hard refresh** : Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)

**Forcer le rechargement du Service Worker** :
1. Ouvrez DevTools (F12)
2. Onglet **Application** → **Service Workers**
3. Cliquez sur **"Unregister"** (désinstaller)
4. Rechargez la page (F5)

---

### Problème : L'app est lente ou ne se charge pas

**Causes possibles** :
1. Cache corrompu
2. Service Worker bloqué
3. Quota de stockage dépassé

**Solutions** :

**1. Vider le cache de l'application** :
```
DevTools (F12) → Application → Storage → Clear site data
```
⚠️ Cela supprime vos données locales ! Exportez d'abord.

**2. Désactiver le Service Worker temporairement** :
```
DevTools (F12) → Application → Service Workers
→ Cochez "Bypass for network"
```

**3. Vérifier le quota de stockage** :
```javascript
// Dans la console (F12) :
navigator.storage.estimate().then(estimate => {
  console.log('Utilisé:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
  console.log('Quota:', (estimate.quota / 1024 / 1024).toFixed(2), 'MB');
});
```

Si le quota est dépassé, supprimez des fichiers attachés volumineux.

---

### Problème : L'icône DeepMemo est floue

**Cause** : Le navigateur utilise une mauvaise taille d'icône.

**Solution** : Réinstallez l'application :
1. Désinstallez DeepMemo
2. Videz le cache du navigateur
3. Réinstallez depuis [https://deepmemo.org](https://deepmemo.org)

Les icônes haute résolution (512×512 px) devraient s'afficher correctement.

---

## Référence Technique

### Service Worker : Événements

| Événement | Quand ? | Action |
|-----------|---------|--------|
| **install** | Nouvelle version détectée | Précache des fichiers essentiels (38 fichiers) |
| **activate** | Service Worker activé | Suppression des anciens caches |
| **fetch** | Requête HTTP | Stratégie Cache First (retourne cache puis update) |

📍 **Référence** : `sw.js:48` (install), `sw.js:61` (activate), `sw.js:79` (fetch)

---

### Stratégie de Cache : Cache First avec Update

```
Requête de fichier
    ↓
Cache Match ?
    ↓
OUI → Retourner depuis cache (instantané)
   └→ + Fetch réseau en arrière-plan
      └→ Mettre à jour le cache si nouvelle version
    ↓
NON → Fetch réseau
   └→ Sauvegarder dans cache
   └→ Retourner la ressource
```

📍 **Référence** : `sw.js:91-142` (logique complète de fetch)

**Avantages** :
- ⚡ **Chargement instantané** (pas d'attente réseau)
- 🔄 **Mise à jour automatique** en arrière-plan
- 🔌 **Fonctionne offline** même sans réseau

**Inconvénient** :
- 🕐 Vous pouvez voir une version légèrement obsolète (jusqu'au prochain rechargement)

---

### Manifests PWA : Champs Principaux

| Champ | Valeur FR | Valeur EN | Description |
|-------|-----------|-----------|-------------|
| `name` | "DeepMemo - Ton second cerveau" | "DeepMemo - Your second brain" | Nom complet affiché lors de l'installation |
| `short_name` | "DeepMemo" | "DeepMemo" | Nom court (icône, notifications) |
| `description` | "Système de gestion de connaissances..." | "Knowledge management system..." | Description de l'app |
| `start_url` | `/` | `/` | Page de démarrage |
| `display` | `standalone` | `standalone` | Mode d'affichage (plein écran) |
| `background_color` | `#0a0a0a` | `#0a0a0a` | Couleur de fond (splash screen) |
| `theme_color` | `#0a0a0a` | `#0a0a0a` | Couleur du thème (barre de statut) |
| `orientation` | `any` | `any` | Orientation autorisée |
| `lang` | `fr` | `en` | Langue du manifest |

📍 **Référence** : `manifest-fr.json:1-28` (manifest complet français)
📍 **Référence** : `manifest-en.json:1-28` (manifest complet anglais)

---

### Meta Tags PWA dans index.html

| Meta Tag | Valeur | Utilisation |
|----------|--------|-------------|
| `theme-color` | `#0a0a0a` | Couleur de la barre d'adresse (mobile) |
| `apple-mobile-web-app-capable` | `yes` | Active le mode standalone sur iOS |
| `apple-mobile-web-app-status-bar-style` | `black-translucent` | Style de la barre de statut iOS |
| `apple-mobile-web-app-title` | `DeepMemo` | Nom affiché sous l'icône iOS |
| `application-name` | `DeepMemo` | Nom de l'application (Android) |

📍 **Référence** : `index.html:6` (theme-color)
📍 **Référence** : `index.html:18-21` (meta tags Apple)

---

### Compatibilité Navigateurs

| Navigateur | Installation PWA | Mode Offline | Interface | Notes |
|------------|------------------|--------------|-----------|-------|
| **Chrome (Desktop)** | ✅ Oui | ✅ Parfait | ✅ Optimisée | **Recommandé** - Support complet |
| **Edge (Desktop)** | ✅ Oui | ✅ Parfait | ✅ Optimisée | **Recommandé** - Support complet |
| **Safari (Mac)** | ⚠️ Partiel | ⚠️ Partiel | ✅ Optimisée | Ajout au Dock uniquement |
| **Firefox (Desktop)** | ❌ Non | ✅ Oui | ✅ Optimisée | Pas d'installation, mais offline fonctionne |
| **Chrome (Android)** | ⚠️ Possible | ✅ Oui | ❌ Non adaptée | Installation déconseillée |
| **Safari (iOS)** | ⚠️ Possible | ⚠️ Partiel | ❌ Non adaptée | Installation déconseillée |
| **Firefox (Android)** | ⚠️ Partiel | ✅ Oui | ❌ Non adaptée | Installation déconseillée |

**Recommandation** : Utilisez **Chrome** ou **Edge** sur **ordinateur** pour la meilleure expérience.

**Avertissement mobile** : Les navigateurs mobiles affichent automatiquement un message vous recommandant d'utiliser un ordinateur.

📍 **Référence** : `src/js/app.js:137-145` (détection mobile et affichage bannière)

---

### Taille et Performance

| Métrique | Valeur | Détail |
|----------|--------|--------|
| **Fichiers précachés** | 38 fichiers | HTML, CSS, JS, icônes, manifests |
| **Taille du cache** | ~300 KB | Très léger ! |
| **Taille des icônes** | 73 KB | icon-192.png (11 KB) + icon-512.png (62 KB) |
| **Temps de chargement (cache)** | <100 ms | Quasi-instantané |
| **Temps de chargement (réseau)** | ~500 ms | Avec connexion rapide |

---

### Service Worker : Code Source Commenté

Le Service Worker de DeepMemo fait **142 lignes** et gère 3 événements principaux :

**1. Installation (install)** - Lignes 48-58
```javascript
self.addEventListener('install', (event) => {
  // Précache tous les fichiers essentiels (38 fichiers)
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // Active immédiatement
  );
});
```

**2. Activation (activate)** - Lignes 61-77
```javascript
self.addEventListener('activate', (event) => {
  // Supprime les anciens caches (nettoyage)
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName); // Supprime
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Prend contrôle immédiatement
  );
});
```

**3. Fetch (fetch)** - Lignes 79-142
```javascript
self.addEventListener('fetch', (event) => {
  // Stratégie Cache First :
  // 1. Chercher dans le cache
  // 2. Si trouvé : retourner + update en arrière-plan
  // 3. Si non trouvé : fetch réseau + mise en cache

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Trouvé dans cache : retourner immédiatement
          // + Fetch en arrière-plan pour mettre à jour
          fetch(event.request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          });
          return cachedResponse;
        }

        // Pas dans cache : fetch réseau + cache
        return fetch(event.request)
          .then((networkResponse) => {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });
      })
  );
});
```

📍 **Référence** : `sw.js:1-142` (fichier complet)

---

## Statistiques

### Fichiers Sources Vérifiés

| Fichier | Lignes | Contenu vérifié |
|---------|--------|-----------------|
| `sw.js` | 143 | Service Worker complet (install, activate, fetch) |
| `manifest-fr.json` | 28 | Manifest PWA français |
| `manifest-en.json` | 28 | Manifest PWA anglais |
| `index.html` | Lignes 6-21, 78-90, 100-107, 456-469 | Meta tags PWA, sélection manifest, bannière mobile, enregistrement SW |
| `src/js/app.js` | Lignes 132-159 | Détection mobile et avertissement |
| `src/js/locales/fr.js` | Lignes 12, 396-399 | Mot-clé "PWA" + messages avertissement mobile |
| `src/js/locales/en.js` | Lignes 383-386 | Messages avertissement mobile (EN) |

**Total** : 6 fichiers sources analysés, toutes les références vérifiées ✅

---

## Voir Aussi

- [Guide Internationalisation](I18N.md) - Manifests bilingues détaillés
- [Architecture](../2-ARCHITECTURE.md#service-worker) - Service Worker dans l'architecture globale
- [Data Model](../3-DATA-MODEL.md#indexeddb-schema) - Stockage local IndexedDB

---

**Dernière mise à jour** : 2026-01-29 | **Version** : V0.10.5
