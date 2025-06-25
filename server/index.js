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

// TODO: rewrite condition chekers based on new prompt
const CONDITION_CHECKERS = {
    'meeting_check': checkIfNoMeetingIsPresent,
    'weather_check': checkWeather,
    'doctor_appointment_check': checkIfNoDoctorAppointment,
    'book_training_check': checkIfNoTraining,
    'table_check': checkIfBookingAvailable,
    // Add more as needed
};

// TODO: rewrite thif function so that it returns data related to condition related to action
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


const checkIfActionCanBeFullfilled = async (intent) => {
    const { intent: intentType, condition } = intent;

    // const conditions = ACTION_CHECKERS[intentType]?.conditionCheckers;
    const actions = ACTION_PERFORMERS[intentType]?.actions;

    // if (!conditions) return false;

    let conditionCanBeFullfilled = true;

    if (condition) {
        conditionCanBeFullfilled = await evaluateConditionTree(condition);
    }

    logger.info({ scope: 'checkIfActionCanBeFullfilled' }, `Action can be fullfilled: ${conditionCanBeFullfilled}`);

    if (!conditionCanBeFullfilled) return false;

    for (const fn of actions) {
        const result = await fn(intent.action);

        if (!result) {
            actionCanBeDone = false;
            break;
        }
    }

    logger.info({ scope: 'checkIfActionCanBeFullfilled' }, `Action can be done: ${actionCanBeDone}`);

    return actionCanBeDone;
}

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
        // console.log('dataText1', dataText);
        const json = extractJson(dataText.response);

        console.log('object', JSON.stringify(json))

        // const data = await response.json();

        // const output = JSON.parse(data.response);

        // logger.info({ data: JSON.stringify(output) }, 'Parsed string');

        // console.log("here-lol", JSON.stringify(output));

        // const actionCanBeMade = await checkIfActionCanBeFullfilled(output);

        // res.send({ actionCanBeDone: actionCanBeMade });

        res.send({ actionCanBeDone: true });
    } catch(err) {
        logger.error(err, 'Error extracting intent');
        res.status(500).json({ error: 'Failed to extract intent' });
    }
});

app.listen(PORT, () => {
    logger.info(`Intent extractor server running at http://localhost:${PORT}`);
});
  