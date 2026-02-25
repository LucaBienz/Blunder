import { Chessboard } from "react-chessboard";
import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { Lightbulb } from "lucide-react";
import puzzles from "../data/puzzles";
import { useSettings } from "../context/SettingsContext";

const PUNISHMENT_DELAY = 600;
const OPPONENT_DELAY = 400;

export default function ChessPuzzleBoard() {
  const { engineDepth, punishmentMoves } = useSettings();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState("your-turn");
  const [squareStyles, setSquareStyles] = useState({});
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [hintSquare, setHintSquare] = useState(null);
  const animatingRef = useRef(false);

  const puzzle = puzzles[puzzleIndex];

  const loadPuzzle = useCallback((index) => {
    const p = puzzles[index];
    const g = new Chess(p.fen);
    setGame(g);
    setMoveIndex(0);
    setStatus("your-turn");
    setSquareStyles({});
    setHintSquare(null);
    setBoardOrientation(p.playerColor === "w" ? "white" : "black");
    animatingRef.current = false;
  }, []);

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex, loadPuzzle]);

  const getSquareStyles = useCallback(() => {
    if (!hintSquare) return squareStyles;
    return {
      ...squareStyles,
      [hintSquare]: { backgroundColor: "rgba(234, 179, 8, 0.5)" },
    };
  }, [squareStyles, hintSquare]);

  const showHint = () => {
    if (status !== "your-turn") return;
    const uci = puzzle.moves[moveIndex];
    if (uci) {
      setHintSquare(uci.substring(0, 2));
    }
  };

  const playOpponentMove = useCallback((currentGame, currentMoveIndex) => {
    const p = puzzles[puzzleIndex];
    if (currentMoveIndex >= p.moves.length) {
      setStatus("solved");
      return;
    }

    const uci = p.moves[currentMoveIndex];
    const move = {
      from: uci.substring(0, 2),
      to: uci.substring(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    };

    setTimeout(() => {
      const g = new Chess(currentGame.fen());
      const result = g.move(move);
      if (result) {
        setGame(g);
        setMoveIndex(currentMoveIndex + 1);
        setStatus("your-turn");
        setSquareStyles({});
        setHintSquare(null);
      }
    }, OPPONENT_DELAY);
  }, [puzzleIndex]);

  const showPunishment = useCallback(async (wrongGame) => {
    animatingRef.current = true;
    setStatus("blunder");

    try {
      const res = await fetch("http://localhost:5000/api/continuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: wrongGame.fen(),
          num_moves: punishmentMoves,
          depth: engineDepth,
        }),
      });
      const data = await res.json();

      if (data.moves && data.moves.length > 0) {
        let g = new Chess(wrongGame.fen());

        for (let i = 0; i < data.moves.length; i++) {
          if (!animatingRef.current) return;
          const uci = data.moves[i];
          const move = {
            from: uci.substring(0, 2),
            to: uci.substring(2, 4),
            promotion: uci.length > 4 ? uci[4] : undefined,
          };

          await new Promise((resolve) => setTimeout(resolve, PUNISHMENT_DELAY));
          if (!animatingRef.current) return;

          const result = g.move(move);
          if (result) {
            const newGame = new Chess(g.fen());
            setGame(newGame);
            g = newGame;

            setSquareStyles({
              [move.from]: { backgroundColor: "rgba(220, 38, 38, 0.4)" },
              [move.to]: { backgroundColor: "rgba(220, 38, 38, 0.4)" },
            });
          } else {
            break;
          }
        }
      }
    } catch {
      setStatus("blunder-no-engine");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (!animatingRef.current) return;
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex, loadPuzzle, punishmentMoves, engineDepth]);

  const onDrop = (sourceSquare, targetSquare) => {
    if (status !== "your-turn" || animatingRef.current) return false;

    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (!result) return false;

    setHintSquare(null);

    const expectedUci = puzzle.moves[moveIndex];
    const actualUci = sourceSquare + targetSquare;

    if (actualUci === expectedUci || (expectedUci && actualUci === expectedUci.substring(0, 4))) {
      setGame(gameCopy);
      setSquareStyles({
        [sourceSquare]: { backgroundColor: "rgba(34, 197, 94, 0.4)" },
        [targetSquare]: { backgroundColor: "rgba(34, 197, 94, 0.4)" },
      });

      const nextMoveIndex = moveIndex + 1;
      setMoveIndex(nextMoveIndex);

      if (nextMoveIndex >= puzzle.moves.length) {
        setStatus("solved");
      } else {
        setStatus("waiting");
        playOpponentMove(gameCopy, nextMoveIndex);
      }
    } else {
      setGame(gameCopy);
      setSquareStyles({
        [sourceSquare]: { backgroundColor: "rgba(220, 38, 38, 0.4)" },
        [targetSquare]: { backgroundColor: "rgba(220, 38, 38, 0.4)" },
      });
      showPunishment(gameCopy);
    }

    return true;
  };

  const goToNextPuzzle = () => {
    animatingRef.current = false;
    setPuzzleIndex((prev) => Math.min(prev + 1, puzzles.length - 1));
  };

  const goToPrevPuzzle = () => {
    animatingRef.current = false;
    setPuzzleIndex((prev) => Math.max(prev - 1, 0));
  };

  const statusMessages = {
    "your-turn": "Your turn - find the best move",
    waiting: "Correct! Opponent is responding...",
    solved: "Puzzle complete!",
    blunder: "That's a blunder - watch what happens...",
    "blunder-no-engine": "Wrong move! (Start the backend to see the punishment line)",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {puzzle.theme}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
          {puzzle.difficulty}
        </span>
      </div>

      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardWidth={440}
        boardOrientation={boardOrientation}
        customSquareStyles={getSquareStyles()}
        animationDuration={200}
        arePiecesDraggable={status === "your-turn"}
      />

      <p
        className={`text-sm font-medium ${
          status === "solved"
            ? "text-green-600 dark:text-green-400"
            : status === "blunder" || status === "blunder-no-engine"
            ? "text-red-600 dark:text-red-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {statusMessages[status]}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={goToPrevPuzzle}
          disabled={puzzleIndex === 0}
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {puzzleIndex + 1} / {puzzles.length}
        </span>

        <button
          onClick={goToNextPuzzle}
          disabled={puzzleIndex === puzzles.length - 1}
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next
        </button>

        <button
          onClick={showHint}
          disabled={status !== "your-turn"}
          className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Lightbulb size={16} />
          Hint
        </button>

        <button
          onClick={() => loadPuzzle(puzzleIndex)}
          className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
