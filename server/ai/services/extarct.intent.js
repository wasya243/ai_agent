// import logger from '#logger.js';

import logger from '../../logger.js';
import { configurationLLM } from '../common/index.js';
import { intentQuestionPrompt } from '../prompts/index.js';

/**
 * @param {string} text
 */
export async function extractIntent(text) {
  const response = await fetch(`${process.env.LLM_URI}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: configurationLLM(intentQuestionPrompt({ text })),
  });

  const data = await response.json();

  const output = JSON.parse(data.response);

  logger.info({ text }, 'LLM question:');
  logger.info({ output }, 'LLM answer:');

  return output;
}
