/**
 * JSON Schema Validation for DeepMemo Imports
 * Custom lightweight validator (~2KB) with context-aware error messages
 */

const MAX_ERRORS = 50; // Early exit after 50 errors

/**
 * Validate a single node
 * @param {Object} node - Node to validate
 * @param {string} nodeId - Node ID
 * @param {Set<string>} allNodeIds - Set of all valid node IDs
 * @param {Object} result - Validation result to populate
 */
function validateNode(node, nodeId, allNodeIds, result) {
  // Required fields
  const requiredFields = ['id', 'type', 'parent', 'children', 'created', 'modified'];

  for (const field of requiredFields) {
    if (!(field in node)) {
      result.errors.push(`Missing required field "${field}" in node ${nodeId}`);
      if (result.errors.length >= MAX_ERRORS) return;
    }
  }

  // Validate type (accept "note" as legacy alias for "node")
  if (node.type && !['node', 'note', 'symlink'].includes(node.type)) {
    result.errors.push(`Invalid node type in ${nodeId}: "${node.type}" (must be "node", "note", or "symlink")`);
  }

  // Validate symlink has targetId
  if (node.type === 'symlink' && !node.targetId) {
    result.errors.push(`Symlink ${nodeId} missing targetId`);
  }

  // Validate node does NOT have targetId
  if ((node.type === 'node' || node.type === 'note') && node.targetId) {
    result.warnings.push(`Regular node ${nodeId} has targetId (should only be on symlinks)`);
  }

  // Validate timestamps
  if (typeof node.created !== 'number' || node.created < 0) {
    result.errors.push(`Invalid created timestamp in ${nodeId}`);
  }
  if (typeof node.modified !== 'number' || node.modified < 0) {
    result.errors.push(`Invalid modified timestamp in ${nodeId}`);
  }

  // Validate children is array
  if (node.children && !Array.isArray(node.children)) {
    result.errors.push(`Field "children" must be an array in ${nodeId}`);
  }

  // Validate parent reference (if not null)
  if (node.parent !== null && !allNodeIds.has(node.parent)) {
    result.errors.push(`Broken reference: ${nodeId} → parent "${node.parent}" does not exist`);
  }

  // Validate children references
  if (Array.isArray(node.children)) {
    for (const childId of node.children) {
      if (!allNodeIds.has(childId)) {
        result.errors.push(`Broken reference: ${nodeId} → child "${childId}" does not exist`);
        if (result.errors.length >= MAX_ERRORS) return;
      }
    }
  }

  // Validate targetId reference (symlinks)
  if (node.targetId && !allNodeIds.has(node.targetId)) {
    result.errors.push(`Broken reference: symlink ${nodeId} → targetId "${node.targetId}" does not exist`);
  }

  // Validate optional arrays
  const arrayFields = ['tags', 'attachments', 'links', 'backlinks'];
  for (const field of arrayFields) {
    if (field in node && !Array.isArray(node[field])) {
      result.errors.push(`Field "${field}" must be an array in ${nodeId}`);
    }
  }
}

/**
 * Detect cycles in parent-child hierarchy using DFS
 * @param {Object} nodes - Nodes object (id -> node)
 * @returns {string|null} - ID of node involved in cycle, or null
 */
function detectCycles(nodes) {
  const visited = new Set();
  const recStack = new Set();

  function hasCycle(nodeId, path = []) {
    if (recStack.has(nodeId)) {
      // Cycle detected - return the node that closes the cycle
      return nodeId;
    }
    if (visited.has(nodeId)) {
      return null;
    }

    visited.add(nodeId);
    recStack.add(nodeId);

    const node = nodes[nodeId];
    if (node && Array.isArray(node.children)) {
      for (const childId of node.children) {
        const cycleNode = hasCycle(childId, [...path, nodeId]);
        if (cycleNode) return cycleNode;
      }
    }

    recStack.delete(nodeId);
    return null;
  }

  // Check from all nodes (to catch disconnected components)
  for (const nodeId of Object.keys(nodes)) {
    const cycleNode = hasCycle(nodeId);
    if (cycleNode) return cycleNode;
  }

  return null;
}

