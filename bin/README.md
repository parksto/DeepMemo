# DeepMemo CLI Tools

Outils en ligne de commande pour DeepMemo.

## branch2pdf.js

Génère un PDF à partir d'une branche exportée en JSON.

### Installation

```bash
cd bin
npm install
```

Sur Linux, pour le support des emojis couleur :
```bash
sudo apt-get install fonts-noto-color-emoji
```

### Usage

1. **Exporter une branche depuis DeepMemo** :
   - Sélectionner un nœud
   - Cliquer sur "⬇️ Export branche"
   - Choisir "📦 Archive ZIP" ou format JSON

2. **Générer le PDF** :
```bash
node branch2pdf.js input.json output.pdf
```

Exemple :
```bash
node branch2pdf.js mon_export.json mon_document.pdf
```

### Fonctionnalités

- ✅ **Table des matières** hiérarchique avec liens cliquables
- ✅ **Markdown complet** : Titres, listes, code, citations, images, tableaux
- ✅ **Symlinks** : Affiche le contenu du nœud cible
- ✅ **Pagination** : Saut de page après chaque nœud
- ✅ **Emojis couleur** (avec fonts-noto-color-emoji sur Linux)
- ✅ **Debug HTML** : Génère `debug.html` pour prévisualiser avant PDF

### Format d'entrée

Le fichier JSON doit être au format `deepmemo-branch` :

```json
{
  "type": "deepmemo-branch",
  "version": "0.10.5",
  "branchRootId": "node_123",
  "nodes": {
    "node_123": {
      "id": "node_123",
      "title": "Ma branche",
      "content": "# Contenu markdown...",
      "children": ["node_456"],
      "type": "note"
    }
  }
}
```

### Options avancées

Pour personnaliser le PDF, modifier les styles CSS dans `branch2pdf.js` (lignes 84-107).

Exemples :
- Marges : `@page { margin: 2cm; }`
- Police : `body { font-family: ...; }`
- Couleurs titres : `h1, h2 { color: #...; }`

### Dépendances

- **Node.js** 16+
- **puppeteer** : Headless Chrome pour génération PDF
- **marked** : Parser Markdown

### Limitations actuelles

- ⚠️ **Pas d'images** : Les attachments ne sont pas encore inclus
- ⚠️ **Symlinks simples** : Affiche le contenu cible uniquement (pas de résolution récursive)

### Alternative en ligne

Une version en ligne sera bientôt disponible via CloudFlare Worker (voir `../cloudflare-worker/README.md`).

Avantages du CLI vs version en ligne :
- ✅ Pas de limitation de taux (illimité)
- ✅ Fonctionne 100% offline
- ✅ Contrôle total sur le rendu
- ✅ Pas de données envoyées à un serveur

### Troubleshooting

**Erreur "chromium not found"** :
```bash
# Installer les dépendances Chromium
cd bin
npx puppeteer browsers install chrome
```

**PDF vide ou erreur de fonts** :
- Sur Linux, installer `fonts-noto-color-emoji`
- Vérifier que `debug.html` s'affiche correctement dans un navigateur

**Timeout ou crash** :
- Augmenter la mémoire : `node --max-old-space-size=4096 branch2pdf.js ...`
- Pour branches très volumineuses (>500 nœuds)

### Contribuer

Pour améliorer cet outil :
1. Modifier `branch2pdf.js`
2. Tester avec différents exports
3. Soumettre une PR sur GitHub

### Licence

MIT
