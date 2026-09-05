import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load local environment variables from functions/.env
try {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
} catch (e) {
  // Silent fallback if .env not present
}

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
  initializeApp();
}

console.log('VIHARA Functions module loaded successfully');

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

/**
 * Retrieve Gemini API Key from environment variables (functions/.env)
 */
function getGeminiApiKey() {
  return (process.env.GEMINI_API_KEY || '').trim();
}

/**
 * Formats multi-turn chat history into Gemini API compatible contents array
 */
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

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: currentMessage }]
  });

  return contents;
}

/**
 * Core handler to process chat with Gemini AI, supporting primary and fallback models
 */
async function generateViharaResponse(message, history, travelerName = null) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new HttpsError(
      'failed-precondition',
      'Gemini API key is not configured. Please add GEMINI_API_KEY to functions/.env.'
    );
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
  const formattedContents = formatChatHistory(history, message);
  const systemInstruction = travelerName
    ? `${VIHARA_SYSTEM_INSTRUCTION}\n\nNote: The traveler's name is ${travelerName}.`
    : VIHARA_SYSTEM_INSTRUCTION;

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
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
        return responseText.trim();
      }
    } catch (err) {
      console.warn(`Attempt with Gemini model "${modelName}" failed:`, err.message);
      lastError = err;
      // If error is 404 or 503, try next candidate model
    }
  }

  throw new HttpsError('internal', lastError?.message || 'Failed to generate AI response from Gemini API.');
}

/**
 * Callable Cloud Function: viharaChat
 * Invoked via Firebase Client SDK: httpsCallable(functions, 'viharaChat')
 */
export const viharaChat = onCall(
  {
    cors: true,
    maxInstances: 10
  },
  async (request) => {
    const { message, history } = request.data || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new HttpsError('invalid-argument', 'A valid message string is required.');
    }

    if (message.length > 2000) {
      throw new HttpsError('invalid-argument', 'Message is too long (maximum 2000 characters).');
    }

    const travelerName = request.auth?.token?.name || null;

    try {
      const reply = await generateViharaResponse(message.trim(), history, travelerName);
      return {
        success: true,
        reply,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error generating AI response in viharaChat:', err);
      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError('internal', err.message || 'Failed to generate AI response.');
    }
  }
);

/**
 * Direct HTTPS REST Endpoint: viharaChatHttp
 * Alternative HTTP endpoint supporting standard POST requests
 */
export const viharaChatHttp = onRequest(
  {
    cors: true,
    maxInstances: 10
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
      return;
    }

    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'A valid message string is required in request body.' });
      return;
    }

    try {
      const reply = await generateViharaResponse(message.trim(), history);
      res.status(200).json({
        success: true,
        reply,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error in viharaChatHttp:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
      });
    }
  }
);
