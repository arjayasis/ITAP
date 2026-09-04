import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const formData = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  const NEW_TECHX_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec';
  const isTechX = formData?.source === 'GMM@TechXSummit2026' || (typeof formData?.event === 'string' && formData.event.includes('Tech'));
  let techxUrl = process.env.GOOGLE_SHEETS_TECHX_WEBHOOK_URL;
  if (!techxUrl || techxUrl.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') || techxUrl.endsWith('/dev')) {
    techxUrl = NEW_TECHX_WEBHOOK_URL;
  }
  const defaultUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

  let webhookUrl = (isTechX && techxUrl) ? techxUrl : (techxUrl || defaultUrl);
  if (webhookUrl && webhookUrl.endsWith('/dev')) {
    webhookUrl = webhookUrl.replace(/\/dev$/, '/exec');
  }

  if (!webhookUrl) {
    console.warn('GOOGLE_SHEETS_WEBHOOK_URL is not defined in environment variables. Simulating RSVP save.');
    return response.status(200).json({ 
      success: true, 
      simulated: true,
      message: 'RSVP recorded in preview mode (Webhook URL not configured)' 
    });
  }

  try {
    const formData = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    
    // Map companion data so it fills columns H, I, J on both new and existing Apps Script versions
    if (formData && formData.hasCompanion !== undefined) {
      const isComp = (formData.hasCompanion === 'yes' || formData.hasCompanion === 'Yes' || formData.hasCompanion === true || formData.hasCompanion === 'true');
      formData.hasCompanion = isComp ? 'Yes' : 'No';
      formData.event = isComp ? 'Yes' : 'No';
      formData.eventName = isComp ? 'Yes' : 'No';
      formData.venue = isComp ? (formData.companionName || 'N/A') : 'None';
      formData.source = isComp ? (formData.companionDesignation || formData.companionTitle || 'N/A') : 'None';
    }

    // Convert the incoming body to URLSearchParams for Google Apps Script
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData || {})) {
      params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
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
      return response.status(googleResponse.status).json({ error: 'Failed to submit to Google Sheets', details: result });
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    return response.status(500).json({ error: error.message || 'Internal server error' });
  }
}
