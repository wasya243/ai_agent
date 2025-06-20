import { baseVariables } from './base.variables.js';

export function intentQuestionPrompt({ text }) {
  return `
   ${baseVariables()}

    ## 🔒 Output Format Rules:
        - Respond with a single valid **JSON object**
        - Respond ONLY with a valid JSON object. Do NOT explain. Do NOT include code blocks or markdown.
        - All keys and values must be in plain JSON, properly quoted      
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

export function conditionQuestionPrompt({ text }) {
  return `
  ${baseVariables()}
  
   ## 🔒 Output Format Rules:
      - Respond with a single valid **JSON object**
      - Respond ONLY with a valid JSON object. Do NOT explain. Do NOT include code blocks or markdown.
      - All keys and values must be in plain JSON, properly quoted
      - Always include availability or feasibility checks for the action (e.g., doctor availability, restaurant table availability) as part of the condition block if the action depends on them.
      - Use **ISO 8601 (UTC)** format for all 'time' fields — see '$TIME_FORMAT'

    ## JSON Object Structure

    ---

      {        
        "condition": {
          "operator": "AND" | "OR",
          "conditions": [ 
            { <basic condition> } | { <nested condition group> }
          ]
        },
        "action": {           
          "time": "<when_to_act>",
          "data": { <structured_info> }
        }
      }

    ---

      ## 🧠 Field Format Reference

      | Field                  | Required | Format / Rule                                                             | Example                                 |
      |------------------------|----------|---------------------------------------------------------------------------|-----------------------------------------|
      |         time           | ✅       | ISO 8601 UTC datetime — must match '$TIME_FORMAT'                         | "2025-06-20T09:30:00.000Z"              |
      
        
    ---

     ## 🚫 Nesting Rules (IMPORTANT)

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
            "time": "2025-06-20T09:12:26.844Z"
            },

            {
                "type": "weather_check",
                "condition": "above",
                "time": "2025-06-20T09:12:26.844Z",
                "data": {
                    "temperature": 20,
                }
            },
            
            {
                "type": "appointment_check",
                "condition": "no_appointment",
                "time": "2025-06-20T09:12:26.844Z"
            },

            {
                "type": "appointment_check_by_doctor",
                "condition": "no_appointment",
                "time": "2025-06-20T09:12:26.844Z",
                "data: {
                    "doctor": "John Smith"
                }
            },
            
            {
                "type": "training_check",
                "condition": "no_training",
                "time": "2025-06-20T09:12:26.844Z"
            },

            {
                "type": "training_check_by_trainer",
                "condition": "no_training",
                "time": "2025-06-20T09:12:26.844Z",
                "data": {
                    "trainer": "Max"
                }
            },

            {
                "type": "booking_check_by_table",
                "condition": "no_booking",
                "time": "2025-06-20T09:12:26.844Z",
                "data" {
                    "people": "2"
                    "restoraunt": "restoraunt A"
                }
            },

            {
                "type": "booking_check",
                "condition": "no_booking",
                "time": "2025-06-20T09:12:26.844Z",
                "data": {
                    "restoraunt": "restoraunt A"
                }
            }
        ]
    ---

    ## Examples
    ### Input: If the weather is good tomorrow at 10 am please book a table for 2 at restaurant A
    ### Output:
    {        
        "condition": {
            "operator": "AND",
            "conditions": [
                {
                    "type": "weather_check",
                    "condition": "above",
                    "time": "2025-06-20T09:12:26.844Z",
                    "data": {
                        "temperature": 20,
                    }
                },
                {
                    "type": "booking_check_by_table",
                    "condition": "no_booking",
                    "time": "2025-06-20T09:12:26.844Z",
                    "data": {
                        "restaurant": "restaurant A",
                        "people": 2
                    }
                }
            ]
        },
        "action": {              
            "time": "2025-06-20T09:12:26.844Z",
            "data": {
                "people": 2,
                "restaurant": "restaurant A"
            }
        }
    }

    ### Input: If the weather is good tomorrow at 10 am or I do not have meeting please book a table for 2 at restaurant A
    ### Output:
    {         
        "condition": {
            "operator": "AND",
            "conditions: [
                {
                    "type": "booking_check_by_table",
                    "time": "2025-06-20T09:12:26.844Z",
                    "condition": "no_booking",
                    "data": {
                        "restaurant": "restaurant A",
                        "people": 2
                    }
                },
                {
                    "operator": "OR",
                    "conditions": [
                        {
                            "type": "weather_check",
                            "condition": "above",
                            "time": "2025-06-20T09:12:26.844Z",
                            "data": {
                                "temperature": 20
                            }
                        },
                        {
                            "type": "meeting_check",
                            "condition": "no_meeting",
                            "time": "2025-06-20T09:12:26.844Z"
                        },
                    ]
                }
            ]
        },
        "action": {               
            "time": "2025-06-20T09:12:26.844Z",
            "data": {
                "people": 2,
                "restaurant": "restaurant A"
            }
        }
    }

    ### Input: If I do not have meeting tomorrow at 10 am or weather is good book a training with Max
    ### Output:
    {
      
        "condition": {
            "operator": "AND",
            "conditions": [
                {
                  "type": "training_check_by_trainer",
                  "condition": "no_training",
                  "time": "2025-06-20T09:12:26.844Z",
                  "data": {
                      "trainer": "Max"
                  }
                },
                {
                  "operator": "OR",
                  "conditions": [
                      {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "2025-06-20T09:12:26.844Z",
                        "data": {
                            "temperature": 20
                        }
                      },
                      {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "2025-06-20T09:12:26.844Z"
                      },                        
                  ]
                }
            ]
        },
        "action": {              
            "time": "2025-06-20T09:12:26.844Z",
            "data": {
                "trainer": "Max"
            }
        }
    }

    ---

    # Your Work
    ### Input
    ${text}
    ### Output
  `;
}
