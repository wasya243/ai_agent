export function createPrompt({ question }) {
  return [
    `
    current day = ${new Date().toISOString()} ,
    $TIME_FORMAT = ISO 8601 -> 2025-06-19T16:06:20.196Z ,
      ;`,
    `Віднеси це до настпупного наміру з набору -> `,
    `[doctor_appointment, book_table, book_training];`,
    `Виконай перевірки за цими параметрами -> `,
    ` ## 🚫 Nesting Rules (IMPORTANT)

        - **Do NOT nest** condition groups unless the sentence clearly requires it.
        - If the input contains a simple list of conditions connected by **AND** or **OR**, represent it with a **flat array** of basic conditions.
        - Only use a nested condition group when:
            - The sentence includes both "AND" **and** "OR" operators, in a way that requires grouping (e.g., "if A or (B and C)").
            - The meaning clearly depends on operator precedence.

        ---

        ## Additional Role for conditions

        - If the action itself depends on external availability (e.g., whether the doctor is available or a table can be booked), include that feasibility check as a condition, not inside the action block. Only once all conditions are met (including that the action is feasible), the action should be executed.

        ## Condition Types

        | Type                          | Description                                               |
        |-------------------------------|-----------------------------------------------------------|
        | meeting_check                 | Checks if no meeting exists                               |
        | weather_check                 | Checks if weather is above or below a threshold           |
        | appointment_check             | Checks if no doctor appointment exists                    |
        | training_check                | Checks if no training exists                              |
        | booking_check                 | Checks if no bookings already at some restoraunt          |
        | appointment_check_by_doctor   | Checks if no doctor appointment exists for given doctor   |
        | training_check_by_trainer     | Checks if no training exists  with given trainer          |
        | booking_check_by_table        | Checks if given table is not booked                       |
        
         Array condition objects examples:
        [
            {
            "type": "meeting_check",
            "condition": "no_meeting",
            "time": "tomorrow 10 am"
            },
            {
                "type": "weather_check",
                "condition": "above",
                "time": "tomorrow 10 am"
                "data": {
                    "temperature": 20,
                }
            },
            {
                "type": "appointment_check",
                "condition": "no_appointment",
                "time": "tomorrow 10 am"
            },
            ]
        ;`,
    `Дай відповіді на запитання у наступному форматі JSON ->`,
    `        {
            "intent": "<intent_type>",  
            "condition": {
                "operator": "AND" | "OR",
                "conditions": [ 
                    { <basic condition> } | { <nested condition group> }
                ]
            },
            "action": {
                "type": "<same_as_intent_type>",
                "time": "<$TIME_FORMAT>",
                "data": { <structured_info> }
            }
        }
         ;`,
    `Твоя відповідь повинна мати наступний вигляд. Це є лише зразком. Я хочу лише подібний вигляд як JSON формат для подальшого використання. Ти повинен завжди верати JSON формат -> `,
    ` 
        {
            "intent": "book_training",
            "condition": {
                "operator": "AND",
                "conditions": [
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "2025-06-19T16:06:20.196Z"
                    },
                    {
                        "type": "training_check_by_trainer",
                        "condition": "no_training",
                        "time": "2025-06-19T16:06:20.196Z",
                        "data": {
                            "trainer": "Max"
                        }
                    }
                ]
            },
            "action": {
                "type": "book_training",
                "time": "2025-06-19T16:06:20.196Z",
                "data": {
                    "trainer": "Max"
                }
            }
        }
      ;`,
    `Твоє запитання на яке я очікую відповідь -> `,
    question,
    ';',
  ].join(' ');
}
