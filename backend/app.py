# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import torch
# import torch.nn as nn
# from torchvision import models, transforms
# from PIL import Image
# import json
# import os

# app = Flask(__name__)
# CORS(app)

# # ═══════════════════════════════
# # BASE PATHS (YOUR STRUCTURE FIXED)
# # ═══════════════════════════════
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pth")
# LABEL_PATH = os.path.join(BASE_DIR, "ml", "class_labels.json")

# DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# print("MODEL PATH:", MODEL_PATH)
# print("LABEL PATH:", LABEL_PATH)


# DISEASE_INFO = {
#     "early_blight": {
#         "medicine": "Mancozeb 75% WP — 2g/L",
#         "fertilizer": "Reduce nitrogen, add potassium",
#         "treatment": "Remove infected leaves, spray every 7 days",
#         "severity": "medium"
#     },
#     "late_blight": {
#         "medicine": "Metalaxyl + Mancozeb",
#         "fertilizer": "Add calcium",
#         "treatment": "Immediate action, improve drainage",
#         "severity": "high"
#     },
#     "healthy": {
#         "medicine": "None",
#         "fertilizer": "Maintain NPK balance",
#         "treatment": "Monitor weekly",
#         "severity": "low"
#     },
#     "leaf_spot": {
#         "medicine": "Copper Oxychloride",
#         "fertilizer": "Balanced fertilizer",
#         "treatment": "Remove infected leaves, avoid overhead watering",
#         "severity": "medium"
#     }
# }
# # ═══════════════════════════════
# # LOAD CLASS LABELS
# # ═══════════════════════════════
# with open(LABEL_PATH, "r") as f:
#     class_to_idx = json.load(f)

# idx_to_class = {v: k for k, v in class_to_idx.items()}
# NUM_CLASSES = len(class_to_idx)

# print("Classes:", idx_to_class)

# # ═══════════════════════════════
# # MODEL DEFINITION
# # ═══════════════════════════════
# def load_model():
#     model = models.mobilenet_v2(weights=None)

#     in_features = model.classifier[1].in_features
#     model.classifier = nn.Sequential(
#         nn.Dropout(0.3),
#         nn.Linear(in_features, 256),
#         nn.ReLU(),
#         nn.Dropout(0.2),
#         nn.Linear(256, NUM_CLASSES),
#     )

#     if os.path.exists(MODEL_PATH):
#         model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
#         print("✅ Model loaded successfully")
#     else:
#         raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

#     model.to(DEVICE)
#     model.eval()
#     return model

# model = load_model()

# # ═══════════════════════════════
# # IMAGE TRANSFORM
# # ═══════════════════════════════
# transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(
#         mean=[0.485, 0.456, 0.406],
#         std=[0.229, 0.224, 0.225]
#     )
# ])

# # ═══════════════════════════════
# # PREDICTION FUNCTION
# # ═══════════════════════════════
# def predict(image_file):
#     image = Image.open(image_file).convert("RGB")
#     image = transform(image).unsqueeze(0).to(DEVICE)

#     with torch.no_grad():
#         output = model(image)
#         probs = torch.softmax(output, dim=1)
#         conf, pred = torch.max(probs, 1)

#     class_name = idx_to_class[pred.item()]
#     confidence = float(conf.item()) * 100

#     return class_name, confidence

# # ═══════════════════════════════
# # API ROUTE
# # ═══════════════════════════════
# @app.route("/api/analyze", methods=["POST"])
# def analyze():
#     if "image" not in request.files:
#         return jsonify({"error": True, "message": "No image uploaded"}), 400

#     file = request.files["image"]

#     try:
#         disease, confidence = predict(file)

#         disease_key = disease.lower().replace(" ", "_")

#         info = DISEASE_INFO.get(disease_key, {
#             "medicine": "Consult agronomist",
#             "fertilizer": "Balanced NPK",
#             "treatment": "Monitor and consult",
#             "severity": "medium"
#         })

#         return jsonify({
#             "disease": disease,
#             "confidence": round(confidence, 1),
#             "severity": info["severity"],
#             "ndvi_score": 0.5,
#             "medicine": info["medicine"],
#             "fertilizer": info["fertilizer"],
#             "treatment": info["treatment"],
#             "action_window": "48 hours",
#             "zones": {
#                 "north": 0.6,
#                 "south": 0.5,
#                 "east": 0.55,
#                 "west": 0.45
#             }
#         })

