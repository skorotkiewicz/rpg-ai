import { Activity, Backpack, Image as ImageIcon, CheckCircle } from "lucide-react";
import { useGameStore } from "../../utils/store";

const Sidebar = () => {
  const { gameState, isLoading, inventory, selectedItem, handlePlayerAction, setSelectedItem } =
    useGameStore();

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
  );
};

export default Sidebar;
