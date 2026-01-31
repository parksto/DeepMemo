/**
 * PDF Export Module - jsPDF Direct Rendering
 * Replaces html2pdf/html2canvas approach with direct text rendering
 */

import { data } from './data.js';
import * as AttachmentsModule from './attachments.js';
import { escapeHtml } from '../utils/helpers.js';
import { t } from '../utils/i18n.js';
import { showToast } from '../ui/toast.js';

/**
 * Parse markdown content into structured blocks for PDF rendering
 * @param {string} markdownContent - Markdown content
 * @param {number} nodeDepth - Depth of the node (for heading offset)
 * @returns {Array} Array of content blocks
 */
function parseMarkdownForPDF(markdownContent, nodeDepth = 0) {
  if (!markdownContent || markdownContent === '@parent:content') return [];

  const blocks = [];
  const lines = markdownContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings (offset by node depth + 1)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length + nodeDepth + 1, 6);
      blocks.push({
        type: 'heading',
        level,
        content: headingMatch[2].trim()
      });
      i++;
      continue;
    }

    // Code blocks
    if (line.startsWith('```')) {
      const codeLines = [];
      i++; // Skip opening ```
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code',
        content: codeLines.join('\n')
      });
      i++; // Skip closing ```
      continue;
    }

    // Unordered lists
    if (line.match(/^[\s]*[-*+]\s+(.+)$/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s+(.+)$/)) {
        const itemMatch = lines[i].match(/^[\s]*[-*+]\s+(.+)$/);
        items.push(itemMatch[1]);
        i++;
      }
      blocks.push({
        type: 'list',
        items
      });
      continue;
    }

    // Ordered lists
    if (line.match(/^[\s]*\d+\.\s+(.+)$/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\s]*\d+\.\s+(.+)$/)) {
        const itemMatch = lines[i].match(/^[\s]*\d+\.\s+(.+)$/);
        items.push(itemMatch[1]);
        i++;
      }
      blocks.push({
        type: 'orderedList',
        items
      });
      continue;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].substring(1).trim());
        i++;
      }
      blocks.push({
        type: 'quote',
        content: quoteLines.join(' ')
      });
      i++;
      continue;
    }

    // Images
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      blocks.push({
        type: 'image',
        alt: imageMatch[1],
        src: imageMatch[2]
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph - collect consecutive lines
    const paragraphLines = [];
    while (i < lines.length && lines[i].trim() &&
           !lines[i].match(/^#{1,6}\s/) &&
           !lines[i].startsWith('```') &&
           !lines[i].match(/^[\s]*[-*+]\s/) &&
           !lines[i].match(/^[\s]*\d+\.\s/) &&
           !lines[i].startsWith('>') &&
           !lines[i].match(/!\[/) &&
           !lines[i].match(/^[-*_]{3,}$/)) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: paragraphLines.join(' ')
      });
    }
  }

  return blocks;
}

/**
 * Strip markdown formatting from text
 */
function stripMarkdown(text) {
  if (!text) return '';

  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .trim();
}

/**
 * Build PDF structure recursively (same as before)
 */
function buildPDFStructure(nodeId, depth = 0, visitedIds = new Set(), numbering = '') {
  const node = data.nodes[nodeId];
  if (!node || visitedIds.has(nodeId)) {
    return null;
  }

  visitedIds.add(nodeId);

  const structure = {
    node,
    depth,
    numbering,
    children: []
  };

  // Process children
  if (node.children && node.children.length > 0) {
    node.children.forEach((childId, index) => {
      const childNumbering = numbering
        ? `${numbering}.${index + 1}`
        : `${index + 1}`;

      const childStructure = buildPDFStructure(
        childId,
        depth + 1,
        new Set(visitedIds),
        childNumbering
      );

      if (childStructure) {
        structure.children.push(childStructure);
      }
    });
  }

  return structure;
}

/**
 * Convert attachment images to base64
 */
