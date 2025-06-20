/**
 * @param {string} prompt
 * @param {any} options
 */
export function configurationLLM(prompt, options) {
  return { ...options, model: 'llama3.2', prompt, stream: false };
}
