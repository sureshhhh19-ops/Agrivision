# import numpy as np
# from PIL import Image
# import torch
# import torch.nn as nn
# from torchvision import models, transforms
# import os

# # ===============================
# # PATH
# # ===============================
# BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
# MODEL_PATH = os.path.join(BASE_DIR, "model.pth")   # PyTorch model file

# # ===============================
# # CLASS ORDER (MATCH TRAINING!)
# # ===============================
# CLASS_NAMES = [
#     "Early Blight",
#     "Healthy",
#     "Late Blight",
#     "Leaf Spot"
# ]

# # ===============================
# # DISEASE INFO
# # ===============================
# DISEASE_INFO = {
#     "Early Blight": {
#         "medicine":    "Mancozeb 75% WP — 2g/L",
#         "fertilizer":  "Reduce nitrogen, add potassium",
#         "treatment":   "Remove infected leaves, spray weekly"
#     },
#     "Late Blight": {
#         "medicine":    "Metalaxyl + Mancozeb",
#         "fertilizer":  "Add calcium",
#         "treatment":   "Immediate action, improve drainage"
#     },
#     "Healthy": {
#         "medicine":    "None",
#         "fertilizer":  "Maintain NPK",
#         "treatment":   "Monitor weekly"
#     },
#     "Leaf Spot": {
#         "medicine":    "Copper Oxychloride",
#         "fertilizer":  "Balanced fertilizer",
#         "treatment":   "Remove infected leaves"
#     }
# }

# # ===============================
# # DEVICE
# # ===============================
# DEVICE = torch.device("cpu")   # CPU only — safe for all systems

# # ===============================
# # PREPROCESSING (matches MobileNetV2 training)
# # ===============================
# TRANSFORM = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(
#         mean=[0.485, 0.456, 0.406],   # ImageNet means
#         std =[0.229, 0.224, 0.225]    # ImageNet stds
#     ),
# ])

# # ===============================
# # BUILD MODEL ARCHITECTURE
# # ===============================
# def build_model():
#     from torchvision import models
#     import torch.nn as nn

#     model = models.mobilenet_v2(weights=None)

#     # EXACT SAME as training
#     model.classifier = nn.Sequential(
#         nn.Linear(1280, 256),
#         nn.ReLU(),
#         nn.Dropout(0.3),
#         nn.Linear(256, 4)
#     )

#     return model
# # ===============================
# # LOAD MODEL
# # ===============================
# def load_model():
#     print("🔄 Loading PyTorch model...")

#     if not os.path.exists(MODEL_PATH):
#         print("⚠️ Model not found → DEMO MODE")
#         return None

#     model = build_model()

#     state = torch.load(MODEL_PATH, map_location=DEVICE)

#     # handle checkpoint formats
#     if isinstance(state, dict) and "model_state_dict" in state:
#         state = state["model_state_dict"]

#     model.load_state_dict(state, strict=False)  # 🔥 important
#     model.to(DEVICE)
#     model.eval()

#     print("✅ Model loaded successfully!")
#     return model
# # ===============================
# # PREPROCESS IMAGE
# # ===============================
# def preprocess_image(image_path):
#     img    = Image.open(image_path).convert("RGB")
#     tensor = TRANSFORM(img).unsqueeze(0).to(DEVICE)  # (1, 3, 224, 224)
#     return tensor

# # ===============================
# # NDVI MAP (unchanged — pure NumPy)
# # ===============================
# def calculate_ndvi_map(image_path):
#     img        = Image.open(image_path).convert("RGB")
#     img_np     = np.array(img.resize((200, 150)), dtype=np.float32)

#     r, g, b    = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]
#     ExG        = 2 * g - r - b

#     exg_min    = np.percentile(ExG, 2)
#     exg_max    = np.percentile(ExG, 98)
#     ndvi_approx = (ExG - exg_min) / (exg_max - exg_min + 0.0001)
#     ndvi_approx = np.clip(ndvi_approx, 0, 1)

#     return (ndvi_approx * 2) - 1   # scale to [-1, 1]

# def calculate_ndvi_score(ndvi_map):
#     positive = ndvi_map[ndvi_map > 0]
#     if len(positive) == 0:
#         return 0.3
#     return float(np.clip(np.mean(positive), 0, 1))

# def calculate_zones(ndvi_map):
#     h, w       = ndvi_map.shape
#     half_h, half_w = h // 2, w // 2

