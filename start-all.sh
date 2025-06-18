#!/bin/bash

echo "Starting doctor-api"
cd doctor-api && npm run start &

echo "Starting meetings-api"
cd meetings-api && npm run start &

echo "Starting restoraunt-api"
cd restoraunt-api && npm run start &

echo "Starting training-api"
cd training-api && npm run start &

echo "Starting weather-api"
cd weather-api && npm run start