/**
 * Validate references and hierarchy
 * @param {Object} nodes - Nodes object
 * @param {Array<string>} rootNodes - Root node IDs (global) or null (branch)
 * @param {Object} result - Validation result to populate
 */
function validateReferences(nodes, rootNodes, result) {
  // Build set of all node IDs for fast lookups
  const allNodeIds = new Set(Object.keys(nodes));

  // Validate each node
  for (const [nodeId, node] of Object.entries(nodes)) {
    validateNode(node, nodeId, allNodeIds, result);
    if (result.errors.length >= MAX_ERRORS) {
      result.errors.push('... validation stopped after 50 errors');
      return;
    }
  }

  // Validate rootNodes (global export only)
  if (rootNodes) {
    for (const rootId of rootNodes) {
      if (!allNodeIds.has(rootId)) {
        result.errors.push(`Root node "${rootId}" does not exist in nodes`);
      } else if (nodes[rootId].parent !== null) {
        result.errors.push(`Root node "${rootId}" has non-null parent: "${nodes[rootId].parent}"`);
      }
    }
  }

  // Detect cycles in hierarchy
  const cycleNode = detectCycles(nodes);
  if (cycleNode) {
    result.errors.push(`Cycle detected in hierarchy involving node "${cycleNode}"`);
  }
}

/**
 * Validate global export format
 * @param {Object} data - Imported data
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateGlobalExport(data) {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Validate structure
  if (!data || typeof data !== 'object') {
    result.errors.push('Invalid data: must be an object');
    result.valid = false;
    return result;
  }

  if (!data.nodes || typeof data.nodes !== 'object') {
    result.errors.push('Missing or invalid "nodes" field (must be an object)');
    result.valid = false;
    return result;
  }

  if (!Array.isArray(data.rootNodes)) {
    result.errors.push('Missing or invalid "rootNodes" field (must be an array)');
    result.valid = false;
    return result;
  }

  // Validate references and hierarchy
  validateReferences(data.nodes, data.rootNodes, result);

  // Set valid flag
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate branch export format
 * @param {Object} data - Imported data
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateBranchExport(data) {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Validate structure
  if (!data || typeof data !== 'object') {
    result.errors.push('Invalid data: must be an object');
    result.valid = false;
    return result;
  }

  if (!data.nodes || typeof data.nodes !== 'object') {
    result.errors.push('Missing or invalid "nodes" field (must be an object)');
    result.valid = false;
    return result;
  }

  if (!data.branchRootId || typeof data.branchRootId !== 'string') {
    result.errors.push('Missing or invalid "branchRootId" field (must be a string)');
    result.valid = false;
    return result;
  }

  // Validate branchRootId exists
  if (!data.nodes[data.branchRootId]) {
    result.errors.push(`Branch root node "${data.branchRootId}" does not exist in nodes`);
    result.valid = false;
    return result;
  }

  // Validate references and hierarchy (no rootNodes for branch)
  validateReferences(data.nodes, null, result);

  // Set valid flag
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Validate metadata.json format (warnings only)
 * @param {Object} metadata - Metadata object
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateMetadata(metadata) {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!metadata || typeof metadata !== 'object') {
    result.warnings.push('Invalid metadata: must be an object');
    return result;
  }

  // Check recommended fields (warnings only)
  const recommendedFields = ['version', 'exportDate', 'exportType', 'nodeCount'];
  for (const field of recommendedFields) {
    if (!(field in metadata)) {
      result.warnings.push(`Metadata missing recommended field: "${field}"`);
    }
  }

  // Validate exportType if present
  if (metadata.exportType && !['full', 'branch'].includes(metadata.exportType)) {
    result.warnings.push(`Unknown exportType: "${metadata.exportType}" (expected "full" or "branch")`);
  }

  return result;
}
