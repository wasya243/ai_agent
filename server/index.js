require('dotenv').config({ path: '.env' });

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch-commonjs');
const cors = require('cors');

const logger = require('./logger');
const { checkIfBookingAvailable, bookTable } = require('./services/restoraunt.service');
const { checkWeather } = require('./services/weather.service');
const { checkIfNoMeetingIsPresent } = require('./services/meetings.service');
const { checkIfTrainingCanBeMade, checkIfNoTraining, bookTraining } = require('./services/training.service');
const { checkIfDoctorAppointmentCanBeDone, checkIfNoDoctorAppointment, bookDoctorAppointment } = require('./services/doctor.service');
const getPrompt = require('./ai/prompt');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

const ACTION_PERFORMERS = {
    'book_table': {
        actions: [bookTable]
    },
    'doctor_appointment': {
        actions: [bookDoctorAppointment]
    },
    'book_training': {
        actions: [bookTraining]
    }
};

const CONDITION_CHECKERS = {
    'meeting_check': checkIfNoMeetingIsPresent,
    'weather_check': checkWeather,
    'appointment_check': checkIfNoDoctorAppointment,
    'training_check': checkIfNoTraining,
    // TODO: maybe different function
    'booking_check': checkIfBookingAvailable
};

const ACTION_CHECKERS = {
    'appointment_check_by_doctor': checkIfDoctorAppointmentCanBeDone,
    'training_check_by_trainer': checkIfTrainingCanBeMade,
      // TODO: maybe different function
    'booking_check_by_table': checkIfBookingAvailable,
}

const evaluateConditionTree = async (node) => {
    if (!node) return true;

    if (node.operator) {
        const evaluations = await Promise.all(node.conditions.map(evaluateConditionTree));

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

const checkIfActionConditionCanBeFullfilled = async (actionCondition) => {
    const { type, time, data } = actionCondition;
    const actionChecker = ACTION_CHECKERS[type];

    if (!actionChecker) {
        throw new Error('Unsupported action type');
    }

    return actionChecker(time, data);
}


const checkIfActionCanBeFullfilled = async (intent) => {
    const { intent: intentType, condition } = intent;

    const actions = ACTION_PERFORMERS[intentType]?.actions;

    let areConditionsFullfilled = true;

    if (condition) {
        areConditionsFullfilled = await evaluateConditionTree(condition);
    }

    logger.info({ scope: 'checkIfActionCanBeFullfilled' }, `Conditions are fullfilled: ${areConditionsFullfilled}`);

    if (!conditionCanBeFullfilled) return false;

    const actionCanBeFullfilled = await checkIfActionConditionCanBeFullfilled(intent.action_conditions);

    logger.info({ scope: 'checkIfActionCanBeFullfilled' }, `Action condition is fullfilled: ${actionCanBeFullfilleds}`);

    if (!actionCanBeFullfilled) return false;

    for (const fn of actions) {
        const result = await fn(intent.action);

        if (!result) {
            actionCanBeDone = false;
            break;
        }
    }

     logger.info({ scope: 'checkIfActionCanBeFullfilled' }, `Action performed`);
}

function extractJson(text) {
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (!jsonMatch) throw new Error("No JSON found");
  return JSON.parse(jsonMatch[0]);
}

app.post('/api/extract-intent', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Missing text input' });
    }

    const prompt = getPrompt(text);

    try {
        const response = await fetch(`${process.env.LLM_URI}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistral:7b',
                prompt: prompt,
                stream: false
            }),
        });

        const dataText = await response.json();
        const json = extractJson(dataText.response);

        logger.info({ data: JSON.stringify(json) }, 'Parsed string');

        const actionCanBeMade = await checkIfActionCanBeFullfilled(json);

        res.send({ actionCanBeDone: actionCanBeMade });

        res.send({ actionCanBeDone: true });
    } catch(err) {
        logger.error(err, 'Error extracting intent');
        res.status(500).json({ error: 'Failed to extract intent' });
    }
});

app.listen(PORT, () => {
    logger.info(`Intent extractor server running at http://localhost:${PORT}`);
});
  