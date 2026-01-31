/**
 * attachments.js
 *
 * Gestion des fichiers attachés aux nœuds via IndexedDB.
 * V0.10: Migrated to use unified Dexie storage layer
 */

import * as Storage from './storage.js';

/**
 * Initialize DB (delegated to storage.js)
 * Kept for backward compatibility
 * @returns {Promise<void>}
 */
export async function initDB() {
  // Storage is initialized automatically in data.js loadData()
  // This function is kept for backward compatibility
  return Promise.resolve();
}

/**
 * Sauvegarde un fichier dans IndexedDB
 * @param {string} id - ID unique de l'attachment
 * @param {Blob} blob - Le fichier à sauvegarder
 * @returns {Promise<void>}
 */
export async function saveAttachment(id, blob) {
  await Storage.saveAttachment(id, blob);
  console.log(`[Attachments] Saved: ${id} (${blob.size} bytes)`);
}

/**
 * Récupère un fichier depuis IndexedDB
 * @param {string} id - ID de l'attachment
 * @returns {Promise<Blob|null>} - Le blob ou null si non trouvé
 */
export async function getAttachment(id) {
  const blob = await Storage.loadAttachment(id);
  if (blob) {
    console.log(`[Attachments] Retrieved: ${id}`);
  }
  return blob;
}

/**
 * Supprime un fichier d'IndexedDB
 * @param {string} id - ID de l'attachment
 * @returns {Promise<void>}
 */
export async function deleteAttachment(id) {
  await Storage.deleteAttachment(id);
  console.log(`[Attachments] Deleted: ${id}`);
}

/**
 * Liste tous les IDs stockés dans IndexedDB
 * @returns {Promise<string[]>} - Array des IDs
 */
export async function listAttachments() {
  const ids = await Storage.listAttachments();
  console.log(`[Attachments] Listed: ${ids.length} files`);
  return ids;
}

/**
 * Récupère la taille totale utilisée
 * @returns {Promise<number>} - Taille en octets
 */
export async function getTotalSize() {
  const totalSize = await Storage.getTotalAttachmentsSize();
  console.log(`[Attachments] Total size: ${totalSize} bytes`);
  return totalSize;
}

/**
 * Génère un ID unique pour un attachment
 * @returns {string} - Format: attach_{timestamp}_{random}
 */
export function generateAttachmentId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `attach_${timestamp}_${random}`;
}

/**
 * Nettoie les fichiers orphelins (présents dans IndexedDB mais pas dans data)
 * @param {Object} data - L'objet data complet
 * @returns {Promise<{deleted: number, freed: number}>} - Stats du nettoyage
 */
export async function cleanOrphans(data) {
  // Collecter tous les IDs référencés dans les nœuds
  const referencedIds = new Set();
  for (const node of Object.values(data.nodes)) {
    if (node.attachments) {
      for (const attachment of node.attachments) {
        referencedIds.add(attachment.id);
      }
    }
  }

  // Lister tous les IDs dans IndexedDB
  const storedIds = await listAttachments();

  // Trouver les orphelins (dans IndexedDB mais pas référencés)
  const orphanIds = storedIds.filter(id => !referencedIds.has(id));

  if (orphanIds.length === 0) {
    console.log('[Attachments] No orphans found');
    return { deleted: 0, freed: 0 };
  }

  // Calculer la taille libérée et supprimer
  let freedSize = 0;
  for (const id of orphanIds) {
    const blob = await getAttachment(id);
    if (blob) {
      freedSize += blob.size;
      await deleteAttachment(id);
    }
  }

  console.log(`[Attachments] Cleaned ${orphanIds.length} orphans, freed ${freedSize} bytes`);
  return { deleted: orphanIds.length, freed: freedSize };
}

/**
 * Nettoie les références orphelines dans les nœuds
 * (nœuds qui référencent des attachments inexistants dans IndexedDB)
 * @param {Object} data - L'objet data complet
 * @returns {Promise<{cleaned: number, nodes: string[]}>} - Stats du nettoyage
 */
