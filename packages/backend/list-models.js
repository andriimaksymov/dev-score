const { GoogleGenAI } = require('@google/genai');

async function listModels() {
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: 'v1',
  });

  try {
    const models = await genAI.models.list();
    console.log('Available Models:');
    models.forEach((m) =>
      console.log(`- ${m.name} (${m.supportedMethods.join(', ')})`),
    );
  } catch (e) {
    console.error('Error listing models:', e);
  }
}

listModels();
