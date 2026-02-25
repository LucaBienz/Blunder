import Sidebar from "../components/Sidebar";
import ChessPuzzleBoard from "../components/ChessPuzzleBoard";

export default function PuzzlePage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 md:ml-40 flex flex-col items-center justify-center p-4 md:p-8 pb-20 md:pb-8">
        <ChessPuzzleBoard />
      </main>
    </div>
  );
}
