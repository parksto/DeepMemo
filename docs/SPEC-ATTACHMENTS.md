# SPEC - Attachments & Files (V0.9)

**Branche** : `feature/attachments-indexeddb`
**Date de création** : 2025-12-25
**Statut** : 🔴 En spécification

---

## 🎯 Objectif

Permettre d'attacher des fichiers (images, PDFs, documents, etc.) aux nœuds DeepMemo, avec :
- Stockage local via **IndexedDB**
- Export/Import via format **ZIP**
- UI simple pour upload, affichage et suppression

---

## 📋 Décisions de design

### Décisions actées

| # | Décision | Justification |
|---|----------|---------------|
| 1 | **IndexedDB uniquement** | Une seule source de vérité, pas d'hybride localStorage/IndexedDB |
| 2 | **Export toujours en ZIP** | Cohérence, même sans fichiers (juste data.json dans le ZIP) |
| 3 | **Inline via syntaxe explicite** | `![](attachment:id)` pour contrôler l'affichage |
| 4 | **Pas de déduplication** | Chaque attachment est indépendant, simplifie la suppression |
| 5 | **Limite 50MB par fichier** | Hard limit pour éviter la saturation |
| 6 | **Suppression manuelle** | Bouton de suppression dans la liste des fichiers du nœud |

### Questions en suspens

- [ ] **Garbage collection** : Automatique au chargement ? Ou bouton manuel dans Settings ?
- [ ] **Preview images** : Thumbnail dans la liste ? Ou seulement fullsize inline ?
- [ ] **Drag & drop** : Sur le nœud entier ? Ou zone dédiée ?
- [ ] **Clipboard paste** : Supporter paste d'images depuis le presse-papier ?

---

## 🏗️ Architecture technique

### Structure de données

#### localStorage (`deepmemo_data`)

```javascript
data = {
  nodes: {
    "node_123": {
      id: "node_123",
      type: "note",
      title: "Ma note avec fichiers",
      content: "Voici mon diagramme:\n\n![](attachment:attach_001)\n\nEt mon document:\n[Voir le PDF](attachment:attach_002)",
      attachments: [
        {
          id: "attach_001",           // ID unique (format: attach_${timestamp}_${random})
          name: "diagram.png",         // Nom original du fichier
          type: "image/png",           // MIME type
          size: 45678,                 // Taille en octets
          created: 1703520000000,      // Timestamp création
          modified: 1703520000000      // Timestamp dernière modif (pour futur support d'édition)
        },
        {
          id: "attach_002",
          name: "document.pdf",
          type: "application/pdf",
          size: 234567,
          created: 1703520100000,
          modified: 1703520100000
        }
      ],
      // ... autres propriétés standards
    }
  }
}
```

#### IndexedDB (`deepmemo-files`)

**Database name** : `deepmemo-files`
**Version** : `1`
**Object Store** : `attachments`
**Key** : `id` (string, ex: "attach_001")
**Value** : `Blob` (le fichier binaire)

```javascript
// Structure IndexedDB
{
  "attach_001": Blob { size: 45678, type: "image/png" },
  "attach_002": Blob { size: 234567, type: "application/pdf" }
}
```

---

## 🔌 API du module attachments.js

### Module : `src/js/core/attachments.js`

```javascript
/**
 * Initialise la connexion IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function initDB()

/**
 * Sauvegarde un fichier dans IndexedDB
 * @param {string} id - ID unique de l'attachment
 * @param {Blob} blob - Le fichier à sauvegarder
 * @returns {Promise<void>}
 */
async function saveAttachment(id, blob)

/**
 * Récupère un fichier depuis IndexedDB
 * @param {string} id - ID de l'attachment
 * @returns {Promise<Blob|null>} - Le blob ou null si non trouvé
 */
async function getAttachment(id)

/**
 * Supprime un fichier d'IndexedDB
 * @param {string} id - ID de l'attachment
 * @returns {Promise<void>}
 */
async function deleteAttachment(id)

/**
 * Liste tous les IDs stockés dans IndexedDB
 * @returns {Promise<string[]>} - Array des IDs
 */
async function listAttachments()

/**
 * Récupère la taille totale utilisée
 * @returns {Promise<number>} - Taille en octets
 */
async function getTotalSize()

/**
 * Génère un ID unique pour un attachment
 * @returns {string} - Format: attach_${timestamp}_${random}
 */
function generateAttachmentId()

/**
 * Nettoie les fichiers orphelins (présents dans IndexedDB mais pas dans data)
 * @param {Object} data - L'objet data complet
 * @returns {Promise<{deleted: number, freed: number}>} - Stats du nettoyage
 */
async function cleanOrphans(data)
```

