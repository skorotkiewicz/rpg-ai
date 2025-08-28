import { useEffect } from "react";
import { Star, Activity, FileText, Upload, Trash2 } from "lucide-react";
import { useGameStore } from "../utils/store";
import { useLocation } from "wouter";

const Welcome = () => {
  const { worldDescription, setWorldDescription, savedGames, loadSavedGames, deleteGame } =
    useGameStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    loadSavedGames();
  }, []);

  const startNewGame = () => {
    const sessionId = `game-session-${Date.now()}`;
    navigate(`/x/${sessionId}`);
  };

  const loadGame = (sessionId) => {
    navigate(`/x/${sessionId}`);
  };

  return (
    <div className="text-center">
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl mb-4 flex items-center justify-center gap-2">
          <Star className="w-6 h-6 text-blue-400" />
          Welcome to AI Adventure Game
        </h2>
        <p className="text-gray-400 mb-6">
          Explore dynamic worlds, collect items, and shape your journey. Each adventure is unique.
        </p>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Describe your world (optional):</label>
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
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <Activity className="w-5 h-5" />
          Start Adventure
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
                      onClick={() => {
                        if (confirm("Delete this game?")) deleteGame(key);
                      }}
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
  );
};

export default Welcome;
