const fs = require("fs");
const { marked } = require("marked");
const puppeteer = require("puppeteer");

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

function generateTOC(tocEntries) {
  let toc = '<h1>Table des matières</h1><ul class="toc">';
  tocEntries.forEach((entry) => {
    const indent = "&nbsp;&nbsp;".repeat(entry.level * 2);
    toc += `<li>${indent}<a href="#${entry.id}">${escapeHtml(entry.title)}</a></li>`;
  });
  return toc + "</ul>";
}

async function generatePDF(inputFile, outputFile) {
  const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  if (data.type !== "deepmemo-branch") {
    throw new Error("Fichier JSON non reconnu (doit être un deepmemo-branch)");
  }

  const nodes = data.nodes;
  const rootId = data.branchRootId;
  const rootNode = nodes[rootId];

  if (!rootNode) throw new Error(`Root ${rootId} introuvable`);

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
      line-height: 1.6; 
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
    ul.toc li { margin: 0.4em 0; }
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
  console.error("Usage: node branch2pdf.js data.json output.pdf");
  process.exit(1);
}

generatePDF(input, output).catch(console.error);