### Export des fonctions

```javascript
export {
  initDB,
  saveAttachment,
  getAttachment,
  deleteAttachment,
  listAttachments,
  getTotalSize,
  generateAttachmentId,
  cleanOrphans
};
```

---

## 📦 Format d'export/import

### Structure du ZIP

```
deepmemo-export-2025-12-25.zip
├── data.json                    # Structure complète (nodes, rootNodes, + métadonnées attachments)
├── attachments/
│   ├── attach_001_diagram.png   # Format: {id}_{name}
│   ├── attach_002_document.pdf
│   └── attach_003_video.mp4
└── metadata.json                # (Optionnel) Métadonnées de l'export
```

### metadata.json (optionnel)

```json
{
  "version": "0.9.0",
  "exportType": "global",
  "exportDate": 1703520000000,
  "nodeCount": 42,
  "attachmentCount": 15,
  "totalSize": 12345678
}
```

### Export global

**Fonction** : `exportGlobalWithFiles()`

**Workflow** :
1. Collecter tous les nœuds
2. Extraire tous les attachments référencés
3. Créer un ZIP avec JSZip
4. Ajouter `data.json`
5. Pour chaque attachment :
   - Récupérer le blob depuis IndexedDB
   - Ajouter au ZIP dans `attachments/{id}_{name}`
6. Générer et télécharger le ZIP

**Nom du fichier** : `deepmemo-export-{timestamp}.zip`

### Export branche

**Fonction** : `exportBranchWithFiles(nodeId)`

**Workflow** :
1. Collecter le nœud + descendants (fonction existante `collectBranchNodes`)
2. Extraire uniquement les attachments de cette branche
3. Même logique que export global, mais scope limité

**Nom du fichier** : `deepmemo-branch-{title}-{timestamp}.zip`

### Import ZIP

**Fonction** : `importZip(file, parentId = null)`

**Workflow** :
1. Détecter si c'est un ZIP (extension `.zip`)
2. Charger avec JSZip
3. Extraire `data.json`
4. Parser les données
5. Pour chaque attachment référencé :
   - Chercher le fichier dans `attachments/{id}_{name}`
   - Si trouvé : sauvegarder dans IndexedDB
   - Si manquant : logger warning + marquer comme "missing" ?
6. Merger les données selon le mode (global = écrase, branche = fusionne)

**Gestion des IDs** :
- **Export global** : IDs conservés si import sur instance vide
- **Export branche** : IDs régénérés (comme actuellement) + remap des attachment IDs

### Import JSON legacy (rétrocompatibilité)

Si l'utilisateur importe un ancien JSON (sans fichiers), ça doit continuer de fonctionner.

**Workflow** :
1. Détecter extension `.json`
2. Parser directement
3. Merger comme avant
4. Ignorer les attachments (array vide ou absent)

---

## 🎨 Interface utilisateur

### 1. Upload de fichiers

**Localisation** : Panneau central, sous le contenu du nœud (en mode Edit)

**UI** :
```
┌─────────────────────────────────────────────┐
│ [Titre du nœud]                             │
│                                             │
│ [Contenu markdown...]                       │
│                                             │
├─────────────────────────────────────────────┤
│ 📎 Fichiers attachés (2)                    │
│                                             │
│  📄 diagram.png (44.6 KB)        [⬇️] [🗑️]  │
│  📄 document.pdf (229.1 KB)      [⬇️] [🗑️]  │
│                                             │
│  [📎 Ajouter un fichier]                    │
└─────────────────────────────────────────────┘
```

**Comportement** :
- Clic sur "Ajouter un fichier" → Input file natif
- Icône adaptée au type MIME :
  - `image/*` → 🖼️
  - `application/pdf` → 📄
  - `video/*` → 🎬
  - `audio/*` → 🎵
  - Autres → 📎
- Affichage de la taille (formatée : KB, MB)
- Bouton ⬇️ : Télécharger le fichier
- Bouton 🗑️ : Supprimer (avec confirmation)

**Validation** :
- Vérifier la taille < 50MB
- Si dépassement : Toast d'erreur "Fichier trop volumineux (max 50MB)"

### 2. Affichage inline des images

