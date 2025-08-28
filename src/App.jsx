import { useState, useRef, useEffect } from "react";
import { get, set, del, keys } from "idb-keyval";
import {
  Settings,
  Save,
  RefreshCcw,
  Activity,
  ScrollText,
  Globe,
  Backpack,
  Image as ImageIcon,
  Type,
  CheckCircle,
  Loader2,
  Gamepad2,
  Star,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { puterModels, puter, systemPrompt, fallbackResponse, gameLangs } from "./utils/utils";
import { useParams, useLocation } from "wouter";

const AIAdventureGame = () => {
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [gameHistory, setGameHistory] = useState([]);
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [modelName, setModelName] = useState("llama3.2:latest");
  const [availableModels, setAvailableModels] = useState([]);
  const [gameLanguage, setGameLanguage] = useState("English");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [worldDescription, setWorldDescription] = useState("");
  const [savedGames, setSavedGames] = useState([]);
  const [messages, setMessages] = useState([]); // For chat history
  const [backend, setBackend] = useState("ollama"); // New: ollama or puter
  const chatEndRef = useRef(null);
  const params = useParams();
  const [location, navigate] = useLocation();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameHistory, gameState]);

  useEffect(() => {
    if (isConfigOpen && backend === "ollama") {
      fetchAvailableModels();
    } else if (backend === "puter") {
      setAvailableModels(puterModels);
      setModelName(puterModels[0]);
    }
  }, [isConfigOpen, ollamaUrl, backend]);

  useEffect(() => {
    if (!gameState && params.id) {
      loadGame(params.id);
    } else {
      loadSavedGames();
    }
  }, []);

  const fetchAvailableModels = async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models.map((model) => model.name));
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  const loadSavedGames = async () => {
    const allKeys = await keys();
    const gameKeys = allKeys.filter((key) => key.startsWith("game-session-"));
    setSavedGames(gameKeys);
  };

  const saveGame = async () => {
    // const sessionId = `game-session-${Date.now()}`;
    const sessionId = params.id;

    const gameData = {
      gameState,
      gameHistory,
      inventory,
      worldDescription,
      gameLanguage,
      messages,
    };
    await set(sessionId, gameData);
    await loadSavedGames();
    alert(`Game saved as ${sessionId}`);
  };

  const loadGame = async (sessionId) => {
    const gameData = await get(sessionId);
    if (gameData) {
      setGameState(gameData.gameState);
      setGameHistory(gameData.gameHistory);
      setInventory(gameData.inventory);
      setWorldDescription(gameData.worldDescription);
      setGameLanguage(gameData.gameLanguage);
      setMessages(gameData.messages);
    }

    if (location !== `/x/${sessionId}`) navigate(`/x/${sessionId}`);
  };

  const deleteGame = async (sessionId) => {
    await del(sessionId);
    await loadSavedGames();
    navigate("/");
  };

  // Generate AI response
  const generateAIResponse = async (playerAction = null, initialDesc = null) => {
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
      if (backend === "ollama") {
        const response = await fetch(`${ollamaUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: "system", content: systemPrompt(gameLanguage) }, ...currentMessages],
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
        aiResponse = data.message.content.trim();
      } else if (backend === "puter") {
        // For Puter, build full prompt since it might not support multi-message
        const fullPrompt =
          systemPrompt(gameLanguage) +
          "\n" +
          currentMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n") +
          "\nASSISTANT:";

        // const fullPrompt = `${systemPrompt(gameLanguage)}\n${currentMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}\nASSISTANT:`;

        const response = await puter.ai.chat(fullPrompt, { model: modelName });
        console.log(response);
        // if (!(await response.success)) throw new Error(`Puter AI error!`);
        aiResponse = await response.message.content.trim();
      }

      // Extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      let gameResponse;
      if (jsonMatch) {
        gameResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }

      // Validate
      if (!gameResponse.type || !gameResponse.description || !gameResponse.question) {
        throw new Error("Invalid response format from AI");
      }

      // Update messages
      currentMessages.push({ role: "assistant", content: aiResponse });
      setMessages(currentMessages);

      // Add new item
      if (gameResponse.new_item) {
        setInventory((prev) => [...prev, gameResponse.new_item]);
      }

      return gameResponse;
    } catch (error) {
      console.error("Error calling AI API:", error);

      currentMessages.push({ role: "assistant", content: JSON.stringify(fallbackResponse) });
      setMessages(currentMessages);
      return fallbackResponse;
    }
  };

  const testOllamaConnection = async () => {
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        console.log("Available models:", data.models);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to connect to Ollama:", error);
      return false;
    }
  };

  const startNewGame = async () => {
    setIsLoading(true);
    setGameHistory([]);
    setInputValue("");
    setInventory([]);
    setSelectedItem(null);
    setMessages([]);

    let connectionOk = true;
    if (backend === "ollama") {
      connectionOk = await testOllamaConnection();
      if (!connectionOk) {
        alert(
          "Cannot connect to Ollama API. Please check if Ollama is running and the URL is correct.",
        );
        setIsLoading(false);
        return;
      }
    } // For Puter, assume it's always available or add check if needed

    try {
      const initialState = await generateAIResponse(null, worldDescription);
      setGameState(initialState);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start the game. Please check your setup.");
    }

    navigate(`/x/game-session-${Date.now()}`);

    setIsLoading(false);
  };

  const handlePlayerAction = async (action) => {
    if (isLoading) return;

    setIsLoading(true);

    // Add player action to history
    const playerEntry = {
      type: "player",
      action: action,
      timestamp: Date.now(),
    };

    const gameEntry = {
      type: "game",
      state: gameState,
      timestamp: Date.now(),
    };

    setGameHistory((prev) => [...prev, gameEntry, playerEntry]);
    setInputValue("");
    setSelectedItem(null);

    try {
      const newState = await generateAIResponse(action);
      setGameState(newState);
    } catch (error) {
      console.error("Error generating AI response:", error);
    }

    setIsLoading(false);
  };

  const handleTextSubmit = () => {
    if (inputValue.trim()) {
      handlePlayerAction(inputValue.trim());
    }
  };

  const handleChoiceClick = (choice) => {
    handlePlayerAction(choice);
  };

  const handleItemUse = (item) => {
    const action = `Use ${item.name} (${item.description})`;
    handlePlayerAction(action);
  };

  const handleItemSelect = (item) => {
    setSelectedItem(selectedItem?.name === item.name ? null : item);
  };

  const renderSVGScene = (svgScene) => {
    if (!svgScene) return null;

    return (
      <div className="bg-gray-700 rounded-lg p-2">
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: <> */}
        <div dangerouslySetInnerHTML={{ __html: svgScene }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              AI Adventure Game
            </h1>
            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>

          {/* Configuration Panel */}
          {isConfigOpen && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Backend:</label>
                  <select
                    value={backend}
                    onChange={(e) => setBackend(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
                  >
                    <option value="ollama">Ollama</option>
                    <option value="puter">Puter</option>
                  </select>
                </div>
                {backend === "ollama" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Ollama URL:</label>
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
                      placeholder="http://localhost:11434"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Model Name:</label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
                  >
                    {availableModels.map((model, index) => (
                      <option key={index} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Game Language:</label>
                  <select
                    value={gameLanguage}
                    onChange={(e) => setGameLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
                  >
                    {gameLangs.map((data, key) => (
                      <option value={data.lang} key={key}>
                        {data.lang} {data.lng && `(${data.lng})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {backend === "ollama" && (
                  <>
                    Make sure the backend is running and the model is available. For Ollama:{" "}
                    <code className="bg-gray-700 px-2 py-1 rounded">ollama pull {modelName}</code>
                    <br />
                  </>
                )}
                The AI will generate all game content in <strong>{gameLanguage}</strong>.
              </p>
            </div>
          )}

          {!gameState ? (
            <div className="text-center">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl mb-4 flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 text-blue-400" />
                  Welcome to AI Adventure Game
                </h2>
                <p className="text-gray-400 mb-6">
                  Explore dynamic worlds, collect items, and shape your journey. Each adventure is
                  unique.
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Describe your world (optional):
                  </label>
                  <textarea
                    value={worldDescription}
                    onChange={(e) => setWorldDescription(e.target.value)}
                    placeholder="E.g., A futuristic sci-fi city on Mars..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
                    rows={3}
                  />
                </div>
                <button
                  type="button"
                  onClick={startNewGame}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating World...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5" />
                      Start Adventure
                    </>
                  )}
                </button>
                {savedGames.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Saved Games
                    </h3>
                    <div className="space-y-2">
                      {savedGames.map((key) => (
                        <div
                          key={key}
                          className="flex justify-between items-center bg-gray-700 p-3 rounded-lg"
                        >
                          <span className="text-gray-300">{key}</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => loadGame(key)}
                              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1 text-sm"
                            >
                              <Upload className="w-4 h-4" />
                              Load
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteGame(key)}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center gap-1 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Game Content - Main Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Game History */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 max-h-96 overflow-y-auto">
                  <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-blue-400" />
                    Adventure History
                  </h3>
                  {gameHistory.map((entry, index) => (
                    <div key={index} className="mb-3">
                      {entry.type === "game" && (
                        <div className="bg-gray-700 rounded-lg p-3 border-l-4 border-blue-500">
                          <p className="text-blue-300 text-sm mb-1 flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            Game Master:
                          </p>
                          <p className="text-gray-300">{entry.state.description}</p>
                          <p className="text-blue-200 mt-2 font-medium">"{entry.state.question}"</p>
                        </div>
                      )}
                      {entry.type === "player" && (
                        <div className="bg-gray-700 rounded-lg p-3 border-l-4 border-green-500 ml-4">
                          <p className="text-green-300 text-sm mb-1 flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            You:
                          </p>
                          <p className="text-gray-300">{entry.action}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Current Game State */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-400" />
                      Current Situation
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed">{gameState.description}</p>
                    <p className="text-blue-200 font-medium text-lg flex items-center gap-2">
                      <Type className="w-5 h-5" />
                      {gameState.question}
                    </p>
                    {gameState.context && (
                      <p className="text-gray-400 text-sm mt-2 italic flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {gameState.context}
                      </p>
                    )}
                  </div>

                  {/* Player Interface */}
                  {gameState.type === "text_input" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Your Response:
                        </label>
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Type what you want to do..."
                          disabled={isLoading}
                          onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-100 placeholder-gray-500 disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleTextSubmit}
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            AI is thinking...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Take Action
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Choose your action:
                      </p>
                      {gameState.choices?.map((choice, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => handleChoiceClick(choice)}
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-4 rounded-lg font-medium transition-all duration-300 text-left flex items-center gap-2"
                        >
                          {String.fromCharCode(65 + index)}. {choice}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* New Game and Save Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={startNewGame}
                    disabled={isLoading}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    New Adventure
                  </button>
                  <button
                    type="button"
                    onClick={saveGame}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Game
                  </button>
                </div>
              </div>

              {/* Sidebar - Scene & Inventory */}
              <div className="space-y-6">
                {/* Current Scene SVG */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    Current Scene
                  </h3>
                  {gameState.svg_scene ? (
                    renderSVGScene(gameState.svg_scene)
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p>No scene data available</p>
                    </div>
                  )}
                </div>

                {/* Inventory */}
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    <Backpack className="w-5 h-5 text-blue-400" />
                    Inventory
                  </h3>
                  {inventory.length > 0 ? (
                    <div className="space-y-2">
                      {inventory.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleItemSelect(item)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedItem?.name === item.name
                              ? "bg-blue-700/50 border border-blue-500"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-100">{item.name}</p>
                              <p className="text-xs text-gray-400">{item.description}</p>
                            </div>
                          </div>
                          {selectedItem?.name === item.name && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemUse(item);
                              }}
                              disabled={isLoading}
                              className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1 rounded text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Use Item
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      <p>No items yet</p>
                      <p className="text-xs mt-1">Explore to find items!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAdventureGame;
