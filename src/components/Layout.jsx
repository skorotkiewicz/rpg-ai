import { useEffect } from "react";
import { Settings, Gamepad2 } from "lucide-react";
import ConfigPanel from "./ConfigPanel";
import { useGameStore } from "../utils/store";
import { puterModels } from "../utils/utils";
import { useLocation } from "wouter";

const Layout = ({ children }) => {
  const [, navigate] = useLocation();
  const {
    isConfigOpen,
    setIsConfigOpen,
    backend,
    fetchAvailableModels,
    setAvailableModels,
    setModelName,
    ollamaUrl,
  } = useGameStore();

  useEffect(() => {
    if (isConfigOpen) {
      if (backend === "ollama") {
        fetchAvailableModels();
      } else if (backend === "puter") {
        setAvailableModels(puterModels);
        setModelName(puterModels[0]);
      }
    }
  }, [isConfigOpen, ollamaUrl, backend]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1
              onClick={() => navigate("/rpg-ai")}
              className="text-4xl font-bold text-white flex items-center gap-2 cursor-pointer"
            >
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

          {isConfigOpen && <ConfigPanel />}

          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
