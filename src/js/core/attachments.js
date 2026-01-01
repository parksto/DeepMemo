/**
 * attachments.js
 *
 * Gestion des fichiers attachés aux nœuds via IndexedDB.
 * Stockage des fichiers binaires (Blob) séparés de la structure de données principale.
 */

const DB_NAME = 'deepmemo-files';
const DB_VERSION = 1;
const STORE_NAME = 'attachments';

let db = null;

/**
 * Initialise la connexion IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
export async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[Attachments] Failed to open IndexedDB:', request.error);
      reject(new Error('IndexedDB non disponible'));
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('[Attachments] IndexedDB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Créer l'object store si nécessaire
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
        console.log('[Attachments] Object store created');
      }
    };
  });
}

/**
 * Sauvegarde un fichier dans IndexedDB
 * @param {string} id - ID unique de l'attachment
 * @param {Blob} blob - Le fichier à sauvegarder
 * @returns {Promise<void>}
 */
export async function saveAttachment(id, blob) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(blob, id);

    request.onsuccess = () => {
      console.log(`[Attachments] Saved: ${id} (${blob.size} bytes)`);
      resolve();
    };

    request.onerror = () => {
      console.error(`[Attachments] Failed to save ${id}:`, request.error);
      reject(request.error);
    };
  });
}

/**
 * Récupère un fichier depuis IndexedDB
 * @param {string} id - ID de l'attachment
 * @returns {Promise<Blob|null>} - Le blob ou null si non trouvé
 */
export async function getAttachment(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        console.log(`[Attachments] Retrieved: ${id}`);
        resolve(request.result);
      } else {
        console.warn(`[Attachments] Not found: ${id}`);
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error(`[Attachments] Failed to get ${id}:`, request.error);
      reject(request.error);
    };
  });
}

/**
 * Supprime un fichier d'IndexedDB
 * @param {string} id - ID de l'attachment
 * @returns {Promise<void>}
 */
export async function deleteAttachment(id) {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`[Attachments] Deleted: ${id}`);
      resolve();
    };

    request.onerror = () => {
      console.error(`[Attachments] Failed to delete ${id}:`, request.error);
      reject(request.error);
    };
  });
}

/**
 * Liste tous les IDs stockés dans IndexedDB
 * @returns {Promise<string[]>} - Array des IDs
 */
export async function listAttachments() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      console.log(`[Attachments] Listed: ${request.result.length} files`);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('[Attachments] Failed to list:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Récupère la taille totale utilisée
 * @returns {Promise<number>} - Taille en octets
 */
export async function getTotalSize() {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const blobs = request.result;
      const totalSize = blobs.reduce((sum, blob) => sum + (blob.size || 0), 0);
      console.log(`[Attachments] Total size: ${totalSize} bytes`);
      resolve(totalSize);
    };

    request.onerror = () => {
      console.error('[Attachments] Failed to get total size:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Génère un ID unique pour un attachment
 * @returns {string} - Format: attach_{timestamp}_{random}
 */
export function generateAttachmentId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `attach_${timestamp}_${random}`;
}

/**
 * Nettoie les fichiers orphelins (présents dans IndexedDB mais pas dans data)
 * @param {Object} data - L'objet data complet
 * @returns {Promise<{deleted: number, freed: number}>} - Stats du nettoyage
 */
export async function cleanOrphans(data) {
  if (!db) await initDB();

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
 * Vérifie si IndexedDB est disponible (peut être bloqué en mode privé Safari)
 * @returns {boolean}
 */
export function isIndexedDBAvailable() {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
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
  if (!db) await initDB();

  // Mapping: {attachmentId: {path, nodeId}}
  const defaultFiles = {
    'demo_mindmap_svg': {
      path: 'assets/demo.svg',
      name: 'demo-mindmap.svg',
      // On trouvera le nodeId dynamiquement (whyHierarchy)
    },
    'demo_freeplane_screenshot': {
      path: 'assets/freeplane-demo.png',
      name: 'freeplane-demo.png',
      // On trouvera le nodeId dynamiquement (export)
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
