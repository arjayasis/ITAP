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
                  const NEW_TECHX_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec';
                  const isTechX = data?.source === 'GMM@TechXSummit2026' || (typeof data?.event === 'string' && data.event.includes('Tech'));
                  let techxUrl = process.env.GOOGLE_SHEETS_TECHX_WEBHOOK_URL || env.GOOGLE_SHEETS_TECHX_WEBHOOK_URL;
                  if (!techxUrl || techxUrl.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') || techxUrl.endsWith('/dev')) {
                    techxUrl = NEW_TECHX_WEBHOOK_URL;
                  }
                  const defaultUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

                  let webhookUrl = (isTechX && techxUrl) ? techxUrl : (techxUrl || defaultUrl);
                  if (webhookUrl && webhookUrl.endsWith('/dev')) {
                    webhookUrl = webhookUrl.replace(/\/dev$/, '/exec');
                  }
                  
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

                  // Map companion data for columns H, I, J compatibility
                  if (data && data.hasCompanion !== undefined) {
                    const isComp = (data.hasCompanion === 'yes' || data.hasCompanion === 'Yes' || data.hasCompanion === true || data.hasCompanion === 'true');
                    data.hasCompanion = isComp ? 'Yes' : 'No';
                    data.event = isComp ? 'Yes' : 'No';
                    data.eventName = isComp ? 'Yes' : 'No';
                    data.venue = isComp ? (data.companionName || 'N/A') : 'None';
                    data.source = isComp ? (data.companionDesignation || data.companionTitle || 'N/A') : 'None';
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
      'import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL': JSON.stringify(
        process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
        process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
        env.GOOGLE_SHEETS_WEBHOOK_URL ||
        env.VITE_GOOGLE_SHEETS_WEBHOOK_URL ||
        ''
      ),
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
