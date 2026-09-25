import env from '../config/env.js';
import Groq from 'groq-sdk';

let groqClient = null;

const normalizeGroqBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return undefined;
  }

  const trimmed = baseUrl.trim().replace(/\/+$/, '');

  if (trimmed.endsWith('/openai/v1')) {
    return trimmed.replace(/\/openai\/v1$/, '');
  }

  return trimmed;
};

const getGroqClient = () => {
  if (!groqClient) {
    if (!env.groqApiKey) {
      throw new Error('GROQ_API_KEY missing');
    }

    const normalizedBaseUrl = normalizeGroqBaseUrl(env.groqBaseUrl);

    groqClient = new Groq({
      apiKey: env.groqApiKey,
      ...(normalizedBaseUrl ? { baseURL: normalizedBaseUrl } : {})
    });
  }

  return groqClient;
};

const getGroqModel = () => env.groqModel;

export { getGroqClient, getGroqModel };