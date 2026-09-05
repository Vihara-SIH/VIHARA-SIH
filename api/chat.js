import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * System prompt defining the VIHARA AI Concierge persona and knowledge domain.
 */
const VIHARA_SYSTEM_INSTRUCTION = `You are the AI Concierge for "VIHARA" - India's Smart Heritage Tourism & AI Travel Platform.

Your role:
- Guide travelers through India's rich heritage, spiritual circuits (e.g. Varanasi, Amritsar, Tirupati, Rishikesh), majestic forts & palaces (e.g. Jaipur, Jodhpur, Udaipur), tranquil nature retreats (e.g. Kerala, Munnar), and adventure treks (e.g. Ladakh, Himalayas).
- Tone: Warm, respectful, inspiring, and culturally authentic (greet travelers warmly with "Namaste 🙏" when starting a conversation).
- Format: Keep answers engaging, helpful, concise, and easy to read on mobile or desktop. Use bullet points for itineraries, top sights, or tips where suitable.
- Encourage users to explore the interactive "Trip Planning" feature in VIHARA to customize their full day-by-day itineraries and budgets.
- Offer practical travel advice: best time to visit, cultural etiquette, dress codes for temples, and local cuisine recommendations.
- Keep responses focused on India travel, heritage, tourism, culture, and itinerary guidance.`;

function formatChatHistory(history, currentMessage) {
  const contents = [];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text) continue;
      const role = item.sender === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: item.text }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: currentMessage }]
  });

  return contents;
}

/**
 * Vercel Production Serverless Function Handler for VIHARA AI Concierge
 */
export default async function handler(req, res) {
  // Safe CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Please use POST.' });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'A valid message string is required.' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    console.error('[VIHARA Vercel API] Error: GEMINI_API_KEY environment variable is missing on Vercel.');
    return res.status(500).json({
      success: false,
      error: 'GEMINI_API_KEY is not configured in Vercel environment variables.'
    });
  }

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const candidateModels = [
    primaryModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest'
  ].filter((v, i, a) => a.indexOf(v) === i);

  const genAI = new GoogleGenerativeAI(apiKey);
  const formattedContents = formatChatHistory(history, message.trim());
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: VIHARA_SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      });

      const response = await model.generateContent({
        contents: formattedContents
      });

      const responseText = response?.response?.text();
      if (responseText && responseText.trim().length > 0) {
        return res.status(200).json({
          success: true,
          reply: responseText.trim(),
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn(`[VIHARA Vercel API] Model ${modelName} error:`, err.message);
      lastError = err;
    }
  }

  console.error('[VIHARA Vercel API] Gemini API execution failed:', lastError);
  return res.status(500).json({
    success: false,
    error: lastError?.message || 'Failed to generate response from Gemini API'
  });
}
