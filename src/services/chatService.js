import { httpsCallable } from 'firebase/functions';
import { functions, auth } from './firebase';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

async function authHeader() {
  try {
    const token = await auth.currentUser?.getIdToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * @returns {Promise<string|{reply:string, actions:Array}>}
 */
export async function sendChatMessage(message, history = [], options = {}) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Please provide a valid message.');
  }

  const cleanMessage = message.trim();
  const formattedHistory = history.map((item) => ({
    sender: item.sender === 'user' ? 'user' : 'model',
    text: item.text
  }));

  const payload = {
    message: cleanMessage,
    history: formattedHistory,
    tripContext: options.tripContext || null
  };

  if (isLocalhost && functions._emulatorConnected && !options.tripContext) {
    try {
      const viharaChatCallable = httpsCallable(functions, 'viharaChat');
      const result = await viharaChatCallable(payload);
      if (result?.data?.reply) {
        if (options.returnFull) {
          return { reply: result.data.reply, actions: result.data.actions || [] };
        }
        return result.data.reply;
      }
    } catch (localError) {
      console.warn('[VIHARA Chat] Local emulator error, falling back to /api/chat:', localError);
    }
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await authHeader())
      },
      body: JSON.stringify(payload)
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
      if (response.status === 404) {
        return options.returnFull
          ? { reply: 'Namaste! The chatbot backend endpoint is currently not reachable.', actions: [] }
          : 'Namaste! The chatbot backend endpoint is currently not reachable. Please check your Vercel deployment.';
      }
      if (response.status === 429) {
        const msg = 'Namaste! Please wait a moment before sending another message.';
        return options.returnFull ? { reply: msg, actions: [] } : msg;
      }
      const errorMsg = responseData?.error || response.statusText || 'Server Error';
      if (String(errorMsg).includes('GEMINI_API_KEY')) {
        const msg = 'Namaste! The AI Concierge requires a configured GEMINI_API_KEY.';
        return options.returnFull ? { reply: msg, actions: [] } : msg;
      }
      const fallback = 'Namaste! 🙏 The AI Concierge encountered a temporary server error. Please try again in a moment.';
      return options.returnFull ? { reply: fallback, actions: [] } : fallback;
    }

    const reply = responseData?.reply || '';
    const actions = Array.isArray(responseData?.actions) ? responseData.actions : [];
    if (options.returnFull) return { reply, actions };
    return reply || 'Namaste! I could not generate a response just then.';
  } catch (error) {
    const msg = 'Namaste! I encountered a temporary connection issue. Please try again in a moment.';
    if (options.returnFull) return { reply: msg, actions: [] };
    return msg;
  }
}
