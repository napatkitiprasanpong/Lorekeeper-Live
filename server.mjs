import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const requested = pathname === '/' ? '/index.html' : pathname;
    const file = resolve(root, `.${requested}`);
    const relativePath = relative(root, file);
    if (relativePath.startsWith('..')) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const contents = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(contents);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(8000, '127.0.0.1', () => {
  process.stdout.write('Lorekeeper Live: http://localhost:8000\n');
});
