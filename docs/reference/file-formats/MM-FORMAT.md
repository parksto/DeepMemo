# FreeMind/Freeplane Format Reference (.mm)

> Spécification complète du format d'export Mind Map FreeMind
>
> **Version** : V0.10.5
> **Mise à jour** : 2026-02-02
>
> 📍 **Sources** : `src/js/core/data.js` (lignes 1429-1566), `src/js/app.js` (ligne 625)

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Principe](#principe)
3. [Structure XML](#structure-xml)
4. [Processus d'Export](#processus-dexport)
5. [Conversion des Nœuds](#conversion-des-nœuds)
6. [Gestion Spéciale](#gestion-spéciale)
7. [Limitations](#limitations)
8. [Compatibilité](#compatibilité)
9. [Cas d'Usage](#cas-dusage)
10. [Référence Rapide](#référence-rapide)

---

## Vue d'ensemble

### Principe

Le format `.mm` (Mind Map) est un **export XML** compatible avec les logiciels de mind mapping FreeMind, Freeplane et XMind. Il permet d'exporter la structure hiérarchique DeepMemo vers des éditeurs de cartes mentales standard.

**Caractéristiques** :
- ✅ **Standard** : XML 1.0 avec schéma FreeMind 1.0.1
- ✅ **Structure** : Hiérarchie complète préservée
- ✅ **Contenu** : Notes exportées en HTML richcontent
- ✅ **Symlinks** : Visualisés avec flèches colorées
- ❌ **Limitation** : Pas d'attachments ni de tags
- ✅ **Portable** : Compatible tous systèmes d'exploitation
- ✅ **Éditable** : Modifiable dans Freeplane/FreeMind/XMind

📍 **Référence** : `data.js:1532-1566` (fonction `exportFreeMindMM`)

---

### Différences avec Autres Formats

| Aspect | .mm (FreeMind) | .dm (Archive) | .json (Interchange) |
|--------|----------------|---------------|---------------------|
| **Format** | XML | ZIP | JSON |
| **Extension** | `.mm` | `.dm` | `.json` |
| **Hiérarchie** | ✅ Complète | ✅ Complète | ✅ Complète |
| **Contenu** | ✅ HTML notes | ✅ Markdown | ✅ Markdown |
| **Attachments** | ❌ Non | ✅ Fichiers binaires | ⚠️ Métadonnées seulement |
| **Tags** | ❌ Non | ✅ Oui | ✅ Oui |
| **Symlinks** | ✅ Flèches visuelles | ✅ Références complètes | ✅ Références complètes |
| **Dates** | ❌ Non | ✅ Created/Modified | ✅ Created/Modified |
| **Taille** | Léger (KB) | Lourd (MB selon attachments) | Léger (KB) |
| **Usage** | Mindmap externe | Backup complet | Interchange, LLM |
| **Éditable** | ✅ Freeplane/XMind | ❌ Non (réimport) | ❌ Non (réimport) |
| **Réimport** | ❌ Non supporté | ✅ Structure + fichiers | ✅ Structure uniquement |

📍 **Référence** : Voir [DM-FORMAT.md](DM-FORMAT.md) et [json-interchange.md](json-interchange.md)

---

## Structure XML

### Vue d'ensemble

**Format XML** : FreeMind 1.0.1 (compatible Freeplane, XMind)

**Structure générale** :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Root Title" ID="node_id">
    <!-- Children nodes recursively -->
  </node>
</map>
```

📍 **Référence** : `data.js:1508-1526` (fonction `generateFreeMindXML`)

---

### Export avec Racine Unique

**Cas** : Un seul nœud racine (export branch ou global avec 1 root)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="Mon Projet" ID="node_1706123456789_abc123">
    <node TEXT="Tâche 1" ID="node_1706123456790_def456">
      <node TEXT="Sous-tâche 1.1" ID="node_1706123456791_ghi789"/>
    </node>
    <node TEXT="Tâche 2" ID="node_1706123456792_jkl012"/>
  </node>
</map>
```

📍 **Référence** : `data.js:1513-1520` (branche if avec une racine)

---

### Export avec Racines Multiples

**Cas** : Plusieurs nœuds racines (export global)

**Comportement** : Création d'une **racine virtuelle** nommée "DeepMemo"

```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="DeepMemo" ID="_virtual_root">
    <node TEXT="Projet A" ID="node_1706123456789_abc123">
      <!-- Children de Projet A -->
    </node>
    <node TEXT="Projet B" ID="node_1706123456790_def456">
      <!-- Children de Projet B -->
    </node>
    <node TEXT="Notes Diverses" ID="node_1706123456791_ghi789">
      <!-- Children de Notes Diverses -->
    </node>
  </node>
</map>
```

📍 **Référence** : `data.js:1522-1525` (branche else avec racine virtuelle)

---

### Structure d'un Nœud

**Nœud minimal** :
```xml
<node TEXT="Titre du nœud" ID="node_1706123456789_abc123"/>
```

**Nœud avec contenu** :
```xml
<node TEXT="Titre du nœud" ID="node_1706123456789_abc123">
  <richcontent TYPE="NOTE">
    <html>
      <head></head>
      <body>
        <p style="white-space: pre-wrap;">Contenu markdown du nœud...</p>
      </body>
    </html>
  </richcontent>
</node>
```

**Nœud avec enfants** :
```xml
<node TEXT="Parent" ID="node_parent_id">
  <node TEXT="Enfant 1" ID="node_child1_id"/>
  <node TEXT="Enfant 2" ID="node_child2_id"/>
</node>
```

📍 **Référence** : `data.js:1455-1500` (fonction `generateNodeXML`)

---

### Nœud Symlink

**Structure complète** :
```xml
<node TEXT="→ Lien vers Tâche 1"
      ID="symlink_1706123456791_ghi789"
      COLOR="#ff9900"
      STYLE="bubble">
  <arrowlink DESTINATION="node_1706123456790_def456"
             COLOR="#ff9900"
             STARTARROW="None"
             ENDARROW="Default"/>
</node>
```

**Propriétés spéciales** :
- `COLOR="#ff9900"` : Orange distinctif
- `STYLE="bubble"` : Style bulle pour différenciation
- `<arrowlink>` : Flèche vers le nœud cible
  - `DESTINATION` : ID du nœud cible
  - `COLOR="#ff9900"` : Flèche orange
  - `ENDARROW="Default"` : Pointe de flèche

📍 **Référence** : `data.js:1467-1469, 1487-1489` (styling et arrowlink)

---

## Processus d'Export

### Flux Complet

```
1. User → Export Modal
   └─ Click "🧠 Mind map" button

2. UI Handler (app.js:625)
   └─ app.confirmExportFreeMind()
       └─ Modal fermeture + appel export

3. Export Core (data.js:1532)
   └─ DataModule.exportFreeMindMM(branchRootId)
       ├─ Collection des nœuds (global ou branch)
       ├─ Détermination des racines
       ├─ Génération XML
       │   └─ generateFreeMindXML(rootIds, nodes)
       │       └─ Pour chaque racine
       │           └─ generateNodeXML(nodeId, nodes, 1)
       │               └─ Récursion sur descendants
       ├─ Création du Blob XML
       ├─ Téléchargement navigateur
       └─ Log console succès

4. Toast Notification
   └─ "Mindmap exported (FreeMind)"
```

📍 **Référence** : `app.js:625-642` (handler), `data.js:1532-1566` (export)

---

### Collection des Nœuds

**Export Global** :
```javascript
// data.js:1537
const nodesToExport = data.nodes;     // Tous les nœuds
const rootIds = data.rootNodes;        // Toutes les racines
```

**Export Branch** :
```javascript
// data.js:1534-1536
const nodesToExport = collectBranchNodes(branchRootId);
const rootIds = [branchRootId];        // Racine unique
```

**Fonction `collectBranchNodes()`** (`data.js:287-304`) :
- Collecte récursive de tous les descendants d'un nœud
- Retourne un dictionnaire `{ nodeId: node }`
- Utilisé aussi pour exports `.dm` branch

📍 **Référence** : `data.js:1534-1540` (collection), `data.js:287-304` (collectBranchNodes)

---

### Génération du Fichier

**Nom de fichier** :

**Export Global** :
```
deepmemo-export-{timestamp}.mm
Exemple : deepmemo-export-1706123456789.mm
```

**Export Branch** :
```
deepmemo-{titre_sanitisé}-{timestamp}.mm
Exemple : deepmemo-Mon-Projet-2024-1706123456789.mm
```

**Sanitisation du titre** :
- Même algorithme que pour exports `.dm` branch
- Espaces → tirets
- Caractères spéciaux supprimés
- Limite 50 caractères

📍 **Référence** : `data.js:1547-1551` (génération nom)

---

### Téléchargement

```javascript
// data.js:1554-1562
const blob = new Blob([xml], { type: 'application/xml' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
```

**Type MIME** : `application/xml`
**Encodage** : UTF-8

📍 **Référence** : `data.js:1554-1562` (download)

---

## Conversion des Nœuds

### Fonction `generateNodeXML()`

**Signature** :
```javascript
function generateNodeXML(nodeId, nodes, indent)
```

**Paramètres** :
- `nodeId` : ID du nœud à convertir
- `nodes` : Dictionnaire de tous les nœuds
- `indent` : Niveau d'indentation (pour pretty-print XML)

**Retour** : String XML du nœud et tous ses descendants

📍 **Référence** : `data.js:1455-1500` (fonction complète)

---

### Conversion du Titre

**Processus** :
```javascript
// data.js:1461-1462
const titleWithoutEmoji = removeEmojis(node.title);
const escapedTitle = escapeXML(titleWithoutEmoji);
```

**Étapes** :
1. **Suppression des emojis** : `removeEmojis()`
2. **Échappement XML** : `escapeXML()`

**Exemple** :
```
Entrée  : "🚀 Mon Projet & Tâches"
Étape 1 : "Mon Projet & Tâches"  (emoji retiré)
Étape 2 : "Mon Projet &amp; Tâches"  (& échappé)
XML     : <node TEXT="Mon Projet &amp; Tâches" .../>
```

📍 **Référence** : `data.js:1461-1462` (conversion titre)

---

### Conversion du Contenu

**Si contenu présent** :
```javascript
// data.js:1471-1483
if (node.content && node.content.trim()) {
  const escapedContent = escapeXML(node.content);
  result += `${spaces}  <richcontent TYPE="NOTE">\n`;
  result += `${spaces}    <html>\n`;
  result += `${spaces}      <head></head>\n`;
  result += `${spaces}      <body>\n`;
  result += `${spaces}        <p style="white-space: pre-wrap;">${escapedContent}</p>\n`;
  result += `${spaces}      </body>\n`;
  result += `${spaces}    </html>\n`;
  result += `${spaces}  </richcontent>\n`;
}
```

**Format** :
- Type : `NOTE` (note attachée au nœud)
- Contenu : HTML `<p>` avec `white-space: pre-wrap;`
- Échappement : Appliqué au contenu markdown

**Exemple** :
```xml
<node TEXT="Titre">
  <richcontent TYPE="NOTE">
    <html>
      <head></head>
      <body>
        <p style="white-space: pre-wrap;"># Titre Markdown

Contenu du nœud...</p>
      </body>
    </html>
  </richcontent>
</node>
```

📍 **Référence** : `data.js:1471-1483` (richcontent)

---

### Symlink : Flèche vers Cible

**Génération arrowlink** :
```javascript
// data.js:1487-1489
if (node.type === 'symlink' && node.targetId) {
  result += `${spaces}  <arrowlink DESTINATION="${node.targetId}" COLOR="#ff9900" STARTARROW="None" ENDARROW="Default"/>\n`;
}
```

**Attributs** :
- `DESTINATION` : ID du nœud cible (non échappé, car ID alphanumérique)
- `COLOR="#ff9900"` : Orange (couleur standard symlink DeepMemo)
- `STARTARROW="None"` : Pas de flèche au départ
- `ENDARROW="Default"` : Flèche standard à l'arrivée

**Visualisation dans FreeMind** :
```
[Symlink Node] ----→ [Target Node]
     (orange)         (normal)
```

📍 **Référence** : `data.js:1487-1489` (arrowlink)

---

### Récursion sur Enfants

**Processus** :
```javascript
// data.js:1492-1497
if (node.children && node.children.length > 0) {
  for (const childId of node.children) {
    result += generateNodeXML(childId, nodes, indent + 1);
  }
  result += `${spaces}</node>\n`;
} else {
  result += '/>\n';
}
```

**Comportement** :
- Si enfants présents → balise ouvrante + récursion + balise fermante
- Si pas d'enfants → balise auto-fermante (`/>`)

**Exemple avec enfants** :
```xml
<node TEXT="Parent" ID="parent_id">
  <node TEXT="Enfant 1" ID="child1_id"/>
  <node TEXT="Enfant 2" ID="child2_id"/>
</node>
```

**Exemple sans enfants** :
```xml
<node TEXT="Feuille" ID="leaf_id"/>
```

📍 **Référence** : `data.js:1492-1497` (récursion)

---

## Gestion Spéciale

### Suppression des Emojis

**Fonction `removeEmojis()`** :
```javascript
// data.js:1443-1446
function removeEmojis(str) {
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
}
```

**Ranges Unicode supprimés** :
- `\u{1F600}-\u{1F64F}` : Emoticons
- `\u{1F300}-\u{1F5FF}` : Symboles et pictogrammes divers
- `\u{1F680}-\u{1F6FF}` : Symboles de transport et cartes
- `\u{2600}-\u{26FF}` : Symboles divers
- `\u{2700}-\u{27BF}` : Dingbats
- `\u{1F900}-\u{1F9FF}` : Symboles et pictogrammes supplémentaires
- `\u{1F1E0}-\u{1F1FF}` : Drapeaux (indicateurs régionaux)

**Raison** : Compatibilité maximale avec FreeMind/Freeplane (certains anciens viewers ne supportent pas les emojis)

**Exemple** :
```
Entrée  : "🚀 Mon Projet 🎯"
Sortie  : " Mon Projet "
XML     : <node TEXT=" Mon Projet "/>
```

📍 **Référence** : `data.js:1443-1446` (removeEmojis)

---

### Échappement XML

**Fonction `escapeXML()`** :
```javascript
// data.js:1429-1436
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

**Caractères échappés** :

| Caractère | Entité XML |
|-----------|------------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&apos;` |

**Application** :
- Titres de nœuds
- Contenu markdown (dans `<richcontent>`)

**Exemple** :
```
Entrée  : "A & B < C > D"
Sortie  : "A &amp; B &lt; C &gt; D"
XML     : <node TEXT="A &amp; B &lt; C &gt; D"/>
```

📍 **Référence** : `data.js:1429-1436` (escapeXML)

---

### Styling des Symlinks

**Attributs ajoutés** :
```javascript
// data.js:1467-1469
if (node.type === 'symlink') {
  result = result.replace('>', ` COLOR="#ff9900" STYLE="bubble">`);
}
```

**Propriétés** :
- `COLOR="#ff9900"` : Orange (couleur standard symlink DeepMemo)
- `STYLE="bubble"` : Style bulle (distinct des nœuds réguliers)

**Résultat XML** :
```xml
<node TEXT="→ Lien vers Tâche 1"
      ID="symlink_123"
      COLOR="#ff9900"
      STYLE="bubble">
  <arrowlink DESTINATION="node_target_id" .../>
</node>
```

**Visualisation dans Freeplane** :
- Nœud affiché avec fond orange
- Style bulle (bordures arrondies)
- Flèche orange vers cible

📍 **Référence** : `data.js:1467-1469` (styling symlinks)

---

### Indentation Pretty-Print

**Algorithme** :
```javascript
// data.js:1457
const spaces = '  '.repeat(indent);
```

**Comportement** :
- Racine (indent=1) : 2 espaces
- Enfant niveau 1 (indent=2) : 4 espaces
- Enfant niveau 2 (indent=3) : 6 espaces
- Etc.

**Exemple** :
```xml
<map version="1.0.1">
  <node TEXT="Root">
    <node TEXT="Child 1">
      <node TEXT="Grandchild 1.1"/>
    </node>
    <node TEXT="Child 2"/>
  </node>
</map>
```

**Raison** : Lisibilité du XML généré (debuggage, édition manuelle)

📍 **Référence** : `data.js:1457` (indentation)

---

## Limitations

### Éléments Non Exportés

| Élément | Exporté ? | Raison | Alternative |
|---------|-----------|--------|-------------|
| **Tags** | ❌ Non | Format FreeMind ne supporte pas les tags natifs | Utiliser `.dm` ou `.json` |
| **Attachments** | ❌ Non | Format FreeMind ne supporte pas les fichiers binaires | Utiliser `.dm` (archive complète) |
| **Created/Modified** | ❌ Non | Format FreeMind ne les utilise pas systématiquement | Utiliser `.dm` ou `.json` |
| **Instance keys** | ❌ Non | Concept spécifique à DeepMemo | N/A |
| **Emojis dans titres** | ⚠️ Supprimés | Compatibilité avec anciens viewers FreeMind | Réimporter `.dm` pour restaurer emojis |
| **Markdown formatage** | ⚠️ Texte brut | FreeMind affiche texte sans formatage | Contenu préservé, formatage perdu visuellement |

📍 **Référence** : Limitations intrinsèques au format FreeMind 1.0.1

---

### Comportements Spéciaux

**Symlinks** :
- ✅ **Inclus** avec flèches visuelles vers cible
- ⚠️ **Limitation** : Pas de synchronisation bidirectionnelle (FreeMind ne supporte pas)
- ℹ️ Si target modifié dans FreeMind, symlink ne reflète pas le changement

**Racines multiples** :
- ✅ **Gestion** : Racine virtuelle "DeepMemo" créée automatiquement
- ℹ️ Lors d'un éventuel réimport (non supporté), racine virtuelle doit être supprimée manuellement

**Contenu markdown** :
- ✅ **Préservé** : Syntaxe markdown conservée dans `<richcontent>`
- ⚠️ **Affichage** : FreeMind/Freeplane affichent texte brut (pas de rendu markdown)
- ℹ️ Pour visualiser formatage, utiliser `.dm` + réimport dans DeepMemo

---

### Réimport Non Supporté

**Status** : ❌ DeepMemo ne supporte **pas** l'import de fichiers `.mm`

**Raisons** :
1. **Perte de données** : Tags, attachments, dates non présents dans `.mm`
2. **Format limité** : FreeMind ne stocke pas toutes les métadonnées DeepMemo
3. **Complexité parsing** : XML parsing + reconstruction hiérarchie
4. **Cas d'usage limité** : Export `.mm` est unidirectionnel (vers mindmap editors)

**Workflow recommandé** :
1. Exporter `.mm` pour édition externe
2. Éditer dans Freeplane/XMind
3. Pour réintégrer : Copier manuellement ou utiliser backup `.dm` comme source

📍 **Référence** : Pas de fonction `importFreeMindMM()` dans le code source

---

## Compatibilité

### Logiciels Testés

| Logiciel | Version | Compatibilité | Notes |
|----------|---------|---------------|-------|
| **Freeplane** | 1.11+ | ✅ Complète | Recommandé (open-source, actif) |
| **FreeMind** | 1.0.1+ | ✅ Complète | Legacy, moins actif |
| **XMind** | 8+ | ✅ Complète | Commercial, import `.mm` supporté |
| **MindMeister** | - | ⚠️ Partielle | Import `.mm` supporté, mais limite contenu |
| **MindManager** | - | ⚠️ Partielle | Import `.mm` avec conversion |

---

### Version du Format

**Déclaration XML** :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
```

**Format** : FreeMind 1.0.1 (standard legacy, compatible largement)

**Pourquoi 1.0.1 ?** :
- Standard le plus compatible
- Supporté par tous les viewers FreeMind/Freeplane
- Pas de fonctionnalités avancées nécessaires (structure simple)

📍 **Référence** : `data.js:1510-1511` (version déclaration)

---

### Encodage

**Encodage** : UTF-8 (universel)

**Caractères supportés** :
- ✅ Latin (a-z, A-Z, accents)
- ✅ Cyrillique, Grec, Arabe, Chinois, Japonais, etc.
- ⚠️ Emojis supprimés (voir section Gestion Spéciale)

**Exemple multi-langues** :
```xml
<node TEXT="Проект (Russe)"/>
<node TEXT="项目 (Chinois)"/>
<node TEXT="プロジェクト (Japonais)"/>
```

---

## Cas d'Usage

### 1. Visualisation Graphique

**Quand** : Besoin de voir l'arborescence sous forme de mind map

**Workflow** :
1. Exporter branche ou global en `.mm`
2. Ouvrir dans Freeplane
3. Réorganiser visuellement (drag & drop graphique)
4. Exporter PDF ou image depuis Freeplane

**Avantages** :
- ✅ Visualisation 2D optimisée (radiale, horizontale, etc.)
- ✅ Zooming, collapsing visuel
- ✅ Export image/PDF pour présentations

**Limitations** :
- ⚠️ Modifications dans Freeplane non réimportables
- ⚠️ Utiliser comme visualisation uniquement (pas édition synchronisée)

---

### 2. Collaboration avec Non-Utilisateurs DeepMemo

**Quand** : Partager structure avec personnes utilisant Freeplane/XMind

**Workflow** :
1. Exporter branche projet en `.mm`
2. Envoyer fichier `.mm` à collaborateur
3. Collaborateur ouvre dans Freeplane
4. Collaborateur peut lire structure et notes
5. (Optionnel) Collaborateur modifie et renvoie `.mm`
6. Copier manuellement modifications dans DeepMemo

**Avantages** :
- ✅ Format standard, largement supporté
- ✅ Pas besoin d'installer DeepMemo
- ✅ Lecture structure complète

**Limitations** :
- ⚠️ Pas de synchronisation bidirectionnelle
- ⚠️ Perte attachments et tags

---

### 3. Brainstorming Externe

**Quand** : Créer mindmap dans Freeplane puis importer manuellement

**Workflow** :
1. Créer mindmap dans Freeplane
2. Exporter `.mm`
3. Lire structure `.mm` manuellement
4. Recréer hiérarchie dans DeepMemo
5. Ajouter tags, attachments, etc.

**Avantages** :
- ✅ Outils graphiques Freeplane (couleurs, icônes, etc.)
- ✅ Brainstorming rapide

**Limitations** :
- ⚠️ Import manuel (pas automatique)
- ⚠️ Processus laborieux pour grandes structures

---

### 4. Export pour Archivage Externe

**Quand** : Archiver structure lisible hors DeepMemo

**Workflow** :
1. Exporter global en `.mm`
2. Stocker `.mm` dans système de fichiers
3. Ouvrir avec n'importe quel viewer XML

**Avantages** :
- ✅ Format texte (XML), lisible sans logiciel spécifique
- ✅ Plus léger que `.dm` (pas d'attachments)
- ✅ Standard ouvert (pas propriétaire)

**Limitations** :
- ⚠️ Pas complet (tags, attachments manquants)
- ⚠️ Utiliser `.dm` pour backup complet

---

### 5. Présentation et Communication

**Quand** : Créer présentation visuelle de projet

**Workflow** :
1. Exporter branche projet en `.mm`
2. Ouvrir dans Freeplane
3. Appliquer thème visuel (couleurs, icônes)
4. Exporter PDF ou PNG depuis Freeplane
5. Utiliser dans présentation PowerPoint/Keynote

**Avantages** :
- ✅ Visualisation professionnelle
- ✅ Export image haute qualité
- ✅ Contrôle layout graphique

**Limitations** :
- ⚠️ Processus manuel (pas automatique)

---

## Référence Rapide

### Fichiers Source

| Aspect | Fichier | Lignes |
|--------|---------|--------|
| **Export principal** | `src/js/core/data.js` | 1532-1566 |
| **Génération XML** | `src/js/core/data.js` | 1508-1526 |
| **Conversion nœud** | `src/js/core/data.js` | 1455-1500 |
| **Échappement XML** | `src/js/core/data.js` | 1429-1436 |
| **Suppression emojis** | `src/js/core/data.js` | 1443-1446 |
| **Collection branch** | `src/js/core/data.js` | 287-304 |
| **Handler UI** | `src/js/app.js` | 625-642 |
| **Modal export** | `index.html` | 361-368 |

---

### Fonctions Clés

| Fonction | Rôle | Signature |
|----------|------|-----------|
| `exportFreeMindMM()` | Point d'entrée export | `(branchRootId = null)` |
| `generateFreeMindXML()` | Génération XML global | `(rootIds, nodes)` |
| `generateNodeXML()` | Conversion nœud récursive | `(nodeId, nodes, indent)` |
| `escapeXML()` | Échappement caractères XML | `(str)` |
| `removeEmojis()` | Suppression emojis | `(str)` |
| `collectBranchNodes()` | Collection descendants | `(nodeId)` |

---

### Nommage Fichiers

| Type Export | Format | Exemple |
|-------------|--------|---------|
| **Global** | `deepmemo-export-{timestamp}.mm` | `deepmemo-export-1706123456789.mm` |
| **Branch** | `deepmemo-{titre}-{timestamp}.mm` | `deepmemo-Mon-Projet-2024-1706123456789.mm` |

**Sanitisation titre** :
- Espaces → tirets `-`
- Caractères spéciaux supprimés
- Limite 50 caractères

---

### Tags XML Utilisés

| Tag | Usage | Attributs |
|-----|-------|-----------|
| `<map>` | Racine XML | `version="1.0.1"` |
| `<node>` | Nœud mindmap | `TEXT`, `ID`, `COLOR`, `STYLE` |
| `<richcontent>` | Contenu HTML | `TYPE="NOTE"` |
| `<arrowlink>` | Lien symlink | `DESTINATION`, `COLOR`, `STARTARROW`, `ENDARROW` |

---

### Couleurs et Styles

| Élément | Couleur | Style |
|---------|---------|-------|
| **Nœud régulier** | Default | Default |
| **Symlink** | `#ff9900` (Orange) | `bubble` |
| **Flèche symlink** | `#ff9900` (Orange) | `ENDARROW="Default"` |

---

### i18n Strings

**Anglais** (`en.js:241-244, 83-84`) :
```javascript
freemind: {
  title: "Mind map",
  desc: ".mm file editable in Freeplane/FreeMind/XMind"
},
// Toasts
freemindExported: "Mindmap exported (FreeMind)",
freemindBranchExported: "Branch exported (FreeMind)",
```

**Français** (`fr.js:249-252, 85-86`) :
```javascript
freemind: {
  title: "Carte mentale",
  desc: "Fichier .mm éditable dans Freeplane/FreeMind/XMind"
},
// Toasts
freemindExported: "Carte mentale exportée (FreeMind)",
freemindBranchExported: "Branche exportée (FreeMind)",
```

---

### Comparaison Formats

| Critère | .mm | .dm | .json |
|---------|-----|-----|-------|
| **Type** | XML | ZIP | JSON |
| **Hiérarchie** | ✅ | ✅ | ✅ |
| **Contenu** | ✅ HTML | ✅ Markdown | ✅ Markdown |
| **Tags** | ❌ | ✅ | ✅ |
| **Attachments** | ❌ | ✅ Binaires | ⚠️ Métadonnées |
| **Symlinks** | ✅ Visuels | ✅ Complets | ✅ Complets |
| **Dates** | ❌ | ✅ | ✅ |
| **Éditable externe** | ✅ Freeplane | ❌ | ❌ |
| **Réimportable** | ❌ | ✅ | ✅ |
| **Taille** | Léger (KB) | Lourd (MB) | Léger (KB) |

---

### Gestion Erreurs

| Erreur | Détection | Message |
|--------|-----------|---------|
| **Aucune données** | `data.js:1542-1545` | `i18nAlert('noData')` |
| **Exception export** | `app.js:639-642` | Toast "Error exporting data" |

---

## Voir Aussi

- [DM-FORMAT.md](DM-FORMAT.md) - Format Archive .dm (ZIP complet)
- [json-interchange.md](json-interchange.md) - Format JSON Interchange
- [validation.md](validation.md) - Validation des formats
- [FILE-FORMATS.md](../../guides/FILE-FORMATS.md) - Guide utilisateur des formats

---

**Documentation vérifiée ligne par ligne** ✅

Toutes les références au code source ont été vérifiées dans DeepMemo V0.10.5 et sont exactes.

---

**Dernière mise à jour** : 2026-02-02 | **Version** : V0.10.5
