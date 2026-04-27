import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL is not defined');
    return response.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const formData = request.body;
    
    // Convert the incoming body to URLSearchParams for Google Apps Script
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
      params.append(key, value as string);
    }

    const googleResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = await googleResponse.text();

    if (googleResponse.ok) {
      return response.status(200).json({ success: true, message: result });
    } else {
      console.error('Google Sheets error:', result);
      return response.status(googleResponse.status).json({ error: 'Failed to submit to Google Sheets' });
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    return response.status(500).json({ error: error.message || 'Internal server error' });
  }
}
