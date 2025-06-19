import { useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = async () => {
    const speechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new speechRecognition();
    recognition.lang = 'en_US';
    recognition.interimResults = false; // disable partial results
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // allow capturing longer inputs

    let finalTranscript = '';

    recognition.start();

    recognition.onresult = async (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript.trim() + ' ';
        }
      }

      if (finalTranscript) {
        recognition.stop();
        setText(finalTranscript.trim());
      }

      try {
        const response = await fetch(
          'http://localhost:3000/api/extract-intent',
          {
            method: 'POST',
            body: JSON.stringify({
              text: 'If I do not have meeting tomorrow at 10 am or I do not have training and weather is good please book a doctor appointment with doctor Bill',
            }),
            // body: JSON.stringify({ text: finalTranscript }),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        console.log('here-data', data);

        const message = data.actionCanBeDone
          ? 'Action can be done'
          : 'Action cannot be done';
        speak(message);
      } catch (err) {
        console.error(err);
      }
    };

    recognition.onerror = (event) => {
      console.log(`Error occurred in recognition: ${event.error}`);
    };

    recognition.onspeechend = () => {
      console.log(`speech end`);
      recognition.stop();
    };

    console.log('Send message');

    try {
      const response = await fetch('http://localhost:3000/api/extract-intent', {
        method: 'POST',
        body: JSON.stringify({
          text: 'If I do not have meeting tomorrow at 10 am or I do not have training and weather is good please book a doctor appointment with doctor Bill',
        }),
        // body: JSON.stringify({ text: finalTranscript }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('here-data', data);

      const message = data.actionCanBeDone
        ? 'Action can be done'
        : 'Action cannot be done';
      speak(message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <h1>Voice Asssitant</h1>
      <button onClick={startVoiceInput}>Speak</button>
      <div>Spoken text: {text}</div>
    </>
  );
}

export default App;