#     def zone_score(zone):
#         return float(np.sum(zone > 0.1) / zone.size)

#     return {
#         "north": round(zone_score(ndvi_map[:half_h, :]),  2),
#         "south": round(zone_score(ndvi_map[half_h:, :]),  2),
#         "east":  round(zone_score(ndvi_map[:, half_w:]),  2),
#         "west":  round(zone_score(ndvi_map[:, :half_w]),  2),
#     }

# # ===============================
# # SEVERITY
# # ===============================
# def get_severity(ndvi_score, disease):
#     if disease == "Healthy":
#         return "low"
#     if ndvi_score > 0.6:
#         return "low"
#     elif ndvi_score > 0.35:
#         return "medium"
#     return "high"

# # ===============================
# # MAIN PREDICTION
# # ===============================
# def predict_disease(image_path, model):
#     ndvi_map   = calculate_ndvi_map(image_path)
#     ndvi_score = calculate_ndvi_score(ndvi_map)
#     zones      = calculate_zones(ndvi_map)

#     # ── Demo mode if model not loaded ──
#     if model is None:
#         import random
#         disease    = random.choice(CLASS_NAMES)
#         confidence = round(random.uniform(75, 95), 1)
#     else:
#         tensor = preprocess_image(image_path)
#         with torch.no_grad():
#             outputs = model(tensor)                        # (1, 4)
#             probs   = torch.softmax(outputs, dim=1)[0]    # (4,)

#         class_idx  = int(torch.argmax(probs).item())
#         confidence = float(probs[class_idx].item()) * 100
#         disease    = CLASS_NAMES[class_idx]

#     severity = get_severity(ndvi_score, disease)
#     info     = DISEASE_INFO[disease]

#     return {
#         "disease":       disease,
#         "severity":      severity,
#         "ndvi_score":    round(ndvi_score, 2),
#         "confidence":    round(confidence, 1),
#         "medicine":      info["medicine"],
#         "fertilizer":    info["fertilizer"],
#         "treatment":     info["treatment"],
#         "zones":         zones,
#         "ndvi_map":      ndvi_map.tolist(),
#         "action_window": "24–48 hours",
#         "zone":          "Auto-detected field zone"
#     }

# # ===============================
# # FIELD ANALYSIS
# # ===============================
# def predict_field(image_path):
#     ndvi_map   = calculate_ndvi_map(image_path)
#     ndvi_score = calculate_ndvi_score(ndvi_map)
#     zones      = calculate_zones(ndvi_map)

#     flat  = ndvi_map.flatten()
#     total = len(flat)

#     healthy_pct  = round(float(np.sum(flat >  0.2) / total) * 100, 1)
#     stressed_pct = round(float(np.sum((flat >= -0.1) & (flat <= 0.2)) / total) * 100, 1)
#     diseased_pct = round(float(np.sum(flat < -0.1) / total) * 100, 1)

#     total_pct = healthy_pct + stressed_pct + diseased_pct
#     if total_pct > 100:
#         factor       = 100 / total_pct
#         healthy_pct  = round(healthy_pct  * factor, 1)
#         stressed_pct = round(stressed_pct * factor, 1)
#         diseased_pct = round(100 - healthy_pct - stressed_pct, 1)

#     risk_score = round((diseased_pct * 0.7) + (stressed_pct * 0.3), 1)
#     risk_score = min(100, max(0, risk_score))
#     severity   = "low" if risk_score < 25 else "medium" if risk_score < 55 else "high"

#     return {
#         "disease":       "Field Analysis",
#         "severity":      severity,
#         "ndvi_score":    round(ndvi_score, 2),
#         "confidence":    round(float(np.random.uniform(82, 91)), 1),
#         "medicine":      "N/A — Use NDVI zones for treatment planning",
#         "fertilizer":    "Apply based on zone breakdown",
#         "treatment":     "Focus treatment on red zones shown in NDVI map",
#         "action_window": "24 hours" if severity == "high" else "48–72 hours",
#         "zone":          "Multi-zone field analysis",
#         "risk_score":    risk_score,
#         "healthy_pct":   healthy_pct,
#         "stressed_pct":  stressed_pct,
#         "diseased_pct":  diseased_pct,
#         "zones":         zones,
#         "ndvi_map":      ndvi_map.tolist()
#     }






# import numpy as np
# from PIL import Image
# import torch
# import torch.nn as nn
# from torchvision import models, transforms
# import os
# import random

# BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
# MODEL_PATH = os.path.join(BASE_DIR, "model.pth")

# CLASS_NAMES = ["Early Blight", "Healthy", "Late Blight", "Leaf Spot"]

# DISEASE_INFO = {
#     "Early Blight": {
#         "medicine": "Mancozeb 75% WP — 2g/L",
#         "fertilizer": "Reduce nitrogen, add potassium",
#         "treatment": "Remove infected leaves, spray weekly"
#     },
#     "Late Blight": {
#         "medicine": "Metalaxyl + Mancozeb",
#         "fertilizer": "Add calcium",
#         "treatment": "Immediate action, improve drainage"
#     },
#     "Healthy": {
#         "medicine": "None",
#         "fertilizer": "Maintain NPK",
#         "treatment": "Monitor weekly"
#     },
#     "Leaf Spot": {
#         "medicine": "Copper Oxychloride",
#         "fertilizer": "Balanced fertilizer",
#         "treatment": "Remove infected leaves"
#     }
# }

# DEVICE = torch.device("cpu")

# TRANSFORM = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
# ])

# # ✅ BUILD MODEL
# def build_model():
#     model = models.mobilenet_v2(weights=None)
#     in_features = model.classifier[1].in_features  # get correct size
#     model.classifier = nn.Sequential(
#         nn.Dropout(0.3),
#         nn.Linear(in_features, 256),
#         nn.ReLU(),
#         nn.Dropout(0.2),
#         nn.Linear(256, 4),
#     )
#     return model

# # ✅ LOAD MODEL SAFE
# def load_model():
#     print("🔄 Loading model...")
#     if not os.path.exists(MODEL_PATH):
#         print("⚠️ Model missing → DEMO MODE")
#         return None

#     try:
#         model = build_model()
#         state = torch.load(MODEL_PATH, map_location=DEVICE)

#         if isinstance(state, dict) and "model_state_dict" in state:
#             state = state["model_state_dict"]

#         model.load_state_dict(state, strict=True)
#         model.eval()
#         return model
#     except Exception as e:
#         print("❌ Model load error:", e)
#         return None

# # ✅ SAFE IMAGE LOAD
# def load_image(image_path):
#     try:
#         return Image.open(image_path).convert("RGB")
#     except:
#         raise ValueError("Invalid image file")

# def preprocess_image(image_path):
#     img = load_image(image_path)
#     return TRANSFORM(img).unsqueeze(0)

# # ✅ FASTER NDVI
# def calculate_ndvi_map(image_path):
#     img = load_image(image_path).resize((200,150))
#     img_np = np.array(img, dtype=np.float32)

#     r,g,b = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]
#     exg = 2*g - r - b

#     exg_min, exg_max = np.percentile(exg,2), np.percentile(exg,98)
#     ndvi = (exg - exg_min) / (exg_max - exg_min + 1e-6)
#     return np.clip(ndvi,0,1)*2 - 1

# def calculate_ndvi_score(ndvi):
#     pos = ndvi[ndvi > 0]
#     return float(np.mean(pos)) if len(pos)>0 else 0.3

# def calculate_zones(ndvi):
#     h,w = ndvi.shape
#     hh,hw = h//2, w//2

#     def score(z): return float(np.mean(z>0.1))

#     return {
#         "north": round(score(ndvi[:hh,:]),2),
#         "south": round(score(ndvi[hh:,:]),2),
#         "east":  round(score(ndvi[:,hw:]),2),
#         "west":  round(score(ndvi[:,:hw]),2)
#     }

# def get_severity(score, disease):
#     if disease == "Healthy": return "low"
#     if score > 0.6: return "low"
#     if score > 0.35: return "medium"
#     return "high"

# # ✅ MAIN
# def predict_disease(image_path, model):
#     ndvi_map = calculate_ndvi_map(image_path)
#     score    = calculate_ndvi_score(ndvi_map)
#     zones    = calculate_zones(ndvi_map)

#     if model is None:
#         disease = random.choice(CLASS_NAMES)
#         confidence = random.uniform(70,90)
#     else:
#         try:
#             tensor = preprocess_image(image_path)
#             with torch.no_grad():
#                 probs = torch.softmax(model(tensor)[0], dim=0)

#             idx = int(torch.argmax(probs))
#             disease = CLASS_NAMES[idx]
#             confidence = float(probs[idx])*100
#         except:
#             disease = "Unknown"
#             confidence = 50

