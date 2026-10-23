/**
 * CloudFlare Worker for PDF generation
 * Uses @cloudflare/puppeteer + Browser Rendering API
 *
 * Rate limiting: 5 PDFs/hour, 20/day per hashed IP (SHA-256)
 * Privacy: Only IP hash stored, 24h TTL, no document data saved
 * Stats: one Analytics Engine data point per request, stored in Analytics Engine, viewable at /stats?key=STATS_KEY
 */

import puppeteer from '@cloudflare/puppeteer';
import { marked } from 'marked';

/**
 * Sanitize a string for use as a filename
 * Unified version matching helpers.js implementation
 * @param {string} text - Text to sanitize
 * @param {Object|number} options - Options object or maxLength
 * @param {number} options.maxLength - Maximum length (default: 50)
 * @param {boolean} options.preserveSpaces - Keep spaces for filesystem (default: false)
 * @returns {string} Sanitized filename-safe string
 */
function sanitizeFilename(text, options = {}) {
  // Backwards compatibility: if options is a number, treat it as maxLength
  if (typeof options === 'number') {
    options = { maxLength: options };
  }

  const { maxLength = 50, preserveSpaces = false } = options;

  if (!text || typeof text !== 'string') {
    return 'Untitled';
  }

  let result = text;
  result = result.replace(/\s+/g, ' ');

  if (preserveSpaces) {
    // Filesystem mode: only replace forbidden characters
    result = result.replace(/[/:*?"<>|]/g, '_');
    result = result.replace(/^\.+/, '_');
  } else {
    // Export mode: convert to web-friendly format
    result = result.replace(/\s*-\s*/g, '-');
    result = result.replace(/[^a-z0-9-]/gi, '-');
    result = result.replace(/-+/g, '-');
    result = result.replace(/^-+|-+$/g, '');
  }

  result = result.substring(0, maxLength).trim();

  if (!preserveSpaces) {
    result = result.replace(/-+$/, '');
  }

  return result || 'Untitled';
}

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

// ===== Usage stats (private, Workers Analytics Engine) =====

const STATS_DATASET = 'deepmemo_pdf';
const STAT_KINDS = ['pdfs', 'origin', 'rate', 'bad', 'error', 'method'];

/**
 * Count pages of a PDF buffer (objects "/Type /Page", not "/Type /Pages")
 */
function countPdfPages(pdfBuffer) {
  const bytes = new Uint8Array(pdfBuffer);
  const head = String.fromCharCode(...bytes.subarray(0, 5));
  if (!head.startsWith('%PDF-')) return 0;
  const text = new TextDecoder('latin1').decode(bytes);
  return (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
}

/**
 * Record one request (non-blocking, never throws).
 * kind: 'pdfs' (valid PDF, with its page count) or a rejection reason.
 * No IP is stored: only the kind, country and a truncated user-agent.
 */
function recordStat(env, request, kind, pages = 0) {
  try {
    env.STATS.writeDataPoint({
      indexes: [kind],
      blobs: [kind, request.cf?.country || '', (request.headers.get('User-Agent') || '').slice(0, 100)],
      doubles: [pages]
    });
  } catch (e) {
    console.error('[Worker] Stats error:', e);
  }
}

/**
 * Constant-time string comparison
 */
function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x[i] || 0) ^ (y[i] || 0);
  }
  return diff === 0;
}

/**
 * Run a SQL query against the Analytics Engine API
 */
