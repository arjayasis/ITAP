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
            // Diagnostic connection test endpoint
            if (req.url === '/api/test-sheets-connection' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const targetUrl = data.webhookUrl || 'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec';
                  
                  // Detect Library URLs
                  if (targetUrl.includes('/macros/library/d/') || targetUrl.includes('/library/d/')) {
                    const match = targetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
                    const scriptId = match ? match[1] : '';
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      ok: false,
                      status: 302,
                      isLibraryLink: true,
                      scriptId,
                      scriptEditorUrl: scriptId ? `https://script.google.com/d/${scriptId}/edit` : 'https://script.google.com',
                      message: 'Google Apps Script Library link detected. Webhooks require a Web App URL ending in /exec.',
                      details: 'A Library URL cannot receive form submissions. Open your script editor, click Deploy > New deployment > Web app > set "Who has access" to "Anyone" > Copy the Web app URL ending in /exec.'
                    }));
                    return;
                  }

                  const startTime = Date.now();
                  const testRes = await fetch(targetUrl, {
                    method: 'GET',
                    redirect: 'follow'
                  });
                  const latencyMs = Date.now() - startTime;
                  const responseText = await testRes.text();
                  const isRedirectedToLogin = testRes.url.includes('accounts.google.com') || testRes.url.includes('ServiceLogin');
                  const isForbidden = testRes.status === 403 || 
                                      isRedirectedToLogin || 
                                      responseText.includes('You need access') || 
                                      responseText.includes('permission');
                  
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    ok: testRes.ok && !isRedirectedToLogin,
                    status: isRedirectedToLogin ? 401 : testRes.status,
                    latencyMs,
                    isForbidden,
                    isLoginRequired: isRedirectedToLogin,
                    message: (testRes.ok && !isRedirectedToLogin)
                      ? `Google Sheets Webhook connected successfully (${latencyMs}ms)`
                      : isForbidden
                        ? 'Google Apps Script Permission Denied (403): In Apps Script, set "Who has access" to "Anyone" so submissions can be recorded.'
                        : `Google Sheets returned HTTP ${testRes.status}`,
                    details: responseText.slice(0, 300)
                  }));
                } catch (err: any) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    ok: false,
                    error: err.message,
                    message: 'Network or fetch error: ' + err.message
                  }));
                }
              });
              return;
            }

            // Registration & RSVP submission endpoints
            if ((req.url === '/api/submit-rsvp' || req.url === '/api/submit-techx-registration') && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body || '{}');
                  const DEFAULT_RSVP_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec';
                  const DEFAULT_STUDENT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec';

                  const isStudent = req.url === '/api/submit-techx-registration' ||
                                    data?.attendeeType === 'student' || 
                                    !!data?.studentNumber ||
                                    !!data?.course;

                  let webhookUrl = '';
                  if (isStudent) {
                    let studentCandidate = process.env.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                                           env.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                                           process.env.GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                                           env.GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                                           (data?.webhookUrl && data.webhookUrl !== DEFAULT_RSVP_WEBHOOK_URL ? data.webhookUrl : null) ||
                                           DEFAULT_STUDENT_WEBHOOK_URL;
                    if (studentCandidate.includes('AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA') ||
                        studentCandidate.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') ||
                        studentCandidate.endsWith('/dev')) {
                      studentCandidate = DEFAULT_STUDENT_WEBHOOK_URL;
                    }
                    webhookUrl = studentCandidate;
                  } else {
                    let rsvpCandidate = process.env.VITE_GMM_RSVP_WEBHOOK_URL ||
                                        env.VITE_GMM_RSVP_WEBHOOK_URL ||
                                        DEFAULT_RSVP_WEBHOOK_URL;
                    if (!rsvpCandidate || 
                        rsvpCandidate.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') || 
                        rsvpCandidate.includes('AKfycbz7oOcamc48Hpcq4oF272ODDILWXWC0T0RUi3teB75mQEnPGA4qaFdUG4lFQfMKm3A') || 
                        rsvpCandidate.includes('BuZl4AvukO5') || 
                        rsvpCandidate.endsWith('/dev')) {
                      rsvpCandidate = DEFAULT_RSVP_WEBHOOK_URL;
                    }
                    webhookUrl = rsvpCandidate;
                  }

                  if (webhookUrl && webhookUrl.endsWith('/dev')) {
                    webhookUrl = webhookUrl.replace(/\/dev$/, '/exec');
                  }

                  // Map companion data for GMM RSVP
                  if (data && !isStudent) {
                    const isComp = (data.hasCompanion === 'yes' || data.hasCompanion === 'Yes' || data.hasCompanion === true || data.hasCompanion === 'true');
                    data.hasCompanion = isComp ? 'Yes' : 'No';
                    data.companionName = isComp ? (data.companionName || 'N/A') : 'None';
                    data.companionDesignation = isComp ? (data.companionDesignation || data.companionTitle || 'N/A') : 'None';
                    data.companionTitle = data.companionDesignation;

                    // Legacy columns H, I, J compatibility
                    data.event = isComp ? 'Yes' : 'No';
                    data.eventName = isComp ? 'Yes' : 'No';
                    data.venue = isComp ? data.companionName : 'None';
                    data.source = isComp ? data.companionDesignation : 'None';

                    // Alternate field names for maximum sheet compatibility
                    data.company = data.companyName || data.company || 'N/A';
                    data.organization = data.companyName || data.organization || 'N/A';
                    data.name = data.fullName || data.name || 'N/A';
                    data.position = data.jobTitle || data.position || 'N/A';
                    data.title = data.jobTitle || data.title || 'N/A';
                    data.mobileNumber = data.mobile || data.mobileNumber || data.phone || 'N/A';
                    data.phone = data.mobileNumber;
                    data.workEmail = data.email || data.workEmail || 'N/A';
                    data.attendance = 'yes';
                  }

                  const params = new URLSearchParams();
                  for (const [key, value] of Object.entries(data)) {
                    if (key === 'webhookUrl' || key === 'isTestPing') continue;
                    params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
                  }

                  const googleResponse = await fetch(webhookUrl, {
                    method: 'POST',
                    body: params,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    redirect: 'follow'
                  });

                  const result = await googleResponse.text();
                  res.statusCode = googleResponse.status;
                  res.setHeader('Content-Type', 'application/json');

                  if (googleResponse.ok) {
                    res.end(JSON.stringify({ success: true, message: result }));
                  } else {
                    const isForbidden = googleResponse.status === 403 || result.includes('You need access') || result.includes('permission');
                    res.end(JSON.stringify({ 
                      success: false, 
                      status: googleResponse.status,
                      scriptEditorUrl: 'https://script.google.com/d/1OjC8o0NwaL92ACOeef_bOH_if5JbNkW8skxJPhzxYAw2zLLolM_2yu5Q/edit',
                      error: isForbidden 
                        ? 'Google Apps Script Permission Error (403): Web App deployment needs "Who has access" set to "Anyone".' 
                        : 'Google Sheets returned an error',
                      details: result 
                    }));
                  }
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
      'import.meta.env.VITE_GMM_RSVP_WEBHOOK_URL': JSON.stringify(
        'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec'
      ),
      'process.env.VITE_GMM_RSVP_WEBHOOK_URL': JSON.stringify(
        'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec'
      ),
      'import.meta.env.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL': JSON.stringify(
        'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec'
      ),
      'process.env.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL': JSON.stringify(
        'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec'
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
