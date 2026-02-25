import Sidebar from "../components/Sidebar";
import ChessPuzzleBoard from "../components/ChessPuzzleBoard";

export default function PuzzlePage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 ml-40 flex flex-col items-center justify-center p-6">
        <ChessPuzzleBoard />
      </main>
    </div>
  );
}
