/**
 * Send itinerary PDF via the server proxy (/api/send-itinerary).
 * The n8n webhook URL stays on the server and is not exposed to the browser.
 */
export const sendItineraryWebhook = async (email, pdfBlob, options = {}) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      success: false,
      message: 'No authenticated email address found. Please ensure you are logged in.'
    };
  }

  if (!pdfBlob) {
    return {
      success: false,
      message: 'No itinerary PDF file available to send. Please generate an itinerary first.'
    };
  }

  try {
    const destinationSlug = options.destination
      ? String(options.destination).replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'Trip';
    const filename = options.filename || `VIHARA_Itinerary_${destinationSlug}.pdf`;

    const buffer = await pdfBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const pdfBase64 = btoa(binary);

    const response = await fetch('/api/send-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        pdfBase64,
        filename,
        destination: options.destination || '',
        numberOfDays: options.numberOfDays || '',
        itinerary: options.itinerary || null
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      return {
        success: false,
        message: data.error || 'Unable to send your itinerary right now. Please try again.'
      };
    }

    return {
      success: true,
      data,
      message: data.message || 'Your itinerary PDF has been sent to your email successfully! 📧'
    };
  } catch (error) {
    console.error('[VIHARA send-itinerary]', error);
    return {
      success: false,
      message: 'Unable to send your itinerary right now. Please try again.'
    };
  }
};