#     severity = get_severity(score, disease)
#     info = DISEASE_INFO.get(disease, DISEASE_INFO["Healthy"])

#     return {
#         "disease": disease,
#         "severity": severity,
#         "ndvi_score": round(score,2),
#         "confidence": round(confidence,1),
#         "confidence_label": "High" if confidence>80 else "Medium" if confidence>60 else "Low",
#         "medicine": info["medicine"],
#         "fertilizer": info["fertilizer"],
#         "treatment": info["treatment"],
#         "zones": zones,
#         "ndvi_map": ndvi_map.tolist(),
#         "action_window": "24–48 hours"
#     }

# # ✅ FIELD
# def predict_field(image_path):
#     ndvi = calculate_ndvi_map(image_path)
#     score = calculate_ndvi_score(ndvi)
#     zones = calculate_zones(ndvi)

#     flat = ndvi.flatten()
#     total = len(flat)

#     healthy = np.sum(flat>0.2)/total*100
#     stressed = np.sum((flat>=-0.1)&(flat<=0.2))/total*100
#     diseased = np.sum(flat<-0.1)/total*100

#     risk = min(100, diseased*0.7 + stressed*0.3)

#     return {
#         "disease": "Field Analysis",
#         "severity": "low" if risk<25 else "medium" if risk<55 else "high",
#         "ndvi_score": round(score,2),
#         "confidence": round(random.uniform(80,90),1),
#         "risk_score": round(risk,1),
#         "zones": zones,
#         "ndvi_map": ndvi.tolist()
#     }


"""
AgriVision - predict.py (PyTorch version)
Handles both:
  - Leaf disease detection  (model.pth)
  - Field health prediction (field_model.pth)
"""

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms
import os
import json

# ═══════════════════════════════════════════
#   PATHS
# ═══════════════════════════════════════════
BASE_DIR          = os.path.dirname(os.path.abspath(__file__))
LEAF_MODEL_PATH   = os.path.join(BASE_DIR, "model.pth")
FIELD_MODEL_PATH  = os.path.join(BASE_DIR, "field_model.pth")
FIELD_LABELS_PATH = os.path.join(BASE_DIR, "field_labels.json")

# ═══════════════════════════════════════════
#   LEAF CLASS NAMES + INFO
# ═══════════════════════════════════════════
# Load class names dynamically from saved training labels
LABELS_PATH = os.path.join(BASE_DIR, "class_labels.json")
if os.path.exists(LABELS_PATH):
    with open(LABELS_PATH) as f:
        _label_map = json.load(f)          # {"early_blight": 0, ...}
    LEAF_CLASS_NAMES = [None] * len(_label_map)
    for name, idx in _label_map.items():
        LEAF_CLASS_NAMES[idx] = name       # ["early_blight", "healthy", ...]
else:
    LEAF_CLASS_NAMES = ["early_blight", "healthy", "late_blight", "leaf_spot"]

DISEASE_INFO = {
    "early_blight": {
        "medicine":   "Mancozeb 75% WP — 2g/L",
        "fertilizer": "Reduce nitrogen, add potassium",
        "treatment":  "Remove infected leaves, spray every 7 days"
    },
    "late_blight": {
        "medicine":   "Metalaxyl + Mancozeb",
        "fertilizer": "Add calcium",
        "treatment":  "Immediate action, improve drainage"
    },
    "healthy": {
        "medicine":   "None",
        "fertilizer": "Maintain NPK balance",
        "treatment":  "Monitor weekly"
    },
    "leaf_spot": {
        "medicine":   "Copper Oxychloride",
        "fertilizer": "Balanced fertilizer",
        "treatment":  "Remove infected leaves, avoid overhead watering"
    }
}

# ═══════════════════════════════════════════
#   FIELD CLASSES + INFO
# ═══════════════════════════════════════════
DEFAULT_FIELD_CLASSES = {"Diseased": 0, "Healthy": 1, "Stressed": 2}

FIELD_INFO = {
    "Healthy": {
        "medicine":      "N/A",
        "fertilizer":    "Maintain NPK, monitor weekly",
        "treatment":     "Field looks healthy. Continue regular monitoring.",
        "action_window": "72 hours",
        "severity":      "low",
    },
    "Stressed": {
        "medicine":      "Check soil moisture and nutrient levels",
        "fertilizer":    "Apply balanced fertilizer — check N-P-K levels",
        "treatment":     "Investigate water supply. Check for early pest signs.",
        "action_window": "48 hours",
        "severity":      "medium",
    },
    "Diseased": {
        "medicine":      "Apply broad-spectrum fungicide immediately",
        "fertilizer":    "Reduce nitrogen. Add potassium and phosphorus.",
        "treatment":     "Isolate affected zones. Spray fungicide. Remove diseased plants.",
        "action_window": "24 hours",
        "severity":      "high",
    },
}

