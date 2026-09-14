import { applyCors, rateLimit } from './_lib/http.js';

const N8N_WEBHOOK_URL =
  (process.env.N8N_WEBHOOK_URL || process.env.N8N_ITINERARY_WEBHOOK_URL || '').trim() ||
  'https://vihara.app.n8n.cloud/webhook/vihara-send-itinerary';

export default async function handler(req, res) {
  applyCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const limited = rateLimit(req, { windowMs: 60_000, max: 8 });
  if (!limited.ok) {
    return res.status(429).json({ success: false, error: 'Please wait before sending another itinerary email.' });
  }

  const body = req.body || {};
  const email = String(body.email || '').trim();
  const pdfBase64 = String(body.pdfBase64 || '').replace(/^data:application\/pdf;base64,/, '');
  const filename = String(body.filename || 'VIHARA_Itinerary.pdf').replace(/[^\w.\-]+/g, '_');
  const destination = body.destination;
  const numberOfDays = body.numberOfDays;
  const itinerary = body.itinerary;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }
  if (!pdfBase64) {
    return res.status(400).json({ success: false, error: 'PDF data is required.' });
  }
  if (pdfBase64.length > 8_000_000) {
    return res.status(413).json({ success: false, error: 'PDF is too large to send.' });
  }

  try {
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const formData = new FormData();
    formData.append('email', email);
    formData.append('data', new Blob([pdfBuffer], { type: 'application/pdf' }), filename);
    if (destination) formData.append('destination', String(destination));
    if (numberOfDays) formData.append('numberOfDays', String(numberOfDays));
    if (itinerary) {
      formData.append('itinerary', typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary));
    }

    const response = await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });
    if (!response.ok) {
      console.error('[send-itinerary] n8n status', response.status);
      return res.status(502).json({
        success: false,
        error: 'Unable to send your itinerary right now. Please try again.'
      });
    }

    let data = null;
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) data = await response.json();
    else data = await response.text();

    return res.status(200).json({
      success: true,
      message: 'Your itinerary PDF has been sent to your email successfully! 📧',
      data
    });
  } catch (err) {
    console.error('[send-itinerary]', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to send your itinerary right now. Please try again.'
    });
  }
}