**Syntaxe markdown** : `![Description](attachment:attach_001)`

**Rendu** :
- Parser le markdown
- Détecter les URLs `attachment:ID`
- Récupérer le blob depuis IndexedDB
- Créer un `blob:` URL temporaire
- Injecter `<img src="blob:..." alt="Description">`

**Gestion du cache** :
- Révoquer les blob URLs quand on change de nœud (pour éviter les fuites mémoire)
- `URL.revokeObjectURL(blobUrl)`

### 3. Liens vers fichiers

**Syntaxe markdown** : `[Voir le document](attachment:attach_002)`

**Rendu** :
- Lien cliquable qui télécharge le fichier
- Ou ouvre dans un nouvel onglet (selon le type)

### 4. Indicateur de stockage (Settings)

**Localisation** : Panneau droit, section "Stockage" (nouvelle)

**UI** :
```
📊 Stockage

Fichiers : 12.3 MB / ~500 MB
[████████░░░░░░░░░░░░] 2%

15 fichiers attachés

[🧹 Nettoyer les fichiers orphelins]
```

**Comportement** :
- Affiche la taille totale utilisée (via `getTotalSize()`)
- Estimation de la limite (dépend du navigateur, afficher "~500 MB" par défaut)
- Bouton de nettoyage : exécute `cleanOrphans(data)` et affiche un toast avec le résultat

---

## 🔧 Modifications des modules existants

### `src/js/core/data.js`

**Ajouts** :
- Importer le module `attachments.js`
- Modifier `exportData()` → renommer en `exportDataJSON()` (legacy)
- Ajouter `exportDataZIP()` (nouvelle fonction principale)
- Modifier `exportBranch()` → renommer en `exportBranchJSON()` (legacy)
- Ajouter `exportBranchZIP()` (nouvelle fonction principale)
- Modifier `importData()` pour détecter ZIP vs JSON
- Modifier `importBranch()` pour détecter ZIP vs JSON
- Ajouter `deleteNodeAttachments(nodeId)` : supprime les fichiers d'un nœud lors de sa suppression

### `src/js/features/editor.js`

**Ajouts** :
- Section "Fichiers attachés" sous le contenu
- Fonction `renderAttachments(node)` : affiche la liste des fichiers
- Fonction `handleFileUpload(event)` : gère l'upload
- Fonction `handleFileDelete(attachId)` : gère la suppression
- Fonction `handleFileDownload(attachId, name)` : télécharge un fichier
- Modifier `renderMarkdown()` pour parser et afficher les `attachment:` URLs

### `src/js/app.js`

**Ajouts** :
- Initialiser IndexedDB au démarrage : `await initDB()`
- Gérer les erreurs si IndexedDB n'est pas disponible (mode privé Safari, etc.)

### `index.html`

**Ajouts** :
- Input file hidden : `<input type="file" id="attachmentInput" style="display:none">`
- Bouton "Ajouter fichier" dans la section attachments

### `src/css/components.css`

**Ajouts** :
- Styles pour `.attachments-section`
- Styles pour `.attachment-item`
- Styles pour les boutons download/delete

---

## 📚 Dépendances externes

### JSZip

**Version** : `3.10.1` (ou dernière stable)
**Taille** : ~100 KB (minified)
**Licence** : MIT
**CDN** : `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`

**Intégration** :
```html
<!-- Dans index.html -->
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
```

**Alternative** : Télécharger le fichier et le servir localement dans `src/vendor/jszip.min.js`

---

## 🧪 Plan de test

### Tests manuels

**Scénario 1 : Upload basique**
1. Ouvrir un nœud en mode Edit
2. Cliquer "Ajouter fichier"
3. Sélectionner une image < 50MB
4. Vérifier que le fichier apparaît dans la liste
5. Vérifier que la taille est correcte
6. Rafraîchir la page → le fichier est toujours là

**Scénario 2 : Affichage inline**
1. Ajouter une image à un nœud
2. Noter l'ID (ex: `attach_001`)
3. Ajouter dans le contenu : `![Mon diagramme](attachment:attach_001)`
4. Passer en mode View
5. Vérifier que l'image s'affiche

**Scénario 3 : Suppression**
1. Ajouter un fichier
2. Cliquer sur le bouton 🗑️
3. Confirmer la suppression
4. Vérifier que le fichier disparaît de la liste
5. Vérifier qu'il est supprimé d'IndexedDB (DevTools → Application → IndexedDB)

