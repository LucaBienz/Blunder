import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import Sidebar from "../components/Sidebar";

export default function ImportPage() {
  const [fen, setFen] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLoad = () => {
    setError("");
    const trimmed = fen.trim();
    if (!trimmed) {
      setError("Please enter a FEN string.");
      return;
    }

    try {
      new Chess(trimmed);
      navigate(`/analysis?fen=${encodeURIComponent(trimmed)}`);
    } catch {
      setError("Invalid FEN string. Please check and try again.");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFen(text);
    } catch {
      setError("Could not read clipboard.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 ml-40 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 text-center">
            Import Position
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Paste a FEN string from chess.com or any chess platform to analyze
            the position.
          </p>

          <div className="flex flex-col gap-3">
            <textarea
              value={fen}
              onChange={(e) => {
                setFen(e.target.value);
                setError("");
              }}
              placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePaste}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm"
              >
                Paste from Clipboard
              </button>
              <button
                onClick={handleLoad}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition text-sm"
              >
                Load Position
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              How to get a FEN from chess.com
            </h2>
            <ol className="text-sm text-gray-500 dark:text-gray-400 list-decimal list-inside space-y-1">
              <li>Open your game on chess.com</li>
              <li>Navigate to the position you want to analyze</li>
              <li>Click the share button or use the analysis board</li>
              <li>Copy the FEN string and paste it here</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
