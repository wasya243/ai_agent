export function createPrompt({ question, variables }) {
  const {
    currentTime = new Date().toISOString(),
    timeFormat = '2025-06-20T09:12:26.844Z',
    localTimezone = 'Europe/Kyiv',
  } = variables || {};

  return `
# 🔧 Variables

$CURRENT_TIME = ${currentTime}  
$LOCAL_TIMEZONE = ${localTimezone}  
$TIME_FORMAT = ISO 8601 → e.g. ${timeFormat}

---

## 🔒 Output Format Rules:

- Respond with a single valid **JSON object**
- Respond **ONLY** with a valid JSON object — do **NOT** explain or include markdown/code blocks
- All keys and values must be in valid JSON (double quotes, no trailing commas)
- Use **ISO 8601 (UTC)** format for all \`time\` fields — see \`$TIME_FORMAT\`
- Always include feasibility checks (e.g. trainer, doctor, table availability) in \`condition\`, never in \`action\`

---

## 🧠 Field Format Reference

| Field                  | Required | Format / Rule                                                             | Example                                 |
|------------------------|----------|---------------------------------------------------------------------------|-----------------------------------------|
| \`intent\`               | ✅       | One of: \`doctor_appointment\`, \`book_table\`, \`book_training\`           | "book_table"                            |
| \`condition.operator\`   | ✅       | "AND" or "OR"                                                              | "AND"                                   |
| \`condition.conditions\` | ✅       | Array of condition objects                                                 | See below                               |
| \`condition.type\`       | ✅       | One of supported condition types                                           | "meeting_check"                         |
| \`condition.condition\`  | ✅       | Specific keyword like \`no_meeting\`, \`above\`, \`no_training\`, etc.     | "no_meeting"                            |
| \`condition.time\`       | ✅       | ISO 8601 UTC datetime — must match \`$TIME_FORMAT\`                         | "2025-06-20T09:30:00.000Z"              |
| \`condition.data\`       | ⬅️       | Required only for specific types (see below)                              | { "temperature": 20 }                   |
| \`action.type\`          | ✅       | Must match \`intent\`                                                      | "book_training"                         |
| \`action.time\`          | ✅       | ISO 8601 UTC datetime                                                      | "2025-06-20T09:30:00.000Z"              |
| \`action.data\`          | ✅       | Structured info depending on \`intent\`                                    | { "restaurant": "A", "people": 2 }      |

---

## 🧩 Condition Types and Required Fields

| type                        | condition       | data fields (if required)                    |
|-----------------------------|------------------|-----------------------------------------------|
| meeting_check               | no_meeting       | —                                             |
| weather_check               | above, below     | temperature (number)                          |
| appointment_check           | no_appointment   | —                                             |
| appointment_check_by_doctor | no_appointment   | doctor (string)                               |
| training_check              | no_training      | —                                             |
| training_check_by_trainer   | no_training      | trainer (string)                              |
| booking_check               | no_booking       | —                                             |
| booking_check_by_table      | no_booking       | restaurant (string), people (number)          |

---

## 🕒 Time Interpretation Guidelines

- Resolve expressions like "tomorrow", "today", "next Monday" relative to \`$LOCAL_TIMEZONE\`
- Then convert to UTC using ISO 8601 format — \`$TIME_FORMAT\`
- NEVER assume "tomorrow 12:30" means UTC time directly — it must be local first, then UTC

### Example:

Input: "Book a table for tomorrow at 12:30 for 6 at Cambodia Restaurant"  
Assume:  
→ \`$CURRENT_TIME\` = ${currentTime}  
→ \`$LOCAL_TIMEZONE\` = ${localTimezone}

Resolve:  
→ Local time = 2025-06-21T12:30:00+03:00  
→ UTC = 2025-06-21T09:30:00.000Z

✅ Use UTC value in all \`time\` fields.

---

## 🚫 Nesting Rules (IMPORTANT)

- Use flat conditions with a single operator unless sentence logic **requires** grouping
- Only use nested groups when "AND" and "OR" are mixed and their grouping affects the meaning
- Do **not** create nested conditions unless needed

---

## 📌 Notes

- \`action.type\` must exactly match \`intent\`
- Use \`$TIME_FORMAT\` in all \`time\` fields
- Feasibility checks (like trainer or table availability) belong inside \`condition\` block

---

## ✅ Examples

### Example 1 — Book a table if weather is good

**Input**: If the weather is good tomorrow at 10 am please book a table for 2 at restaurant A  
**Output**:
{
  "intent": "book_table",
  "condition": {
    "operator": "AND",
    "conditions": [
      {
        "type": "weather_check",
        "condition": "above",
        "time": "2025-06-21T07:00:00.000Z",
        "data": {
          "temperature": 20
        }
      },
      {
        "type": "booking_check_by_table",
        "condition": "no_booking",
        "time": "2025-06-21T07:00:00.000Z",
        "data": {
          "restaurant": "restaurant A",
          "people": 2
        }
      }
    ]
  },
  "action": {
    "type": "book_table",
    "time": "2025-06-21T07:00:00.000Z",
    "data": {
      "restaurant": "restaurant A",
      "people": 2
    }
  }
}

---

### Example 2 — Book training if no meeting

**Input**: If I do not have meeting tomorrow at 10 am please book a training with Max  
**Output**:
{
  "intent": "book_training",
  "condition": {
    "operator": "AND",
    "conditions": [
      {
        "type": "meeting_check",
        "condition": "no_meeting",
        "time": "2025-06-21T07:00:00.000Z"
      },
      {
        "type": "training_check_by_trainer",
        "condition": "no_training",
        "time": "2025-06-21T07:00:00.000Z",
        "data": {
          "trainer": "Max"
        }
      }
    ]
  },
  "action": {
    "type": "book_training",
    "time": "2025-06-21T07:00:00.000Z",
    "data": {
      "trainer": "Max"
    }
  }
}

---

# Your Task

### Input:
${question}

### Output:
`;
}