async function convertAttachmentsToBase64(node) {
  if (!node.attachments || node.attachments.length === 0) {
    return { images: [], idMap: {} };
  }

  const images = node.attachments.filter(att =>
    att.type && att.type.startsWith('image/')
  );

  const idMap = {};

  const base64Images = await Promise.all(
    images.map(async att => {
      try {
        const blob = await AttachmentsModule.getAttachment(att.id);
        if (!blob) return null;

        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result;
            idMap[att.id] = base64;
            resolve({
              name: att.name,
              base64: base64,
              type: att.type
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error(`[PDF Export] Failed to convert attachment ${att.id}:`, error);
        return null;
      }
    })
  );

  return {
    images: base64Images.filter(img => img !== null),
    idMap
  };
}

/**
 * Render PDF content using jsPDF
 */
async function renderPDFContent(pdf, structure, options = {}, visitedIds = new Set()) {
  if (!structure) return { y: pdf.internal.pageSize.getHeight() };

  const { node, depth, numbering, children } = structure;
  const { includeSymlinks = 'citations' } = options;

  // Cycle protection
  if (visitedIds.has(node.id)) {
    return { y: pdf.internal.pageSize.getHeight() };
  }
  visitedIds.add(node.id);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2) - (depth * 10);

  let y = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : margin;
  if (!pdf.lastAutoTable) {
    y = 60; // Start after TOC placeholder
  }

  // Add node title
  const titlePrefix = numbering ? `${numbering} ` : '';
  const titleText = stripMarkdown(node.title || 'Untitled');
  const fullTitle = titlePrefix + titleText;

  // Set font size based on depth
  const fontSize = Math.max(16 - (depth * 2), 10);
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', 'bold');

  // Check if we need a new page
  if (y + 20 > pageHeight - margin) {
    pdf.addPage();
    y = margin;
  }

  pdf.text(fullTitle, margin + (depth * 10), y);
  y += fontSize * 0.6;

  // Handle symlinks
  if (node.type === 'symlink') {
    const targetNode = data.nodes[node.targetId];

    if (!targetNode) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(200, 0, 0);
      pdf.text(`🔗 ${t('pdf.brokenLink') || 'Lien cassé'}`, margin + (depth * 10), y);
      pdf.setTextColor(0, 0, 0);
      y += 10;
    } else if (includeSymlinks === 'citations') {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`→ ${t('pdf.see') || 'Voir'}: ${stripMarkdown(targetNode.title)}`, margin + (depth * 10), y);
      pdf.setTextColor(0, 0, 0);
      y += 10;
    }
  }

  // Render content
  if (node.type !== 'symlink' || includeSymlinks === 'full') {
    const contentNode = node.type === 'symlink' ? data.nodes[node.targetId] : node;

    if (contentNode && contentNode.content && contentNode.content !== '@parent:content') {
      // Convert attachments
      const { idMap } = await convertAttachmentsToBase64(contentNode);

      // Replace attachment references
      let content = contentNode.content;
      for (const [attachId, base64Url] of Object.entries(idMap)) {
        content = content.replaceAll(`attachment:${attachId}`, base64Url);
      }

      // Parse markdown
      const blocks = parseMarkdownForPDF(content, depth);

      // Render blocks
      for (const block of blocks) {
        // Check page break
        if (y > pageHeight - margin - 30) {
          pdf.addPage();
          y = margin;
        }

        if (block.type === 'heading') {
          const headingSize = Math.max(14 - block.level, 10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(headingSize);
          y += 5;
          pdf.text(stripMarkdown(block.content), margin + (depth * 10), y);
          y += headingSize * 0.6;
        } else if (block.type === 'paragraph') {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          const lines = pdf.splitTextToSize(stripMarkdown(block.content), maxWidth);
          pdf.text(lines, margin + (depth * 10), y);
          y += (lines.length * 5) + 5;
        } else if (block.type === 'list' || block.type === 'orderedList') {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(11);
          block.items.forEach((item, index) => {
            const bullet = block.type === 'list' ? '•' : `${index + 1}.`;
            const lines = pdf.splitTextToSize(stripMarkdown(item), maxWidth - 10);
            pdf.text(bullet, margin + (depth * 10), y);
            pdf.text(lines, margin + (depth * 10) + 10, y);
            y += (lines.length * 5) + 2;
          });
          y += 3;
        } else if (block.type === 'code') {
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(9);
          pdf.setFillColor(245, 245, 245);
          const codeLines = block.content.split('\n');
          const codeHeight = codeLines.length * 5 + 10;
          pdf.rect(margin + (depth * 10), y - 3, maxWidth, codeHeight, 'F');
          codeLines.forEach(line => {
            pdf.text(line, margin + (depth * 10) + 5, y + 2);
            y += 5;
          });
          y += 10;
        } else if (block.type === 'quote') {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(11);
          pdf.setTextColor(85, 85, 85);
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(1);
          pdf.line(margin + (depth * 10), y - 2, margin + (depth * 10), y + 10);
          const lines = pdf.splitTextToSize(stripMarkdown(block.content), maxWidth - 10);
          pdf.text(lines, margin + (depth * 10) + 8, y);
          y += (lines.length * 5) + 8;
          pdf.setTextColor(0, 0, 0);
        } else if (block.type === 'image') {
          try {
            // Add image if it's a data URL
            if (block.src.startsWith('data:image/')) {
              const imgWidth = Math.min(maxWidth, 150);
              pdf.addImage(block.src, 'JPEG', margin + (depth * 10), y, imgWidth, 0);
              y += 80; // Approximate image height
            }
          } catch (error) {
            console.error('[PDF Export] Failed to add image:', error);
          }
        } else if (block.type === 'hr') {
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(margin + (depth * 10), y, margin + maxWidth, y);
          y += 10;
        }
      }

      y += 5;
    }
  }

  // Render children recursively
  if (node.type !== 'symlink') {
    for (const child of children) {
      const result = await renderPDFContent(pdf, child, options, visitedIds);
      y = result.y;
    }
  }

  return { y };
}

