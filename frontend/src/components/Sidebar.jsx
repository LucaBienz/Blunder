import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Puzzle, Brain, Upload, Settings, ChevronDown, Code, Coffee } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const navItems = [
  { icon: Puzzle, label: "Puzzles", path: "/puzzle" },
  { icon: Brain, label: "Analysis", path: "/analysis" },
  { icon: Upload, label: "Import", path: "/import" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { engineDepth, setEngineDepth, punishmentMoves, setPunishmentMoves } =
    useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="fixed top-0 left-0 h-full w-40 bg-gray-100 dark:bg-gray-800 flex flex-col items-center py-6 shadow-lg z-30">
      <button
        onClick={() => navigate("/")}
        className="text-xl font-bold text-purple-600 dark:text-purple-300 whitespace-nowrap hover:opacity-80 transition mb-10"
      >
        Blunder !
      </button>

      <div className="flex flex-col items-center gap-8">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            className={`flex flex-col items-center gap-1 transition ${
              location.pathname === path
                ? "text-purple-600 dark:text-purple-300"
                : "text-gray-600 dark:text-gray-400 hover:text-purple-500"
            }`}
          >
            <Icon size={28} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto w-full px-3 space-y-2">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center justify-center gap-1 w-full py-2 text-gray-500 dark:text-gray-400 hover:text-purple-500 transition"
        >
          <Settings size={18} />
          <span className="text-xs">Engine</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${settingsOpen ? "rotate-0" : "rotate-180"}`}
          />
        </button>

        {settingsOpen && (
          <div className="space-y-3 pb-4">
            <div>
              <label className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                <span>Depth</span>
                <span>{engineDepth}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={engineDepth}
                onChange={(e) => setEngineDepth(Number(e.target.value))}
                className="w-full accent-purple-600 h-1"
              />
            </div>
            <div>
              <label className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                <span>Blunder line</span>
                <span>{punishmentMoves}</span>
              </label>
              <input
                type="range"
                min={2}
                max={8}
                value={punishmentMoves}
                onChange={(e) => setPunishmentMoves(Number(e.target.value))}
                className="w-full accent-purple-600 h-1"
              />
            </div>
          </div>
        )}
        <a
          href="https://www.buymeacoffee.com/lucabienz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full py-1 text-gray-400 dark:text-gray-500 hover:text-yellow-500 transition text-[10px]"
        >
          <Coffee size={12} />
          <span>Buy me a coffee</span>
        </a>
        <a
          href="https://github.com/LucaBienz/BlunderBuddy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 w-full py-1 text-gray-400 dark:text-gray-500 hover:text-purple-500 transition text-[10px]"
        >
          <Code size={12} />
          <span>Source (GPLv3)</span>
        </a>
      </div>
    </aside>
  );
}
