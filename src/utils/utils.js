// const speakGameState = (gameState, gameLanguage) => {
//   if ("speechSynthesis" in window && gameState) {
//     const textToSpeak = `${gameState.description}. ${gameState.question}`;
//     const utterance = new SpeechSynthesisUtterance(textToSpeak);

//     // Set language based on gameLanguage (basic mapping; expand as needed for more languages)
//     let langCode;
//     switch (gameLanguage) {
//       case "English":
//         langCode = "en-US";
//         break; // en-US
//       case "Polish":
//         langCode = "pl-PL";
//         break; // pl-PL
//       // case 'Spanish': langCode = 'es-ES'; break;
//       // case 'French': langCode = 'fr-FR'; break;
//       // case 'German': langCode = 'de-DE'; break;
//       // case 'Italian': langCode = 'it-IT'; break;
//       // case 'Portuguese': langCode = 'pt-PT'; break;
//       // case 'Russian': langCode = 'ru-RU'; break;
//       // case 'Japanese': langCode = 'ja-JP'; break;
//       // case 'Chinese': langCode = 'zh-CN'; break;
//       default:
//         langCode = "en-US"; // en-US
//     }
//     utterance.lang = langCode;
//     // utterance.lang = 'pl';
//     // utterance.voice = 'male1';

//     // Optional: Adjust rate/pitch/volume if needed
//     utterance.rate = 1.0; // Normal speed
//     utterance.pitch = 1.0; // Normal pitch
//     utterance.volume = 1.0; // Full volume

//     // Speak it
//     window.speechSynthesis.speak(utterance);
//   } else {
//     console.warn("Text-to-Speech is not supported in this browser.");
//   }
// };

// // useEffect(() => {
// //   if (gameState) {
// //     speakGameState(gameState, gameLanguage);
// //   }
// // }, [gameState]);

const puterModels = [
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5-chat-latest",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gpt-4.5-preview",
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "o1-mini",
  "o1-pro",
  "o3",
  "o3-mini",
  "o4-mini",
];

const systemPrompt = (gameLanguage) => {
  return `You are a creative game master for an interactive text adventure game. You must respond ONLY with valid JSON in this exact format:

{
  "type": "text_input" or "choice" or "item_action",
  "description": "detailed description of the current scene/situation",
  "question": "question or prompt for the player",
  "choices": ["option 1", "option 2"] (only if type is "choice", otherwise omit),
  "svg_scene": "<svg viewBox=\\"0 0 300 200\\" class=\\"w-full h-48 bg-gradient-to-b from-sky-300 to-green-300 rounded\\"><!-- SVG elements here --></svg>",
  "new_item": {
    "name": "Item Name",
    "description": "what it does",
    "emoji": "📱"
  } (only when player finds/gets new item, otherwise omit),
  "context": "additional atmospheric context"
}

IMPORTANT: Respond entirely in ${gameLanguage}. All text fields must be in ${gameLanguage}.

Special Rules for SVG Scene:
- Generate a complete SVG code representing the current scene.
- Use viewBox="0 0 300 200"
- Include class="w-full h-48 bg-gradient-to-b from-sky-300 to-green-300 rounded"
- Always include a representation of the player at center (around x:150, y:100)
- Add 3-6 other elements around the player
- Use coordinates from 50 to 250 for x, 50 to 150 for y
- Add descriptive labels to important elements using <text>
- Make scenes feel alive and detailed
- You can use any SVG elements: circles, rects, paths, polygons, etc.
- Include background elements like sun, ground if appropriate

Item System:
- Use "item_action" type when player tries to use an inventory item
- Add "new_item" only when player finds/picks up something new
- Items can be anything: weapons, tools, food, magical objects, phones, keys, etc.
- Sometimes offer a third choice to pick up/interact with items`;
};

// Fallback
const fallbackResponse = {
  type: "text_input",
  description:
    "You find yourself in a mysterious place. The AI encountered an error, but your adventure continues...",
  question: "What do you do?",
  svg_scene: `<svg viewBox="0 0 300 200" class="w-full h-48 bg-gradient-to-b from-sky-300 to-green-300 rounded"><circle cx="150" cy="100" r="10" fill="#F59E0B"/><rect x="100" y="80" width="20" height="40" fill="#92400E"/><polygon points="150,20 100,100 200,100" fill="#6B7280"/></svg>`,
  context: "Something went wrong with the storyteller, but the magic of adventure persists.",
};

const gameLangs = [
  { lang: "English", lng: null },
  { lang: "Polish", lng: "Polski" },
  { lang: "Spanish", lng: "Español" },
  { lang: "French", lng: "Français" },
  { lang: "German", lng: "Deutsch" },
  { lang: "Italian", lng: "Italiano" },
  { lang: "Portuguese", lng: "Português" },
  { lang: "Russian", lng: "Русский" },
  { lang: "Japanese", lng: "日本語" },
  { lang: "Chinese", lng: "中文" },
];

export { puterModels, systemPrompt, fallbackResponse, gameLangs };
