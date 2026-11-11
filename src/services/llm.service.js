const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

let claudeClient;
let deepseekClient;

function getClaudeClient() {
  if (!claudeClient) {
    claudeClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return claudeClient;
}

function getDeepSeekClient() {
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }
  return deepseekClient;
}

/**
 * Servicio unificado de LLM: soporta DeepSeek y Claude según LLM_PROVIDER
 */
async function chat({ system, messages }) {
  const provider = (process.env.LLM_PROVIDER || 'deepseek').toLowerCase();
  const maxTokens = Number(process.env.MAX_TOKENS) || 300;

  if (provider === 'deepseek') {
    const client = getDeepSeekClient();
    const systemPrompt = system ?? 'Eres un asistente conciso y útil. Responde en español de forma directa sin rodeos.';
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const r = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-flash',
      messages: formattedMessages,
      max_tokens: maxTokens,
    });

    return {
      respuesta: r.choices[0]?.message?.content ?? '',
      uso: r.usage,
    };
  } else {
    // Claude (@anthropic-ai/sdk)
    const client = getClaudeClient();
    const r = await client.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: system ?? 'Eres un asistente conciso y útil. Responde en español de forma directa sin rodeos.',
      messages: messages,
    });

    const bloque = r.content.find((b) => b.type === 'text');
    return {
      respuesta: bloque?.text ?? '',
      uso: r.usage,
    };
  }
}

async function preguntar(texto, system) {
  return chat({
    system,
    messages: [{ role: 'user', content: texto }],
  });
}

module.exports = { chat, preguntar };