**Scénario 4 : Export/Import global**
1. Créer 2-3 nœuds avec fichiers
2. Export global → ZIP téléchargé
3. Vider localStorage + IndexedDB
4. Import du ZIP
5. Vérifier que tout est restauré (nœuds + fichiers)

**Scénario 5 : Export/Import branche**
1. Créer une branche avec fichiers
2. Export branche → ZIP téléchargé
3. Import sur un autre nœud parent
4. Vérifier que les fichiers sont bien dupliqués (nouveaux IDs)

**Scénario 6 : Limite de taille**
1. Tenter d'uploader un fichier > 50MB
2. Vérifier le toast d'erreur
3. Vérifier que le fichier n'est pas ajouté

**Scénario 7 : Garbage collection**
1. Créer un nœud avec fichier
2. Supprimer le nœud (mais pas via le bouton de suppression de fichier)
3. Exécuter le nettoyage
4. Vérifier que le fichier orphelin est supprimé d'IndexedDB

### Tests navigateurs

- [ ] Chrome/Edge (Windows, Linux)
- [ ] Firefox (Windows, Linux)
- [ ] Safari (macOS, iOS si possible)
- [ ] Mobile browsers (Chrome Android, Safari iOS)

---

## 📅 Roadmap d'implémentation

### Phase 1 : Fondations (Commit 1-2)

**Objectif** : Module IndexedDB fonctionnel

- [ ] Créer `src/js/core/attachments.js`
- [ ] Implémenter toutes les fonctions de l'API
- [ ] Ajouter tests manuels dans la console
- [ ] Documenter le module (JSDoc)

**Validation** : Pouvoir sauvegarder/récupérer/supprimer un blob via console

### Phase 2 : UI Upload (Commit 3-4)

**Objectif** : Pouvoir attacher des fichiers aux nœuds

- [ ] Ajouter la section "Fichiers attachés" dans `editor.js`
- [ ] Implémenter upload via input file
- [ ] Afficher la liste des fichiers
- [ ] Implémenter téléchargement
- [ ] Implémenter suppression
- [ ] Ajouter validation de taille (50MB)
- [ ] Ajouter styles CSS

**Validation** : Pouvoir ajouter/voir/télécharger/supprimer des fichiers sur un nœud

### Phase 3 : Export ZIP (Commit 5-6)

**Objectif** : Export global et branche en ZIP

- [ ] Intégrer JSZip (CDN ou local)
- [ ] Implémenter `exportDataZIP()` dans `data.js`
- [ ] Implémenter `exportBranchZIP()` dans `data.js`
- [ ] Modifier les boutons d'export pour utiliser ZIP par défaut
- [ ] Tester avec plusieurs fichiers

**Validation** : Export → ZIP téléchargé avec data.json + fichiers

### Phase 4 : Import ZIP (Commit 7-8)

**Objectif** : Import global et branche depuis ZIP

- [ ] Implémenter détection ZIP vs JSON
- [ ] Implémenter `importZip()` pour global
- [ ] Implémenter `importZip()` pour branche
- [ ] Gérer la régénération des IDs (mode branche)
- [ ] Tester round-trip complet (export → import)

**Validation** : Import → Données + fichiers restaurés correctement

### Phase 5 : Affichage inline (Commit 9)

**Objectif** : Images affichées dans le markdown

- [ ] Parser `attachment:ID` dans `renderMarkdown()`
- [ ] Générer blob URLs temporaires
- [ ] Injecter `<img>` dans le HTML
- [ ] Révoquer les blob URLs au changement de nœud
- [ ] Tester avec plusieurs images

**Validation** : `![](attachment:id)` affiche l'image correctement

### Phase 6 : Polish (Commit 10-11)

**Objectif** : Finitions et nettoyage

- [ ] Ajouter indicateur de stockage dans Settings
- [ ] Implémenter garbage collection UI
- [ ] Supprimer automatiquement les fichiers lors de la suppression de nœud
- [ ] Ajouter icônes selon type MIME
- [ ] Améliorer les messages d'erreur
- [ ] Documenter dans `docs/README.md`

**Validation** : Tous les scénarios de test passent

### Phase 7 : Documentation (Commit 12)

**Objectif** : Mise à jour de la doc

- [ ] Mettre à jour `docs/README.md`
- [ ] Mettre à jour `docs/ARCHITECTURE.md`
- [ ] Mettre à jour `CLAUDE.md`
- [ ] Mettre à jour `docs/ROADMAP.md`
- [ ] Créer un nœud de démo dans `default-data.js` ?

