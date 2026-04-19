from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# Try to load trained model (fallback if scikit-learn not available)
model = None
try:
    import joblib
    import numpy as np
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'roadmap_dt.pkl')
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("✅ ML Model loaded successfully")
    else:
        print("⚠️ Model file not found. Using fallback logic.")
except Exception as e:
    print(f"⚠️ Could not load model: {e}")
    print("Running with fallback rule-based logic")


@app.route('/predict', methods=['POST'])
def predict():
    """Predict roadmap action based on quiz performance."""
    try:
        data = request.json
        score_ratio = float(data.get('score_ratio', 0.5))
        relative_time = float(data.get('relative_time', 1.0))
        attempts = int(data.get('attempts', 1))

        if model is None:
            # Fallback rule-based logic
            if score_ratio < 0.4:
                label = 'STRONG_GAP'
            elif score_ratio < 0.6:
                label = 'WEAK_GAP'
            elif attempts > 2:
                label = 'RETRY'
            else:
                label = 'PROGRESS'
        else:
            # Use trained model
            import numpy as np
            X = np.array([[score_ratio, relative_time, attempts]])
            label = model.predict(X)[0]

        return jsonify({
            'label': label,
            'confidence': 0.85 if model else 0.6,
            'input': {
                'score_ratio': score_ratio,
                'relative_time': relative_time,
                'attempts': attempts
            }
        })
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'label': 'PROGRESS', 'error': str(e)}), 400


@app.route('/anomaly', methods=['POST'])
def anomaly():
    """Detect anomalous behavior during sessions."""
    try:
        data = request.json
        paste_chars = int(data.get('paste_chars', 0))
        tab_switches = int(data.get('tab_switches', 0))
        solve_time = float(data.get('solve_time', 100))
        avg_peer_time = float(data.get('avg_peer_time', 100))
        paste_count = int(data.get('paste_count', 0))

        # Rule-based anomaly detection
        paste_flag = 1 if paste_chars > 50 else 0
        tab_flag = 1 if tab_switches > 4 else 0
        speed_flag = 1 if (solve_time < avg_peer_time * 0.25 and paste_count == 0) else 0

        score = paste_flag * 0.4 + tab_flag * 0.3 + speed_flag * 0.3
        status = 'suspicious' if score > 0.6 else ('review' if score > 0.3 else 'clean')

        return jsonify({
            'anomaly_score': round(score, 2),
            'status': status,
            'flags': {
                'large_paste': bool(paste_flag),
                'excessive_tab_switches': bool(tab_flag),
                'suspicious_speed': bool(speed_flag)
            }
        })
    except Exception as e:
        print(f"Anomaly detection error: {e}")
        return jsonify({'status': 'clean', 'anomaly_score': 0, 'error': str(e)}), 400


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'fallback_logic': model is None
    })


if __name__ == '__main__':
    app.run(port=5001, debug=True)
