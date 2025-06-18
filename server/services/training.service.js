const fetch = require('node-fetch-commonjs');
const chrono = require('chrono-node');

const logger = require('../logger');

const checkIfNoTraining = async ({ time }) => {
    logger.info({ scope: 'checkIfNoTraining', data: JSON.stringify({ time }) }, 'Incoming data');
    const parsed = chrono.parseDate(time);

    logger.info({ scope: 'checkIfNoTraining', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.TRAINING_API}/api/check-time`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: parsed.toISOString(),
            }),
    });

    const parsedResponse = await response.json();
    const { available } = parsedResponse;

    logger.info({ scope: 'checkIfNoTraining', data: JSON.stringify(parsedResponse) }, 'Parsed responsse');

    return available;
}

const checkIfTrainingCanBeMade = async ({ data, time }) => {
    logger.info({ scope: 'checkIfTrainingCanBeMade', data: JSON.stringify({ time, data }) }, 'Incoming data');
    const parsed = chrono.parseDate(time);

    logger.info({ scope: 'checkIfTrainingCanBeMade', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.TRAINING_API}/api/can-make-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: parsed.toISOString(),
                trainer: data.trainer,
            }),
    });

    const parsedResponse = await response.json();
    const { available } = parsedResponse;

    logger.info({ scope: 'checkIfTrainingCanBeMade', data: JSON.stringify(parsedResponse) }, 'Parsed responsse');

    return available;
}

// TODO: rewrite functionality
const bookTraining = async ({ data, time }) => {
    logger.info({ scope: 'bookTraining', data: JSON.stringify({ time, data }) }, 'Incoming data');
    const parsed = chrono.parseDate(time);

    logger.info({ scope: 'bookTraining', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.TRAINING_API}/api/can-make-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: parsed.toISOString(),
                trainer: data.trainer,
            }),
    });

    const parsedResponse = await response.json();
    const { available } = parsedResponse;

    logger.info({ scope: 'bookTraining', data: JSON.stringify(parsedResponse) }, 'Parsed responsse');

    return available;
}

module.exports = {
    checkIfTrainingCanBeMade,
    checkIfNoTraining,
    bookTraining,
};