#     except Exception as e:
#         return jsonify({"error": True, "message": str(e)}), 500

# # ═══════════════════════════════
# # WEATHER API (STATIC DEMO)
# # ═══════════════════════════════
# @app.route("/api/weather", methods=["POST"])
# def weather():
#     return jsonify({
#         "temp": 30,
#         "humidity": 60,
#         "wind_speed": 3.5,
#         "description": "Partly cloudy",
#         "disease_risk": "Medium",
#         "spray_advice": "Spray in early morning",
#         "rain_advice": "No rain expected",
#         "forecast": []
#     })


# # ═══════════════════════════════
# # RUN SERVER
# # ═══════════════════════════════
# if __name__ == "__main__":
#     print("\n🚀 AgriVision backend starting...")
#     app.run(debug=True)




# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import tempfile
# import os
# import sys

# # ── Connect to ml folder ──
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# ML_DIR   = os.path.join(BASE_DIR, '..', 'ml')
# sys.path.insert(0, ML_DIR)

# from predict import load_model, predict_disease

# app = Flask(__name__)
# CORS(app)

# # Load model once at startup
# print("Starting AgriVision backend...")
# model = load_model()
# print("✅ Backend ready!")

# # ══════════════════════════════
# #   ROUTES
# # ══════════════════════════════

# @app.route('/api/health')
# def health():
#     return jsonify({"status": "ok", "model": "loaded"})

# @app.route('/api/demo')
# def demo():
#     return jsonify({
#         "disease":       "Early Blight",
#         "severity":      "medium",
#         "ndvi_score":    0.42,
#         "medicine":      "Mancozeb 75% WP — 2g per litre of water",
#         "fertilizer":    "Reduce nitrogen. Add potassium-rich fertilizer.",
#         "treatment":     "1. Remove infected leaves immediately\n2. Spray fungicide every 7 days\n3. Avoid overhead watering\n4. Ensure proper spacing between plants",
#         "confidence":    "87%",
#         "action_window": "48 hours",
#         "zone":          "Zone B — Northwest Field"
#     })

# @app.route('/api/analyze', methods=['POST'])
# def analyze():
#     if 'image' not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     file = request.files['image']

#     if file.filename == '':
#         return jsonify({"error": "Empty file"}), 400

#     # Save temporarily
#     suffix = '.jpg'
#     if file.filename.lower().endswith('.png'):
#         suffix = '.png'
#     elif file.filename.lower().endswith('.webp'):
#         suffix = '.webp'

#     with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
#         file.save(tmp.name)
#         tmp_path = tmp.name

#     try:
#         result = predict_disease(tmp_path, model)
#         print(f"✅ Prediction: {result['disease']} ({result['confidence']})")
#         return jsonify(result)

#     except Exception as e:
#         print(f"❌ Prediction error: {e}")
#         return jsonify({
#             "disease":       "Early Blight",
#             "severity":      "medium",
#             "ndvi_score":    0.42,
#             "medicine":      "Mancozeb 75% WP — 2g per litre of water",
#             "fertilizer":    "Reduce nitrogen. Add potassium-rich fertilizer.",
#             "treatment":     "1. Remove infected leaves\n2. Spray fungicide every 7 days\n3. Avoid overhead watering",
#             "confidence":    "87%",
#             "action_window": "48 hours",
#             "zone":          "Zone B — Northwest Field"
#         })

#     finally:
#         if os.path.exists(tmp_path):
#             os.unlink(tmp_path)

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)