async function queryStats(env, sql) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`,
    { method: 'POST', headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` }, body: sql }
  );
  if (!response.ok) {
    throw new Error(`Analytics SQL ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  return (await response.json()).data;
}

/**
 * Render the stats page (404 if STATS_KEY is unset or wrong)
 */
async function handleStats(request, env) {
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!env.STATS_KEY || !safeEqual(key, env.STATS_KEY)) {
    return new Response('Not found', { status: 404 });
  }

  let body;
  try {
    const [daily, agents] = await Promise.all([
      queryStats(env, `SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, blob1 AS kind,
        sum(_sample_interval) AS n, sum(double1 * _sample_interval) AS pages
        FROM ${STATS_DATASET} WHERE timestamp > NOW() - INTERVAL '90' DAY GROUP BY day, kind`),
      queryStats(env, `SELECT blob3 AS ua, blob1 AS kind, sum(_sample_interval) AS n
        FROM ${STATS_DATASET} WHERE timestamp > NOW() - INTERVAL '30' DAY GROUP BY ua, kind`)
    ]);
    body = renderStats(daily, agents);
  } catch (error) {
    console.error('[Worker] Stats query error:', error);
    body = '<p>Stats indisponibles (voir <code>wrangler tail</code>). Vérifier les secrets CF_ACCOUNT_ID et CF_API_TOKEN.</p>';
  }

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DeepMemo – Stats PDF</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2em auto; padding: 0 1em; color: #333; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 2em; }
  td, th { padding: 0.4em 0.5em; font-size: 0.9em; border-bottom: 1px solid #ddd; text-align: right; }
  th:first-child, td:first-child { text-align: left; word-break: break-all; }
  tfoot td { font-weight: bold; }
</style></head><body>${body}</body></html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex'
    }
  });
}

function renderStats(daily, agents) {
  const tr = (cells) => `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
  const num = (v) => Math.round(Number(v) || 0);

  // Daily table: one row per day, one column per kind (+ pages)
  const days = {};
  daily.forEach(({ day, kind, n, pages }) => {
    const d = days[day.slice(0, 10)] ||= { pages: 0 };
    d[kind] = num(n);
    d.pages += num(pages);
  });
  const rows = Object.entries(days).sort(([a], [b]) => b.localeCompare(a));
  const total = { pages: 0 };
  rows.forEach(([, d]) => {
    total.pages += d.pages;
    STAT_KINDS.forEach(k => { total[k] = (total[k] || 0) + (d[k] || 0); });
  });
  const dayCells = (label, d) => [label, d.pdfs || 0, d.pages, ...STAT_KINDS.slice(1).map(k => d[k] || 0)];

  // Top user-agents: valid PDFs vs rejected requests
  const byAgent = {};
  agents.forEach(({ ua, kind, n }) => {
    const a = byAgent[ua] ||= { ok: 0, ko: 0 };
    a[kind === 'pdfs' ? 'ok' : 'ko'] += num(n);
  });
  const topAgents = Object.entries(byAgent)
    .sort(([, a], [, b]) => (b.ok + b.ko) - (a.ok + a.ko)).slice(0, 10);

  return `<h1>Usage PDF</h1>
<div style="overflow-x:auto"><table>
  <thead><tr><th>Jour (UTC)</th><th>PDF</th><th>Pages</th><th title="403">Origine</th><th title="429">Limite</th><th title="400">Invalide</th><th title="500">Erreur</th><th title="405">Méthode</th></tr></thead>
  <tbody>${rows.map(([day, d]) => tr(dayCells(day, d))).join('')}</tbody>
  <tfoot>${tr(dayCells('Total (90 j)', total))}</tfoot>
</table></div>
<h2>User-agents (30 j)</h2>
<div style="overflow-x:auto"><table>
  <thead><tr><th>User-agent</th><th>PDF valides</th><th>Refusés</th></tr></thead>
  <tbody>${topAgents.map(([ua, a]) => tr([escapeHtml(ua || '(vide)'), a.ok, a.ko])).join('')}</tbody>
</table></div>`;
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
    if (request.method === 'GET' && new URL(request.url).pathname === '/stats') {
      return handleStats(request, env);
    }

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
      recordStat(env, request, 'method');
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
      recordStat(env, request, 'origin');
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
        recordStat(env, request, 'rate');
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
        recordStat(env, request, 'bad');
        return new Response('Missing required fields: nodes, rootId', {
          status: 400,
          headers: corsHeaders
        });
      }

      // Generate PDF
      const pdfBuffer = await generatePDF(env, nodes, rootId);
      const node = nodes[rootId];
      const filename = `${sanitizeFilename(node.title)}.pdf`;

      // Count only valid PDFs
      const pages = countPdfPages(pdfBuffer);
      if (pages > 0) {
        recordStat(env, request, 'pdfs', pages);
      }

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
      // Malformed JSON body is a client error, anything else a generation failure
      recordStat(env, request, error instanceof SyntaxError ? 'bad' : 'error');
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
