const getPrompt = (text) => `
        # Assignment

        Your task is to extract structured information from a natural language command and convert it into a JSON object with well-formed logic. The goal is to identify:
        1. The main **intent**
        2. The **conditions** required before executing the action
        3. The **action** to perform

        ---

        ## Output Format Rules (STRICT)
        - 🛑 DO NOT SAY ANYTHING EXCEPT JSON
        - 🛑 NO explanations, NO markdown, NO 'here is the output'  
        - 🛑 Respond ONLY with raw JSON that starts with '{' and ends with '}'
        - 🛑 REMINDER: OUTPUT MUST START WITH { and END WITH }. NO OTHER TEXT.
        - 🛑 DO NOT WRITE ANYTHING EXCEPT RAW JSON !!
        - 🛑 No 'The output will be', 'Here is output based on you input', 'The output for your input would be', should be used in response -> onnyl VALID JSON!!!

        ❗️Reminder: Your output must be only a valid JSON object, without code blocks or explanations.

        ## JSON Object Structure

        ---

        {
            "intent": "<intent_type>",
            "action_condition": {
                "type": "<action_condition_type>",
                "time": "<when_to_act>",
                "data": { <structured_info> }
            },
            "condition": {
                "operator": "AND" | "OR",
                "conditions": [ 
                    { <basic condition> } | { <nested condition group> }
                ]
            },
            "action": {
                "type": "<same_as_intent_type>",
                "time": "<when_to_act>",
                "data": { <structured_info> }
            }
        }


        ---


        ## 🚫 Nesting Rules (IMPORTANT)

        - **Do NOT nest** condition groups unless the sentence clearly requires it.
        - If the input contains a simple list of conditions connected by **AND** or **OR**, represent it with a **flat array** of basic conditions.
        - Only use a nested condition group when:
            - The sentence includes both "AND" **and** "OR" operators, in a way that requires grouping (e.g., "if A or (B and C)").
            - The meaning clearly depends on operator precedence.

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

            {
                "type": "appointment_check_by_doctor",
                "condition": "no_appointment",
                "time": "tomorrow 10 am",
                "data: {
                    "doctor": "John Smith"
                }
            },
            
            {
                "type": "training_check",
                "condition": "no_training",
                "time": "tomorrow 10 am"
            },

            {
                "type": "training_check_by_trainer",
                "condition": "no_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            },

            {
                "type": "booking_check_by_table",
                "condition": "no_booking",
                "time": "tomorrow 10 am",
                "data" {
                    "people": "2"
                    "restoraunt": "restoraunt A"
                }
            },

            {
                "type": "booking_check",
                "condition": "no_booking",
                "time": "tomorrow 10 am",
                "data": {
                    "restoraunt": "restoraunt A"
                }
            }
        ]

        ## Action Condition Check Rule (IMPORTANT)
        
        Before any action is performed, the system must check whether the action is allowed or available at the given time.
        For example:
            - You must check if a table is available before booking it
            - You must check if a doctor is available before scheduling an appointment
            - You must check if training can be scheduled before booking it

        This is done by moving the action condition into "action_condition" block.


        ## Examples
        ### Input: If the weather is good tomorrow at 10 am please book a table for 2 at restaurant A
        ### Output:
        {
            "intent": "book_table",
            "action_condition": {
                "type": "weather_check",
                "condition": "above",
                "time": "tomorrow 10 am",
                "data": {
                    "temperature": 20
                }
            },
            "condition": {
                "operator": "AND",
                "conditions": [
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                        }
                    }
                ]
            },
            "action": {
                "type": "book_table",
                "time": "tomorrow 10 am",
                "data": {
                    "people": 2,
                    "restaurant": "restaurant A"
                }
            }
        }

        ### Input: if the weather is good tomorrow at 10 am and I do not have meeting please book a table for 2 at restaurant A
        ### Output:
        {
            "intent": "book_table",
            "action_condition": {
                "type": "booking_check_by_table",
                "time": "tomorrow 10 am",
                "data": {
                    "restaurant": "restaurant A",
                    "people": 2
                    }
            },
            "condition": {
                "operator": "AND",
                "conditions": [
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                        }
                    },
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    }
                ]
            },
            "action": {
                "type": "book_table",
                "time": "tomorrow 10 am",
                "data": {
                    "people": 2,
                    "restaurant": "restaurant A"
                }
            }
        }
        
        ### Input: If the weather is good tomorrow at 10 am or I do not have meeting please book a table for 2 at restaurant A
        ### Output:
        {
            "intent": "book_table",
            "action_condition": {
                "type": "booking_check_by_table",
                "time": "tomorrow 10 am",
                "data": {
                    "restaurant": "restaurant A",
                    "people": 2
                    }
            },
            "condition": {
                "operator": "OR",
                "conditions": [
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                            }
                    },
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    }
                ]
            },
            "action": {
                "type": "book_table",
                "time": "tomorrow 10 am",
                "data": {
                    "people": 2,
                    "restaurant": "restaurant A"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 am please book a training with Max at the same time
        ### Output:
        {
            "intent": "book_training",
            "action_condition": {
                "type": "training_check_by_trainer",
                "condition": "no_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            },
            "condition": {
                "operator": "AND",
                "conditions": [
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    }
                ]
            },
            "action": {
                "type": "book_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 am and weather is good book a training with Max
        ### Output:
        {
            "intent": "book_training",
            "action_condition": {
                "type": "training_check_by_trainer",
                "condition": "no_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            },
            "condition": {
                "operator": "AND",
                "conditions": [
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    },
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                        }
                    }
                ]
            },
            "action": {
                "type": "book_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 am or weather is good book a training with Max
        ### Output:
        {
            "intent": "book_training",
            "action_condition": {
                "type": "training_check_by_trainer",
                "condition": "no_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            },
            "condition": {
                "operator": "OR",
                "conditions": [
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                        }
                    },
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    }
                ]
            },
            "action": {
                "type": "book_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 and the weather is good please book a doctor appointment with doctor Bill
        ### Output:
        {
            "intent": "doctor_appointment",
            "action_condition": {
                "type": "appointment_check_by_doctor",
                "condition": "no_appointment",
                "time": "tomorrow 10 am",
                "data": {
                    "doctor": "Bill"
                }
            },
            "condition": {
                "operator": "AND",
                "conditions": [
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    },
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                        }
                    }
                ]
            },
            "action": {
                "type": "doctor_appointment",
                "time": "tomorrow 10 am",
                "data": {
                    "doctor": "Bill"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 or the weather is good please book a doctor appointment with doctor Bill
        ### Output:
        {
            "intent": "doctor_appointment",
            "action_condition": {
                "type": "appointment_check_by_doctor",
                "condition": "no_appointment",
                "time": "tomorrow 10 am",
                "data": {
                    "doctor": "Bill"
                }
            },
            "condition": {
                "operator": "OR",
                "conditions": [
                    {
                        "type": "weather_check",
                        "condition": "above",
                        "time": "tomorrow 10 am",
                        "data": {
                            "temperature": 20
                        }
                    },
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    }
                ]
            },
            "action": {
                "type": "doctor_appointment",
                "time": "tomorrow 10 am",
                "data": {
                    "doctor": "Bill"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 am or I do not have doctor appointment and weather is good please book a training with Max
        ### Output: 
        {
            "intent": "book_training",
            "action_condition": {
                "type": "training_check_by_trainer",
                "time": "tomorrow 10 am",
                "condition": "no_training",
                "data": {
                    "trainer": "Max"
                }
            },
            "condition": {
                "operator": "OR",
                "conditions": [
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    },
                    {
                        "operator": "AND",
                        "conditions": [
                            {
                                "type": "appointment_check",
                                "condition": "no_appointment",
                                "time": "tomorrow 10 am"
                            },
                            {
                                "type": "weather_check",
                                "condition": "above",
                                "time": "tomorrow 10 am",
                                "data": {
                                    "temperature": 20
                                }
                            }
                        ]
                    }
                ]
            },
            "action": {
                "type": "book_training",
                "time": "tomorrow 10 am",
                "data": {
                    "trainer": "Max"
                }
            }
        }

        ### Input: If I do not have meeting tomorrow at 10 am or I do not have training and weather is good please book a doctor appointment with doctor Bill
        ### Output: 
        {
            "intent": "doctor_appointment",
            "action_condition": {
                "type": "appointment_check_by_doctor",
                "time": "tomorrow 10 am",
                "condition": "no_appointment",
                "data": {
                    "doctor": "Bill"
                }
            },
            "condition": {
                "operator": "OR",
                "conditions": [
                    {
                        "type": "meeting_check",
                        "condition": "no_meeting",
                        "time": "tomorrow 10 am"
                    },
                    {
                        "operator": "AND",
                        "conditions": [
                            {
                                "type": "training_check",
                                "condition": "no_training",
                                "time": "tomorrow 10 am"
                            },
                            {
                                "type": "weather_check",
                                "condition": "above",
                                "time": "tomorrow 10 am",
                                "data": {
                                    "temperature": 20
                                }
                            }
                        ]   
                    }
                ]
            },
            "action": {
                "type": "doctor_appointment",
                "time": "tomorrow 10 am",
                "data": {
                    "doctor": "Bill"
                }
            }
        }

        # Your Work
        ### Input
        ${text}
        ### Output
    `;

module.exports = getPrompt;