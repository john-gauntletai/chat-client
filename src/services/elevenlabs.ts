const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
const DEFAULT_VOICE_ID = 'TxGEqnHWrfWFTfGW9XjX'; // Example voice ID, you can change this

const VOICE_IDS = {
  user_2rJxFleQJFcCAW1qDksxYGmNf1K: 'q6dOQ7cWvu7J8lcW5IzF',
  user_2reJhBOcFpvgdNzE0pQAHH1geAd: 'UsKJP4mZ2SxON9rcRdwm',
  user_2rGpXSfQmGx7s5Mh6OiruynsI8k: 'UsKJP4mZ2SxON9rcRdwm',
  user_2rSXQp72p7FxfR8YpUzpixk4IDs: 'CwhRBWXzGAHq8TQ4Fs17',
  agent: 'D38z5RcWu1voky8WS1ja',
};

export const playAudio = async (text: string, userId?: string) => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${
        VOICE_IDS[userId] || DEFAULT_VOICE_ID
      }`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) throw new Error('Failed to generate speech');

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};
