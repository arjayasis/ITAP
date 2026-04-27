const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL;

if (!url) {
  console.error("❌ GOOGLE_SHEETS_WEBHOOK_URL or VITE_GOOGLE_SHEETS_WEBHOOK_URL is not set.");
  process.exit(1);
}

console.log("✅ Webhook URL found in environment variables.");
console.log("URL starts with:", url.substring(0, 40) + "...");

async function testConnection() {
  console.log("Sending test data to Google Sheets...");
  
  const formData = new URLSearchParams();
  formData.append('timestamp', new Date().toISOString());
  formData.append('company', 'ITAP Test Connection');
  formData.append('name', 'System Validator');
  formData.append('position', 'Bot');
  formData.append('email', 'test@itaphil.com');
  formData.append('mobile', '0000000000');
  formData.append('attendance', 'yes');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Google Apps Script requires no-cors from browsers, but from Node we can just send it normally
      // or we can just send it and see if it succeeds.
    });
    
    const text = await response.text();
    console.log("Response Status:", response.status);
    console.log("Response Body:", text);
    
    if (response.ok) {
      console.log("✅ Successfully connected to Google Sheets Webhook!");
    } else {
      console.error("❌ Failed to connect. Server responded with an error.");
    }
  } catch (error) {
    console.error("❌ Error connecting to the webhook:", error.message);
  }
}

testConnection();
