import os
import joblib
import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTORIZER_PATH = os.path.join(BASE_DIR, 'ml_models', 'vectorizer.joblib')
MODEL_PATH = os.path.join(BASE_DIR, 'ml_models', 'model.joblib')

vectorizer = joblib.load(VECTORIZER_PATH)
model = joblib.load(MODEL_PATH)

def is_social_impact_project(title, area, description):
    """
    Returns True if the project is predicted as 'impactful' by the ML model.
    """
    text = f"{title} {area} {description}"
    X = vectorizer.transform([text])
    prediction = model.predict(X)[0]
    return prediction == 'impactful'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTORIZER_PATH = os.path.join(BASE_DIR, 'ml_models', 'vectorizer.joblib')
MODEL_PATH = os.path.join(BASE_DIR, 'ml_models', 'model.joblib')

vectorizer = joblib.load(VECTORIZER_PATH)
model = joblib.load(MODEL_PATH)

def is_social_impact_project(title, area, description):
    """
    Returns True if the project is predicted as 'impactful' by the ML model.
    """
    text = f"{title} {area} {description}"
    X = vectorizer.transform([text])
    prediction = model.predict(X)[0]
    return prediction == 'impactful'
