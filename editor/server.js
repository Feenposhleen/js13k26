const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 7362;
const HOST = 'localhost';
// Serve files from the `public` subfolder instead of the script's directory
const ROOT_DIR = path.join(__dirname, 'public');
const DRAWABLES_PATH = path.join(__dirname, '..', 'src', 'core', 'assets', 'drawables.gen.ts');
const AUDIO_PATH = path.join(__dirname, '..', 'src', 'core', 'assets', 'audio.gen.ts');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function safeJoin(base, target) {
  const resolved = path.resolve(base, '.' + path.sep + target);
  if (!resolved.startsWith(path.resolve(base))) {
    return null;
  }
  return resolved;
}

function send404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not found');
}

function send500(res, err) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Server error: ' + (err && err.message ? err.message : String(err)));
}

const OPEN_MARKER = '/*GEN*/';
const CLOSE_MARKER = '/*/GEN*/';

function findGenRegion(content) {
  const i = content.indexOf(OPEN_MARKER);
  if (i === -1) return null;
  const j = content.indexOf(CLOSE_MARKER, i + OPEN_MARKER.length);
  if (j === -1) return null;
  return {
    before: content.slice(0, i),
    inner: content.slice(i + OPEN_MARKER.length, j),
    after: content.slice(j + CLOSE_MARKER.length),
    startIdx: i,
    endIdx: j + CLOSE_MARKER.length
  };
}

function toObjectLiteral(obj) {
  if (obj === null) return 'null';
  if (typeof obj === 'string') {
    return `'${obj
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')}'`;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return `[${obj.map(toObjectLiteral).join(', ')}]`;
  }
  if (typeof obj === 'object') {
    return `{ ${Object.entries(obj)
      .map(([k, v]) => {
        // Use identifier if valid, otherwise quote key
        const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`;
        return `${key}: ${toObjectLiteral(v)}`;
      })
      .join(', ')} }`;
  }
  return 'undefined';
}

function handleGenFileGet(res, filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        send404(res);
      } else {
        send500(res, err);
      }
      return;
    }
    const region = findGenRegion(data);
    if (!region) {
      send404(res);
      return;
    }
    let parsedJson;
    try {
      const trimmed = region.inner.trim();
      const evaled = eval('(' + trimmed + ')');
      const json = JSON.stringify(evaled);
      parsedJson = trimmed === '' ? {} : JSON.parse(json);
    } catch (e) {
      send500(res, new Error('Invalid JSON inside GEN region: ' + e.message));
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(parsedJson, null, 2));
  });
}

function handleGenFilePost(req, res, filePath) {
  let size = 0;
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit
  const chunks = [];
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > MAX_SIZE) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Payload too large');
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8').trim();
    let obj;
    try {
      obj = body === '' ? {} : JSON.parse(body);
    } catch (e) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Invalid JSON: ' + e.message);
      return;
    }

    const innerLiteral = toObjectLiteral(obj);

    fs.mkdir(path.dirname(filePath), { recursive: true }, (mkErr) => {
      if (mkErr) {
        send500(res, mkErr);
        return;
      }

      fs.readFile(filePath, 'utf8', (rErr, data) => {
        let newContent;
        if (rErr) {
          if (rErr.code === 'ENOENT') {
            newContent = OPEN_MARKER + '\n' + innerLiteral + '\n' + CLOSE_MARKER + '\n';
          } else {
            send500(res, rErr);
            return;
          }
        } else {
          const region = findGenRegion(data);
          if (region) {
            newContent = region.before + OPEN_MARKER + innerLiteral + CLOSE_MARKER + region.after;
          } else {
            const sep = data.endsWith('\n') ? '' : '\n';
            newContent = data + sep + OPEN_MARKER + '\n' + innerLiteral + '\n' + CLOSE_MARKER + '\n';
          }
        }

        fs.writeFile(filePath, newContent, 'utf8', (wErr) => {
          if (wErr) {
            send500(res, wErr);
            return;
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, path: path.relative(process.cwd(), filePath) }));
        });
      });
    });
  });
  req.on('error', (err) => {
    send500(res, err);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '/';

  // GET /drawables
  if (req.method === 'GET' && (pathname === '/drawables' || pathname === '/drawables/')) {
    return handleGenFileGet(res, DRAWABLES_PATH);
  }

  // POST /drawables
  if (req.method === 'POST' && (pathname === '/drawables' || pathname === '/drawables/')) {
    return handleGenFilePost(req, res, DRAWABLES_PATH);
  }

  // GET /audio
  if (req.method === 'GET' && (pathname === '/audio' || pathname === '/audio/')) {
    return handleGenFileGet(res, AUDIO_PATH);
  }

  // POST /audio
  if (req.method === 'POST' && (pathname === '/audio' || pathname === '/audio/')) {
    return handleGenFilePost(req, res, AUDIO_PATH);
  }

  // Serve files and directory listing from the public subfolder
  const fsPath = safeJoin(ROOT_DIR, pathname);
  if (!fsPath) {
    send404(res);
    return;
  }

  fs.stat(fsPath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        send404(res);
      } else {
        send500(res, err);
      }
      return;
    }

    if (stats.isDirectory()) {
      // try to serve index.html if present
      const indexPath = path.join(fsPath, 'index.html');
      fs.stat(indexPath, (iErr, iStats) => {
        if (!iErr && iStats.isFile()) {
          // serve index.html
          res.statusCode = 200;
          res.setHeader('Content-Type', MIME['.html'] || 'text/html; charset=utf-8');
          fs.createReadStream(indexPath).pipe(res);
          return;
        }

        // directory listing
        fs.readdir(fsPath, { withFileTypes: true }, (rErr, entries) => {
          if (rErr) {
            send500(res, rErr);
            return;
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          const list = entries.map(e => {
            const name = e.name + (e.isDirectory() ? '/' : '');
            return name;
          }).join('\n');
          res.end(list);
        });
      });
      return;
    }

    if (stats.isFile()) {
      const ext = path.extname(fsPath).toLowerCase();
      const contentType = MIME[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      const stream = fs.createReadStream(fsPath);
      stream.on('error', (sErr) => send500(res, sErr));
      stream.pipe(res);
      return;
    }

    // not a file or directory
    send404(res);
  });
});

server.on('error', (err) => {
  console.error('Server error:', err && err.message ? err.message : String(err));
  process.exitCode = 1;
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : String(err));
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason && reason.stack ? reason.stack : String(reason));
});

server.listen(PORT, HOST, () => {
  console.log(`Editor hosted at http://${HOST}:${PORT}/`);
  console.log(`GET  /drawables -> reads ${DRAWABLES_PATH}`);
  console.log(`POST /drawables -> writes ${DRAWABLES_PATH}`);
  console.log(`GET  /audio     -> reads ${AUDIO_PATH}`);
  console.log(`POST /audio     -> writes ${AUDIO_PATH}`);
  console.log(`Serving files from ${ROOT_DIR}`);
});