/**
 * @typedef {import('pino').Logger} Logger
 */

import pino from 'pino';

const customLevels = {
  infoWrite: 35,
};

const logger = pino({
  customLevels,

  transport: {
    target: 'pino-pretty',

    options: {
      colorize: true,
    },
  },
});

export default logger;
