import { createServer } from 'node:http';
import { parse } from 'node:url';
import { PriceService } from './src/priceService.js';
import { BasketService } from './src/basketService.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const priceService = new PriceService(fetch);
const basketService = new BasketService(priceService);

const sendJson = (res, statusCode, data) => {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(payload);
};

const sendStatic = async (res, filePath, contentType = 'text/html') => {
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404);
    res.end('Not found');
  }
};

const router = async (req, res) => {
  const { pathname, query } = parse(req.url, true);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (pathname === '/api/quotes' && req.method === 'GET') {
    const symbolsParam = query.symbols;
    if (!symbolsParam) {
      sendJson(res, 400, { error: 'symbols query parameter is required' });
      return;
    }
    const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean);
    if (!symbols.length) {
      sendJson(res, 400, { error: 'No valid symbols provided' });
      return;
    }
    try {
      const quotes = await priceService.getQuotes(symbols);
      sendJson(res, 200, { quotes });
    } catch (err) {
      sendJson(res, 502, { error: err.message || 'Unable to fetch quotes' });
    }
    return;
  }

  if (pathname === '/api/basket' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const { basket, contribution } = parsed;
        if (!Array.isArray(basket) || !basket.length) {
          sendJson(res, 400, { error: 'basket must be a non-empty array' });
          return;
        }
        const breakdown = await basketService.buildAllocation(basket, contribution ?? 0);
        sendJson(res, 200, breakdown);
      } catch (err) {
        sendJson(res, 400, { error: 'Invalid JSON body' });
      }
    });
    return;
  }

  if (pathname === '/script.js') {
    await sendStatic(res, path.join(__dirname, 'script.js'), 'application/javascript');
    return;
  }
  if (pathname === '/styles.css') {
    await sendStatic(res, path.join(__dirname, 'styles.css'), 'text/css');
    return;
  }
  if (pathname === '/' || pathname === '/index.html') {
    await sendStatic(res, path.join(__dirname, 'index.html'));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
};

// Export a handler for serverless platforms like Vercel
export default function handler(req, res) {
  router(req, res);
}

// Only start a long-lived server when running locally
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  createServer(handler).listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
