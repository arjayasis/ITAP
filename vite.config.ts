import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-mock',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/submit-rsvp' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const webhookUrl = process.env.GOOGLE_SHEETS_TECHX_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;
                  
                  if (!webhookUrl) {
                    console.log('ℹ️ [Dev Mock API] RSVP Received:', data);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      success: true, 
                      simulated: true, 
                      message: 'RSVP recorded in preview mode (Set GOOGLE_SHEETS_WEBHOOK_URL to sync to live Google Sheet)' 
                    }));
                    return;
                  }

                  const params = new URLSearchParams();
                  for (const [key, value] of Object.entries(data)) {
                    params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
                  }

                  const googleResponse = await fetch(webhookUrl, {
                    method: 'POST',
                    body: params,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                  });

                  const result = await googleResponse.text();
                  res.statusCode = googleResponse.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: googleResponse.ok, message: result }));
                } catch (error: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: error.message }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
