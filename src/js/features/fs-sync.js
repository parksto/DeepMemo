/**
 * File System Sync Module
 * Handles bidirectional synchronization between DeepMemo (IndexedDB) and local file system
 * Uses File System Access API (Chrome/Edge only)
 */

import { data, saveData } from '../core/data.js';
import { generateId } from '../utils/helpers.js';
import * as AttachmentsModule from '../core/attachments.js';
import * as TreeModule from './tree.js';
import { showToast } from '../ui/toast.js';
import { t } from '../utils/i18n.js';
import * as FrontmatterModule from '../utils/frontmatter.js';

// ============================================================================
// SECTION 1: Feature Detection
// ============================================================================

/**
 * Vérifie si File System Access API est supportée
 * @returns {boolean} true si supportée (Chrome/Edge)
 */
export function isFileSystemSyncSupported() {
  return 'showDirectoryPicker' in window;
}

// ============================================================================
// SECTION 2: Sanitization & Collisions
// ============================================================================

/**
 * Sanitize un nom de fichier pour être compatible cross-platform
 * @param {string} title - Titre du nœud
 * @returns {string} Nom de fichier sanitizé
 */
function sanitizeFilename(title) {
  if (!title || typeof title !== 'string') {
    return 'Untitled';
  }

  return title
    .replace(/[/:*?"<>|]/g, '_')     // Caractères interdits Windows
    .replace(/^\.+/, '_')             // Pas de points au début
    .replace(/\s+/g, ' ')             // Collapse espaces multiples
    .substring(0, 200)                // Limite longueur (sécurité)
    .trim() || 'Untitled';
}

/**
 * Enlève TOUS les suffixes accumulés " (N)" d'un nom de fichier
 * CRITIQUE pour éviter "doc (2) (2) (2).pdf"
 * @param {string} name - Nom avec possibles suffixes
 * @returns {string} Nom nettoyé
 */
function cleanAccumulatedSuffixes(name) {
  return name.replace(/ \(\d+\)/g, '');
}

/**
 * Résout les collisions de noms de fichiers
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire parent
 * @param {string} baseName - Nom de base du fichier (sans extension)
 * @param {string} extension - Extension (avec point, ex: '.md')
 * @returns {Promise<string>} Nom final disponible
 */
async function resolveNameCollision(dirHandle, baseName, extension) {
  const cleanBase = cleanAccumulatedSuffixes(baseName);
  let finalName = cleanBase + extension;
  let counter = 2;

  while (true) {
    try {
      // Tester si le fichier/dossier existe
      if (extension) {
        await dirHandle.getFileHandle(finalName, { create: false });
      } else {
        await dirHandle.getDirectoryHandle(finalName, { create: false });
      }

      // Existe → incrémenter le compteur
      finalName = `${cleanBase} (${counter})${extension}`;
      counter++;
    } catch (e) {
      // N'existe pas → nom libre
      return finalName;
    }
  }
}

// ============================================================================
// SECTION 3: Export Flow
// ============================================================================

/**
 * Collecte tous les nœuds d'une branche (wrapper autour de data.js)
 * @param {string} branchId - ID de la racine de branche
 * @returns {Object} Map { nodeId: node }
 */
function collectBranchNodes(branchId) {
  const result = {};
  const visited = new Set();

  function traverse(nodeId) {
    if (visited.has(nodeId)) return;

    const node = data.nodes[nodeId];
    if (!node) return;

    visited.add(nodeId);
    result[nodeId] = node;

    // Traverser enfants
    if (node.children) {
      for (const childId of node.children) {
        traverse(childId);
      }
    }

    // Traverser target si symlink
    if (node.type === 'symlink' && node.targetId) {
      traverse(node.targetId);
    }
  }

  traverse(branchId);
  return result;
}

/**
 * Point d'entrée principal pour l'export vers File System
 * @param {string} branchId - ID de la racine de branche
 * @param {Function} progressCallback - Callback (current, message)
 * @returns {Promise<Object>} Stats { nodes, files, attachments }
 */
export async function exportBranchToFS(branchId, progressCallback) {
  // 1. Feature detection
  if (!isFileSystemSyncSupported()) {
    throw new Error('File System Access API not supported');
  }

  // 2. Demander au user de choisir le répertoire
  let dirHandle;
  try {
    dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // User a annulé
    }
    throw new Error(t('fsSync.permissionDenied'));
  }

  // 3. Collecter nœuds de la branche
  const branchNodes = collectBranchNodes(branchId);

  // 4. Export récursif
  const exportedIds = new Set();
  const stats = { nodes: 0, files: 0, attachments: 0 };

  await exportNodeRecursive(
    branchId,
    dirHandle,
    exportedIds,
    branchNodes,
    stats,
    progressCallback
  );

  return stats;
}

/**
 * Export récursif d'un nœud et ses descendants
 * @param {string} nodeId - ID du nœud à exporter
 * @param {FileSystemDirectoryHandle} parentDirHandle - Handle du répertoire parent
 * @param {Set} exportedIds - Set des IDs déjà exportés (éviter doublons)
 * @param {Object} branchNodes - Map de tous les nœuds de la branche
 * @param {Object} stats - Statistiques de l'export
 * @param {Function} progressCallback - Callback de progression
 */
async function exportNodeRecursive(
  nodeId,
  parentDirHandle,
  exportedIds,
  branchNodes,
  stats,
  progressCallback
) {
  const node = branchNodes[nodeId];

  // Skip si nœud absent ou déjà exporté
  if (!node || exportedIds.has(nodeId)) return;

  exportedIds.add(nodeId);
  stats.nodes++;

  if (progressCallback) {
    progressCallback({ current: stats.nodes, message: `Exporting: ${node.title}` });
  }

  const baseName = sanitizeFilename(node.title);

  // CAS 1: SYMLINKS → fichier .dmlink
  if (node.type === 'symlink') {
    const filename = await resolveNameCollision(parentDirHandle, baseName, '.dmlink');
    await writeSymlinkFile(parentDirHandle, filename, node);
    stats.files++;
    return;
  }

  // CAS 2 & 3: BRANCHES vs LEAVES
  const hasChildren = node.children?.length > 0;

  if (hasChildren) {
    // BRANCHES → Folder/index.md
    const folderName = await resolveNameCollision(parentDirHandle, baseName, '');
    const nodeDirHandle = await parentDirHandle.getDirectoryHandle(folderName, { create: true });

    // Écrire index.md
    await writeNodeMarkdown(nodeDirHandle, 'index.md', node);
    stats.files++;

    // Export attachments
    const attCount = await exportAttachments(node, nodeDirHandle);
    stats.attachments += attCount;

    // Export enfants récursivement
    for (const childId of node.children) {
      await exportNodeRecursive(
        childId,
        nodeDirHandle,
        exportedIds,
        branchNodes,
        stats,
        progressCallback
      );
    }
  } else {
    // LEAVES → Title.md (à côté des autres fichiers)
    const filename = await resolveNameCollision(parentDirHandle, baseName, '.md');
    await writeNodeMarkdown(parentDirHandle, filename, node);
    stats.files++;

    // Export attachments (à côté du .md)
    const attCount = await exportAttachments(node, parentDirHandle);
    stats.attachments += attCount;
  }
}

/**
 * Écrit un fichier markdown avec frontmatter
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire
 * @param {string} filename - Nom du fichier
 * @param {Object} node - Nœud à écrire
 */
async function writeNodeMarkdown(dirHandle, filename, node) {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();

    const frontmatter = FrontmatterModule.generateFrontmatter(node);
    const content = frontmatter + (node.content || '');

    await writable.write(content);
    await writable.close();
  } catch (error) {
    console.error(`[FS Export] Failed to write markdown ${filename}:`, error);
    throw error;
  }
}

