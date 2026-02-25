import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import engine

MAX_DEPTH = 20

app = Flask(__name__)

allowed_origin = os.environ.get("CORS_ORIGIN", "*")
CORS(app, origins=[allowed_origin])

limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"])

FEN_REGEX = re.compile(
    r"^[rnbqkpRNBQKP1-8/]+ [wb] [KQkq-]+ [a-h1-8-]+ \d+ \d+$"
)

def validate_fen(fen):
    if not isinstance(fen, str) or len(fen) > 100:
        return False
    return bool(FEN_REGEX.match(fen.strip()))

def clamp_depth(depth):
    if depth is None:
        return None
    return max(1, min(int(depth), MAX_DEPTH))

@app.route('/api/evaluate', methods=['POST'])
@limiter.limit("30 per minute")
def evaluate_position():
    data = request.get_json()
    fen = data.get('fen')
    depth = clamp_depth(data.get('depth'))
    if not fen:
        return jsonify({'error': 'No FEN provided'}), 400
    if not validate_fen(fen):
        return jsonify({'error': 'Invalid FEN'}), 400

    try:
        if depth:
            engine.set_depth(depth)
        engine.set_position(fen)
        best_move = engine.get_best_move()
        evaluation = engine.get_evaluation()
        best_line = engine.get_best_line(5)

        return jsonify({
            'best_move': best_move,
            'evaluation': evaluation,
            'best_line': best_line
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/continuation', methods=['POST'])
@limiter.limit("20 per minute")
def continuation():
    data = request.get_json()
    fen = data.get('fen')
    num_moves = min(int(data.get('num_moves', 4)), 8)
    depth = clamp_depth(data.get('depth'))
    if not fen:
        return jsonify({'error': 'No FEN provided'}), 400
    if not validate_fen(fen):
        return jsonify({'error': 'Invalid FEN'}), 400

    try:
        if depth:
            engine.set_depth(depth)
        moves = engine.get_continuation(fen, num_moves)
        return jsonify({'moves': moves})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-lines', methods=['POST'])
@limiter.limit("30 per minute")
def top_lines():
    data = request.get_json()
    fen = data.get('fen')
    num = min(int(data.get('num', 3)), 5)
    depth = clamp_depth(data.get('depth'))
    if not fen:
        return jsonify({'error': 'No FEN provided'}), 400
    if not validate_fen(fen):
        return jsonify({'error': 'Invalid FEN'}), 400

    try:
        if depth:
            engine.set_depth(depth)
        engine.set_position(fen)
        lines = engine.get_best_line(num)
        return jsonify({'lines': lines})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
