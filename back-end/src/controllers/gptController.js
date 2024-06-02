// gptController.js
const { takePrompt } = require('../services/gpt');

async function getGPTResponse(req, res) {
  const prompt = req.body.prompt;
  const response = await takePrompt(prompt);
  res.json({ response: response });
}

module.exports = { getGPTResponse };
