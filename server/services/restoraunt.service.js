import fetch from 'node-fetch-commonjs';
import * as chrono from 'chrono-node';

import logger from '../logger.js';

export const checkIfBookingAvailable = async ({ data, time }) => {
  logger.info(
    { scope: 'checkIfBookingAvailable', data: JSON.stringify({ data, time }) },
    'Incoming data'
  );

  const parsed = chrono.parseDate(time);

  const response = await fetch(
    `${process.env.RESTORAUNT_API}/api/can-book-table`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        time: parsed.toISOString(),
        people: data.amountOfPeople,
      }),
    }
  );

  const parsedResponse = await response.json();

  logger.info(
    { scope: 'checkIfBookingAvailable', data: JSON.stringify(parsedResponse) },
    'Parsed response'
  );

  return {
    available: !!parsedResponse.table,
    table: parsedResponse.table,
  };
};

export const bookTable = async ({ data, time }) => {
  logger.info(
    { scope: 'bookTable', data: JSON.stringify({ data, time }) },
    'Incoming data'
  );

  const parsed = chrono.parseDate(time);

  const response = await fetch(`${process.env.RESTORAUNT_API}/api/book-table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // TODO: possibly add amount of people for table in booking as well
    body: JSON.stringify({
      time: parsed.toISOString(),
      tableId: data.tableId,
    }),
  });

  const parsedResponse = await response.json();

  logger.info(
    { scope: 'bookTable', data: JSON.stringify(parsedResponse) },
    'Parsed response'
  );

  return parsedResponse;
};
