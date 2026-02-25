# Blunder !

A free, self-hostable chess tactics trainer. Solve puzzles, see *why* your move was wrong by watching the engine's punishment line play out, and analyze your own games - all powered by Stockfish running locally.

Born out of frustration with chess.com locking position evaluation behind a paywall.

## Features

- Interactive puzzle solving with drag-and-drop
- Blunder visualization - wrong moves trigger a multi-move punishment line showing what the opponent would play
- Configurable punishment line length (2–8 moves)
- Hint system that highlights the piece you should move
- FEN import - paste a position from chess.com or any other source
- Free-play analysis board with eval bar and top engine lines
- Adjustable Stockfish depth (1–20)
- Dark mode with animated view transition
- Runs entirely offline, no accounts or subscriptions

## Tech Stack

**Frontend:** React, Tailwind CSS, react-chessboard, chess.js, lucide-react
**Backend:** Flask, python-stockfish
**Engine:** [Stockfish](https://stockfishchess.org/download/) (local binary)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js + npm
- Stockfish binary - download from [stockfishchess.org](https://stockfishchess.org/download/) and place it in `backend/stockfish/`

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The Flask server runs at `http://localhost:5000`.

Make sure the Stockfish binary is at `backend/stockfish/stockfish.exe` (or update the path in `engine.py`).

### Frontend

```bash
cd frontend
npm install
npm start
```

The React app runs at `http://localhost:3000`.

## Project Structure

```
backend/
  app.py              Flask API (evaluate, continuation, top-lines)
  engine.py           Stockfish wrapper
  stockfish/          Stockfish binary goes here

frontend/
  src/
    components/       ChessPuzzleBoard, Sidebar, ThemeToggle
    context/          SettingsContext (dark mode, engine config)
    data/             Hardcoded puzzle set
    pages/            Landing, Puzzle, Import, Analysis
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/evaluate` | Evaluate a FEN position (best move, eval, top lines) |
| POST | `/api/continuation` | Get a multi-move best-play continuation from a position |
| POST | `/api/top-lines` | Get top N engine lines for a position |

All endpoints accept an optional `depth` parameter.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

This project uses [Stockfish](https://github.com/official-stockfish/Stockfish), which is also GPLv3-licensed. Stockfish is not bundled — users download it separately. See [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES) for details.

## Author

Built by [Luca Bienz](https://github.com/LucaBienz)