**Validation** : Documentation complète et à jour

---

## ⚠️ Risques et limitations

### Risques techniques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **IndexedDB non disponible** (mode privé Safari) | Haut | Détecter au démarrage, afficher un avertissement, désactiver les attachments |
| **Quota dépassé** | Moyen | Vérifier avant upload, afficher la taille utilisée, limite 50MB/fichier |
| **Corruption IndexedDB** | Moyen | Mécanisme de détection + réinitialisation, toast d'erreur clair |
| **Blob URLs non révoqués** (fuite mémoire) | Faible | Cleanup systématique au changement de nœud |
| **ZIP trop gros** (>500MB) | Faible | Warning si export > 100MB, streaming si possible |

### Limitations connues

- **Pas de versioning** : Un fichier modifié écrase l'ancien (pas d'historique)
- **Pas d'édition** : Les fichiers sont en lecture seule (pas d'édition inline)
- **Pas de compression** : Les fichiers sont stockés tels quels (pas de compression en IndexedDB)
- **Pas de preview** : Pas de thumbnails générés (affichage fullsize uniquement)
- **Pas de drag & drop** : Upload via bouton uniquement (V1)
- **Pas de clipboard paste** : Pas de paste d'images depuis presse-papier (V1)

---

## 🔄 Migration et rétrocompatibilité

### Migration V0.8 → V0.9

**Pas de migration nécessaire** :
- Les données existantes continuent de fonctionner
- Les nœuds n'ont simplement pas de fichiers attachés
- Pas de changement breaking dans la structure de `data`

### Rétrocompatibilité

**Import JSON simple** :
- Les exports V0.8 (JSON simple) restent importables
- Détection automatique de l'absence d'attachments

**Export rétrocompatible** :
- On pourrait ajouter un bouton "Exporter en JSON (sans fichiers)" pour legacy
- Mais pas obligatoire : le ZIP avec juste `data.json` est équivalent

---

## 📝 Notes de développement

### Convention de nommage

**Attachment IDs** : `attach_{timestamp}_{random4digits}`
- Exemple : `attach_1703520000000_7382`
- Garantit l'unicité et la traçabilité

**Fichiers dans ZIP** : `{id}_{originalName}`
- Exemple : `attach_1703520000000_7382_diagram.png`
- Permet de retrouver facilement le fichier + garde le nom lisible

### Gestion des erreurs

**Toujours wrapper les appels IndexedDB** :
```javascript
try {
  await saveAttachment(id, blob);
} catch (error) {
  console.error('[Attachments] Failed to save:', error);
  showToast('Erreur : impossible de sauvegarder le fichier', 'error');
  // Rollback si nécessaire
}
```

**Types d'erreurs à gérer** :
- `QuotaExceededError` : Quota dépassé
- `NotFoundError` : Fichier non trouvé
- `InvalidStateError` : IndexedDB fermé ou corrompu
- Network errors (pour JSZip si CDN)

### Performance

**Optimisations possibles** :
- Cache des blob URLs en mémoire (éviter de re-générer à chaque render)
- Lazy loading des fichiers (charger seulement si affiché)
- Streaming du ZIP (pour gros exports)

**À surveiller** :
- Temps de parsing du ZIP à l'import
- Mémoire utilisée lors de l'affichage de nombreuses images

---

## 🎓 Références

### Documentation IndexedDB

- [MDN - IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN - Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

### Documentation JSZip

- [JSZip Documentation](https://stuk.github.io/jszip/)
- [JSZip API](https://stuk.github.io/jszip/documentation/api_jszip.html)

### Storage Limits

- [Chrome Storage Quota](https://web.dev/storage-for-the-web/)
- [Firefox Storage Limits](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

---

## ✅ Checklist de complétion

**Feature considérée complète quand** :

- [ ] Tous les tests manuels passent
- [ ] Testé sur Chrome, Firefox, Safari
- [ ] Documentation à jour
- [ ] Pas de console errors
- [ ] Garbage collection fonctionne
- [ ] Export/Import round-trip OK
- [ ] Limite 50MB respectée
- [ ] UI responsive et accessible
- [ ] Code reviewé et commenté

---

**Dernière mise à jour** : 2025-12-25
**Prochaine révision** : Après Phase 1 (fondations IndexedDB)