"""
AgriVision - app.py
Complete backend with:
  - Leaf disease detection
  - Field NDVI analysis
  - Live weather advisory
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import tempfile
import os
import sys
import traceback

# ── Connect to ml folder ──
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR   = os.path.join(BASE_DIR, '..', 'ml')
sys.path.insert(0, ML_DIR)

from predict import load_model, predict_disease, predict_field

app = Flask(__name__)
CORS(app)

# ══════════════════════════════
#   WEATHER CONFIG
# ══════════════════════════════
WEATHER_API_KEY = "1957753c62b83c5c2ec2b72c0cfa77de"

# ══════════════════════════════
#   LOAD MODEL ON STARTUP
# ══════════════════════════════
print("🚀 Starting AgriVision backend...")

try:
    model = load_model()
    print("✅ Model loaded successfully!")
except Exception as e:
    print("❌ Model loading failed:", e)
    traceback.print_exc()
    model = None

# ══════════════════════════════
#   HEALTH CHECK
# ══════════════════════════════
@app.route('/api/health')
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })


# ══════════════════════════════
#   SERVE FRONTEND FILES
# ══════════════════════════════
FRONTEND_DIR = os.path.join(BASE_DIR, '..')

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(FRONTEND_DIR, filename)
# ══════════════════════════════
#   WEATHER ROUTE
# ══════════════════════════════
@app.route('/api/weather', methods=['POST'])
def weather():
    import requests as req

    data = request.get_json()
    lat  = data.get('lat', 13.0219)
    lon  = data.get('lon', 75.0367)

    try:
        curr_url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
        )
        fore_url = (
            f"https://api.openweathermap.org/data/2.5/forecast"
            f"?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric&cnt=24"
        )

        curr = req.get(curr_url, timeout=8).json()
        fore = req.get(fore_url, timeout=8).json()

        if curr.get("cod") != 200:
            print("❌ Weather API error:", curr)
            return jsonify({"error": curr.get("message", "Weather API error")}), 500

        temp        = curr['main']['temp']
        humidity    = curr['main']['humidity']
        description = curr['weather'][0]['description'].title()
        wind_speed  = curr['wind']['speed']
        rain_today  = curr.get('rain', {}).get('1h', 0)

        forecast = []
        for item in fore.get('list', [])[:6]:
            forecast.append({
                "time":     item['dt_txt'],
                "temp":     item['main']['temp'],
                "humidity": item['main']['humidity'],
                "desc":     item['weather'][0]['description'].title(),
                "rain":     item.get('rain', {}).get('3h', 0)
            })

        if humidity > 85 and 18 < temp < 28:
            disease_risk = "High"
            spray_advice = "⚠️ High fungal risk. Spray TODAY before conditions worsen."
        elif humidity > 65:
            disease_risk = "Medium"
            spray_advice = "💊 Moderate risk. Spray within 1–2 days."
        else:
            disease_risk = "Low"
            spray_advice = "✅ Low risk. Continue routine monitoring."

        rain_soon   = any(f['rain'] > 0 for f in forecast)
        rain_advice = ("🌧️ Rain expected — spray BEFORE rain for best effect."
                       if rain_soon else "☀️ No rain expected. Safe spraying window.")

        return jsonify({
            "temp":         round(temp, 1),
            "humidity":     humidity,
            "description":  description,
            "wind_speed":   wind_speed,
            "rain_today":   rain_today,
            "disease_risk": disease_risk,
            "spray_advice": spray_advice,
            "rain_advice":  rain_advice,
            "forecast":     forecast
        })

    except Exception as e:
        print("❌ Weather error:", e)
        traceback.print_exc()
        return jsonify({"error": "Weather fetch failed", "message": str(e)}), 500


# ══════════════════════════════
#   ANALYZE ROUTE
# ══════════════════════════════
@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": True, "message": "No image uploaded"}), 400

    file  = request.files['image']
    mode  = request.form.get('mode', 'leaf')
    fname = file.filename.lower()

    suffix = '.jpg'
    if fname.endswith('.png'):  suffix = '.png'
    elif fname.endswith('.webp'): suffix = '.webp'

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        if mode == 'field':
            result = predict_field(tmp_path)
        else:
            if model is None:
                return jsonify({"error": True, "message": "Model not loaded"}), 500
            result = predict_disease(tmp_path, model)

        print(f"✅ [{mode}] {result.get('disease')} | {result.get('confidence')}%")
        return jsonify(result)

    except Exception as e:
        print("❌ Error:", e)
        traceback.print_exc()
        return jsonify({"error": True, "message": str(e)}), 500

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# ══════════════════════════════
#   RUN
# ══════════════════════════════
if __name__ == '__main__':
    print("🌿 AgriVision API → http://localhost:5000")
    app.run(debug=True, port=5000)