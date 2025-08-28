/* store.js */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { systemPrompt, fallbackResponse, fullPrompt } from "./utils";
import { set as idbSet, del as idbDel, keys as idbKeys } from "idb-keyval";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { jsonrepair } from "jsonrepair";

function updateConfig(partialUpdate) {
  const current = JSON.parse(localStorage.getItem("rpg-ai") || "{}");
  const newConfig = { ...current, ...partialUpdate };
  localStorage.setItem("rpg-ai", JSON.stringify(newConfig));
  return newConfig;
}

// --- default config ---
if (!localStorage.getItem("rpg-ai")) {
  localStorage.setItem(
    "rpg-ai",
    JSON.stringify({
      ollamaUrl: "http://localhost:11434",
      modelName: "llama3.2:latest",
      gameLanguage: "English",
      backend: "ollama",
      geminiKey: "",
    }),
  );
}

const initialConfig = JSON.parse(localStorage.getItem("rpg-ai") || "{}");
const getPuter = () => (typeof window !== "undefined" && window.puter ? window.puter : null);

const useGameStore = create(
  devtools((set, get) => ({
    ...initialConfig,
    gameState: null,
    isLoading: false,
    inputValue: "",
    gameHistory: [],
    availableModels: [],
    isConfigOpen: false,
    inventory: [],
    selectedItem: null,
    worldDescription: "",
    savedGames: [],
    messages: [],
    puter: getPuter(),

    setGameState: (value) => set({ gameState: value }),
    setIsLoading: (value) => set({ isLoading: value }),
    setInputValue: (value) => set({ inputValue: value }),
    setGameHistory: (value) => set({ gameHistory: value }),
    setAvailableModels: (value) => set({ availableModels: value }),
    setIsConfigOpen: (value) => set({ isConfigOpen: value }),
    setInventory: (value) => set({ inventory: value }),
    setSelectedItem: (value) => set({ selectedItem: value }),
    setWorldDescription: (value) => set({ worldDescription: value }),
    setSavedGames: (value) => set({ savedGames: value }),
    setMessages: (value) => set({ messages: value }),
    setOllamaUrl: (value) => {
      updateConfig({ ollamaUrl: value });
      set({ ollamaUrl: value });
    },
    setModelName: (value) => {
      updateConfig({ modelName: value });
      set({ modelName: value });
    },
    setGameLanguage: (value) => {
      updateConfig({ gameLanguage: value });
      set({ gameLanguage: value });
    },
    setBackend: (value) => {
      updateConfig({ backend: value });
      set({ backend: value });
    },
    setGeminiKey: (value) => {
      updateConfig({ geminiKey: value });
      set({ geminiKey: value });
    },

    fetchAvailableModels: async () => {
      const { ollamaUrl } = get();
      try {
        const response = await fetch(`${ollamaUrl}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          set({ availableModels: data.models.map((model) => model.name) });
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    },

    loadSavedGames: async () => {
      const allKeys = await idbKeys();
      const gameKeys = allKeys.filter((key) => key.startsWith("game-session-"));
      set({ savedGames: gameKeys });
    },

    saveGame: async (sessionId) => {
      const { gameState, gameHistory, inventory, worldDescription, gameLanguage, messages } = get();
      const gameData = {
        gameState,
        gameHistory,
        inventory,
        worldDescription,
        gameLanguage,
        messages,
      };
      await idbSet(sessionId, gameData);
      await get().loadSavedGames();
      alert(`Game saved as ${sessionId}`);
    },

    deleteGame: async (sessionId) => {
      await idbDel(sessionId);
      await get().loadSavedGames();
    },

    testOllamaConnection: async () => {
      const { ollamaUrl } = get();
      try {
        const response = await fetch(`${ollamaUrl}/api/tags`);
        return response.ok;
      } catch (error) {
        console.error("Failed to connect to Ollama:", error);
        return false;
      }
    },

    generateAIResponse: async (playerAction = null, initialDesc = null) => {
      const { messages, inventory, backend, modelName, ollamaUrl, gameLanguage, geminiKey } = get();
      const currentMessages = [...messages];

      const inventoryContext =
        inventory.length > 0
          ? `Player's inventory: ${inventory.map((item) => `${item.name} (${item.description})`).join(", ")}`
          : "Player has no items yet.";

      let userContent;
      if (playerAction) {
        userContent = `${inventoryContext}\nPlayer's last action: ${playerAction}\nContinue the story based on this action. If they used an item from inventory, incorporate that into the story.`;
      } else {
        userContent = `${inventoryContext}\nStart a new adventure story${initialDesc ? ` in the following setting: ${initialDesc}` : "."}`;
      }

      currentMessages.push({ role: "user", content: userContent });

      let aiResponse;
      try {
        // -- OLLAMA
        if (backend === "ollama") {
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: "system", content: systemPrompt(gameLanguage) },
                ...currentMessages,
              ],
              stream: false,
              options: {
                temperature: 0.8,
                top_p: 0.9,
                max_tokens: 800,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          aiResponse = data.message.content?.trim();

          // -- PUTER
        } else if (backend === "puter") {
          const response = await puter.ai.chat(fullPrompt(gameLanguage, currentMessages), {
            model: modelName,
          });

          aiResponse = response.message.content?.trim();

          // -- GEMINI
        } else if (backend === "gemini") {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(fullPrompt(gameLanguage, currentMessages));

          aiResponse = result.response.text()?.trim();
        }

        // aiResponse = jsonrepair(aiResponse);

        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        let gameResponse;
        if (jsonMatch) {
          gameResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid JSON response");
        }

        if (!gameResponse.type || !gameResponse.description || !gameResponse.question) {
          throw new Error("Invalid response format from AI");
        }

        currentMessages.push({ role: "assistant", content: aiResponse });
        set({ messages: currentMessages });

        if (gameResponse.new_item) {
          set({ inventory: [...inventory, gameResponse.new_item] });
        }

        return gameResponse;
      } catch (error) {
        console.error("Error calling AI API:", error);

        currentMessages.push({ role: "assistant", content: JSON.stringify(fallbackResponse) });
        set({ messages: currentMessages });
        return fallbackResponse;
      }
    },

    handlePlayerAction: async (action) => {
      const state = get();
      if (state.isLoading) return;

      set({ isLoading: true });

      const playerEntry = {
        type: "player",
        action: action,
        timestamp: Date.now(),
      };

      const gameEntry = {
        type: "game",
        state: state.gameState,
        timestamp: Date.now(),
      };

      set({ gameHistory: [...state.gameHistory, gameEntry, playerEntry] });
      set({ inputValue: "", selectedItem: null });

      try {
        const newState = await state.generateAIResponse(action);
        set({ gameState: newState });
      } catch (error) {
        console.error("Error generating AI response:", error);
      }

      set({ isLoading: false });
    },
  })),
);

export { useGameStore };
