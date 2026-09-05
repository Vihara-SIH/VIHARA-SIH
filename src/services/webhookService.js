const N8N_WEBHOOK_URL = 'https://vihara.app.n8n.cloud/webhook/vihara-send-itinerary';

/**
 * Send the generated travel itinerary PDF to the user's email via n8n production webhook using multipart/form-data.
 *
 * @param {string} email - The currently authenticated user's email address
 * @param {Blob|File} pdfBlob - The actual generated itinerary PDF Blob
 * @param {Object} options - Additional trip details such as filename, destination, numberOfDays, structured itinerary
 * @returns {Promise<{success: boolean, message?: string, data?: any}>}
 */
export const sendItineraryWebhook = async (email, pdfBlob, options = {}) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    console.warn('[VIHARA n8n Webhook] Aborted: No valid email address provided.');
    return {
      success: false,
      message: 'No authenticated email address found. Please ensure you are logged in.'
    };
  }

  if (!pdfBlob) {
    console.warn('[VIHARA n8n Webhook] Aborted: No PDF Blob available.');
    return {
      success: false,
      message: 'No itinerary PDF file available to send. Please generate an itinerary first.'
    };
  }

  try {
    const destinationSlug = options.destination
      ? options.destination.replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'Trip';
    const filename = options.filename || `VIHARA_Itinerary_${destinationSlug}.pdf`;

    // 1. Log Request Start
    console.log('[VIHARA n8n Webhook] Initiating production request:', {
      url: N8N_WEBHOOK_URL,
      email: email.trim(),
      filename,
      pdfSize: `${(pdfBlob.size / 1024).toFixed(2)} KB`,
      destination: options.destination || 'N/A',
      numberOfDays: options.numberOfDays || 'N/A'
    });

    const formData = new FormData();

    // 2. Append required FormData fields
    formData.append('email', email.trim());
    formData.append('data', pdfBlob, filename);

    // 3. Append supplementary fields
    if (options.destination) {
      formData.append('destination', options.destination);
    }
    if (options.numberOfDays) {
      formData.append('numberOfDays', String(options.numberOfDays));
    }
    if (options.itinerary) {
      formData.append(
        'itinerary',
        typeof options.itinerary === 'string'
          ? options.itinerary
          : JSON.stringify(options.itinerary)
      );
    }

    // 4. Send POST request with FormData (Browser automatically sets Content-Type: multipart/form-data; boundary=...)
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData
    });

    // 5. Log HTTP Response Status
    console.log(`[VIHARA n8n Webhook] Response received: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`[VIHARA n8n Webhook] Error: Server responded with status ${response.status} ${response.statusText}`);
      return {
        success: false,
        message: 'Unable to send your itinerary right now. Please try again.'
      };
    }

    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // 6. Log Response Body
    console.log('[VIHARA n8n Webhook] Response body:', responseData || '(empty success response)');

    return {
      success: true,
      data: responseData,
      message: 'Your itinerary PDF has been sent to your email successfully! 📧'
    };
  } catch (error) {
    // 7. Log Network / Fetch Errors
    console.error('[VIHARA n8n Webhook] Network or execution error:', error);
    return {
      success: false,
      message: 'Unable to send your itinerary right now. Please try again.'
    };
  }
};
