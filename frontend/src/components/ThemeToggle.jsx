import { Sun, Moon } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useSettings();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      {darkMode ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  );
}
