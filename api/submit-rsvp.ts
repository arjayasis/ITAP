import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const formData = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
  
  // Dedicated Official Webhook URLs
  const OFFICIAL_RSVP_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwZjUcC7UNIPniLLt4YncpwNXOFx42UkZCb8A8ATtYjAMBj-jz1OEnbvyM4Uu54PfhhnA/exec';
  const OFFICIAL_STUDENT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw-2p-1fL-_IDixg68VgGLggXMtbxvEFSGj2mwkTUVawmYn4GE5iBPV_BuZl4AvukO5/exec';

  const isStudent = formData?.attendeeType === 'student' || 
                    !!formData?.studentNumber || 
                    !!formData?.course;

  let webhookUrl = OFFICIAL_RSVP_WEBHOOK_URL;

  if (isStudent) {
    let studentUrl = process.env.VITE_GOOGLE_SHEETS_STUDENT_WEBHOOK_URL || process.env.GOOGLE_SHEETS_STUDENT_WEBHOOK_URL;
    if (!studentUrl || studentUrl.endsWith('/dev') || studentUrl.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq')) {
      studentUrl = OFFICIAL_STUDENT_WEBHOOK_URL;
    }
    webhookUrl = studentUrl;
  } else {
    // For Industry RSVP: only accept explicitly configured RSVP URL, otherwise use OFFICIAL_RSVP_WEBHOOK_URL
    let rsvpUrl = process.env.VITE_GMM_RSVP_WEBHOOK_URL;
    if (!rsvpUrl || 
        rsvpUrl.includes('AKfycbx6JpS4WkG99mA8dbryWxKWyJ2ZPXmtbSmXGhAGwLjq') || 
        rsvpUrl.includes('AKfycbz7oOcamc48Hpcq4oF272ODDILWXWC0T0RUi3teB75mQEnPGA4qaFdUG4lFQfMKm3A') || 
        rsvpUrl.includes('BuZl4AvukO5') || 
        rsvpUrl.endsWith('/dev')) {
      rsvpUrl = OFFICIAL_RSVP_WEBHOOK_URL;
    }
    webhookUrl = rsvpUrl;
  }

  try {
    // Map companion data and alternative field names for maximum sheet version compatibility
    if (formData && !isStudent) {
      const isComp = (formData.hasCompanion === 'yes' || formData.hasCompanion === 'Yes' || formData.hasCompanion === true || formData.hasCompanion === 'true');
      formData.hasCompanion = isComp ? 'Yes' : 'No';
      formData.companionName = isComp ? (formData.companionName || 'N/A') : 'None';
      formData.companionDesignation = isComp ? (formData.companionDesignation || formData.companionTitle || 'N/A') : 'None';
      formData.companionTitle = formData.companionDesignation;

      // Legacy columns H, I, J compatibility for older sheets
      formData.event = isComp ? 'Yes' : 'No';
      formData.eventName = isComp ? 'Yes' : 'No';
      formData.venue = isComp ? formData.companionName : 'None';
      formData.source = isComp ? formData.companionDesignation : 'None';

      // Alternate field names
      formData.company = formData.companyName || formData.company || 'N/A';
      formData.organization = formData.companyName || formData.organization || 'N/A';
      formData.name = formData.fullName || formData.name || 'N/A';
      formData.position = formData.jobTitle || formData.position || 'N/A';
      formData.title = formData.jobTitle || formData.title || 'N/A';
      formData.mobileNumber = formData.mobile || formData.mobileNumber || formData.phone || 'N/A';
      formData.phone = formData.mobileNumber;
      formData.workEmail = formData.email || formData.workEmail || 'N/A';
      formData.attendance = 'yes';
    }

    // Convert the incoming body to URLSearchParams for Google Apps Script
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData || {})) {
      if (key === 'webhookUrl') continue;
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
      console.error('Google Sheets error:', result);
      return response.status(googleResponse.status).json({ error: 'Failed to submit to Google Sheets', details: result });
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    return response.status(500).json({ error: error.message || 'Internal server error' });
  }
}
