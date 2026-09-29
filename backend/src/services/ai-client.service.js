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
      timeout: env.aiTimeoutMs,
      ...(normalizedBaseUrl ? { baseURL: normalizedBaseUrl } : {})
    });
  }

  return groqClient;
};

const getGroqModel = () => env.groqModel;

const completeChat = async ({
  messages,
  tools,
  tool_choice,
  temperature = 0.2,
  parallel_tool_calls = false,
  maxTokens = env.aiMaxOutputTokens
}) => {
  const payload = {
    model: getGroqModel(),
    messages,
    temperature,
    max_tokens: maxTokens,
    parallel_tool_calls
  };

  if (tools) payload.tools = tools;
  if (tool_choice) payload.tool_choice = tool_choice;

  return getGroqClient().chat.completions.create(payload);
};

export { completeChat, getGroqClient, getGroqModel };