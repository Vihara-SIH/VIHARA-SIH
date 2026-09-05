import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

/**
 * Sends a message to the AI Concierge backend.
 *
 * Supported environments:
 * 1. Local Development: Firebase Functions Emulator (localhost:5001) via httpsCallable
 * 2. Production (Vercel): Vercel Serverless Function (/api/chat) via fetch
 *
 * @param {string} message - User query message
 * @param {Array<{sender: string, text: string}>} [history=[]] - Conversation history
 * @returns {Promise<string>} AI assistant response text
 */
export async function sendChatMessage(message, history = []) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Please provide a valid message.');
  }

  const cleanMessage = message.trim();
  const formattedHistory = history.map((item) => ({
    sender: item.sender === 'user' ? 'user' : 'model',
    text: item.text
  }));

  // =========================================================================
  // 1. LOCAL DEVELOPMENT: Use Firebase Functions Emulator if on localhost
  // =========================================================================
  if (isLocalhost && functions._emulatorConnected) {
    console.log('[VIHARA Chat] Using Local Firebase Functions Emulator (127.0.0.1:5001)...');
    try {
      const viharaChatCallable = httpsCallable(functions, 'viharaChat');
      const result = await viharaChatCallable({
        message: cleanMessage,
        history: formattedHistory
      });

      if (result?.data?.reply) {
        return result.data.reply;
      }
    } catch (localError) {
      console.warn('[VIHARA Chat] Local emulator error, falling back to /api/chat:', localError);
    }
  }

  // =========================================================================
  // 2. PRODUCTION / VERCEL: Use Serverless Endpoint (/api/chat)
  // =========================================================================
  console.log('[VIHARA Chat] Dispatching request to production /api/chat endpoint...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: cleanMessage,
        history: formattedHistory
      })
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { error: text };
      }
    }

    if (!response.ok) {
      // 1. Endpoint Not Found (404)
      if (response.status === 404) {
        console.error('[VIHARA Chat] Error (Incorrect Endpoint): /api/chat was not found (404). Check Vercel serverless configuration.');
        return 'Namaste! The chatbot backend endpoint is currently not reachable. Please check your Vercel deployment.';
      }

      // 2. Gemini API / Key Configuration Error (500)
      const errorMsg = responseData?.error || response.statusText || 'Server Error';
      console.error(`[VIHARA Chat] Error (Gemini API / Server ${response.status}):`, errorMsg);

      if (errorMsg.includes('GEMINI_API_KEY')) {
        return 'Namaste! The AI Concierge requires a configured GEMINI_API_KEY. Please add GEMINI_API_KEY to your Vercel Project Environment Variables.';
      }

      return 'Namaste! 🙏 The AI Concierge encountered a temporary server error. Please try again in a moment.';
    }

    if (responseData && responseData.reply) {
      return responseData.reply;
    }

    throw new Error('Empty response received from /api/chat');
  } catch (error) {
    // 3. Network or CORS Error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[VIHARA Chat] Error (CORS / Network Unreachable): Failed to fetch from /api/chat.', error);
      return 'Namaste! Unable to connect to the AI Concierge service. Please check your network connection.';
    }

    // 4. General Backend Error
    console.error('[VIHARA Chat] Error (Backend Unavailable):', error);
    return 'Namaste! I encountered a temporary connection issue. Please try again in a moment.';
  }
}
