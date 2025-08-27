export const speakGameState = (gameState, gameLanguage) => {
  if ('speechSynthesis' in window && gameState) {
    const textToSpeak = `${gameState.description}. ${gameState.question}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Set language based on gameLanguage (basic mapping; expand as needed for more languages)
    let langCode;
    switch (gameLanguage) {
      case 'English': langCode = 'en-US'; break; // en-US
      case 'Polish': langCode = 'pl-PL'; break; // pl-PL
      // case 'Spanish': langCode = 'es-ES'; break;
      // case 'French': langCode = 'fr-FR'; break;
      // case 'German': langCode = 'de-DE'; break;
      // case 'Italian': langCode = 'it-IT'; break;
      // case 'Portuguese': langCode = 'pt-PT'; break;
      // case 'Russian': langCode = 'ru-RU'; break;
      // case 'Japanese': langCode = 'ja-JP'; break;
      // case 'Chinese': langCode = 'zh-CN'; break;
      default: langCode = 'en-US'; // en-US
    }
    utterance.lang = langCode;
    // utterance.lang = 'pl';
    // utterance.voice = 'male1';

    // Optional: Adjust rate/pitch/volume if needed
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

   
    // Speak it
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-Speech is not supported in this browser.');
  }
};

// useEffect(() => {
//   if (gameState) {
//     speakGameState(gameState, gameLanguage);
//   }
// }, [gameState]);