export async function cleanOrphanedReferences(data) {
  const existingIds = new Set(await listAttachments());
  let cleanedCount = 0;
  const affectedNodes = [];

  for (const node of Object.values(data.nodes)) {
    if (!node.attachments || node.attachments.length === 0) continue;

    const before = node.attachments.length;
    node.attachments = node.attachments.filter(att => {
      const exists = existingIds.has(att.id);
      if (!exists) {
        console.warn(`[Attachments] Removed orphaned reference: ${att.id} from node ${node.id}`);
      }
      return exists;
    });

    if (node.attachments.length < before) {
      cleanedCount += (before - node.attachments.length);
      affectedNodes.push(node.id);
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Attachments] Cleaned ${cleanedCount} orphaned references from ${affectedNodes.length} nodes`);
  } else {
    console.log('[Attachments] No orphaned references found');
  }

  return { cleaned: cleanedCount, nodes: affectedNodes };
}

/**
 * Vérifie si IndexedDB est disponible (peut être bloqué en mode privé Safari)
 * @returns {boolean}
 */
export function isIndexedDBAvailable() {
  try {
    return 'indexedDB' in window && window.indexedDB !== null && typeof Dexie !== 'undefined';
  } catch (e) {
    return false;
  }
}

/**
 * Formate une taille en octets pour affichage humain
 * @param {number} bytes - Taille en octets
 * @returns {string} - Taille formatée (ex: "1.2 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Charge les fichiers de démonstration par défaut depuis assets/
 * Appelé uniquement au premier lancement avec données de démo
 * @param {Object} data - L'objet data pour mettre à jour les nœuds
 * @returns {Promise<void>}
 */
export async function loadDefaultAttachments(data) {
  // Mapping: {attachmentId: {path, name}}
  const defaultFiles = {
    'demo_mindmap_svg': {
      path: 'assets/demo.svg',
      name: 'demo-mindmap.svg',
    },
    'demo_freeplane_screenshot': {
      path: 'assets/freeplane-demo.png',
      name: 'freeplane-demo.png',
    }
  };

  console.log('[Attachments] Loading default demo files...');

  // Trouver les nœuds concernés par leur titre
  const whyHierarchyNode = Object.values(data.nodes).find(n =>
    n.title === "🧠 Pourquoi une structure en arbre ?" ||
    n.title === "🧠 Why a tree structure?"
  );
  const exportNode = Object.values(data.nodes).find(n =>
    n.title === "⬇️ Export / Import"
  );

  for (const [id, config] of Object.entries(defaultFiles)) {
    try {
      // Vérifier si le fichier existe déjà
      const existing = await getAttachment(id);
      if (existing) {
        console.log(`[Attachments] Demo file already exists: ${id}`);
        continue;
      }

      // Fetch le fichier depuis assets/
      const response = await fetch(config.path);
      if (!response.ok) {
        console.error(`[Attachments] Failed to fetch ${config.path}: ${response.status}`);
        continue;
      }

      // Convertir en Blob
      const blob = await response.blob();

      // Sauvegarder dans IndexedDB
      await saveAttachment(id, blob);
      console.log(`[Attachments] Loaded demo file: ${id} (${formatFileSize(blob.size)})`);

      // Ajouter les metadata au nœud approprié
      const targetNode = id === 'demo_mindmap_svg' ? whyHierarchyNode : exportNode;
      if (targetNode) {
        if (!targetNode.attachments) {
          targetNode.attachments = [];
        }
        targetNode.attachments.push({
          id: id,
          name: config.name,
          type: blob.type,
          size: blob.size
        });
        console.log(`[Attachments] Added metadata to node: ${targetNode.title}`);
      }

    } catch (error) {
      console.error(`[Attachments] Error loading ${id}:`, error);
    }
  }

  console.log('[Attachments] Default demo files loaded successfully');
}
