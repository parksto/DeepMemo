/**
 * CloudFlare Worker for PDF generation
 * Uses @cloudflare/puppeteer + Browser Rendering API
 *
 * Rate limiting: 5 PDFs/hour, 20/day per hashed IP (SHA-256)
 * Privacy: Only IP hash stored, 24h TTL, no document data saved
 */

import puppeteer from '@cloudflare/puppeteer';
import { marked } from 'marked';

/**
 * Hash IP address for privacy-friendly rate limiting
 */
async function hashIP(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check and update rate limits
 */
async function checkRateLimit(env, ipHash) {
  const now = Date.now();
  const hourKey = `rate:${ipHash}:${Math.floor(now / 3600000)}`;
  const dayKey = `rate:${ipHash}:${Math.floor(now / 86400000)}`;

  const [hourCount, dayCount] = await Promise.all([
    env.RATE_LIMIT.get(hourKey),
    env.RATE_LIMIT.get(dayKey)
  ]);

  const hourRequests = parseInt(hourCount || '0');
  const dayRequests = parseInt(dayCount || '0');

  if (hourRequests >= 5) {
    return { allowed: false, reason: 'hour', remaining: 5 - hourRequests };
  }
  if (dayRequests >= 20) {
    return { allowed: false, reason: 'day', remaining: 20 - dayRequests };
  }

  // Increment counters with automatic TTL
  await Promise.all([
    env.RATE_LIMIT.put(hourKey, (hourRequests + 1).toString(), {
      expirationTtl: 3600  // 1 hour
    }),
    env.RATE_LIMIT.put(dayKey, (dayRequests + 1).toString(), {
      expirationTtl: 86400  // 24 hours
    })
  ]);

  return {
    allowed: true,
    hourRemaining: 5 - hourRequests - 1,
    dayRemaining: 20 - dayRequests - 1
  };
}

// ===== PDF Generation Logic (from bin/branch2pdf.js) =====

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

  // Handle symlinks (directive @parent:content)
  if (displayContent.trim().startsWith('@parent:')) {
    const directive = displayContent.trim();
    const match = directive.match(/@parent:(\w+)/);
    if (match) {
      const field = match[1];
      // Find parent by looking at structural links (ratio 1.0)
      // For now, simplified: assume parent info is available
      // TODO: Handle symlink content resolution if needed
    }
  }

  let html = `<div class="node-wrapper">
    <h${depth + 1} id="${anchor}">${escapeHtml(displayTitle)}</h${depth + 1}>
    ${renderAndShiftToDiv(displayContent, depth + 1)}
  </div>`;

  // Recurse through children
  if (node.children && node.children.length > 0) {
    node.children.forEach((childId) => {
      const childNode = nodesMap[childId];
      if (childNode) {
        html += buildHTML(childNode, nodesMap, depth + 1, tocEntries);
      }
    });
  }

  return html;
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

const darkThemeCSS = `
  @page { margin: 1.5cm; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    line-height: normal;
    color: #333;
    background: #fff;
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
  .node-wrapper { page-break-after: always; }
  ul.toc { list-style: none; padding-left: 0; }
  ul.toc li { margin: 0.5em 0; line-height: 1.4; }
  .toc { page-break-after: always; }
  img { max-width: 100%; height: auto; }
  .toc { page-break-after: always; }
  hr { border: 0; border-top: 1px solid #eee; margin: 1em 0; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
  pre { background: #f4f4f4; padding: 12px; border-radius: 5px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #2c3e50; margin: 1em 0; padding-left: 1em; color: #666; font-style: italic; }
`;

/**
 * Generate PDF from nodes data
 */
async function generatePDF(env, nodes, rootId) {
  const rootNode = nodes[rootId];
  if (!rootNode) {
    throw new Error(`Root node ${rootId} not found`);
  }

  // Build HTML content
  const tocEntries = [];
  const bodyHTML = buildHTML(rootNode, nodes, 0, tocEntries);
  const tocHTML = generateTOC(tocEntries);

  const fullHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(rootNode.title)}</title>
  <style>${darkThemeCSS}</style>
</head>
<body>
  ${tocHTML}
  ${bodyHTML}
</body>
</html>`;

  // Launch browser and generate PDF
  const browser = await puppeteer.launch(env.BROWSER);
  const page = await browser.newPage();

  await page.setContent(fullHTML, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
  });

  await browser.close();

  return pdf;
}

// ===== Worker Handler =====

export default {
  async fetch(request, env) {
    // CORS headers for development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Expose-Headers': 'X-RateLimit-Remaining-Hour, X-RateLimit-Remaining-Day',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Check referer to prevent abuse from clones
    const referer = request.headers.get('Referer') || request.headers.get('Origin') || '';
    const allowedOrigins = [
      'http://localhost',
      'http://127.0.0.1',
      'https://deepmemo.org',
      'https://deepmemo.ydns.eu' // Dev staging
    ];

    const isAllowed = allowedOrigins.some(origin => referer.startsWith(origin));
    if (!isAllowed && referer) {
      console.warn('[Worker] Blocked request from unauthorized origin:', referer);
      return new Response(JSON.stringify({
        error: 'Unauthorized origin. Please use the official DeepMemo instance or deploy your own Worker.'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    try {
      // Get and hash IP
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const ipHash = await hashIP(ip);

      // Check rate limit
      const rateLimit = await checkRateLimit(env, ipHash);
      if (!rateLimit.allowed) {
        const message = rateLimit.reason === 'hour'
          ? 'Limite atteinte : 5 PDFs par heure maximum'
          : 'Limite atteinte : 20 PDFs par jour maximum';

        return new Response(JSON.stringify({ error: message }), {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining-Hour': '0',
            'X-RateLimit-Remaining-Day': '0',
          }
        });
      }

      // Parse request
      const { nodes, rootId } = await request.json();

      if (!nodes || !rootId) {
        return new Response('Missing required fields: nodes, rootId', {
          status: 400,
          headers: corsHeaders
        });
      }

      // Generate PDF
      const pdfBuffer = await generatePDF(env, nodes, rootId);
      const node = nodes[rootId];
      const filename = `${node.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

      return new Response(pdfBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-RateLimit-Remaining-Hour': rateLimit.hourRemaining.toString(),
          'X-RateLimit-Remaining-Day': rateLimit.dayRemaining.toString(),
        }
      });

    } catch (error) {
      console.error('[Worker] PDF generation error:', error);
      return new Response(JSON.stringify({
        error: 'PDF generation failed',
        details: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
