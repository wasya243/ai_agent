import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch-commonjs';
import cors from 'cors';

import logger from './logger.js';
import {
  checkIfBookingAvailable,
  bookTable,
} from './services/restoraunt.service.js';
import { checkWeather } from './services/weather.service.js';
import { checkIfNoMeetingIsPresent } from './services/meetings.service.js';
import {
  checkIfTrainingCanBeMade,
  checkIfNoTraining,
  bookTraining,
} from './services/training.service.js';
import {
  checkIfDoctorAppointmentCanBeDone,
  checkIfNoDoctorAppointment,
  bookDoctorAppointment,
} from './services/doctor.service.js';
import getPrompt from './ai/prompt.js';

const { json } = bodyParser;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(json());

// const ACTION_CHECKERS = {
//     'book_table': {
//         actionCheckers: [checkIfBookingAvailable]
//     },
//     'doctor_appointment': {
//         actionCheckers: [checkIfDoctorAppointmentCanBeDone]
//     },
//     'book_training': {
//         actionCheckers: [checkIfTrainingCanBeMade]
//     }
// };

// TODO: rewrite action performers based on new prompt
const ACTION_PERFORMERS = {
  book_table: {
    actions: [bookTable],
  },
  doctor_appointment: {
    actions: [bookDoctorAppointment],
  },
  book_training: {
    actions: [bookTraining],
  },
};

// TODO: rewrite condition chekers based on new prompt
const CONDITION_CHECKERS = {
  meeting_check: checkIfNoMeetingIsPresent,
  weather_check: checkWeather,
  doctor_appointment_check: checkIfNoDoctorAppointment,
  book_training_check: checkIfNoTraining,
  table_check: checkIfBookingAvailable,
  // Add more as needed
};

// TODO: rewrite thif function so that it returns data related to condition related to action
const evaluateConditionTree = async (node) => {
  if (!node) return true;

  if (node.operator) {
    const evaluations = await Promise.all(
      node.conditions.map(evaluateConditionTree)
    );

    if (node.operator === 'AND') {
      return evaluations.every(Boolean);
    } else if (node.operator === 'OR') {
      return evaluations.some(Boolean);
    } else {
      throw new Error(`Unsupported operator: ${node.operator}`);
    }
  }

  // Leaf node: map to correct checker
  const checker = CONDITION_CHECKERS[node.type];
  if (!checker) throw new Error(`No condition checker for type: ${node.type}`);

  return checker(node);
};

const checkIfActionCanBeFullfilled = async (intent) => {
  const { intent: intentType, condition } = intent;

  // const conditions = ACTION_CHECKERS[intentType]?.conditionCheckers;
  const actions = ACTION_PERFORMERS[intentType]?.actions;

  // if (!conditions) return false;

  let conditionCanBeFullfilled = true;

  if (condition) {
    conditionCanBeFullfilled = await evaluateConditionTree(condition);
  }

  logger.info(
    { scope: 'checkIfActionCanBeFullfilled' },
    `Action can be fullfilled: ${conditionCanBeFullfilled}`
  );

  if (!conditionCanBeFullfilled) return false;

  for (const fn of actions) {
    const result = await fn(intent.action);

    if (!result) {
      actionCanBeDone = false;
      break;
    }
  }

  logger.info(
    { scope: 'checkIfActionCanBeFullfilled' },
    `Action can be done: ${actionCanBeDone}`
  );

  return actionCanBeDone;
};

const performAction = async (intent) => {
  const { intent: intentType, condition } = intent;
  const actions = ACTION_PERFORMERS[intentType]?.actions;

  for (const fn of actions) {
    const result = await fn(intent.action);

    if (!result) {
      actionCanBeDone = false;
      break;
    }
  }
};

app.post('/api/extract-intent', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing text input' });
  }

  const prompt = getPrompt(text);

  try {
    const peyload = JSON.stringify({
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
    });

    logger.info({ LLM_URI: process.env.LLM_URI }, 'LLM url:');

    const response = await fetch(`${process.env.LLM_URI}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: peyload,
    });

    // logger.info({ response }, 'LLM request answer: ');

    const data = await response.json();

    const output = JSON.parse(data.response);

    logger.info({ text }, 'LLM question:');
    logger.info({ output }, 'LLM answer:');

    // console.log("here-lol", JSON.stringify(output));

    // const actionCanBeMade = await checkIfActionCanBeFullfilled(output);

    // res.send({ actionCanBeDone: actionCanBeMade });

    res.send({ actionCanBeDone: true, output });
  } catch (err) {
    logger.error(err, 'Error extracting intent');
    res.status(500).json({ error: 'Failed to extract intent' });
  }
});

app.listen(PORT, () => {
  logger.info(`Intent extractor server running at http://localhost:${PORT}`);
});
