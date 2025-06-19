import pino from 'pino';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFile = path.join(logDir, 'app.log');

const streams = [
  { level: 'info', stream: process.stdout }, // консольний вивід (сирий)
  { level: 'info', stream: pino.destination(logFile) }, // файл
];

const logger = pino(
  {
    level: 'info',
    customLevels: { infoWrite: 35 },
    useOnlyCustomLevels: false,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
  pino.multistream(streams)
);

export default logger;
