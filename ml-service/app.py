import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

app = Flask(__name__)
CORS(app)

# Train scikit-learn Pipeline (StandardScaler + RandomForestClassifier) on historical performance & engagement telemetry
# Features: [quiz_score, avg_previous_score, attempt_count, avg_time_per_question, engagement_score]
# Target: 1 (Easy), 2 (Medium), 3 (Hard)

X_train = np.array([
    # Low quiz score & low engagement -> Easy (1)
    [20, 30, 1, 10, 0.2],
    [35, 40, 2, 12, 0.3],
    [10, 20, 1, 8,  0.5],
    # High quiz score but LOW engagement -> Downgraded to Medium (2)
    [85, 80, 1, 15, 0.2],
    [90, 85, 2, 20, 0.1],
    [75, 70, 1, 14, 0.35],
    # Medium quiz score & normal engagement -> Medium (2)
    [50, 55, 1, 15, 0.7],
    [60, 65, 2, 18, 0.8],
    [68, 60, 1, 16, 0.6],
    # High quiz score & high engagement -> Hard (3)
    [80, 85, 1, 22, 0.9],
    [95, 90, 2, 25, 0.95],
    [88, 82, 1, 20, 0.85]
])

y_train = np.array([1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3])

# Create explicit scikit-learn Pipeline
ml_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('classifier', RandomForestClassifier(n_estimators=10, random_state=42))
])

# Fit the sklearn Pipeline model
ml_pipeline.fit(X_train, y_train)

def calculate_ml_recommendation(quiz_score, previous_scores=[], attempt_count=1, avg_time_per_question=15, engagement_score=None):
    avg_prev = np.mean(previous_scores) if previous_scores else quiz_score
    eng = engagement_score if engagement_score is not None else 1.0

    # Format feature array
    features = np.array([[quiz_score, avg_prev, attempt_count, avg_time_per_question, eng]])
    
    # Predict difficulty tier using scikit-learn Pipeline
    predicted_tier = int(ml_pipeline.predict(features)[0])
    probabilities = ml_pipeline.predict_proba(features)[0]
    confidence = float(np.max(probabilities))

    engagement_note = None
    if eng < 0.4:
        engagement_note = "reduced due to low engagement signals"

    tier_map = {1: "easy", 2: "medium", 3: "hard"}

    return {
        "level": tier_map[predicted_tier],
        "difficulty": predicted_tier,
        "confidence": round(confidence, 2),
        "engagementNote": engagement_note,
        "modelUsed": "scikit-learn Pipeline (StandardScaler + RandomForestClassifier)"
    }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "ml-service", "model": "scikit-learn Pipeline (StandardScaler + RandomForest)"}), 200

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json() or {}
        quiz_score = data.get('quizScore', 0)
        previous_scores = data.get('previousScores', [])
        attempt_count = data.get('attemptCount', 1)
        avg_time_per_question = data.get('avgTimePerQuestion', 15)
        engagement_score = data.get('engagementScore', None)

        if engagement_score is not None:
            try:
                engagement_score = float(engagement_score)
            except (ValueError, TypeError):
                engagement_score = None

        result = calculate_ml_recommendation(
            float(quiz_score),
            previous_scores,
            int(attempt_count),
            float(avg_time_per_question),
            engagement_score
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5001))
  app.run(host='0.0.0.0', port=port, debug=True)
