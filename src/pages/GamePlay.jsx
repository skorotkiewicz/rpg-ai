import { useRef, useEffect } from "react";
import { get as idbGet } from "idb-keyval";
import { RefreshCcw, Save } from "lucide-react";
import { useParams, useLocation } from "wouter";
import AIGameLoader from "../components/AIGameLoader";
import PlayerInterface from "../components/UI/PlayerInterface";
import CurrentGameState from "../components/UI/CurrentGameState";
import Sidebar from "../components/UI/Sidebar";
import GameHistory from "../components/UI/GameHistory";
import { useGameStore } from "../utils/store";

const GamePlay = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const {
    gameState,
    isLoading,
    gameHistory,
    setGameState,
    setIsLoading,
    setInputValue,
    setGameHistory,
    setInventory,
    setSelectedItem,
    setMessages,
    backend,
    testOllamaConnection,
    generateAIResponse,
    worldDescription,
    saveGame,
    setWorldDescription,
    setGameLanguage,
  } = useGameStore();

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameHistory, gameState]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const sessionId = params.id;
      const gameData = await idbGet(sessionId);
      if (gameData) {
        setGameState(gameData.gameState);
        setGameHistory(gameData.gameHistory);
        setInventory(gameData.inventory);
        setWorldDescription(gameData.worldDescription);
        setGameLanguage(gameData.gameLanguage);
        setMessages(gameData.messages);
      } else {
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
            navigate("/");
            return;
          }
        }
        try {
          const initialState = await generateAIResponse(null, worldDescription);
          setGameState(initialState);
        } catch (error) {
          console.error("Error starting game:", error);
          alert("Failed to start the game. Please check your setup.");
          setIsLoading(false);
          navigate("/");
          return;
        }
      }
      setIsLoading(false);
    };
    init();
  }, [params.id]);

  const startNewAdventure = () => {
    navigate("/");
  };

  if ((isLoading || !gameState) && !gameState) {
    return <AIGameLoader />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Game Content - Main Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Game History */}
        <GameHistory chatEndRef={chatEndRef} />

        {/* Current Game State */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <CurrentGameState />
          {!isLoading && <PlayerInterface />}
        </div>

        {/* New Game and Save Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={startNewAdventure}
            disabled={isLoading}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            New Adventure
          </button>
          <button
            type="button"
            onClick={() => saveGame(params.id)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Game
          </button>
        </div>
      </div>

      {/* Sidebar - Scene & Inventory */}
      <Sidebar />
    </div>
  );
};

export default GamePlay;