/**
 * Écrit un fichier symlink (.dmlink)
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire
 * @param {string} filename - Nom du fichier
 * @param {Object} node - Nœud symlink
 */
async function writeSymlinkFile(dirHandle, filename, node) {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();

    const symlinkData = {
      id: node.id,
      title: node.title,
      type: 'symlink',
      targetId: node.targetId,
      created: new Date(node.created).toISOString(),
      modified: new Date(node.modified).toISOString()
    };

    const yaml = `---\n${jsyaml.dump(symlinkData)}---\n`;
    await writable.write(yaml);
    await writable.close();
  } catch (error) {
    console.error(`[FS Export] Failed to write symlink ${filename}:`, error);
    throw error;
  }
}

/**
 * Exporte les attachments d'un nœud
 * @param {Object} node - Nœud source
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire
 * @returns {Promise<number>} Nombre d'attachments exportés
 */
async function exportAttachments(node, dirHandle) {
  if (!node.attachments?.length) return 0;

  let count = 0;

  for (const attachment of node.attachments) {
    try {
      // Récupérer le blob depuis IndexedDB
      const blob = await AttachmentsModule.getAttachment(attachment.id);
      if (!blob) {
        console.warn(`[FS Export] Attachment not found: ${attachment.id}`);
        continue;
      }

      // Sanitize le nom et extraire extension
      const sanitizedName = sanitizeFilename(attachment.name) || `attachment`;
      const match = sanitizedName.match(/^(.+?)(\.[^.]+)?$/);
      const base = match[1];
      const ext = match[2] || '.bin';

      // IMPORTANT : Inclure l'ID dans le nom de fichier pour permettre le remapping à l'import
      // Format : {name}__{attachId}{ext}
      const nameWithId = `${base}__${attachment.id}`;

      // Résoudre collision (ne devrait pas arriver car ID est unique, mais au cas où)
      const finalName = await resolveNameCollision(dirHandle, nameWithId, ext);

      // Écrire le fichier
      const fileHandle = await dirHandle.getFileHandle(finalName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      count++;
    } catch (error) {
      console.error(`[FS Export] Failed to export attachment ${attachment.name}:`, error);
      // Continue avec les autres attachments
    }
  }

  return count;
}

// ============================================================================
// SECTION 3.5: ID Remapping (pour éviter collisions à l'import)
// ============================================================================

/**
 * Régénère tous les IDs des nœuds importés pour éviter les collisions
 * @param {Object} importedNodes - Map { oldId: node }
 * @param {Array<string>} rootChildIds - IDs des racines
 * @returns {Object} { remappedNodes, nodeIdMapping, attachmentIdMapping }
 */
function remapAllIds(importedNodes, rootChildIds) {
  const nodeIdMapping = {};        // oldId -> newId
  const attachmentIdMapping = {};  // oldAttachId -> newAttachId
  const remappedNodes = {};

  // Phase 1 : Générer les nouveaux IDs pour tous les nœuds
  for (const oldId in importedNodes) {
    const newId = generateId();
    nodeIdMapping[oldId] = newId;
  }

  // Phase 2 : Créer les nœuds avec les nouveaux IDs
  for (const oldId in importedNodes) {
    const node = importedNodes[oldId];
    const newId = nodeIdMapping[oldId];

    // Cloner le nœud avec le nouvel ID
    const remappedNode = {
      ...node,
      id: newId,
      parent: node.parent, // Sera remappé à l'insertion dans le parent
      children: node.children.map(childId => nodeIdMapping[childId] || childId),
      attachments: []
    };

    // Remapper les attachments
    if (node.attachments) {
      for (const att of node.attachments) {
        // Si l'attachment a un _originalId, créer le mapping
        if (att._originalId) {
          attachmentIdMapping[att._originalId] = att.id;
        }

        // Copier l'attachment sans le champ temporaire _originalId
        const { _originalId, ...cleanAtt } = att;
        remappedNode.attachments.push(cleanAtt);
      }
    }

    // Remapper targetId si symlink
    if (node.type === 'symlink' && node.targetId) {
      remappedNode.targetId = nodeIdMapping[node.targetId] || node.targetId;
    }

    remappedNodes[newId] = remappedNode;
  }

  return { remappedNodes, nodeIdMapping, attachmentIdMapping };
}

/**
 * Remplace les références aux IDs dans le contenu et les symlinks
 * @param {Object} remappedNodes - Nœuds avec nouveaux IDs
 * @param {Object} nodeIdMapping - Mapping oldId -> newId
 * @param {Object} attachmentIdMapping - Mapping oldAttachId -> newAttachId
 */
function remapReferences(remappedNodes, nodeIdMapping, attachmentIdMapping) {
  for (const nodeId in remappedNodes) {
    const node = remappedNodes[nodeId];

    // Remapper les références attachment:ID dans le contenu markdown
    if (node.content) {
      let content = node.content;

      // Remplacer toutes les références attachment:oldId par attachment:newId
      for (const oldAttachId in attachmentIdMapping) {
        const newAttachId = attachmentIdMapping[oldAttachId];
        // Pattern : attachment:oldId (avec boundaries pour éviter partial match)
        const regex = new RegExp(`attachment:${escapeRegExp(oldAttachId)}\\b`, 'g');
        content = content.replace(regex, `attachment:${newAttachId}`);
      }

      node.content = content;
    }

    // Note : Les targetId des symlinks ont déjà été remappés dans remapAllIds()
  }
}

/**
 * Échappe les caractères spéciaux pour regex
 * @param {string} str - String à échapper
 * @returns {string} String échappée
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Copie un attachment dans IndexedDB avec un nouveau ID
 * @param {string} oldId - Ancien ID
 * @param {string} newId - Nouveau ID
 */
async function copyAttachment(oldId, newId) {
  try {
    const blob = await AttachmentsModule.getAttachment(oldId);
    if (blob) {
      await AttachmentsModule.saveAttachment(newId, blob);
    }
  } catch (error) {
    console.error(`[FS Import] Failed to copy attachment ${oldId} -> ${newId}:`, error);
  }
}

// ============================================================================
// SECTION 4: Import Flow
// ============================================================================

/**
 * Point d'entrée principal pour l'import depuis File System
 * @param {string} parentId - ID du nœud parent où importer
 * @param {Function} progressCallback - Callback (count)
 * @returns {Promise<Object>} { count: number }
 */
export async function importBranchFromFS(parentId, progressCallback) {
  // 1. Feature detection
  if (!isFileSystemSyncSupported()) {
    throw new Error('File System Access API not supported');
  }

  // 2. Demander au user de choisir le répertoire
  let dirHandle;
  try {
    dirHandle = await window.showDirectoryPicker({ mode: 'read' });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error(t('fsSync.permissionDenied'));
  }

  // 3. Parser récursivement (avec IDs originaux du frontmatter)
  const importedNodes = {};
  const rootChildIds = await parseDirectoryRecursive(
    dirHandle,
    parentId,
    importedNodes,
    progressCallback
  );

  // 4. Régénérer tous les IDs pour éviter les collisions
  const { remappedNodes, nodeIdMapping, attachmentIdMapping } = remapAllIds(importedNodes, rootChildIds);

  // 5. Remapper les références dans le contenu et les symlinks
  remapReferences(remappedNodes, nodeIdMapping, attachmentIdMapping);

  // 6. Fusionner dans data.nodes
  Object.assign(data.nodes, remappedNodes);

  // 7. Attacher au parent (avec IDs remappés)
  const parentNode = data.nodes[parentId];
  if (parentNode) {
    const remappedRootIds = rootChildIds.map(id => nodeIdMapping[id] || id);
    parentNode.children.push(...remappedRootIds);
  }

  // 8. Sauvegarder
  await saveData();

  return { count: Object.keys(remappedNodes).length };
}

/**
 * Parse récursivement un répertoire et ses sous-répertoires
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire
 * @param {string} parentId - ID du nœud parent
 * @param {Object} importedNodes - Map accumulant les nœuds importés
 * @param {Function} progressCallback - Callback de progression
 * @returns {Promise<Array<string>>} IDs des enfants directs
 */
async function parseDirectoryRecursive(dirHandle, parentId, importedNodes, progressCallback) {
  const children = [];

  for await (const [name, handle] of dirHandle.entries()) {
    // Skip fichiers système
    if (name.startsWith('.') || name === 'Thumbs.db' || name === 'desktop.ini') {
      continue;
    }

    if (handle.kind === 'file') {
      if (name.endsWith('.dmlink')) {
        // SYMLINK
        const node = await parseSymlinkFile(handle, parentId);
        if (node) {
          importedNodes[node.id] = node;
          children.push(node.id);
          progressCallback?.(Object.keys(importedNodes).length);
        }
      } else if (name.endsWith('.md') && name !== 'index.md') {
        // LEAF (fichier .md qui n'est pas index.md)
        const node = await parseMarkdownFile(handle, parentId);
        if (node) {
          // Import attachments depuis le même répertoire
          await importAttachmentsForNode(node, dirHandle);

          importedNodes[node.id] = node;
          children.push(node.id);
          progressCallback?.(Object.keys(importedNodes).length);
        }
      }
    } else if (handle.kind === 'directory') {
      // BRANCH (dossier)
      const node = await parseFolderNode(handle, parentId);
      if (node) {
        // Import attachments depuis le dossier
        await importAttachmentsForNode(node, handle);

        // Parser enfants récursivement
        const childIds = await parseDirectoryRecursive(
          handle,
          node.id,
          importedNodes,
          progressCallback
        );
        node.children = childIds;

        importedNodes[node.id] = node;
        children.push(node.id);
        progressCallback?.(Object.keys(importedNodes).length);
      }
    }
  }

  return children;
}

/**
 * Parse un fichier markdown (leaf)
 * @param {FileSystemFileHandle} fileHandle - Handle du fichier
 * @param {string} parentId - ID du parent
 * @returns {Promise<Object|null>} Nœud parsé ou null
 */
async function parseMarkdownFile(fileHandle, parentId) {
  try {
    const file = await fileHandle.getFile();
    const text = await file.text();

    const { frontmatter, content } = FrontmatterModule.parseFrontmatter(text);

    if (frontmatter && FrontmatterModule.validateFrontmatter(frontmatter, 'node')) {
      // Frontmatter valide → utiliser les métadonnées
      return {
        id: frontmatter.id,
        type: 'node',
        title: frontmatter.title,
        content,
        tags: frontmatter.tags || [],
        parent: parentId,
        children: [],
        attachments: [],
        created: new Date(frontmatter.created).getTime(),
        modified: new Date(frontmatter.modified).getTime()
      };
    } else {
      // Fallback : générer nouveau nœud
      return {
        id: generateId(),
        type: 'node',
        title: fileHandle.name.replace('.md', ''),
        content,
        tags: [],
        parent: parentId,
        children: [],
        attachments: [],
        created: Date.now(),
        modified: Date.now()
      };
    }
  } catch (error) {
    console.error(`[FS Import] Failed to parse markdown ${fileHandle.name}:`, error);
    return null;
  }
}

/**
 * Parse un dossier (branch)
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du dossier
 * @param {string} parentId - ID du parent
 * @returns {Promise<Object|null>} Nœud parsé ou null
 */
async function parseFolderNode(dirHandle, parentId) {
  try {
    // Chercher index.md
    const indexHandle = await dirHandle.getFileHandle('index.md', { create: false });
    return await parseMarkdownFile(indexHandle, parentId);
  } catch (e) {
    // Pas d'index.md → créer nœud avec titre = nom du dossier
    return {
      id: generateId(),
      type: 'node',
      title: dirHandle.name,
      content: '',
      tags: [],
      parent: parentId,
      children: [],
      attachments: [],
      created: Date.now(),
      modified: Date.now()
    };
  }
}

/**
 * Parse un fichier symlink (.dmlink)
 * @param {FileSystemFileHandle} fileHandle - Handle du fichier
 * @param {string} parentId - ID du parent
 * @returns {Promise<Object|null>} Nœud symlink parsé ou null
 */
async function parseSymlinkFile(fileHandle, parentId) {
  try {
    const file = await fileHandle.getFile();
    const text = await file.text();

    const yaml = text.match(/^---\s*\n([\s\S]*?)\n---/)?.[1];
    if (!yaml) return null;

    const symlinkData = jsyaml.load(yaml);

    if (!symlinkData.targetId) {
      console.warn(`[FS Import] Symlink missing targetId: ${fileHandle.name}`);
      return null;
    }

    return {
      id: symlinkData.id || generateId(),
      type: 'symlink',
      title: symlinkData.title || fileHandle.name.replace('.dmlink', ''),
      targetId: symlinkData.targetId,
      parent: parentId,
      children: [],
      tags: [],
      attachments: [],
      created: symlinkData.created ? new Date(symlinkData.created).getTime() : Date.now(),
      modified: symlinkData.modified ? new Date(symlinkData.modified).getTime() : Date.now()
    };
  } catch (error) {
    console.error(`[FS Import] Failed to parse symlink ${fileHandle.name}:`, error);
    return null;
  }
}

/**
 * Importe les attachments d'un répertoire vers un nœud
 * @param {Object} node - Nœud cible
 * @param {FileSystemDirectoryHandle} dirHandle - Handle du répertoire
 */
async function importAttachmentsForNode(node, dirHandle) {
  const validExtensions = [
    '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.txt', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.mp3', '.mp4'
  ];

  const attachments = [];

  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind !== 'file') continue;
    if (name.endsWith('.md') || name.endsWith('.dmlink')) continue;

    // Vérifier extension
    const hasValidExt = validExtensions.some(ext => name.toLowerCase().endsWith(ext));
    if (!hasValidExt) continue;

    try {
      const file = await handle.getFile();

      // Skip fichiers trop gros (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        console.warn(`[FS Import] Skipping large file: ${name} (${file.size} bytes)`);
        continue;
      }

      // Parser le nom de fichier pour extraire l'ancien ID
      // Format attendu : {name}__{oldId}{ext}
      let originalId = null;
      let displayName = name;

      const match = name.match(/^(.+)__([^.]+)(\.[^.]+)$/);
      if (match) {
        displayName = match[1] + match[3]; // Nom sans l'ID
        originalId = match[2];              // Ancien ID
      }

      // Générer nouveau ID et sauvegarder dans IndexedDB
      const attachId = AttachmentsModule.generateAttachmentId();
      const blob = await file.arrayBuffer();
      await AttachmentsModule.saveAttachment(attachId, new Blob([blob], { type: file.type }));

      const attachment = {
        id: attachId,
        name: displayName,
        type: file.type || 'application/octet-stream',
        size: file.size
      };

      // Stocker l'ancien ID temporairement pour le remapping
      if (originalId) {
        attachment._originalId = originalId;
      }

      attachments.push(attachment);
    } catch (error) {
      console.error(`[FS Import] Failed to import attachment ${name}:`, error);
    }
  }

  node.attachments = attachments;
}

