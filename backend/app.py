import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import re
from nltk.corpus import stopwords
from keras.preprocessing.sequence import pad_sequences
from flask_caching import Cache
from functools import lru_cache

app = Flask(__name__)
CORS(app)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Load model and tokenizer
with open('model.pkl', 'rb') as file:
    model = pickle.load(file)

with open('tokenizer.pkl', 'rb') as file:
    tokenizer = pickle.load(file)

@lru_cache(maxsize=1000)
def preprocess_text(text):
    TAG_RE = re.compile(r'<[^>]+>')
    stop_words = set(stopwords.words('english'))

    text = TAG_RE.sub('', text)
    text = text.lower()
    text = re.sub(r'[^a-zA-Z]', ' ', text)
    text = re.sub(r'\s+[a-zA-Z]\s+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    text = ' '.join(word for word in text.split() if word not in stop_words)

    return text

@app.route('/predict', methods=['POST'])
@cache.cached(timeout=300, query_string=True)
def predict():
    data = request.json
    review = data.get('review', '')

    if not review:
        return jsonify({"error": "No review provided"}), 400

    processed_review = preprocess_text(review)
    sequences = tokenizer.texts_to_sequences([processed_review])
    padded = pad_sequences(sequences, maxlen=100, padding='post', truncating='post')

    prediction = model.predict(padded)
    sentiment = "Positive" if prediction[0] >= 0.5 else "Negative"
    confidence = float(prediction[0]) if sentiment == "Positive" else float(1 - prediction[0])
    confidence = round(confidence * 100, 2)

    return jsonify({"sentiment": sentiment, "confidence": confidence})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)