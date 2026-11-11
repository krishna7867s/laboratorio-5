const llm = require('./llm.service');

module.exports = {
  preguntar: llm.preguntar,
  chat: llm.chat,
};
