const fetch = require('node-fetch-commonjs');
const chrono = require('chrono-node');

const logger = require('../logger');

const checkWeather = async ({ time, temperature }) => {
    logger.info({ scope: 'checkWeather', data: JSON.stringify({ time, temperature }) }, 'Incoming data');

    const parsed = chrono.parseDate(time); 

    logger.info({ scope: 'checkWeather', data: JSON.stringify({ time: parsed }) }, 'Parsed time');

    const response = await fetch(`${process.env.WEATHER_API}/api/weather`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                time: parsed.toISOString()
            }),
    });

    const parsedResponse = await response.json();
    
    logger.info({ scope: 'checkWeather', data: JSON.stringify(parsedResponse) }, 'Parsed responsse');

    if (!parsedResponse.weather) return false;

    return parsedResponse.weather?.temperature === temperature; 
}

module.exports = {
    checkWeather
};