/**
 * Frontmatter YAML utility module
 * Handles parsing and generation of YAML frontmatter for File System Sync
 */

/**
 * Génère le frontmatter YAML pour un nœud
 * @param {Object} node - Le nœud DeepMemo
 * @returns {string} Frontmatter YAML formaté avec délimiteurs
 */
export function generateFrontmatter(node) {
  const metadata = {
    id: node.id,
    title: node.title,
    tags: node.tags || [],
    created: new Date(node.created).toISOString(),
    modified: new Date(node.modified).toISOString()
  };

  return `---\n${jsyaml.dump(metadata)}---\n\n`;
}

/**
 * Parse le frontmatter d'un fichier markdown
 * @param {string} markdownText - Contenu du fichier markdown
 * @returns {Object} { frontmatter: Object|null, content: string }
 */
export function parseFrontmatter(markdownText) {
  const match = markdownText.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

  if (!match) {
    return { frontmatter: null, content: markdownText };
  }

  try {
    const frontmatter = jsyaml.load(match[1]);
    return { frontmatter, content: match[2] };
  } catch (error) {
    console.error('[Frontmatter] Parse error:', error);
    return { frontmatter: null, content: markdownText };
  }
}

/**
 * Valide le frontmatter selon le type de fichier
 * @param {Object} frontmatter - Données frontmatter parsées
 * @param {string} fileType - 'node' ou 'symlink'
 * @returns {boolean} true si valide
 */
export function validateFrontmatter(frontmatter, fileType) {
  if (!frontmatter || typeof frontmatter !== 'object') return false;

  if (fileType === 'node') {
    return !!frontmatter.id && !!frontmatter.title;
  } else if (fileType === 'symlink') {
    return !!frontmatter.id && !!frontmatter.targetId && frontmatter.type === 'symlink';
  }

  return false;
}
