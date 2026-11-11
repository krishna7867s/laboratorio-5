const { chat } = require('./llm.service');

/**
 * Fábrica de agentes basados en LLM (Claude / DeepSeek)
 */
const createAgent = ({ system, tools = [] }) =>
  async (input, history = []) => {
    const messages = [...history, { role: 'user', content: input }];
    return chat({ system, messages, tools });
  };

// Agente de ejemplo: Soporte técnico
const soporte = createAgent({
  system: 'Eres un agente de soporte técnico conciso y útil. Responde en español.',
});

module.exports = { createAgent, soporte };
