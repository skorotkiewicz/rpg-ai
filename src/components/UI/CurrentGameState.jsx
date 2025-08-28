import { useGameStore } from "../../utils/store";
import AIGameLoader from "../AIGameLoader";
import { Star, Type, FileText } from "lucide-react";

const CurrentGameState = () => {
  const { gameState, isLoading } = useGameStore();

  return (
    <div className="mb-6">
      {isLoading ? (
        <AIGameLoader />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default CurrentGameState;
