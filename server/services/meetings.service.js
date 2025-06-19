import fetch from 'node-fetch-commonjs';
import * as chrono from 'chrono-node';

import logger from '../logger.js';

export const checkIfNoMeetingIsPresent = async ({ time }) => {
  logger.info(
    { scope: 'checkIfNoMeetingIsPresent', data: JSON.stringify({ time }) },
    'Incoming data'
  );

  const parsed = chrono.parseDate(time);

  logger.info(
    {
      scope: 'checkIfNoMeetingIsPresent',
      data: JSON.stringify({ time: parsed }),
    },
    'Parsed time'
  );

  const response = await fetch(
    `${process.env.MEETINGS_API}/api/meeting-is-present`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time: parsed.toISOString() }),
    }
  );

  const parsedResponse = await response.json();

  logger.info(
    {
      scope: 'checkIfNoMeetingIsPresent',
      data: JSON.stringify(parsedResponse),
    },
    'Parsed response'
  );

  return parsedResponse.present === false;
};