/**
 * Generate TOC data structure
 */
function collectTOCEntries(structure, entries = []) {
  if (!structure) return entries;

  const { node, depth, numbering, children } = structure;

  if (depth >= 0) {
    entries.push({
      title: stripMarkdown(node.title || 'Untitled'),
      numbering,
      depth,
      nodeId: node.id
    });
  }

  children.forEach(child => collectTOCEntries(child, entries));

  return entries;
}

/**
 * Main export function
 */
export async function exportBranchPDF(branchRootId = null, options = {}) {
  // Check if jsPDF is available
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    console.error('[PDF Export] jsPDF library not loaded');
    alert('PDF export library not loaded');
    return;
  }

  const {
    includeSymlinks = 'citations',
    includeTOC = true
  } = options;

  try {
    // Show progress
    showToast(t('pdf.generating') || 'Génération du PDF...', 'info');

    // Build structure
    const rootIds = branchRootId ? [branchRootId] : data.rootNodes;

    if (rootIds.length === 0) {
      alert('No data to export');
      return;
    }

    console.log('[PDF Export] Building structure...');

    let fullStructure;
    if (rootIds.length === 1) {
      fullStructure = buildPDFStructure(rootIds[0], 0, new Set(), '');
    } else {
      fullStructure = {
        node: { id: '_virtual', title: 'DeepMemo' },
        depth: -1,
        numbering: '',
        children: rootIds.map((rootId, index) =>
          buildPDFStructure(rootId, 0, new Set(), `${index + 1}`)
        ).filter(s => s !== null)
      };
    }

    // Initialize PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add TOC
    if (includeTOC) {
      const tocEntries = collectTOCEntries(fullStructure);

      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(t('pdf.tableOfContents') || 'Sommaire', 20, 20);

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      let y = 35;
      tocEntries.forEach(entry => {
        const indent = entry.depth * 5;
        const text = `${entry.numbering} ${entry.title}`;
        const truncated = text.length > 70 ? text.substring(0, 67) + '...' : text;
        pdf.text(truncated, 20 + indent, y);
        y += 6;

        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });

      pdf.addPage();
    }

    console.log('[PDF Export] Rendering content...');

    // Render content
    if (fullStructure.children) {
      for (const child of fullStructure.children) {
        await renderPDFContent(pdf, child, { includeSymlinks });
      }
    } else {
      await renderPDFContent(pdf, fullStructure, { includeSymlinks });
    }

    // Save PDF
    const timestamp = Date.now();
    const filename = branchRootId && data.nodes[branchRootId]
      ? `${data.nodes[branchRootId].title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`
      : `deepmemo-export-${timestamp}.pdf`;

    pdf.save(filename);

    console.log(`[PDF Export] PDF file exported: ${filename}`);
    showToast(
      branchRootId ? t('toast.pdfBranchExported') : t('toast.pdfExported') || 'PDF exporté avec succès',
      'success'
    );
  } catch (error) {
    console.error('[PDF Export] Failed:', error);
    alert(`PDF export failed: ${error.message}`);
  }
}
