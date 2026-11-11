const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno automáticamente

async function preguntar(texto, system) {
  const msg = await client.messages.create({
    model: process.env.CLAUDE_MODEL,
    max_tokens: 1024,
    system: system ?? 'Eres un asistente útil. Responde en español.',
    messages: [{ role: 'user', content: texto }],
  });

  const bloque = msg.content.find((b) => b.type === 'text');
  return { respuesta: bloque?.text ?? '', uso: msg.usage };
}

module.exports = { preguntar };
