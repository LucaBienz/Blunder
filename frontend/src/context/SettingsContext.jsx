import { createContext, useContext, useState } from "react";
import { flushSync } from "react-dom";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [engineDepth, setEngineDepth] = useState(12);
  const [punishmentMoves, setPunishmentMoves] = useState(4);

  const toggleDarkMode = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setDarkMode((prev) => !prev));
      });
    } else {
      setDarkMode((prev) => !prev);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        engineDepth,
        setEngineDepth,
        punishmentMoves,
        setPunishmentMoves,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
