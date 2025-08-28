import { useGameStore } from "../../utils/store";
import { Activity, Type, CheckCircle, Loader2 } from "lucide-react";

const PlayerInterface = () => {
  const { gameState, isLoading, inputValue, setInputValue, handlePlayerAction } = useGameStore();

  const handleTextSubmit = () => {
    if (inputValue.trim()) {
      handlePlayerAction(inputValue.trim());
    }
  };

  const handleChoiceClick = (choice) => {
    handlePlayerAction(choice);
  };

  return (
    <>
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
    </>
  );
};

export default PlayerInterface;
