import { Routes, Route } from "react-router-dom";
import { useSettings } from "./context/SettingsContext";
import LandingPage from "./pages/LandingPage";
import PuzzlePage from "./pages/PuzzlePage";
import ImportPage from "./pages/ImportPage";
import AnalysisPage from "./pages/AnalysisPage";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const { darkMode } = useSettings();

  return (
    <div className={darkMode ? "dark" : ""}>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/puzzle" element={<PuzzlePage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </div>
  );
}