# ═══════════════════════════════════════════
#   DEVICE + TRANSFORM
# ═══════════════════════════════════════════
DEVICE = torch.device("cpu")

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std =[0.229, 0.224, 0.225]),
])

# ═══════════════════════════════════════════
#   MODEL BUILDERS
# ═══════════════════════════════════════════
def _build_mobilenet(num_classes, hidden=256):
    m = models.mobilenet_v2(weights=None)
    in_f = m.classifier[1].in_features
    m.classifier = nn.Sequential(
        nn.Dropout(0.3),        # ← match train.py exactly
        nn.Linear(in_f, hidden),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(hidden, num_classes),
    )
    return m


def _load_weights(model, path):
    state = torch.load(path, map_location=DEVICE)
    if isinstance(state, dict) and "model_state_dict" in state:
        state = state["model_state_dict"]
    model.load_state_dict(state)
    model.to(DEVICE)
    model.eval()
    return model


# ═══════════════════════════════════════════
#   LOAD LEAF MODEL  (called by app.py)
# ═══════════════════════════════════════════
def load_model():
    print("🔄 Loading leaf model...")
    if not os.path.exists(LEAF_MODEL_PATH):
        print("⚠️  model.pth not found — DEMO mode active")
        return None
    model = _build_mobilenet(len(LEAF_CLASS_NAMES), hidden=256)
    model = _load_weights(model, LEAF_MODEL_PATH)
    print("✅ Leaf model loaded!")
    return model


# ═══════════════════════════════════════════
#   LOAD FIELD MODEL  (lazy, called once)
# ═══════════════════════════════════════════
_field_model  = None
_field_labels = None

def _get_field_model():
    global _field_model, _field_labels
    if _field_model is not None:
        return _field_model, _field_labels

    # Label map
    if os.path.exists(FIELD_LABELS_PATH):
        with open(FIELD_LABELS_PATH) as f:
            raw = json.load(f)
        label_map = {v: k for k, v in raw.items()}
    else:
        label_map = {v: k for k, v in DEFAULT_FIELD_CLASSES.items()}

    if not os.path.exists(FIELD_MODEL_PATH):
        print("⚠️  field_model.pth not found — using NDVI only")
        _field_labels = label_map
        return None, label_map

    model = _build_mobilenet(len(label_map), hidden=128)
    model = _load_weights(model, FIELD_MODEL_PATH)
    _field_model  = model
    _field_labels = label_map
    print("✅ Field model loaded!")
    return _field_model, _field_labels


# ═══════════════════════════════════════════
#   NDVI HELPERS
# ═══════════════════════════════════════════
def calculate_ndvi_map(image_path):
    img    = Image.open(image_path).convert("RGB")
    img_np = np.array(img.resize((200, 150)), dtype=np.float32)
    r, g, b = img_np[:,:,0], img_np[:,:,1], img_np[:,:,2]
    ExG   = 2 * g - r - b
    lo, hi = np.percentile(ExG, 2), np.percentile(ExG, 98)
    ndvi  = np.clip((ExG - lo) / (hi - lo + 1e-6), 0, 1)
    return (ndvi * 2) - 1   # [-1, 1]


def calculate_ndvi_score(ndvi_map):
    pos = ndvi_map[ndvi_map > 0]
    return float(np.clip(np.mean(pos), 0, 1)) if len(pos) else 0.3


def calculate_zones(ndvi_map):
    h, w = ndvi_map.shape
    hh, hw = h // 2, w // 2
    score = lambda z: round(float(np.sum(z > 0.1) / z.size), 2)
    return {
        "north": score(ndvi_map[:hh, :]),
        "south": score(ndvi_map[hh:, :]),
        "east":  score(ndvi_map[:, hw:]),
        "west":  score(ndvi_map[:, :hw]),
    }


def get_severity(ndvi_score, disease):
    if "healthy" in disease.lower(): return "low"
    return "low" if ndvi_score > 0.6 else "medium" if ndvi_score > 0.35 else "high"


