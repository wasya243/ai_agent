import { configurationLLM } from '#ai/common/index.js';
import { conditionQuestionPrompt, intentQuestionPrompt } from '#ai/index.js';
import logger from '#logger.js';

/**
 * @param {string} text
 */
export async function extractIntent(text) {
  const response = await fetch(`${process.env.LLM_URI}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: configurationLLM(intentQuestionPrompt({ text }), { format: 'json' }),
  });

  const responseCon = await fetch(`${process.env.LLM_URI}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: configurationLLM(conditionQuestionPrompt({ text }), {
      format: 'json',
    }),
  });

  const data = await response.json();
  const dataCon = await responseCon.json();

  const output = JSON.parse(data.response);
  const outputCon = JSON.parse(dataCon.response);

  logger.info({ text }, 'extractIntent: LLM question:');
  logger.info({ output, outputCon }, 'extractIntent: LLM answer:');

  return output;
}
