import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { RotateCcw, FlipVertical } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useSettings } from "../context/SettingsContext";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export default function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const initialFen = searchParams.get("fen") || STARTING_FEN;
  const { engineDepth } = useSettings();

  const [game, setGame] = useState(new Chess(initialFen));
  const [orientation, setOrientation] = useState("white");
  const [evalData, setEvalData] = useState(null);
  const [evalError, setEvalError] = useState("");
  const [moveHistory, setMoveHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const evaluate = useCallback(async (fen) => {
    setLoading(true);
    setEvalError("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen, depth: engineDepth }),
      });
      const data = await res.json();
      if (data.error) {
        setEvalError(data.error);
        setEvalData(null);
      } else {
        setEvalData(data);
      }
    } catch {
      setEvalError("Backend not running. Start the Flask server to see evaluations.");
      setEvalData(null);
    }
    setLoading(false);
  }, [engineDepth]);

  useEffect(() => {
    evaluate(initialFen);
  }, [evaluate, initialFen]);

  const onDrop = (sourceSquare, targetSquare) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!result) return false;

    setGame(gameCopy);
    setMoveHistory((prev) => [...prev, result.san]);
    evaluate(gameCopy.fen());
    return true;
  };

  const resetBoard = () => {
    const g = new Chess(initialFen);
    setGame(g);
    setMoveHistory([]);
    evaluate(g.fen());
  };

  const formatEval = (evaluation) => {
    if (!evaluation) return "-";
    if (evaluation.type === "mate") {
      return evaluation.value === 0 ? "Checkmate" : `M${evaluation.value}`;
    }
    const score = evaluation.value / 100;
    return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1);
  };

  const evalScore = evalData?.evaluation;
  const evalNum =
    evalScore?.type === "cp"
      ? evalScore.value / 100
      : evalScore?.type === "mate"
      ? evalScore.value > 0
        ? 15
        : -15
      : 0;
  const whiteBarPercent = Math.min(Math.max(50 + evalNum * 5, 5), 95);

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 ml-40 flex items-center justify-center p-8 gap-8">
        <div className="flex gap-6">
          <div className="w-8 rounded-full overflow-hidden border border-gray-400 dark:border-gray-600 flex flex-col">
            <div
              className="bg-gray-900 transition-all duration-500"
              style={{ height: `${100 - whiteBarPercent}%` }}
            />
            <div
              className="bg-white transition-all duration-500"
              style={{ height: `${whiteBarPercent}%` }}
            />
          </div>

          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardWidth={520}
            boardOrientation={orientation}
            animationDuration={200}
          />
        </div>

        <div className="w-80 flex flex-col gap-5">
          <div className="flex gap-3">
            <button
              onClick={() =>
                setOrientation((o) => (o === "white" ? "black" : "white"))
              }
              className="flex items-center gap-1.5 px-4 py-2.5 text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <FlipVertical size={18} />
              Flip
            </button>
            <button
              onClick={resetBoard}
              className="flex items-center gap-1.5 px-4 py-2.5 text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-5">
            <h3 className="text-base font-medium text-gray-500 dark:text-gray-400 mb-3">
              Evaluation
            </h3>
            {loading ? (
              <p className="text-base text-gray-400">Analyzing...</p>
            ) : evalError ? (
              <p className="text-base text-red-500 dark:text-red-400">
                {evalError}
              </p>
            ) : evalData ? (
              <div className="space-y-3">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatEval(evalData.evaluation)}
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  Best move: <span className="font-mono">{evalData.best_move}</span>
                </p>
                {evalData.best_line && evalData.best_line.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Top lines
                    </p>
                    {evalData.best_line.slice(0, 3).map((line, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm font-mono text-gray-600 dark:text-gray-400"
                      >
                        <span>{line.Move}</span>
                        <span>
                          {line.Centipawn != null
                            ? (line.Centipawn / 100).toFixed(1)
                            : `M${line.Mate}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-5">
            <h3 className="text-base font-medium text-gray-500 dark:text-gray-400 mb-3">
              Move History
            </h3>
            {moveHistory.length === 0 ? (
              <p className="text-base text-gray-400">No moves yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {moveHistory.map((move, i) => (
                  <span
                    key={i}
                    className="text-sm font-mono px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {i % 2 === 0 && (
                      <span className="text-gray-400 mr-0.5">
                        {Math.floor(i / 2) + 1}.
                      </span>
                    )}
                    {move}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
