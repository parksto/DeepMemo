const fs = require("fs");
const { marked } = require("marked");
const puppeteer = require("puppeteer");
const yauzl = require("yauzl");

const escapeHtml = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function renderAndShiftToDiv(markdown, shift = 0) {
  const html = marked.parse(markdown);
  return html.replace(/<h([1-6])>(.*?)<\/h\1>/gi, (match, level, content) => {
    const newLevel = parseInt(level, 10) + shift;
    return `<div class="heading-${newLevel}">${content}</div>`;
  });
}

function buildHTML(node, nodesMap, depth, tocEntries) {
  const anchor = node.id;
  tocEntries.push({ level: depth, title: node.title, id: anchor });

  let displayTitle = node.title;
  let displayContent = node.content || "";

  if (node.type === "symlink" && node.targetId && nodesMap[node.targetId]) {
    const target = nodesMap[node.targetId];
    displayContent = target.content || displayContent;
  }

  let html = `<div class="node-wrapper">
    <h${depth + 1} id="${anchor}">${escapeHtml(displayTitle)}</h${depth + 1}>
    ${renderAndShiftToDiv(displayContent, depth + 1)}
  </div>`;

  if (node.children && node.children.length > 0) {
    node.children.forEach((childId) => {
      const childNode = nodesMap[childId];
      if (childNode) {
        html += buildHTML(childNode, nodesMap, depth + 1, tocEntries);
      } else {
        console.warn(`Enfant introuvable : ${childId}`);
      }
    });
  }

  return html;
}

/**
 * Read data.json and attachments from a .dm archive (ZIP file)
 * Returns { data, attachments }
 */
async function readDataFromDM(filepath) {
  return new Promise((resolve, reject) => {
    yauzl.open(filepath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      let dataJsonContent = '';
      const attachments = {}; // Map: attachmentId -> Buffer

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (entry.fileName === 'data.json') {
          // Read data.json
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            readStream.on('data', (chunk) => {
              dataJsonContent += chunk.toString('utf8');
            });

            readStream.on('end', () => {
              zipfile.readEntry();
            });
          });
        } else if (entry.fileName.startsWith('attachments/')) {
          // Read attachment file
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            const chunks = [];
            readStream.on('data', (chunk) => {
              chunks.push(chunk);
            });

            readStream.on('end', () => {
              const buffer = Buffer.concat(chunks);
              // Extract attachment ID from filename: "attachments/attach_123_abc_file.png"
              const filename = entry.fileName.split('/')[1]; // "attach_123_abc_file.png"
              const attachId = filename.split('_').slice(0, 3).join('_'); // "attach_123_abc"
              attachments[attachId] = buffer;
              console.log(`[CLI] Loaded attachment: ${attachId} (${buffer.length} bytes)`);
              zipfile.readEntry();
            });
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on('end', () => {
        if (!dataJsonContent) {
          return reject(new Error('data.json not found in .dm archive'));
        }
        try {
          const data = JSON.parse(dataJsonContent);
          resolve({ data, attachments });
        } catch (parseErr) {
          reject(new Error(`Invalid JSON in data.json: ${parseErr.message}`));
        }
      });

      zipfile.on('error', reject);
    });
  });
}

/**
 * Process inline images in markdown content
 * Replaces ![alt](attachment:id) or ![alt](attach_id) with base64 data URLs
 */
function processInlineImages(content, nodeAttachments, attachmentsMap) {
  if (!content || !nodeAttachments || nodeAttachments.length === 0) {
    return content;
  }

  // Detect markdown image references: ![alt](ref) or ![alt](ref "title")
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let processedContent = content;

  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const alt = match[1];
    const ref = match[2];
    const fullMatch = match[0];

    // Strip "attachment:" prefix if present
    const attachmentId = ref.startsWith('attachment:')
      ? ref.substring('attachment:'.length)
      : ref;

    // Check if ref is an attachment ID
    const attachment = nodeAttachments.find(att => att.id === attachmentId);
    if (attachment && attachmentsMap[attachmentId]) {
      const buffer = attachmentsMap[attachmentId];
      const base64 = buffer.toString('base64');
      const mimeType = attachment.type || 'application/octet-stream';
      const dataUrl = `data:${mimeType};base64,${base64}`;

      processedContent = processedContent.replace(fullMatch, `![${alt}](${dataUrl})`);
      console.log(`[CLI] ✓ Converted inline image: ${attachment.name} (${attachment.type})`);
    }
  }

  return processedContent;
}

