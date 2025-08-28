import { ScrollText, Globe, Activity } from "lucide-react";
import { useGameStore } from "../../utils/store";

const GameHistory = ({ chatEndRef }) => {
  const { gameHistory } = useGameStore();

  return (
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
  );
};

export default GameHistory;
