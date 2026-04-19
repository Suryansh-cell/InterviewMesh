"""
Train Decision Tree model for roadmap predictions (OPTIONAL).
Features: [score_ratio, relative_time, attempts]
Labels: PROGRESS, WEAK_GAP, STRONG_GAP, RETRY

This script is optional. The ML service works with fallback rule-based logic if scikit-learn is not available.
"""

import os
import sys

try:
    import numpy as np
    import pandas as pd
    from sklearn.tree import DecisionTreeClassifier
    import joblib
    
    print("✅ Training Decision Tree model...")
    
    # Generate synthetic training data
    np.random.seed(42)
    n_samples = 1000

    # Feature: score_ratio (0-1), relative_time (0-3), attempts (1-5)
    score_ratio = np.random.uniform(0, 1, n_samples)
    relative_time = np.random.uniform(0.2, 3.0, n_samples)
    attempts = np.random.randint(1, 6, n_samples)

    # Generate labels based on rules
    labels = []
    for s, t, a in zip(score_ratio, relative_time, attempts):
        if s >= 0.7 and a <= 2:
            labels.append('PROGRESS')
        elif s < 0.4:
            labels.append('STRONG_GAP')
        elif s < 0.6:
            labels.append('WEAK_GAP')
        elif a > 2:
            labels.append('RETRY')
        else:
            labels.append('PROGRESS')

    # Create feature matrix
    X = np.column_stack([score_ratio, relative_time, attempts])
    y = np.array(labels)

    # Train Decision Tree
    dt = DecisionTreeClassifier(
        max_depth=6,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42
    )
    dt.fit(X, y)

    # Print accuracy
    from sklearn.model_selection import cross_val_score
    scores = cross_val_score(dt, X, y, cv=5)
    print(f"✅ Decision Tree trained successfully!")
    print(f"📊 Cross-validation accuracy: {scores.mean():.2%} (+/- {scores.std():.2%})")
    print(f"🏷️  Classes: {list(dt.classes_)}")

    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'roadmap_dt.pkl')
    joblib.dump(dt, model_path)
    print(f"💾 Model saved to: {model_path}")
    
except ImportError as e:
    print(f"⚠️ scikit-learn not available: {e}")
    print("✅ ML service will work with fallback rule-based logic")
    print("💡 To enable ML model training, install: pip install scikit-learn pandas")
except Exception as e:
    print(f"❌ Training error: {e}")
    print("✅ ML service will work with fallback rule-based logic")
    sys.exit(1)
