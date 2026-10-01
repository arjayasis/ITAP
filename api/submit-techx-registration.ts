import type { VercelRequest, VercelResponse } from '@vercel/node';

const OFFICIAL_STUDENT_WEBHOOK_URL = 
  'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

    if (formData?.webhookUrl && (formData.webhookUrl.includes('/macros/library/d/') || formData.webhookUrl.includes('/library/d/'))) {
      return response.status(400).json({
        error: 'Google Apps Script Library URL provided instead of a Web App webhook URL. Deploy the script as a Web App (ending in /exec) with "Who has access" set to "Anyone".',
        isLibraryLink: true
      });
    }

    let webhookUrl = OFFICIAL_STUDENT_WEBHOOK_URL;
    const customUrl = (formData?.webhookUrl && formData.webhookUrl !== OFFICIAL_STUDENT_WEBHOOK_URL ? formData.webhookUrl : null) ||
                      process.env.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL ||
                      process.env.GOOGLE_SHEETS_STUDENT_WEBHOOK_URL;

    if (customUrl && 
        customUrl.startsWith('https://script.google.com/macros/s/') && 
        !customUrl.includes('AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA') && 
        !customUrl.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') && 
        !customUrl.includes('AKfycbz7oOcamc48Hpcq4oF272ODDILWXWC0T0RUi3teB75mQEnPGA4qaFdUG4lFQfMKm3A') && 
        !customUrl.endsWith('/dev')) {
      webhookUrl = customUrl;
    }

    // Convert payload to URLSearchParams for Google Apps Script Web App
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData || {})) {
      if (key === 'webhookUrl' || key === 'isTestPing') continue;
      params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }

    const googleResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow'
    });

    const result = await googleResponse.text();

    if (googleResponse.ok) {
      return response.status(200).json({ success: true, message: result });
    } else {
      const isForbidden = googleResponse.status === 403 || result.includes('You need access') || result.includes('permission');
      console.error(`Google Sheets response error (${googleResponse.status}):`, result.slice(0, 200));
      return response.status(googleResponse.status).json({ 
        error: isForbidden 
          ? 'Google Apps Script Permission Error (403): The Web App deployment requires permission. In Google Apps Script, click Deploy > Manage deployments > Edit > set "Who has access" to "Anyone".'
          : 'Failed to submit to Google Sheets', 
        status: googleResponse.status,
        scriptEditorUrl: 'https://script.google.com/d/1OjC8o0NwaL92ACOeef_bOH_if5JbNkW8skxJPhzxYAw2zLLolM_2yu5Q/edit',
        details: result 
      });
    }
  } catch (error: any) {
    console.error('Submission proxy error:', error);
    return response.status(500).json({ error: error.message || 'Internal server error' });
  }
}
