import { Settings } from "lucide-react";
import { useGameStore } from "../utils/store";
import { gameLangs } from "../utils/utils";

const ConfigPanel = () => {
  const {
    backend,
    setBackend,
    ollamaUrl,
    setOllamaUrl,
    modelName,
    setModelName,
    availableModels,
    gameLanguage,
    setGameLanguage,
    geminiKey,
    setGeminiKey,
  } = useGameStore();

  return (
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
            <option value="gemini">Gemini</option>
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
        {backend === "gemini" && (
          <div>
            <label className="block text-sm font-medium mb-2">Gemini API:</label>
            <input
              type="text"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
              placeholder="Gemini API Key..."
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
        {backend === "gemini" && (
          <>
            Go to{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener"
              className="bg-gray-700 m-1 px-1 rounded"
            >
              Google AI Studio
            </a>{" "}
            to get your API Key.
            <br />
          </>
        )}
        The AI will generate all game content in <strong>{gameLanguage}</strong>.
      </p>
    </div>
  );
};

export default ConfigPanel;
