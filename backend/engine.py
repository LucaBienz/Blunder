import os
import platform
from stockfish import Stockfish

if platform.system() == "Windows":
    STOCKFISH_PATH = os.path.join(os.path.dirname(__file__), 'stockfish', 'stockfish.exe')
else:
    STOCKFISH_PATH = os.environ.get("STOCKFISH_PATH", "/usr/games/stockfish")

stockfish = Stockfish(STOCKFISH_PATH)
stockfish.set_depth(12)

def set_position(fen):
    stockfish.set_fen_position(fen)

def set_depth(depth):
    stockfish.set_depth(depth)

def get_best_move():
    return stockfish.get_best_move()

def get_evaluation():
    return stockfish.get_evaluation()

def get_best_line(num_moves=5):
    return stockfish.get_top_moves(num_moves)

def get_continuation(fen, num_moves=4):
    moves = []
    stockfish.set_fen_position(fen)
    for _ in range(num_moves):
        best = stockfish.get_best_move()
        if not best:
            break
        moves.append(best)
        stockfish.make_moves_from_current_position([best])
    return moves