function generateTOC(tocEntries) {
  let toc = '<h1>Table des matières</h1>';
  toc += '<ul class="toc">';
  tocEntries.forEach((entry) => {
    const indent = "&nbsp;&nbsp;".repeat(entry.level * 2);
    toc += `<li class="toc-entry">${indent}${escapeHtml(entry.title)}</li>`;
  });
  return toc + "</ul>";
}

async function generatePDF(inputFile, outputFile) {
  // Detect file type by extension or magic number
  let data, attachments = {};
  const isDM = inputFile.endsWith('.dm') || inputFile.endsWith('.zip');

  if (isDM) {
    console.log('Detected .dm archive, extracting data.json and attachments...');
    const result = await readDataFromDM(inputFile);
    data = result.data;
    attachments = result.attachments;
  } else {
    // Assume JSON file (no attachments)
    data = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  }

  // Support both global and branch exports
  let nodes, rootId;

  if (data.type === "deepmemo-branch") {
    // Branch export
    console.log('Detected branch export');
    nodes = data.nodes;
    rootId = data.branchRootId;
  } else if (data.rootNodes && data.nodes) {
    // Global export - use first root node
    console.log('Detected global export, using first root node');
    nodes = data.nodes;
    rootId = data.rootNodes[0];
    if (!rootId) {
      throw new Error("No root nodes found in global export");
    }
  } else {
    throw new Error("Unrecognized data format. Expected branch export or global export.");
  }

  const rootNode = nodes[rootId];
  if (!rootNode) throw new Error(`Root node ${rootId} not found`);

  // Process inline images in all nodes
  if (Object.keys(attachments).length > 0) {
    console.log(`[CLI] Processing inline images in ${Object.keys(nodes).length} nodes...`);
    for (const [nodeId, node] of Object.entries(nodes)) {
      if (node.content && node.attachments && node.attachments.length > 0) {
        node.content = processInlineImages(node.content, node.attachments, attachments);
      }
    }
  }

  const tocEntries = [];
  const bodyHTML = buildHTML(rootNode, nodes, 0, tocEntries);
  const tocHTML = generateTOC(tocEntries);

  const fullHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(rootNode.title)}</title>
  <style>
    @page { margin: 1.5cm; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; 
      line-height: normal; 
      color: #333; 
    }
    h1, h2, h3, h4, h5, h6 { color: #2c3e50; page-break-after: avoid; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.7em; }
    h3 { font-size: 1.4em; }
    .heading-1 { font-size: 2.0em; font-weight: bold; margin: 1.2em 0 0.8em; color: #2c3e50; }
    .heading-2 { font-size: 1.7em; font-weight: bold; margin: 1.1em 0 0.7em; color: #2c3e50; }
    .heading-3 { font-size: 1.4em; font-weight: bold; margin: 1.0em 0 0.6em; color: #34495e; }
    .heading-4 { font-size: 1.2em; font-weight: bold; margin: 0.9em 0 0.5em; color: #34495e; }
    .heading-5 { font-size: 1.1em; font-weight: bold; margin: 0.8em 0 0.4em; color: #34495e; }
    .heading-6 { font-size: 1.0em; font-weight: bold; margin: 0.7em 0 0.3em; color: #34495e; }
    .node-wrapper { page-break-after: always; }  /* Force page break after each node */
    ul.toc { list-style: none; padding-left: 0; }
    ul.toc li { margin: 0.5em 0; line-height: 1.4; }
    .toc { page-break-after: always; }
    img { max-width: 100%; height: auto; }
    .toc { page-break-after: always; }
    hr { border: 0; border-top: 1px solid #eee; margin: 1em 0; }
  </style>
</head>
<body>
  ${tocHTML}
  ${bodyHTML}
</body>
</html>`;

  fs.writeFileSync("debug.html", fullHTML);

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

  await browser.close();
  console.log(`✅ PDF généré : ${outputFile}`);
}

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error("Usage: node branch2pdf.js <input> <output.pdf>");
  console.error("");
  console.error("  <input>  : .dm archive (ZIP) or .json file (branch export)");
  console.error("  <output> : Output PDF file");
  console.error("");
  console.error("Examples:");
  console.error("  node branch2pdf.js export.dm output.pdf");
  console.error("  node branch2pdf.js branch.json output.pdf");
  process.exit(1);
}

generatePDF(input, output).catch(console.error);
