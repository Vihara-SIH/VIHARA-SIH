import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'functions/.env') });

async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key present:', !!apiKey, apiKey?.slice(0, 8) + '...');

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  console.log('HTTP Status:', res.status, res.statusText);
  const data = await res.json();
  if (data.models) {
    console.log('Available models:', data.models.map(m => m.name));
  } else {
    console.log('Response:', data);
  }
}

listGeminiModels();
