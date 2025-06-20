export function baseVariables() {
  const {
    currentTime = new Date().toISOString(),
    timeFormat = '2025-06-20T09:12:26.844Z',
    localTimezone = 'Europe/Kyiv',
  } = {};
  return ` 
    ## Variables for better understanding and to use notes in the text below

    $CURRENT_TIME = ${currentTime}  
    $LOCAL_TIMEZONE = ${localTimezone}  
    $TIME_FORMAT = ISO 8601 → e.g. ${timeFormat}

    ---
    `;
}
