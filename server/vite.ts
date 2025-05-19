
import { Express } from 'express';
import { createServer } from 'vite';

export const log = (message: string) => {
  console.log(`[server] ${message}`);
};

export async function setupVite(app: Express) {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  app.use('/assets', express.static('dist/public/assets'));
  app.get('*', (_req, res) => {
    res.sendFile('dist/public/index.html', { root: '.' });
  });
}
