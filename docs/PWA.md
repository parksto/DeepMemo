# PWA Guide - DeepMemo

*[Version française](PWA.fr.md)*

---

## 🎯 What is a PWA?

A **Progressive Web App** allows you to install DeepMemo as a real application on your computer or mobile, with:

✅ **Native installation** - Icon on desktop/start menu
✅ **Offline mode** - Works without Internet connection
✅ **Fullscreen opening** - No browser address bar
✅ **Fast startup** - Smart cache for optimal performance

---

## 📦 Installation

### On Desktop (Chrome, Edge, Brave)

1. **Open** [deepmemo.ydns.eu](https://deepmemo.ydns.eu) in your browser
2. **Look for the install icon** in the address bar (➕ or computer icon)
3. **Click** on "Install DeepMemo"
4. The app opens in a dedicated window!

**Alternative:**
- Menu ⋮ → "Install DeepMemo"

### On Mobile (Android)

1. **Open** [deepmemo.ydns.eu](https://deepmemo.ydns.eu) in Chrome
2. **Menu** ⋮ → "Add to Home screen"
3. **Confirm** the addition
4. The icon appears on your home screen!

### On iOS (Safari)

1. **Open** [deepmemo.ydns.eu](https://deepmemo.ydns.eu) in Safari
2. **Share button** (↑ icon) → "Add to Home Screen"
3. **Name** the app → "Add"
4. The icon appears on your home screen!

---

## 🔍 Verify it Works

### Test 1: Installation
✅ The app opens in a separate window (no address bar)
✅ The icon appears in the start menu / home screen

### Test 2: Offline Mode
1. **Open** the installed app
2. **Turn off** your Internet connection (Wi-Fi or data)
3. **Refresh** the app (`Ctrl+R` or `Cmd+R`)
4. ✅ The app continues to work!

### Test 3: Automatic Cache
1. **Open** DevTools (`F12`) → **Application** → **Cache Storage**
2. **Verify** that `deepmemo-v1.3.0` contains all files
3. ✅ CSS, JS files, icons cached

---

## 🔄 Updates

### The Application Updates Automatically

The Service Worker checks for updates in the background. When a new version is available:

1. **Completely close** the application
2. **Reopen it**
3. ✅ The new version is installed!

**Technical note:** Updates are applied during the next Service Worker activation (app close/reopen).

---

## 🗑️ Uninstallation

### On Desktop (Chrome, Edge)

1. **Right-click** on the app icon (taskbar or start menu)
2. **Select** "Uninstall" or "Remove"
3. **Confirm** the deletion

**Alternative:**
- Menu ⋮ in the app → "Uninstall DeepMemo"

### On Mobile (Android)

1. **Long press** on the icon
2. **Select** "Uninstall" or "Remove from Home screen"

### On iOS

1. **Long press** on the icon
2. **Select** "Remove App"

---

## 🔧 Technical Notes

### Service Worker

DeepMemo uses a **Cache-First** strategy:
- Files served from cache first (fast startup)
- Updates in background when network is available
- Full offline mode after first visit

### Cache

**Cached files:**
- `index.html`
- All CSS (`src/css/*.css`)
- All JS (`src/js/**/*.js`)
- PWA icons
- External libraries (marked.js, JSZip)
- Internationalization dictionaries (fr.js, en.js)

**User data:**
- Stored in **LocalStorage** (structured data)
- Stored in **IndexedDB** (attached files)
- **Never in Service Worker cache** (code/data separation)

### Manifest

The `manifest.json` file defines:
- **Name**: "DeepMemo - Your second brain" (EN) / "Ton second cerveau" (FR)
- **Mode**: `standalone` (fullscreen)
- **Theme**: Black (#0a0a0a)
- **Icons**: 192x192 and 512x512
- **Localized** (manifest-fr.json, manifest-en.json)

---

## 📱 Compatibility

| Platform | Installation | Offline | Notes |
|----------|--------------|---------|-------|
| **Chrome Desktop** | ✅ | ✅ | Full support |
| **Edge Desktop** | ✅ | ✅ | Full support |
| **Brave Desktop** | ✅ | ✅ | Full support |
| **Android Chrome** | ✅ | ✅ | Full support |
| **iOS Safari** | ✅ | ✅ | Full support |
| **Firefox** | ⚠️ Partial | ✅ | Limited installation |

**Note:** Push notifications are not implemented in DeepMemo (not needed for a local notes app).

---

## 🎉 PWA Advantages

**For you:**
- 📱 Native app without heavy download
- ⚡ Instant startup (local cache)
- ✈️ Works offline (plane, subway, etc.)
- 🔒 Private data (no remote server)
- 🆓 Free and open source (MIT)

**For the project:**
- 🌍 No stores (Apple, Google) to manage
- 🚀 Instant deployment (simple push)
- 💰 Zero infrastructure cost
- 🔧 Automatic updates without user action

---

**Enjoy! DeepMemo is now installable as a real app!** 🌟