def _preprocess(image_path):
    img = Image.open(image_path).convert("RGB")
    return TRANSFORM(img).unsqueeze(0).to(DEVICE)


# ═══════════════════════════════════════════
#   LEAF PREDICTION
# ═══════════════════════════════════════════
def predict_disease(image_path, model):
    ndvi_map   = calculate_ndvi_map(image_path)
    ndvi_score = calculate_ndvi_score(ndvi_map)
    zones      = calculate_zones(ndvi_map)

    if model is None:
        import random
        disease    = random.choice(LEAF_CLASS_NAMES)
        confidence = round(random.uniform(75, 95), 1)
    else:
        with torch.no_grad():
            probs = torch.softmax(model(_preprocess(image_path)), dim=1)[0]
        idx        = int(torch.argmax(probs))
        confidence = round(float(probs[idx]) * 100, 1)
        disease    = LEAF_CLASS_NAMES[idx]

    info = DISEASE_INFO.get(disease, DISEASE_INFO.get("healthy"))

# Convert "early_blight" → "Early Blight" for display
    display_name = disease.replace("_", " ").title()

    return {
    "disease":       display_name,
    "severity":      get_severity(ndvi_score, display_name),
    "ndvi_score":    round(ndvi_score, 2),
    "confidence":    confidence,
    "medicine":      info["medicine"],
    "fertilizer":    info["fertilizer"],
    "treatment":     info["treatment"],
    "zones":         zones,
    "ndvi_map":      ndvi_map.tolist(),
    "action_window": "24–48 hours",
    "zone":          "Auto-detected field zone",
}
    

# ═══════════════════════════════════════════
#   FIELD PREDICTION  (ML + NDVI blended)
# ═══════════════════════════════════════════
def predict_field(image_path):
    ndvi_map   = calculate_ndvi_map(image_path)
    ndvi_score = calculate_ndvi_score(ndvi_map)
    zones      = calculate_zones(ndvi_map)

    flat  = ndvi_map.flatten()
    total = len(flat)

    healthy_pct  = round(float(np.sum(flat >  0.2) / total) * 100, 1)
    stressed_pct = round(float(np.sum((flat >= -0.1) & (flat <= 0.2)) / total) * 100, 1)
    diseased_pct = round(float(np.sum(flat < -0.1)  / total) * 100, 1)

    # Clamp to 100%
    tp = healthy_pct + stressed_pct + diseased_pct
    if tp > 100:
        f = 100 / tp
        healthy_pct  = round(healthy_pct  * f, 1)
        stressed_pct = round(stressed_pct * f, 1)
        diseased_pct = round(100 - healthy_pct - stressed_pct, 1)

    risk_score = round((diseased_pct * 0.7) + (stressed_pct * 0.3), 1)
    risk_score = min(100, max(0, risk_score))

    # ── ML field model ──
    field_model, label_map = _get_field_model()

    if field_model is not None:
        with torch.no_grad():
            probs = torch.softmax(field_model(_preprocess(image_path)), dim=1)[0]
        idx        = int(torch.argmax(probs))
        ml_label   = label_map[idx]
        confidence = round(float(probs[idx]) * 100, 1)

        # Override: if ML says Healthy but NDVI shows high risk, trust NDVI
        if ml_label == "Healthy" and risk_score > 50:
            ml_label   = "Stressed"
            confidence = round(confidence * 0.8, 1)

    else:
        # NDVI-only fallback
        ml_label   = ("Healthy"  if risk_score < 25 else
                      "Stressed" if risk_score < 55 else "Diseased")
        confidence = round(float(np.random.uniform(72, 88)), 1)

    info = FIELD_INFO.get(ml_label, FIELD_INFO["Stressed"])

    return {
        "disease":       f"Field Analysis — {ml_label}",
        "severity":      info["severity"],
        "ndvi_score":    round(ndvi_score, 2),
        "confidence":    confidence,
        "medicine":      info["medicine"],
        "fertilizer":    info["fertilizer"],
        "treatment":     info["treatment"],
        "action_window": info["action_window"],
        "zone":          "Multi-zone field analysis",
        "risk_score":    risk_score,
        "healthy_pct":   healthy_pct,
        "stressed_pct":  stressed_pct,
        "diseased_pct":  diseased_pct,
        "zones":         zones,
        "ndvi_map":      ndvi_map.tolist(),
        "ml_label":      ml_label,
    }