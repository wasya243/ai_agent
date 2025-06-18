const fetch = require('node-fetch-commonjs');
const chrono = require('chrono-node');

const logger = require('../logger');

const checkIfNoDoctorAppointment = async ({ time }) => {
    logger.info({ scope: 'checkIfNoDoctorAppointment', data: JSON.stringify({ time }) }, 'Incoming data');

    const parsed = chrono.parseDate(time);

    logger.info({ scope: 'checkIfNoDoctorAppointment', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.DOCTORS_API}/api/check-time`, {
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

    logger.info({ scope: 'checkIfNoDoctorAppointment', data: JSON.stringify(parsedResponse) }, 'Parsed response');

    return available;
};

const checkIfDoctorAppointmentCanBeDone = async ({ data, time }) => {
    logger.info({ scope: 'checkIfDoctorAppointmentCanBeDone', data: JSON.stringify({ time, data }) }, 'Incoming data');

    const parsed = chrono.parseDate(time);

    logger.info({ scope: 'checkIfDoctorAppointmentCanBeDone', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.DOCTORS_API}/api/can-make-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: parsed.toISOString(),
                doctor: data.doctor,
            }),
    });

    const parsedResponse = await response.json();
    const { available } = parsedResponse;

    logger.info({ scope: 'checkIfDoctorAppointmentCanBeDone', data: JSON.stringify(parsedResponse) }, 'Parsed response');

    return available;
}

// TODO: rewrite
const bookDoctorAppointment = async ({ data, time }) => {
    logger.info({ scope: 'bookDoctorAppointment', data: JSON.stringify({ time, data }) }, 'Incoming data');

    const parsed = chrono.parseDate(time);

    logger.info({ scope: 'bookDoctorAppointment', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.DOCTORS_API}/api/can-make-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: parsed.toISOString(),
                doctor: data.doctor,
            }),
    });

    const parsedResponse = await response.json();
    const { available } = parsedResponse;

    logger.info({ scope: 'bookDoctorAppointment', data: JSON.stringify(parsedResponse) }, 'Parsed response');

    return available;
}

module.exports = {
    checkIfDoctorAppointmentCanBeDone,
    checkIfNoDoctorAppointment,
    bookDoctorAppointment,
}