// ============================================================================
// SECTION 5: UI Dialogs
// ============================================================================

/**
 * Affiche le dialog d'export et lance l'export
 * @param {string} nodeId - ID du nœud à exporter (racine de l'export)
 */
export async function showExportDialog(nodeId) {
  if (!isFileSystemSyncSupported()) {
    showToast(t('fsSync.notSupported'), '⚠️');
    return;
  }

  if (!nodeId) {
    showToast(t('toast.selectNodeFirst'), 'ℹ️');
    return;
  }

  try {
    showToast(t('fsSync.exporting'), 'ℹ️');

    const stats = await exportBranchToFS(nodeId, (progress) => {
      // TODO: Update progress in toast or modal
      console.log(`[FS Export] Progress: ${progress.current} nodes - ${progress.message}`);
    });

    showToast(t('fsSync.exportSuccess', {
      count: stats.nodes,
      files: stats.files
    }), '✅');

  } catch (error) {
    if (error.name === 'AbortError') {
      // User a annulé → ne pas afficher d'erreur
      return;
    }
    console.error('[FS Export] Failed:', error);
    showToast(t('fsSync.exportError', { message: error.message }), '❌');
  }
}

/**
 * Affiche le dialog d'import et lance l'import
 * @param {string} parentId - ID du nœud parent
 */
export async function showImportDialog(parentId) {
  if (!isFileSystemSyncSupported()) {
    showToast(t('fsSync.notSupported'), '⚠️');
    return;
  }

  try {
    showToast(t('fsSync.importing'), 'ℹ️');

    const result = await importBranchFromFS(parentId, (count) => {
      console.log(`[FS Import] Progress: ${count} nodes imported`);
    });

    showToast(t('fsSync.importSuccess', { count: result.count }), '✅');

    return result;

  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error('[FS Import] Failed:', error);
    showToast(t('fsSync.importError', { message: error.message }), '❌');
  }
}
