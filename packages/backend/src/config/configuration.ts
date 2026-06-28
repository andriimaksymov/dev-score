export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  github: {
    apiToken: process.env.GITHUB_API_TOKEN,
    apiBaseUrl: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  openrouter: {
    // Support both the conventional name and the shorthand used in .env.local.
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  },
  ai: {
    providerOrder:
      process.env.AI_PROVIDER_ORDER || 'openrouter,openai,gemini,groq',
    openrouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-5-mini',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  },
  // Future configurations
  // database: {
  //   url: process.env.DATABASE_URL,
  // },
});
