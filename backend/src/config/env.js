import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET'];
const configuredRefreshSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenSecret =
  configuredRefreshSecret && configuredRefreshSecret !== 'your-refresh-token-secret'
    ? configuredRefreshSecret
    : process.env.JWT_REFRESH_SECRET;

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

if (!refreshTokenSecret) {
  throw new Error('Missing required environment variable: REFRESH_TOKEN_SECRET');
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1m',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com',
  refreshTokenSecret,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
  aiMaxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS || 800),
  aiMaxConversationChars: Number(process.env.AI_MAX_CONVERSATION_CHARS || 12000),
  chatHistoryLimit: Number(process.env.CHAT_HISTORY_LIMIT || 15),
  chatSummaryThreshold: Number(process.env.CHAT_SUMMARY_THRESHOLD || 20)
};

export default env;
