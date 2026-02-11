# Export PDF

> Guide complet pour exporter vos branches DeepMemo en documents PDF professionnels
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-01-29

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Export Online (CloudFlare Worker)](#export-online-cloudflare-worker)
3. [Export Offline (CLI)](#export-offline-cli)
4. [Format du PDF généré](#format-du-pdf-généré)
5. [Gestion des images](#gestion-des-images)
6. [Gestion des symlinks](#gestion-des-symlinks)
7. [Comparaison Online vs Offline](#comparaison-online-vs-offline)
8. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

### Deux méthodes d'export PDF

DeepMemo propose **deux méthodes** pour exporter vos branches en PDF :

| Méthode | Avantages | Inconvénients | Usage recommandé |
|---------|-----------|---------------|------------------|
| **📤 Online** (CloudFlare Worker) | ✅ Aucune installation<br>✅ Fonctionne dans le navigateur<br>✅ Automatique | ⚠️ Limite de débit (5/h, 20/jour)<br>⚠️ Nécessite Internet | Usage occasionnel, petites branches |
| **💻 Offline** (CLI) | ✅ Sans limitation<br>✅ Fonctionne hors-ligne<br>✅ Plus rapide pour gros volumes | ⚠️ Installation Node.js requise<br>⚠️ Ligne de commande | Usage fréquent, exports en masse, automatisation |

---

## Export Online (CloudFlare Worker)

### Comment utiliser l'export Online ?

1. **Sélectionner le nœud** à exporter (racine de la branche)
2. Cliquer sur **"📄 Document PDF"** dans la modal d'export
3. La **modal de confidentialité** s'affiche (première utilisation uniquement)
4. Cliquer sur **"✓ Compris, générer"**
5. Le PDF est généré et téléchargé automatiquement

📍 **Référence UI** : `index.html:379-386` (bouton export PDF modal)
📍 **Référence code** : `app.js:738-756` (fonction `confirmExportPDF`)

---

### Modal de confidentialité

Lors de la première utilisation, DeepMemo affiche une **modal de confidentialité** expliquant le système de rate limiting et la protection de la vie privée.

📍 **Référence UI** : `index.html:395-447` (modal PDF Privacy Notice)

**Contenu de la modal** :

#### Limites de débit

Pour protéger les coûts serveur, les exports sont limités à :
- **5 PDFs par heure** (maximum)
- **20 PDFs par jour** (maximum)

📍 **Référence** : `src/js/locales/fr.js:259-260` (messages limites)
📍 **Référence code** : `cloudflare-worker/worker.js:39-43` (vérification limites)

#### Protection de la vie privée

- **IP hashée (SHA-256)** : Votre adresse IP est hashée cryptographiquement avant stockage
- **TTL de 24h** : Les hashs sont automatiquement supprimés après 24 heures
- **Aucun log de document** : Le contenu de votre document n'est jamais sauvegardé
- **Comparaison** : Plus respectueux que les logs serveur web standards (30-90 jours)

📍 **Référence** : `src/js/locales/fr.js:261-264` (messages confidentialité)
📍 **Référence code** : `cloudflare-worker/worker.js:15-21` (fonction `hashIP`)

#### Option "Ne plus afficher"

Cocher la case **"Ne plus afficher ce message"** sauvegarde votre choix dans `localStorage` :

```javascript
localStorage.setItem('deepmemo_pdf_privacy_accepted', 'true');
```

📍 **Référence** : `app.js:777-781` (sauvegarde préférence)

---

### Alternative Offline

La modal mentionne l'alternative CLI disponible dans le dossier `bin/` du projet GitHub :

> "Un outil CLI est disponible sur GitHub pour exporter sans limitation ni connexion internet (dossier bin/)."

📍 **Référence** : `src/js/locales/fr.js:265-266` (message alternative offline)

---

### Processus d'export Online

#### 1. Vérification de la connexion

L'export online nécessite une connexion Internet active :

```javascript
if (!navigator.onLine) {
  showToast(t('messages.pdfRequiresOnline'), '⚠️');
  return;
}
```

📍 **Référence** : `app.js:985-988`

#### 2. Préparation des données

Les données sont préparées en plusieurs étapes :

**a. Résolution des symlinks**

Les symlinks sont résolus pour inclure le contenu de leur cible :

```javascript
if (node.type === 'symlink' && node.targetId && nodesMap[node.targetId]) {
  const target = nodesMap[node.targetId];
  resolvedNode = {
    id: node.id,
    title: node.title,
    content: target.content || '',  // ← Contenu de la cible
    ...
  };
}
```

📍 **Référence** : `app.js:926-936`

**b. Conversion des images inline**

Les références `![alt](attachment:id)` sont converties en **Data URLs base64** :

```javascript
const blob = await AttachmentsModule.getAttachment(attachment.id);
const dataUrl = await this.blobToBase64(blob);
replacements.push({ from: fullMatch, to: `![${alt}](${dataUrl})` });
```

📍 **Référence** : `app.js:809-846` (fonction `processInlineImages`)

**Toast de préparation** : ℹ️ "Préparation des données..."

📍 **Référence** : `app.js:995`

#### 3. Détermination de l'URL du Worker

L'URL du CloudFlare Worker varie selon l'environnement :

| Environnement | URL du Worker | Usage |
|---------------|---------------|-------|
| **Localhost** | `http://localhost:8787/generate` | Développement local |
| **Production** | `https://pdf.deepmemo.org/generate` | DeepMemo officiel et clones |

📍 **Référence** : `app.js:672-681` (fonction `getWorkerURL`)

**Note** : Le Worker vérifie le header `Referer` pour bloquer les requêtes depuis des origines non autorisées.

📍 **Référence** : `cloudflare-worker/worker.js:225-246` (vérification origine)

#### 4. Envoi au Worker

Les données sont envoyées au Worker via une requête `POST` :

```javascript
const response = await fetch(workerURL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nodes: pdfNodes,
    rootId,
    type
  })
});
```

📍 **Référence** : `app.js:1004-1012`

**Toast de génération** : ℹ️ "Génération du PDF en cours..."

📍 **Référence** : `app.js:1002`

#### 5. Réception du rate limit

Le Worker renvoie des headers indiquant le quota restant :

```javascript
this.pdfRateLimits = {
  hourRemaining: parseInt(response.headers.get('X-RateLimit-Remaining-Hour') || '0'),
  dayRemaining: parseInt(response.headers.get('X-RateLimit-Remaining-Day') || '0'),
  lastUpdate: Date.now()
};
```

📍 **Référence** : `app.js:1015-1020`

Ces limites sont sauvegardées dans `localStorage` pour affichage ultérieur :

```javascript
localStorage.setItem('deepmemo_pdf_rate_limits', JSON.stringify(this.pdfRateLimits));
```

📍 **Référence** : `app.js:724-732` (fonction `savePdfRateLimits`)

#### 6. Téléchargement du PDF

Si la génération réussit, le PDF est téléchargé automatiquement :

```javascript
const blob = await response.blob();
const filename = `${sanitizeFilename(node.title)}.pdf`;
// Download trigger...
```

**Note** : `sanitizeFilename()` normalise le titre pour créer un nom de fichier valide (espaces → tirets, suppression caractères spéciaux, fusion tirets multiples, max 50 caractères).

📍 **Référence** : `app.js:1031-1033`

---

### Gestion des erreurs Online

#### Rate limit dépassé (429)

Si le quota est dépassé, un message d'erreur s'affiche :

```javascript
if (response.status === 429) {
  const errorData = await response.json();
  showToast(errorData.error || t('messages.pdfRateLimitExceeded'), '⚠️');
  return;
}
```

📍 **Référence** : `app.js:1022-1027`

**Messages possibles** :
- ⚠️ "Limite atteinte : 5 PDFs par heure maximum"
- ⚠️ "Limite atteinte : 20 PDFs par jour maximum"

📍 **Référence** : `cloudflare-worker/worker.js:256-258`

#### Origine non autorisée (403)

Si le Worker bloque la requête (clone non autorisé) :

```json
{
  "error": "Unauthorized origin. Please use the official DeepMemo instance or deploy your own Worker."
}
```

📍 **Référence** : `cloudflare-worker/worker.js:237-245`

#### Erreur serveur (500)

En cas d'erreur lors de la génération :

```json
{
  "error": "PDF generation failed",
  "details": "..."
}
```

📍 **Référence** : `cloudflare-worker/worker.js:296-308`

---

## Export Offline (CLI)

### Prérequis

L'export offline nécessite :
- **Node.js** : Version 16+ recommandée
- **NPM** : Pour installer les dépendances
- **Fichier d'export** : Archive `.dm` (ZIP) ou fichier `.json`

### Installation

1. **Cloner le dépôt GitHub** (ou télécharger le dossier `bin/`)
2. **Installer les dépendances** :

```bash
cd bin/
npm install
```

Les dépendances installées sont :
- `marked` : Parser Markdown → HTML
- `puppeteer` : Navigateur headless pour génération PDF
- `yauzl` : Décompression ZIP (lecture archives `.dm`)

📍 **Référence** : `bin/branch2pdf.js:1-4` (imports)

---

### Utilisation

#### Syntaxe de base

```bash
node branch2pdf.js <input> <output.pdf>
```

**Paramètres** :
- `<input>` : Fichier d'entrée (`.dm` ou `.json`)
- `<output.pdf>` : Fichier PDF de sortie

📍 **Référence** : `bin/branch2pdf.js:285-296` (args parsing et usage)

#### Exemples

**Depuis une archive .dm** :
```bash
node branch2pdf.js mon-export.dm output.pdf
```

**Depuis un fichier JSON** :
```bash
node branch2pdf.js branch-export.json output.pdf
```

---

### Formats d'entrée supportés

#### Archive .dm (ZIP)

Le CLI détecte automatiquement les archives `.dm` (ou `.zip`) et extrait :
- **`data.json`** : Structure des nœuds
- **`attachments/`** : Fichiers attachés (pour images inline)

📍 **Référence** : `bin/branch2pdf.js:57-120` (fonction `readDataFromDM`)

**Détection** :

```javascript
const isDM = inputFile.endsWith('.dm') || inputFile.endsWith('.zip');
```

📍 **Référence** : `bin/branch2pdf.js:175`

#### Fichier JSON

Si le fichier n'est pas un ZIP, il est traité comme un fichier JSON :

```javascript
data = JSON.parse(fs.readFileSync(inputFile, "utf8"));
```

📍 **Référence** : `bin/branch2pdf.js:184`

**Formats JSON supportés** :

| Format | Détection | Utilisation |
|--------|-----------|-------------|
| **Export de branche** | `data.type === "deepmemo-branch"` | Utilise `data.branchRootId` |
| **Export global** | `data.rootNodes && data.nodes` | Utilise le premier `rootNodes[0]` |

📍 **Référence** : `bin/branch2pdf.js:187-205`

---

### Processus de génération Offline

#### 1. Lecture des données

**Si archive .dm** :
- Extraction de `data.json`
- Chargement des attachments dans un buffer en mémoire

📍 **Référence** : `bin/branch2pdf.js:57-120`

**Si fichier JSON** :
- Lecture directe du fichier
- Pas d'attachments (images inline non disponibles)

#### 2. Traitement des images inline

Si des attachments sont disponibles, ils sont convertis en **Data URLs base64** :

```javascript
const base64 = buffer.toString('base64');
const mimeType = attachment.type || 'application/octet-stream';
const dataUrl = `data:${mimeType};base64,${base64}`;
processedContent = processedContent.replace(fullMatch, `![${alt}](${dataUrl})`);
```

📍 **Référence** : `bin/branch2pdf.js:126-160` (fonction `processInlineImages`)

**Regex de détection des images** :

```regex
/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
```

📍 **Référence** : `bin/branch2pdf.js:132`

#### 3. Construction du HTML

Le CLI construit un document HTML complet avec :
- **Table des matières** (TOC) hiérarchique
- **Contenu des nœuds** avec hiérarchie préservée
- **Styles CSS** intégrés

📍 **Référence** : `bin/branch2pdf.js:22-51` (fonction `buildHTML`)
📍 **Référence** : `bin/branch2pdf.js:162-170` (fonction `generateTOC`)

#### 4. Génération du PDF avec Puppeteer

Le HTML est converti en PDF via Puppeteer :

```javascript
const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--font-render-hinting=medium",
  ],
});
const page = await browser.newPage();
await page.setContent(fullHTML, { waitUntil: "networkidle0" });
await page.pdf({
  path: outputFile,
  format: "A4",
  printBackground: true,
  margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
});
```

📍 **Référence** : `bin/branch2pdf.js:264-279`

**Fichier de debug** :

Un fichier `debug.html` est généré dans le répertoire courant pour inspection :

```javascript
fs.writeFileSync("debug.html", fullHTML);
```

📍 **Référence** : `bin/branch2pdf.js:262`

---

## Format du PDF généré

### Structure du document

Le PDF généré contient :

1. **Page de garde** : Table des matières hiérarchique
2. **Pages de contenu** : Un nœud par page (avec saut de page automatique)
3. **Styles cohérents** : Typographie professionnelle

### Table des matières

La table des matières est générée automatiquement avec indentation hiérarchique :

```html
<h1>Table des matières</h1>
<ul class="toc">
  <li class="toc-entry">Titre niveau 1</li>
  <li class="toc-entry">&nbsp;&nbsp;&nbsp;&nbsp;Titre niveau 2</li>
  <li class="toc-entry">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Titre niveau 3</li>
</ul>
```

📍 **Référence** : `bin/branch2pdf.js:162-170` (génération TOC)
📍 **Référence** : `cloudflare-worker/worker.js:118-126` (génération TOC worker)

**Indentation** : 2 espaces insécables (`&nbsp;&nbsp;`) par niveau de profondeur

📍 **Référence** : `bin/branch2pdf.js:166`

---

### Styles CSS

#### Police de caractères

Police système moderne et lisible :

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
```

📍 **Référence** : `bin/branch2pdf.js:233` et `cloudflare-worker/worker.js:131`

#### Titres

Les titres Markdown (niveaux 1-6) sont convertis en `<div class="heading-N">` pour un contrôle précis des styles :

```css
.heading-1 { font-size: 2.0em; font-weight: bold; margin: 1.2em 0 0.8em; color: #2c3e50; }
.heading-2 { font-size: 1.7em; font-weight: bold; margin: 1.1em 0 0.7em; color: #2c3e50; }
.heading-3 { font-size: 1.4em; font-weight: bold; margin: 1.0em 0 0.6em; color: #34495e; }
.heading-4 { font-size: 1.2em; font-weight: bold; margin: 0.9em 0 0.5em; color: #34495e; }
.heading-5 { font-size: 1.1em; font-weight: bold; margin: 0.8em 0 0.4em; color: #34495e; }
.heading-6 { font-size: 1.0em; font-weight: bold; margin: 0.7em 0 0.3em; color: #34495e; }
```

📍 **Référence** : `bin/branch2pdf.js:241-246` et `cloudflare-worker/worker.js:140-145`

**Raison du shift** : Les titres Markdown dans le contenu des nœuds sont décalés pour préserver la hiérarchie du document global

📍 **Référence** : `bin/branch2pdf.js:14-20` (fonction `renderAndShiftToDiv`)

#### Éléments Markdown

```css
code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

pre {
  background: #f4f4f4;
  padding: 12px;
  border-radius: 5px;
  overflow-x: auto;
}

blockquote {
  border-left: 4px solid #2c3e50;
  margin: 1em 0;
  padding-left: 1em;
  color: #666;
  font-style: italic;
}

hr {
  border: 0;
  border-top: 1px solid #eee;
  margin: 1em 0;
}

img {
  max-width: 100%;
  height: auto;
}
```

📍 **Référence** : `cloudflare-worker/worker.js:150-156` (styles éléments Markdown)

#### Sauts de page

Chaque nœud commence sur une nouvelle page :

```css
.node-wrapper {
  page-break-after: always;
}
```

📍 **Référence** : `bin/branch2pdf.js:247` et `cloudflare-worker/worker.js:146`

La table des matières a également un saut de page automatique :

```css
.toc {
  page-break-after: always;
}
```

📍 **Référence** : `bin/branch2pdf.js:250` et `cloudflare-worker/worker.js:149`

---

## Gestion des images

### Images inline dans le contenu Markdown

Les images insérées avec la syntaxe Markdown sont converties en **Data URLs base64** pour inclusion directe dans le PDF :

#### Syntaxe dans DeepMemo

```markdown
![Description de l'image](attachment:attach_1706123456789_abc)
```

ou

```markdown
![Description](attach_1706123456789_abc)
```

Le préfixe `attachment:` est optionnel.

📍 **Référence** : `app.js:826-828` (détection préfixe online)
📍 **Référence** : `bin/branch2pdf.js:142-144` (détection préfixe offline)

#### Conversion en Data URL

**Online** :

```javascript
const blob = await AttachmentsModule.getAttachment(attachment.id);
const dataUrl = await this.blobToBase64(blob);  // → "data:image/png;base64,..."
```

📍 **Référence** : `app.js:834-836`

**Offline** :

```javascript
const buffer = attachments[attachmentId];  // Buffer from ZIP
const base64 = buffer.toString('base64');
const mimeType = attachment.type || 'application/octet-stream';
const dataUrl = `data:${mimeType};base64,${base64}`;
```

📍 **Référence** : `bin/branch2pdf.js:149-152`

#### Résultat dans le PDF

Le HTML final contient :

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." alt="Description">
```

Les images sont **intégrées directement** dans le PDF (pas de liens externes).

---

### Images externes

Les images référencées par URL externe (`![](https://example.com/image.jpg)`) sont **également incluses** si le réseau est accessible lors de la génération.

⚠️ **Limitation CLI offline** : Si le CLI est exécuté sans connexion Internet, les images externes ne seront pas affichées.

---

## Gestion des symlinks

### Comportement des symlinks dans le PDF

Les symlinks sont **résolus automatiquement** lors de l'export PDF :

#### Online

```javascript
if (node.type === 'symlink' && node.targetId && nodesMap[node.targetId]) {
  const target = nodesMap[node.targetId];
  resolvedNode = {
    id: node.id,
    title: node.title,
    content: target.content || '',  // ← Contenu de la cible
    ...
  };
}
```

📍 **Référence** : `app.js:926-936`

Le symlink apparaît dans le PDF avec :
- **Son propre titre** (peut être différent de la cible)
- **Le contenu de la cible**
- **Les enfants de la cible** (si la cible en a)

#### Offline

Le CLI gère également les symlinks via une directive spéciale `@parent:` dans le contenu (pour compatibilité avec d'anciens exports) :

```javascript
if (displayContent.trim().startsWith('@parent:')) {
  const directive = displayContent.trim();
  const match = directive.match(/@parent:(\w+)/);
  // TODO: Handle symlink content resolution if needed
}
```

📍 **Référence** : `cloudflare-worker/worker.js:89-97`

⚠️ **Note** : Cette fonctionnalité est actuellement simplifiée dans le worker.

---

### Symlinks externes (Branch Mode)

En **mode branche**, les symlinks pointant vers des nœuds **hors de la branche** sont détectés et marqués comme "externes" :

```javascript
const isExternalSymlink = branchContext && !isNodeInBranch(node.targetId, branchContext);
if (isExternalSymlink) {
  console.log(`[PDF] External symlink detected: ${node.id} -> ${node.targetId} (no descendants)`);
}
```

📍 **Référence** : `app.js:938-941`

**Comportement** :
- Le symlink externe est inclus dans le PDF
- Son contenu est résolu (contenu de la cible)
- Ses descendants sont **ignorés** (pour éviter de déborder du scope de la branche)

---

## Comparaison Online vs Offline

| Critère | Export Online | Export Offline (CLI) |
|---------|---------------|----------------------|
| **Installation** | ❌ Aucune | ✅ Node.js + NPM |
| **Connexion Internet** | ✅ Requise | ❌ Optionnelle (sauf images externes) |
| **Limite de débit** | ⚠️ 5/h, 20/jour | ✅ Aucune |
| **Vitesse** | ⚠️ Dépend du serveur | ✅ Rapide (local) |
| **Images inline** | ✅ Supportées (depuis IndexedDB) | ✅ Supportées (depuis archive .dm) |
| **Symlinks** | ✅ Résolus automatiquement | ⚠️ Résolution simplifiée |
| **Format d'entrée** | 📊 Données en mémoire | 📦 Archive .dm ou .json |
| **Fichier de debug** | ❌ Non | ✅ Oui (`debug.html`) |
| **Privacy** | ⚠️ IP hashée (24h) | ✅ 100% local |
| **Usage recommandé** | Occasionnel, petites branches | Fréquent, grosses branches, automatisation |

---

## Troubleshooting

### Problèmes Online

#### "Limite atteinte : 5 PDFs par heure maximum"

**Cause** : Vous avez dépassé le quota horaire.

**Solution** :
- Attendre 1 heure pour réinitialisation du quota
- Utiliser l'export **Offline (CLI)** qui n'a pas de limite

**Quota restant** : Visible dans `localStorage` sous la clé `deepmemo_pdf_rate_limits`

📍 **Référence** : `app.js:724-731` (sauvegarde quota)

---

#### "Limite atteinte : 20 PDFs par jour maximum"

**Cause** : Vous avez dépassé le quota journalier.

**Solution** :
- Attendre 24 heures pour réinitialisation du quota
- Utiliser l'export **Offline (CLI)** qui n'a pas de limite

📍 **Référence** : `cloudflare-worker/worker.js:42-43` (limite journalière)

---

#### "Unauthorized origin. Please use the official DeepMemo instance..."

**Cause** : Vous utilisez un clone non autorisé de DeepMemo.

**Solution** :
- Utiliser l'instance officielle : https://deepmemo.org/
- **OU** déployer votre propre CloudFlare Worker (voir documentation technique)

📍 **Référence** : `cloudflare-worker/worker.js:237-245` (vérification origine)

**Origines autorisées** :
- `http://localhost` (développement)
- `http://127.0.0.1` (développement)
- `https://deepmemo.org` (production)
- `https://deepmemo.ydns.eu` (staging)

📍 **Référence** : `cloudflare-worker/worker.js:227-232`

---

#### "PDF generation failed"

**Cause** : Erreur serveur lors de la génération.

**Solutions** :
1. Vérifier votre connexion Internet
2. Réessayer dans quelques minutes
3. Réduire la taille de la branche (moins de nœuds)
4. Utiliser l'export **Offline (CLI)** si le problème persiste

📍 **Référence** : `cloudflare-worker/worker.js:296-308` (gestion erreurs)

---

### Problèmes Offline (CLI)

#### "command not found: node"

**Cause** : Node.js n'est pas installé.

**Solution** :
1. Installer Node.js depuis https://nodejs.org/ (version 16+ recommandée)
2. Vérifier l'installation : `node --version`

---

#### "Cannot find module 'marked'"

**Cause** : Les dépendances NPM ne sont pas installées.

**Solution** :

```bash
cd bin/
npm install
```

📍 **Référence** : `bin/branch2pdf.js:2-4` (dépendances requises)

---

#### "data.json not found in .dm archive"

**Cause** : L'archive `.dm` est corrompue ou mal formatée.

**Solution** :
1. Réexporter la branche depuis DeepMemo
2. Vérifier que le fichier est bien une archive ZIP valide :
   ```bash
   unzip -l mon-export.dm
   ```
3. Vérifier la présence de `data.json` dans l'archive

📍 **Référence** : `bin/branch2pdf.js:106-108`

---

#### "Invalid JSON in data.json"

**Cause** : Le fichier `data.json` contient du JSON mal formé.

**Solution** :
1. Vérifier la validité du JSON : https://jsonlint.com/
2. Réexporter depuis DeepMemo si le fichier est corrompu

📍 **Référence** : `bin/branch2pdf.js:109-114`

---

#### "No root nodes found in global export"

**Cause** : L'export global ne contient aucun nœud racine.

**Solution** :
- Exporter une **branche spécifique** au lieu d'un export global vide
- Vérifier que `rootNodes` n'est pas un tableau vide

📍 **Référence** : `bin/branch2pdf.js:200-202`

---

#### Images inline non affichées dans le PDF

**Cause** : Les fichiers attachés ne sont pas présents dans l'archive `.dm`.

**Solution** :
1. Vérifier que l'export utilisé est au format **ZIP (.dm)** et non `.json`
2. Vérifier la présence du dossier `attachments/` dans l'archive :
   ```bash
   unzip -l mon-export.dm | grep attachments
   ```
3. Réexporter avec l'option **"📦 Archive ZIP"** qui inclut les attachments

📍 **Référence** : `bin/branch2pdf.js:211-218` (traitement images)

---

#### Erreur Puppeteer "Failed to launch chrome"

**Cause** : Chromium (requis par Puppeteer) n'est pas installé ou incompatible.

**Solutions** :

**Sur Linux** :
```bash
# Installer les dépendances Chromium
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

**Sur macOS/Windows** : Puppeteer devrait installer Chromium automatiquement lors de `npm install`.

📍 **Référence** : `bin/branch2pdf.js:264-271` (lancement Puppeteer)

---

## Bonnes pratiques

### ✅ À faire

- **Tester l'export** sur une petite branche avant d'exporter une grande base
- **Utiliser le CLI** pour les exports fréquents ou volumineux
- **Vérifier le fichier `debug.html`** (CLI) pour diagnostiquer les problèmes de rendu
- **Compresser les grandes images** avant de les attacher pour réduire la taille du PDF
- **Exporter au format .dm (ZIP)** pour inclure les images dans les PDFs offline

### ❌ À éviter

- Exporter des branches **très volumineuses** (>500 nœuds) avec la méthode online
- Utiliser l'export online de manière **automatisée** (risque de dépassement de quota)
- Modifier manuellement le fichier `data.json` avant export CLI (risque d'erreur JSON)
- Utiliser des images **très lourdes** (>10 MB) qui alourdissent le PDF

---

## Voir aussi

- [Formats d'export/import](FILE-FORMATS.md) : Détails sur le format .dm (ZIP)
- [Pièces jointes](ATTACHMENTS.md) : Gestion des fichiers attachés
- [Data Model](../3-DATA-MODEL.md) : Structure des données exportées

---

**Dernière mise à jour** : 2026-01-29 | **Version** : V0.10.5
