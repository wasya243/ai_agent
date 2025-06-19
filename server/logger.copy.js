import pino from 'pino';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, 'app.log');

const customLevels = {
  infoWrite: 35,
};

const streams = [
  {
    level: 'infoWrite',
    stream: pino.destination(logFile),
  },
  { level: 'infoWrite', stream: process.stdout },
];

const logger = pino(
  {
    customLevels,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
    useOnlyCustomLevels: false,
    // formatters: {
    //   level(label, number) {
    //     return { level: label };
    //   },
    // },
  }
  // pino.multistream(streams)
);

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
    {
      target: 'pino/file',
      level: 'info',
      options: {
        destination: './logs/app.log',
      },
    },
  ],
});

const loggerExtend = pino(
  {
    customLevels,
    useOnlyCustomLevels: false,
  },
  transport
);

export default loggerExtend;
