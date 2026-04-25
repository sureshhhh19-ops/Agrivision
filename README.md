# 🌿 AgriVision — AI-Powered Crop Health Monitoring System

> **Xypheria 2026 Hackathon** · Team CodeCultivators · Alva's Institute of Engineering & Technology

[![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)](https://python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.11-red?logo=pytorch)](https://pytorch.org)
[![Flask](https://img.shields.io/badge/Flask-3.1-black?logo=flask)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📌 Problem Statement

India loses **₹90,000 crore annually** to crop diseases. **70% of farmers** detect disease only after visible damage — when it is already too late to save the harvest. Existing solutions require expensive hardware sensors costing ₹15,000+ per acre, making them inaccessible to small and marginal farmers.

**AgriVision solves this.**

---

## 💡 What is AgriVision?

AgriVision is a dual-mode AI web application that helps farmers detect crop diseases early using:

- 🌿 **Leaf Mode** — Upload a leaf photo → CNN model detects disease → Get medicine, fertilizer, and treatment advice instantly
- 🛰️ **Field Mode** — Upload a satellite/aerial field image → NDVI analysis → Get field health distribution, risk score, zone breakdown, and NDVI heatmap

No sensors. No hardware. Zero cost to farmers.

---

## 🖥️ Live Demo Flow

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   USER SELECTS MODE                             │
│   ┌──────────────┐    ┌──────────────────────┐  │
│   │ 🌿 Leaf Mode │    │ 🛰️ Field Mode        │  │
│   └──────┬───────┘    └──────────┬───────────┘  │
│          │                       │               │
│    Upload leaf photo       Upload field image    │
│          │                       │               │
│    CNN (MobileNetV2)       ExG NDVI Analysis     │
│    Disease Detection       Risk Score Calc       │
│          │                       │               │
│    ┌─────▼──────┐         ┌──────▼───────┐      │
│    │ Disease    │         │ Risk Score   │      │
│    │ Medicine   │         │ Health Dist  │      │
│    │ Fertilizer │         │ NDVI Heatmap │      │
│    │ Treatment  │         │ Zone Breakdown│     │
│    └────────────┘         └──────────────┘      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
agrivision/
│
├── frontend/                  # HTML + CSS + JavaScript (No framework)
│   ├── index.html             # 4-page Single Page Application
│   ├── style.css              # Dark theme with green accents
│   └── script.js              # All frontend logic + NDVI canvas rendering
│
├── backend/                   # Python Flask REST API
│   └── app.py                 # API routes: /analyze, /weather, /health
│
├── ml/                        # Machine Learning
│   ├── predict.py             # Prediction + NDVI calculation engine
│   ├── train.py               # Model training script
│   └── model.pth              # Trained MobileNetV2 weights (PyTorch)
│
└── data/                      # Sample images and datasets
    └── satellite/             # Sample Sentinel-2 field images
```

---

## 🧠 Machine Learning

### Leaf Disease Detection (CNN)

| Property | Details |
|----------|---------|
| **Architecture** | MobileNetV2 (Transfer Learning) |
| **Dataset** | PlantVillage Dataset (54,000+ leaf images) |
| **Classes** | Early Blight, Late Blight, Leaf Spot, Healthy |
| **Framework** | PyTorch 2.11 |
| **Input Size** | 224 × 224 RGB |
| **Preprocessing** | ImageNet normalization (mean/std) |

### Field Health Analysis (NDVI)

| Property | Details |
|----------|---------|
| **Algorithm** | Excess Green Index (ExG) — `2G - R - B` |
| **Output** | NDVI map (−1 to 1 scale) |
| **Zone Analysis** | 4 quadrants: North, South, East, West |
| **Health Classes** | Healthy (>0.2), Stressed (−0.1 to 0.2), Diseased (<−0.1) |
| **Risk Score** | Weighted: Diseased×0.7 + Stressed×0.3 |

---

## 🛠️ Tech Stack

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10 | Core language |
| Flask | 3.1 | REST API server |
| flask-cors | latest | Cross-Origin requests |
| PyTorch | 2.11 | Deep learning inference |
| TorchVision | 0.26 | MobileNetV2 + transforms |
| Pillow | 12.2 | Image processing |
| NumPy | 2.4 | NDVI computation |
| Requests | 2.33 | Weather API calls |

### Frontend
| Tool | Purpose |
|------|---------|
| HTML5 / CSS3 / JavaScript | Core frontend (no framework) |
| Canvas API | NDVI heatmap rendering, gauge chart |
| Fetch API | REST API communication |
| Google Fonts (Syne + DM Sans) | Typography |

### External APIs
| API | Purpose | Cost |
|-----|---------|------|
| OpenWeatherMap API | Current weather + 5-day forecast | Free tier |
| Sentinel-2 (ESA) | Satellite field imagery reference | Free |

### Open Source Models Used
| Model | Source | License |
|-------|--------|---------|
| MobileNetV2 | TorchVision / ImageNet pretrained | BSD |
| PlantVillage Dataset | Penn State University | CC BY 4.0 |

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- pip
- VS Code (recommended) with Live Server extension

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/agrivision.git
cd agrivision
```

### 2. Install Python Dependencies
```bash
cd backend
pip install flask flask-cors pillow numpy requests

cd ../ml
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### 3. Add Model File
Place your trained `model.pth` file in the `ml/` folder.

If you want to train from scratch:
```bash
cd ml
python train.py
```

### 4. Add Weather API Key
In `backend/app.py`, replace:
```python
WEATHER_API_KEY = "YOUR_KEY_HERE"
```
Get a free key at: https://openweathermap.org/api

### 5. Run Backend
```bash
cd backend
python app.py
```
Backend runs at: `http://127.0.0.1:5000`

### 6. Run Frontend
Open `frontend/index.html` with VS Code Live Server, or simply open in browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server + model status |
| POST | `/api/analyze` | Analyze uploaded image (leaf or field) |
| POST | `/api/weather` | Fetch weather + disease risk advisory |

### `/api/analyze` Request
```
POST /api/analyze
Content-Type: multipart/form-data

image: <image file>
mode:  "leaf" or "field"
```

### `/api/analyze` Response (Leaf Mode)
```json
{
  "disease": "Early Blight",
  "severity": "medium",
  "confidence": 87.3,
  "ndvi_score": 0.42,
  "medicine": "Mancozeb 75% WP — 2g/L",
  "fertilizer": "Reduce nitrogen, add potassium",
  "treatment": "Remove infected leaves, spray weekly",
  "action_window": "24–48 hours",
  "zone": "Auto-detected field zone"
}
```

### `/api/analyze` Response (Field Mode)
```json
{
  "disease": "Field Analysis",
  "severity": "medium",
  "ndvi_score": 0.54,
  "risk_score": 38.5,
  "healthy_pct": 62.1,
  "stressed_pct": 28.4,
  "diseased_pct": 9.5,
  "zones": {
    "north": 0.68,
    "south": 0.44,
    "east": 0.71,
    "west": 0.38
  },
  "ndvi_map": [[...]],
  "action_window": "48–72 hours"
}
```

### `/api/weather` Request
```json
{ "lat": 13.0, "lon": 77.5 }
```

### `/api/weather` Response
```json
{
  "temp": 28.4,
  "humidity": 74,
  "description": "Partly Cloudy",
  "wind_speed": 3.2,
  "disease_risk": "Medium",
  "spray_advice": "💊 Spray within 1–2 days.",
  "rain_advice": "☀️ Safe spraying window.",
  "forecast": [...]
}
```

---

## 🌿 NDVI Heatmap Color Scale

| Color | NDVI Range | Meaning |
|-------|-----------|---------|
| 🟤 Brown | −2.0 (special) | Bare soil / Uncultivated |
| 🔴 Dark Red | −1.0 to −0.1 | Severely diseased |
| 🟠 Orange | −0.1 to 0.2 | Stressed vegetation |
| 🟡 Yellow | 0.2 to 0.4 | Mild stress |
| 🟢 Light Green | 0.4 to 0.6 | Moderately healthy |
| 💚 Dark Green | 0.6 to 1.0 | Healthy crop |

---

## 📊 Disease Classes & Treatments

| Disease | Medicine | Fertilizer |
|---------|---------|-----------|
| **Early Blight** | Mancozeb 75% WP — 2g/L | Reduce nitrogen, add potassium |
| **Late Blight** | Metalaxyl + Mancozeb | Add calcium-rich fertilizer |
| **Leaf Spot** | Copper Oxychloride 50% WP | Balanced NPK |
| **Healthy** | No medicine needed | Continue regular NPK schedule |

---

## 🔭 Future Roadmap

- [ ] Real Sentinel-2 NIR band integration for true NDVI
- [ ] Multi-language support (Kannada, Hindi, Tamil, Telugu)
- [ ] Voice input for farmers using Web Speech API
- [ ] Government scheme integration (PM-Kisan, AgriStack)
- [ ] Pest detection model (separate CNN)
- [ ] Offline PWA mode for low-connectivity areas
- [ ] WhatsApp alert integration

---

## 👥 Team

**Team CodeCultivators** — Xypheria 2026
Alva's Institute of Engineering & Technology, Moodbidri

| Member | Role |
|--------|------|
| Shiva | Frontend (HTML/CSS/JS) + Integration |
| Suresh | Backend (Flask API) |
| Bheemangouda | ML Model (PyTorch + Training) |
| Devansh | Data Pipeline + Presentation |

---

## 📚 References & Credits

- **PlantVillage Dataset** — Hughes, D.P. & Salathé, M. (2015). An open access repository of images on plant health. [CC BY 4.0]
- **MobileNetV2** — Sandler et al. (2018). MobileNetV2: Inverted Residuals and Linear Bottlenecks. CVPR 2018.
- **Excess Green Index (ExG)** — Woebbecke et al. (1995). Color indices for weed identification under various soil, residue, and lighting conditions.
- **Sentinel-2 Imagery** — European Space Agency (ESA) Copernicus Programme. Free and open access.
- **OpenWeatherMap API** — Free tier weather data API.
- **TorchVision Models** — PyTorch open source model zoo.

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

The PlantVillage dataset is used under CC BY 4.0 license.
MobileNetV2 pretrained weights are used under BSD license.

---

## 🙏 Acknowledgements

- Xypheria 2026 organizing committee, Alva's Institute of Engineering & Technology
- Penn State University for the PlantVillage dataset
- PyTorch and TorchVision open source community
- European Space Agency for free Sentinel-2 satellite data
- OpenWeatherMap for free weather API

---

*Built with 🌿 for Indian Farmers — Team CodeCultivators, Xypheria 2026*
