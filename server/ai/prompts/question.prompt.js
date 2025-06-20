export function intentQuestionPrompt({ text }) {
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

    ## 🔒 Output Format Rules:
        - Respond with a single valid **JSON object**
        - Respond ONLY with a valid JSON object. Do NOT explain. Do NOT include code blocks or markdown.
        - All keys and values must be in plain JSON, properly quoted
        - Always include availability or feasibility checks for the action (e.g., doctor availability, restaurant table availability) as part of the condition block if the action depends on them.
        - Use **ISO 8601 (UTC)** format for all 'time' fields — see '$TIME_FORMAT'
    ---

    ## 🧠 Field Format Reference
      - List of intentions you can use (<intent_type>) -> [doctor_appointment, book_table, book_training] 

    ## JSON Object Structure
    ---
    {
      "intent": "<intent_type>",  
    }
    ---

    **Input**: If I do not have meeting tomorrow at 10 am please book a training with Max  
    **Output**:
    { 
      "intent": "book_training",
    }

    **Input**: If the weather is good tomorrow at 10 am please book a table for 2 at restaurant A  
    **Output**:
    {
      "intent": "book_table",
    }

    # Your Work
    ### Input
    ${text}
    ### Output
  `;
}
