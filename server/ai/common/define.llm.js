/**
 * @typedef {Object} LLMOptions
 * @property {string} [format]
 * @property {string} [model]
 * @property {boolean} [stream]
 */

/**
 * @param {string} prompt
 * @param {LLMOptions} options
 * @returns {string | Object | LLMOptions}
 */
export function configurationLLM(prompt, options) {
  const { format } = options;

  const config = { ...options, model: 'llama3.2', prompt, stream: false };

  let returnValue;
  switch (format) {
    case 'json':
      returnValue = JSON.stringify(config);
      break;
    default:
      returnValue = config;
      break;
  }
  return returnValue;
}
