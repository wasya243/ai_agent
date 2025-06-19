import { Intents } from './intent';

export const defineIntentMessages = [
  // {
  //   type: 'book_table',
  //   message:
  //     'If the weather is good tomorrow at 10 am please book a table for 2 at restaurant A',
  // },
  // {
  //   type: 'book_table',
  //   message:
  //     'if the weather is good tomorrow at 10 am and I do not have meeting please book a table for 2 at restaurant A',
  // },
  // {
  //   type: 'book_table',
  //   message:
  //     'If the weather is good tomorrow at 10 am or I do not have meeting please book a table for 2 at restaurant A',
  // },
  // {
  //   type: 'book_training',
  //   message:
  //     'If I do not have meeting tomorrow at 10 am please book a training with Max at the same time',
  // },
  // {
  //   type: 'book_training',
  //   message:
  //     'If I do not have meeting tomorrow at 10 am and weather is good book a training with Max',
  // },
  // {
  //   type: 'book_training',
  //   message:
  //     'If I do not have meeting tomorrow at 10 am or weather is good book a training with Max',
  // },
  // {
  //   type: 'doctor_appointment',
  //   message:
  //     'If I do not have meeting tomorrow at 10 and the weather is good please book a doctor appointment with doctor Bill',
  // },
  // {
  //   type: 'doctor_appointment',
  //   message:
  //     'If I do not have meeting tomorrow at 10 or the weather is good please book a doctor appointment with doctor Bill',
  // },
  // {
  //   type: 'book_training',
  //   message:
  //     'If I do not have meeting tomorrow at 10 am or I do not have doctor appointment and weather is good please book a training with Max',
  // },
  // {
  //   type: 'doctor_appointment',
  //   message:
  //     'If I do not have meeting tomorrow at 10 am or I do not have training and weather is good please book a doctor appointment with doctor Bill',
  // },

  // Custom intent
  {
    type: Intents.TableOrRestourant,
    message:
      'Book a table for tomorrow at 12:30 for groups of 6 at Cambodia Restaurant',
  },
  {
    type: Intents.Doctor,
    message:
      'I can see that my back is starting to hurt. I think I should go to the doctor. Make an appointment for me for the day after tomorrow at 9:00 a.m.',
  },
  {
    type: Intents.Training,
    message: 'Book a training session in the Farash gym in 6 days at 19:30',
  },
  // {
  //   type: 'template',
  //   message: 'template',
  // },
];
