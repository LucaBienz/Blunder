import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-center">
      <h1 className="text-5xl font-bold text-purple-700 dark:text-purple-300 mb-4">
        Blunder !
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Sharpen your tactics, learn from your mistakes.
      </p>
      <button
        onClick={() => navigate("/puzzle")}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
      >
        Start Training
      </button>
    </div>
  );
}
