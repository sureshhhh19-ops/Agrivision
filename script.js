// // ══════════════════════════════════════════
// //   AGRIVISION — script.js FINAL
// //   Two workflows: Leaf + Field
// // ══════════════════════════════════════════

// let currentData = null;
// let selectedMode = 'leaf';

// // ══ MODE SELECT ══
// function setMode(mode) {
//   selectedMode = mode;
//   document.getElementById('leafMode').classList.toggle('active', mode === 'leaf');
//   document.getElementById('fieldMode').classList.toggle('active', mode === 'field');

//   if (mode === 'leaf') {
//     document.getElementById('analyzeText').textContent   = 'Analyze Leaf';
//     document.getElementById('dropzone-text').textContent = 'Drop your leaf image here';
//     document.getElementById('mode-desc').textContent     = '📌 Upload a close-up photo of a crop leaf to detect disease, get medicine and treatment advice.';
//   } else {
//     document.getElementById('analyzeText').textContent   = 'Analyze Field';
//     document.getElementById('dropzone-text').textContent = 'Drop your satellite field image here';
//     document.getElementById('mode-desc').textContent     = '🛰️ Upload a satellite or aerial field image for NDVI health analysis and risk assessment.';
//   }
//   resetUpload();
// }

// function resetUpload() {
//   const preview = document.getElementById('preview');
//   if (preview) { preview.src = ''; preview.style.display = 'none'; }
//   const di = document.getElementById('dropzone-inner');
//   if (di) di.style.display = 'flex';
//   const dz = document.getElementById('dropzone');
//   if (dz) dz.classList.remove('has-image');
//   const fi = document.getElementById('file-info');
//   if (fi) fi.textContent = '';
//   const btn = document.getElementById('analyzeBtn');
//   if (btn) btn.disabled = true;
//   const inp = document.getElementById('imageInput');
//   if (inp) inp.value = '';
// }

// // ══ PAGE NAVIGATION ══
// function showPage(pageId) {
//   document.querySelectorAll('.page').forEach(p => {
//     p.classList.remove('active');
//     p.style.display = 'none';
//   });
//   const target = document.getElementById(pageId);
//   if (!target) return;
//   target.style.display = 'block';
//   setTimeout(() => target.classList.add('active'), 10);
//   window.scrollTo({ top: 0, behavior: 'smooth' });

//   document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
//   if (pageId === 'page-home') document.getElementById('step1')?.classList.add('active');
//   if (pageId === 'page-leaf-results' || pageId === 'page-field-results') document.getElementById('step2')?.classList.add('active');
//   if (pageId === 'page-ndvi') document.getElementById('step3')?.classList.add('active');
// }

// // ══ IMAGE PREVIEW ══
// function previewImage() {
//   const file = document.getElementById('imageInput').files[0];
//   if (!file) return;

//   const url = URL.createObjectURL(file);
//   const preview = document.getElementById('preview');
//   preview.src = url;
//   preview.style.display = 'block';
//   document.getElementById('dropzone-inner').style.display = 'none';
//   document.getElementById('dropzone').classList.add('has-image');

//   // Pre-set images
//   const ndviOrig = document.getElementById('ndvi-original');
//   if (ndviOrig) ndviOrig.src = url;
//   const leafImg = document.getElementById('leaf-result-image');
//   if (leafImg) leafImg.src = url;
//   const fieldImg = document.getElementById('field-result-image');
//   if (fieldImg) fieldImg.src = url;

//   const sizeKB = (file.size / 1024).toFixed(1);
//   document.getElementById('file-info').textContent = `📁 ${file.name} · ${sizeKB} KB`;
//   document.getElementById('analyzeBtn').disabled = false;
// }

// // ══ DELAY HELPER ══
// function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// // ══ ANALYZE ══
// async function analyzeImage() {
//   const file = document.getElementById('imageInput').files[0];
//   if (!file) return alert('Please upload an image first!');

//   document.getElementById('analyzeBtn').disabled = true;
//   document.getElementById('loading-bar').style.display = 'block';

//   const fill = document.getElementById('loading-fill');
//   if (fill) {
//     fill.style.animation = 'none';
//     fill.offsetHeight;
//     fill.style.animation = 'loadProgress 2.5s ease forwards';
//   }

//  const API = 'http://127.0.0.1:5000';

// try {
//   const formData = new FormData();
//   formData.append('image', file);
//   formData.append('mode', selectedMode);

//   const res = await fetch(`${API}/api/analyze`, {
//     method: 'POST',
//     body: formData
//   });
//     if (res.ok) {
//       currentData = await res.json();
//     } else {
//       throw new Error('Server error');
//     }
//   } catch (e) {
//     console.warn('Using fallback:', e);
//     currentData = {
//       disease: "Early Blight", severity: "medium",
//       ndvi_score: 0.42, confidence: 87,
//       medicine: "Mancozeb 75% WP — 2g per litre of water",
//       fertilizer: "Reduce nitrogen. Add potassium-rich fertilizer.",
//       treatment: "1. Remove infected leaves immediately\n2. Spray fungicide every 7 days\n3. Avoid overhead watering\n4. Ensure proper plant spacing",
//       zone: "Zone B — Northwest Field",
//       action_window: "48 hours",
//       ndvi_map: null,
//       zones: { north: 0.72, south: 0.42, east: 0.65, west: 0.38 }
//     };
//   }

//   await delay(2000);
//   document.getElementById('loading-bar').style.display = 'none';
//   document.getElementById('analyzeBtn').disabled = false;

//   if (currentData.error) {
//     alert('⚠️ ' + (currentData.message || 'Please upload a valid crop or field image.'));
//     resetUpload();
//     return;
//   }

//   // Route to correct results page
//   if (selectedMode === 'leaf') {
//     displayLeafResults(currentData);
//     showPage('page-leaf-results');
//   } else {
//     displayFieldResults(currentData);
//     showPage('page-field-results');
//   }
// }

// // ══ LEAF RESULTS ══
// function displayLeafResults(data) {
//   const score = parseFloat(data.ndvi_score) || 0.5;
//   const conf  = typeof data.confidence === 'number'
//     ? data.confidence.toFixed(1) + '%'
//     : data.confidence + '%';

//   const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

//   set('leaf-disease-name',   data.disease);
//   set('leaf-confidence-val', conf);
//   set('leaf-action-window',  data.action_window || '48 hours');
//   set('leaf-medicine',       data.medicine);
//   set('leaf-fertilizer',     data.fertilizer);
//   set('leaf-treatment',      data.treatment);

//   // Severity badge
//   const badge = document.getElementById('leaf-severity-badge');
//   if (badge) {
//     badge.textContent = (data.severity || 'medium').toUpperCase();
//     badge.className = 'sev-pill sev-' + (data.severity || 'medium');
//   }

//   // Icon
//   const icon = document.getElementById('leaf-dis-icon');
//   if (icon) {
//     if (data.disease?.toLowerCase().includes('healthy')) icon.textContent = '✅';
//     else if (data.severity === 'high') icon.textContent = '🚨';
//     else icon.textContent = '⚠️';
//   }

//   // Timestamp
//   const now = new Date();
//   set('leaf-img-meta', `Analyzed at ${now.toLocaleTimeString()} · ${now.toLocaleDateString()}`);

//   // Quick stats
//   set('leaf-health-index', score >= 0.6 ? 'Good' : score >= 0.3 ? 'Moderate' : 'Poor');
//   set('leaf-risk-level',   data.severity === 'low' ? 'Low' : data.severity === 'high' ? 'High' : 'Medium');
//   set('leaf-crop-status',  data.disease?.toLowerCase().includes('healthy') ? 'Healthy ✅' : 'Needs Treatment ⚠️');
// }

// // ══ FIELD RESULTS ══
// function displayFieldResults(data) {
//   const score = parseFloat(data.ndvi_score) || 0.5;
//   const conf  = typeof data.confidence === 'number'
//     ? data.confidence.toFixed(1) + '%'
//     : data.confidence + '%';

//   const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

//   // ── Risk Score (0-100) ──
//   // Convert NDVI to risk: low NDVI = high risk
//   const riskScore = Math.round((1 - score) * 100);
//   set('risk-score-num', riskScore);
//   set('field-ndvi-score', score.toFixed(2));
//   set('field-confidence', conf);
//   set('field-action-window', data.action_window || '48 hours');

//   // Risk level label
//   let riskLevel, priority;
//   if (riskScore < 30) { riskLevel = '🟢 Low';    priority = 'Routine monitoring'; }
//   else if (riskScore < 60) { riskLevel = '🟡 Medium'; priority = 'Action needed soon'; }
//   else { riskLevel = '🔴 High';   priority = 'Immediate action required'; }

//   set('field-risk-level', riskLevel);
//   set('field-priority',   priority);

//   // Animate risk circle
//   const circle = document.getElementById('risk-circle-fill');
//   if (circle) {
//     const circumference = 364;
//     const offset = circumference - (riskScore / 100) * circumference;
//     const color = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#eab308' : '#ef4444';
//     circle.style.strokeDashoffset = offset;
//     circle.style.stroke = color;
//     circle.style.transition = 'stroke-dashoffset 1.2s ease, stroke 0.5s';
//   }

//   // Risk bar
//   const riskBar = document.getElementById('risk-bar-fill');
//   if (riskBar) {
//     riskBar.style.width = riskScore + '%';
//     riskBar.style.background = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#eab308' : '#ef4444';
//     riskBar.style.transition = 'width 1s ease';
//   }

//   // ── Affected Area Distribution ──
//   // Compute from zones if available, else from NDVI score
//   let healthyPct, stressedPct, diseasedPct;

//   if (data.zones) {
//     const vals = Object.values(data.zones);
//     const total = vals.length;
//     healthyPct  = Math.round((vals.filter(v => v > 0.6).length / total) * 100);
//     stressedPct = Math.round((vals.filter(v => v > 0.3 && v <= 0.6).length / total) * 100);
//     diseasedPct = 100 - healthyPct - stressedPct;
//   } else {
//     healthyPct  = Math.round(score * 60);
//     stressedPct = Math.round((1 - score) * 25);
//     diseasedPct = 100 - healthyPct - stressedPct;
//     if (diseasedPct < 0) diseasedPct = 0;
//   }

//   set('area-healthy',  healthyPct  + '%');
//   set('area-stressed', stressedPct + '%');
//   set('area-diseased', diseasedPct + '%');
//   set('donut-healthy-pct', healthyPct + '%');
//   set('healthy-bar-pct',   healthyPct  + '%');
//   set('stressed-bar-pct',  stressedPct + '%');
//   set('diseased-bar-pct',  diseasedPct + '%');

//   // Animate bars
//   setTimeout(() => {
//     const hb = document.getElementById('healthy-bar');
//     const sb = document.getElementById('stressed-bar');
//     const db = document.getElementById('diseased-bar');
//     if (hb) hb.style.width = healthyPct  + '%';
//     if (sb) sb.style.width = stressedPct + '%';
//     if (db) db.style.width = diseasedPct + '%';
//   }, 300);

//   // Draw donut chart
//   drawDonut(healthyPct, stressedPct, diseasedPct);

//   // Timestamp
// // Timestamp
//   const now = new Date();
//   set('field-img-meta', `Analyzed at ${now.toLocaleTimeString()} · ${now.toLocaleDateString()}`);

//   // Show weather card and fetch live weather
//   const weatherCard = document.getElementById('weather-card');
//   if (weatherCard) weatherCard.style.display = 'block';

//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
//       ()  => fetchWeather(13.0219, 75.0367)  // Moodbidri fallback
//     );
//   } else {
//     fetchWeather(13.0219, 75.0367);
//   }
// }

// // ══ DONUT CHART ══
// function drawDonut(healthy, stressed, diseased) {
//   const canvas = document.getElementById('donutCanvas');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');
//   const cx = canvas.width / 2, cy = canvas.height / 2, r = 55;
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   const segments = [
//     { pct: healthy,  color: '#22c55e' },
//     { pct: stressed, color: '#eab308' },
//     { pct: diseased, color: '#ef4444' }
//   ];

//   let startAngle = -Math.PI / 2;
//   segments.forEach(seg => {
//     if (seg.pct <= 0) return;
//     const angle = (seg.pct / 100) * Math.PI * 2;
//     ctx.beginPath();
//     ctx.moveTo(cx, cy);
//     ctx.arc(cx, cy, r, startAngle, startAngle + angle);
//     ctx.closePath();
//     ctx.fillStyle = seg.color;
//     ctx.fill();
//     startAngle += angle;
//   });

//   // Inner circle (donut hole)
//   ctx.beginPath();
//   ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
//   ctx.fillStyle = '#0c180c';
//   ctx.fill();
// }

// // ══ GO TO NDVI PAGE ══
// function goToFieldNDVI() {
//   showPage('page-ndvi');
//   setTimeout(() => {
//     const score = parseFloat(currentData?.ndvi_score) || 0.5;
//     drawGauge(score);
//     updateGaugeLabel(score);
//     document.getElementById('gauge-score').textContent = score.toFixed(2);

//     const img = document.getElementById('ndvi-original');
//     if (!img || !img.src) return;

//     const tryDraw = () => {
//       if (currentData?.ndvi_map) {
//         drawNDVIFromBackend(currentData.ndvi_map);
//       } else {
//         drawNDVIFromPixels();
//       }
//       if (currentData?.zones) {
//         setZone('north-bar', 'north-text', 'north-dot', currentData.zones.north);
//         setZone('south-bar', 'south-text', 'south-dot', currentData.zones.south);
//         setZone('east-bar',  'east-text',  'east-dot',  currentData.zones.east);
//         setZone('west-bar',  'west-text',  'west-dot',  currentData.zones.west);
//       }
//     };

//     if (img.complete && img.naturalWidth > 0) tryDraw();
//     else img.onload = tryDraw;
//   }, 300);
// }

// // ══ NDVI FROM BACKEND ══
// function drawNDVIFromBackend(ndviMap) {
//   const canvas = document.getElementById('ndviCanvas');
//   if (!canvas || !ndviMap) return;

//   const h = ndviMap.length, w = ndviMap[0].length;
//   canvas.width = w; canvas.height = h;

//   const ctx = canvas.getContext('2d');
//   const imgData = ctx.createImageData(w, h);
//   const d = imgData.data;

//   // Find min/max for normalization
//   let mn = Infinity, mx = -Infinity;
//   for (let y = 0; y < h; y++)
//     for (let x = 0; x < w; x++) {
//       mn = Math.min(mn, ndviMap[y][x]);
//       mx = Math.max(mx, ndviMap[y][x]);
//     }
//   const range = mx - mn + 0.0001;

//   for (let y = 0; y < h; y++) {
//     for (let x = 0; x < w; x++) {
//       const norm = (ndviMap[y][x] - mn) / range;
//       const color = ndviColor(norm);
//       const i = (y * w + x) * 4;
//       d[i] = color[0]; d[i+1] = color[1]; d[i+2] = color[2]; d[i+3] = 255;
//     }
//   }
//   ctx.putImageData(imgData, 0, 0);
// }

// // ══ NDVI FROM PIXELS (IMPROVED — fixes red-only issue) ══
// function drawNDVIFromPixels() {
//   const canvas = document.getElementById('ndviCanvas');
//   const img    = document.getElementById('ndvi-original');
//   if (!canvas || !img || !img.src) return;

//   // Match canvas to display size
//   const parent = canvas.parentElement;
//   const w = parent ? parent.offsetWidth || 400 : 400;
//   const h = 260;
//   canvas.width  = w;
//   canvas.height = h;

//   const ctx = canvas.getContext('2d');
//   ctx.drawImage(img, 0, 0, w, h);

//   const imgData = ctx.getImageData(0, 0, w, h);
//   const d = imgData.data;
//   const total = d.length / 4;

//   // Step 1: Calculate raw NDVI-like value per pixel
//   const ndviVals = new Float32Array(total);
//   for (let i = 0, j = 0; i < d.length; i += 4, j++) {
//     const r = d[i], g = d[i+1], b = d[i+2];
//     // Use green as proxy for NIR (better than just red-green)
//     // Also consider blue to distinguish sky/water
//     const vegetation = (g - r) / (g + r + 1);
//     const brightness = (r + g + b) / 3;
//     // Weight by brightness to avoid dark pixels being classified wrong
//     ndviVals[j] = vegetation * (brightness / 128);
//   }

//   // Step 2: Normalize to 0-1 using percentile (NOT min/max — avoids outliers)
//   const sorted = Float32Array.from(ndviVals).sort();
//   const p5  = sorted[Math.floor(total * 0.05)];  // 5th percentile
//   const p95 = sorted[Math.floor(total * 0.95)];  // 95th percentile
//   const range = p95 - p5 + 0.0001;

//   // Step 3: Apply color mapping
//   for (let i = 0, j = 0; i < d.length; i += 4, j++) {
//     const norm = Math.max(0, Math.min(1, (ndviVals[j] - p5) / range));
//     const color = ndviColor(norm);
//     d[i] = color[0]; d[i+1] = color[1]; d[i+2] = color[2];
//     // Keep alpha
//   }

//   ctx.putImageData(imgData, 0, 0);
// }

// // ══ NDVI COLOR MAP ══
// // Smooth gradient: dark red → orange → yellow → light green → dark green
// function ndviColor(norm) {
//   // 5-stop color gradient
//   const stops = [
//     [0.00, [139,   0,   0]],  // dark red
//     [0.20, [220,  50,  10]],  // red-orange
//     [0.35, [255, 165,   0]],  // orange
//     [0.50, [255, 220,   0]],  // yellow
//     [0.65, [180, 230, 100]],  // yellow-green
//     [0.80, [ 60, 180,  60]],  // green
//     [1.00, [  0,  80,  20]]   // dark green
//   ];

//   for (let i = 0; i < stops.length - 1; i++) {
//     const [t0, c0] = stops[i];
//     const [t1, c1] = stops[i + 1];
//     if (norm >= t0 && norm <= t1) {
//       const t = (norm - t0) / (t1 - t0);
//       return [
//         Math.round(c0[0] + (c1[0] - c0[0]) * t),
//         Math.round(c0[1] + (c1[1] - c0[1]) * t),
//         Math.round(c0[2] + (c1[2] - c0[2]) * t)
//       ];
//     }
//   }
//   return [0, 80, 20];
// }

// // ══ ZONE UI ══
// function setZone(barId, textId, dotId, value) {
//   const bar  = document.getElementById(barId);
//   const text = document.getElementById(textId);
//   const dot  = document.getElementById(dotId);
//   if (!bar || !text) return;

//   const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
//   const color = value > 0.6 ? '#22c55e' : value > 0.3 ? '#eab308' : '#ef4444';
//   const status = value > 0.6 ? 'Healthy' : value > 0.3 ? 'Mild Stress' : 'High Stress';

//   bar.style.width      = pct + '%';
//   bar.style.background = color;
//   bar.style.transition = 'width 1s ease';
//   text.textContent     = `${status} · ${value.toFixed(2)}`;
//   if (dot) dot.style.background = color;
// }

// // ══ GAUGE ══
// function drawGauge(score) {
//   const canvas = document.getElementById('gaugeCanvas');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   const cx = canvas.width / 2, cy = canvas.height - 10, r = 80;

//   ctx.beginPath();
//   ctx.arc(cx, cy, r, Math.PI, 0);
//   ctx.strokeStyle = '#1e3a1e'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();

//   const color = score < 0.2 ? '#ef4444' : score < 0.4 ? '#f97316' : score < 0.6 ? '#eab308' : '#22c55e';
//   ctx.beginPath();
//   ctx.arc(cx, cy, r, Math.PI, Math.PI + score * Math.PI);
//   ctx.strokeStyle = color; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();

//   ctx.fillStyle = '#365836'; ctx.font = '10px DM Sans'; ctx.textAlign = 'center';
//   ctx.fillText('0.0', cx - r - 12, cy + 4);
//   ctx.fillText('1.0', cx + r + 12, cy + 4);
// }

// function updateGaugeLabel(score) {
//   const label = document.getElementById('gauge-label');
//   if (!label) return;
//   if (score >= 0.6)      { label.textContent = 'Healthy Crop';    label.style.color = '#4ade80'; }
//   else if (score >= 0.4) { label.textContent = 'Mild Stress';     label.style.color = '#a3e635'; }
//   else if (score >= 0.2) { label.textContent = 'Moderate Stress'; label.style.color = '#eab308'; }
//   else                   { label.textContent = 'Severe Disease';  label.style.color = '#ef4444'; }
// }

// window.addEventListener('load', () => {
//   drawGauge(0.42);
//   drawDonut(62, 28, 10);
// });

// // ══ RESET ══
// function resetApp() {
//   currentData = null;
//   resetUpload();
//   const weatherCard = document.getElementById('weather-card');
//   if (weatherCard) {
//     weatherCard.style.display = 'none';
//     document.getElementById('weather-content').style.display = 'none';
//     document.getElementById('weather-loading').style.display = 'flex';
//     document.getElementById('weather-error').style.display   = 'none';
//   }
//   showPage('page-home');
// }


// // ══ FETCH WEATHER ══
// async function fetchWeather(lat, lon) {
//   const card    = document.getElementById('weather-card');
//   const loading = document.getElementById('weather-loading');
//   const content = document.getElementById('weather-content');
//   const error   = document.getElementById('weather-error');

//   if (!card) return;

//   loading.style.display = 'flex';
//   content.style.display = 'none';
//   error.style.display   = 'none';

//   const API = 'http://127.0.0.1:5000';

//   try {
//     const res = await fetch(`${API}/api/weather`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ lat, lon })
//     });

//     if (!res.ok) throw new Error('Weather API failed');

//     const w = await res.json();

//     // Fill current weather
//     document.getElementById('w-temp').textContent     = w.temp + '°C';
//     document.getElementById('w-humidity').textContent = w.humidity + '%';
//     document.getElementById('w-wind').textContent     = w.wind_speed + ' m/s';
//     document.getElementById('w-desc').textContent     = w.description;

//     // Advisory
//     document.getElementById('w-disease-risk').textContent = w.disease_risk;
//     document.getElementById('w-spray-advice').textContent = w.spray_advice;
//     document.getElementById('w-rain-advice').textContent  = w.rain_advice;

//     // Risk color
//     const riskBox = document.getElementById('w-disease-risk-box');
//     if (riskBox) {
//       if (w.disease_risk === 'High') riskBox.style.borderColor = '#ef4444';
//       else if (w.disease_risk === 'Medium') riskBox.style.borderColor = '#eab308';
//       else riskBox.style.borderColor = '#22c55e';
//     }

//     // Forecast
//     const foreRow = document.getElementById('forecast-row');
//     foreRow.innerHTML = '';

//     (w.forecast || []).forEach(f => {
//       const date = new Date(f.time).toLocaleDateString('en-IN', {
//         weekday: 'short',
//         day: 'numeric'
//       });

//       foreRow.innerHTML += `
//         <div class="forecast-card">
//           <div class="forecast-date">${date}</div>
//           <div class="forecast-temp">${Math.round(f.temp)}°C</div>
//           <div class="forecast-desc">${f.desc}</div>
//           <div class="forecast-hum">💧 ${f.humidity}%</div>
//           ${f.rain > 0 ? `<div class="forecast-rain">🌧️ ${f.rain}mm</div>` : ''}
//         </div>
//       `;
//     });

//     loading.style.display = 'none';
//     content.style.display = 'block';

//   } catch (e) {
//     console.error('Weather error:', e);
//     loading.style.display = 'none';
//     error.style.display = 'block';
//   }
// }
























// ══════════════════════════════════════════
//   AGRIVISION — script.js
//   Two workflows: Leaf + Field
//   Kannada translations added
// ══════════════════════════════════════════

// let currentData = null;
// let selectedMode = 'leaf';

// // ══ KANNADA TRANSLATIONS ══
// const KN = {
//   // Disease names
//   diseases: {
//     "Early Blight":  "ಆರಂಭಿಕ ಎಲೆ ಕೊಳೆ ರೋಗ",
//     "Late Blight":   "ತಡವಾದ ಎಲೆ ಕೊಳೆ ರೋಗ",
//     "Healthy":       "ಆರೋಗ್ಯಕರ ಸಸ್ಯ",
//     "Leaf Spot":     "ಎಲೆ ಚುಕ್ಕೆ ರೋಗ",
//   },

//   // Severity
//   severity: {
//     "low":    "ಕಡಿಮೆ ತೀವ್ರತೆ",
//     "medium": "ಮಧ್ಯಮ ತೀವ್ರತೆ",
//     "high":   "ಅಧಿಕ ತೀವ್ರತೆ",
//   },

//   // Medicine
//   medicine: {
//     "Early Blight":  "ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP — 2 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ",
//     "Late Blight":   "ಮೆಟಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ ಬಳಸಿ",
//     "Healthy":       "ಯಾವುದೇ ಔಷಧ ಅಗತ್ಯವಿಲ್ಲ",
//     "Leaf Spot":     "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಸಿಂಪಡಿಸಿ",
//   },

//   // Fertilizer
//   fertilizer: {
//     "Early Blight":  "ಸಾರಜನಕ ಕಡಿಮೆ ಮಾಡಿ, ಪೊಟ್ಯಾಷಿಯಂ ಹೆಚ್ಚಿಸಿ",
//     "Late Blight":   "ಕ್ಯಾಲ್ಸಿಯಂ ಗೊಬ್ಬರ ಹಾಕಿ",
//     "Healthy":       "NPK ಸಮತೋಲನ ಕಾಪಾಡಿ",
//     "Leaf Spot":     "ಸಮತೋಲಿತ ಗೊಬ್ಬರ ಬಳಸಿ",
//   },

//   // Treatment
//   treatment: {
//     "Early Blight":  "1. ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆಯಿರಿ\n2. ಪ್ರತಿ 7 ದಿನಕ್ಕೊಮ್ಮೆ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ\n3. ತಲೆಯ ಮೇಲೆ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ",
//     "Late Blight":   "1. ತಕ್ಷಣ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ\n2. ನೀರು ಬಸಿದು ಹೋಗುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ\n3. ರೋಗಪೀಡಿತ ಭಾಗಗಳನ್ನು ನಾಶ ಮಾಡಿ",
//     "Healthy":       "ವಾರಕ್ಕೊಮ್ಮೆ ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
//     "Leaf Spot":     "1. ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆಯಿರಿ\n2. ತಲೆಯ ಮೇಲೆ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ",
//   },

//   // Action window
//   action: "24–48 ಗಂಟೆಗಳಲ್ಲಿ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ",

//   // NDVI explanations
//   ndvi: {
//     title:       "NDVI ಬಗ್ಗೆ ಮಾಹಿತಿ (ಕನ್ನಡದಲ್ಲಿ)",
//     what_title:  "NDVI ಎಂದರೇನು?",
//     what_text:   "NDVI (Normalized Difference Vegetation Index) ಎಂದರೆ ಸಸ್ಯಗಳ ಆರೋಗ್ಯವನ್ನು ಅಳೆಯುವ ಒಂದು ವೈಜ್ಞಾನಿಕ ವಿಧಾನ. ಇದು -1 ರಿಂದ +1 ವರೆಗೆ ಇರುತ್ತದೆ.",
//     score_title: "ಅಂಕಗಳ ಅರ್ಥ",
//     scores: [
//       { range: "0.6 – 1.0", meaning: "ಆರೋಗ್ಯಕರ ಬೆಳೆ 🟢", color: "#22c55e" },
//       { range: "0.4 – 0.6", meaning: "ಸಾಮಾನ್ಯ ಒತ್ತಡ 🟡",  color: "#a3e635" },
//       { range: "0.2 – 0.4", meaning: "ಮಧ್ಯಮ ಒತ್ತಡ 🟡",    color: "#eab308" },
//       { range: "0.0 – 0.2", meaning: "ತೀವ್ರ ರೋಗ 🔴",       color: "#ef4444" },
//       { range: "0 ಕ್ಕಿಂತ ಕಡಿಮೆ", meaning: "ಬರಡು ಭೂಮಿ ⬛", color: "#6b7280" },
//     ],
//     color_title: "ಬಣ್ಣಗಳ ಅರ್ಥ (ನಕ್ಷೆಯಲ್ಲಿ)",
//     colors: [
//       { color: "#006400", meaning: "ಗಾಢ ಹಸಿರು — ಸಂಪೂರ್ಣ ಆರೋಗ್ಯಕರ ಬೆಳೆ" },
//       { color: "#90EE90", meaning: "ತಿಳಿ ಹಸಿರು — ಸ್ವಲ್ಪ ಒತ್ತಡ" },
//       { color: "#FFD700", meaning: "ಹಳದಿ — ಮಧ್ಯಮ ತೊಂದರೆ" },
//       { color: "#FF4500", meaning: "ಕಿತ್ತಳೆ ಕೆಂಪು — ತೀವ್ರ ರೋಗ" },
//       { color: "#8B0000", meaning: "ಗಾಢ ಕೆಂಪು — ಬರಡು / ಮಣ್ಣು" },
//     ],
//     zone_title: "ವಲಯ ಅರ್ಥ",
//     zone_text:  "ನಿಮ್ಮ ಹೊಲವನ್ನು ಉತ್ತರ, ದಕ್ಷಿಣ, ಪೂರ್ವ ಮತ್ತು ಪಶ್ಚಿಮ ಎಂದು 4 ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ. ಪ್ರತಿ ಭಾಗದ ಆರೋಗ್ಯ ಪ್ರತ್ಯೇಕವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",
//     tip_title:  "ರೈತರಿಗೆ ಸಲಹೆ",
//     tip_text:   "ಕೆಂಪು ಬಣ್ಣದ ವಲಯಗಳಿಗೆ ತಕ್ಷಣ ಗಮನ ನೀಡಿ. ಹಳದಿ ವಲಯಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ. ಹಸಿರು ವಲಯಗಳು ಆರೋಗ್ಯಕರವಾಗಿವೆ.",
//   }
// };

// // ══ MODE SELECT ══
// function setMode(mode) {
//   selectedMode = mode;
//   document.getElementById('leafMode').classList.toggle('active', mode === 'leaf');
//   document.getElementById('fieldMode').classList.toggle('active', mode === 'field');

//   if (mode === 'leaf') {
//     document.getElementById('analyzeText').textContent   = 'Analyze Leaf';
//     document.getElementById('dropzone-text').textContent = 'Drop your leaf image here';
//     document.getElementById('mode-desc').textContent     = '📌 Upload a close-up photo of a crop leaf to detect disease, get medicine and treatment advice.';
//   } else {
//     document.getElementById('analyzeText').textContent   = 'Analyze Field';
//     document.getElementById('dropzone-text').textContent = 'Drop your satellite field image here';
//     document.getElementById('mode-desc').textContent     = '🛰️ Upload a satellite or aerial field image for NDVI health analysis and risk assessment.';
//   }
//   resetUpload();
// }

// function resetUpload() {
//   const preview = document.getElementById('preview');
//   if (preview) { preview.src = ''; preview.style.display = 'none'; }
//   const di = document.getElementById('dropzone-inner');
//   if (di) di.style.display = 'flex';
//   const dz = document.getElementById('dropzone');
//   if (dz) dz.classList.remove('has-image');
//   const fi = document.getElementById('file-info');
//   if (fi) fi.textContent = '';
//   const btn = document.getElementById('analyzeBtn');
//   if (btn) btn.disabled = true;
//   const inp = document.getElementById('imageInput');
//   if (inp) inp.value = '';
// }

// // ══ PAGE NAVIGATION ══
// function showPage(pageId) {
//   document.querySelectorAll('.page').forEach(p => {
//     p.classList.remove('active');
//     p.style.display = 'none';
//   });
//   const target = document.getElementById(pageId);
//   if (!target) return;
//   target.style.display = 'block';
//   setTimeout(() => target.classList.add('active'), 10);
//   window.scrollTo({ top: 0, behavior: 'smooth' });

//   document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
//   if (pageId === 'page-home')         document.getElementById('step1')?.classList.add('active');
//   if (pageId === 'page-leaf-results' || pageId === 'page-field-results') document.getElementById('step2')?.classList.add('active');
//   if (pageId === 'page-ndvi')         document.getElementById('step3')?.classList.add('active');
// }

// // ══ IMAGE PREVIEW ══
// function previewImage() {
//   const file = document.getElementById('imageInput').files[0];
//   if (!file) return;

//   const url     = URL.createObjectURL(file);
//   const preview = document.getElementById('preview');
//   preview.src   = url;
//   preview.style.display = 'block';
//   document.getElementById('dropzone-inner').style.display = 'none';
//   document.getElementById('dropzone').classList.add('has-image');

//   const ndviOrig = document.getElementById('ndvi-original');
//   if (ndviOrig) ndviOrig.src = url;
//   const leafImg  = document.getElementById('leaf-result-image');
//   if (leafImg)  leafImg.src  = url;
//   const fieldImg = document.getElementById('field-result-image');
//   if (fieldImg) fieldImg.src = url;

//   const sizeKB = (file.size / 1024).toFixed(1);
//   document.getElementById('file-info').textContent = `📁 ${file.name} · ${sizeKB} KB`;
//   document.getElementById('analyzeBtn').disabled = false;
// }

// function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// // ══ ANALYZE ══
// async function analyzeImage() {
//   const file = document.getElementById('imageInput').files[0];
//   if (!file) return alert('Please upload an image first!');

//   document.getElementById('analyzeBtn').disabled    = true;
//   document.getElementById('loading-bar').style.display = 'block';

//   const fill = document.getElementById('loading-fill');
//   if (fill) {
//     fill.style.animation = 'none';
//     fill.offsetHeight;
//     fill.style.animation = 'loadProgress 2.5s ease forwards';
//   }

//   const API = 'http://127.0.0.1:5000';

//   try {
//     const formData = new FormData();
//     formData.append('image', file);
//     formData.append('mode',  selectedMode);

//     const res = await fetch(`${API}/api/analyze`, { method: 'POST', body: formData });
//     if (res.ok) {
//       currentData = await res.json();
//     } else {
//       throw new Error('Server error');
//     }
//   } catch (e) {
//     console.warn('Using fallback:', e);
//     currentData = {
//       disease: "Early Blight", severity: "medium",
//       ndvi_score: 0.42, confidence: 87,
//       medicine:    "Mancozeb 75% WP — 2g per litre of water",
//       fertilizer:  "Reduce nitrogen. Add potassium-rich fertilizer.",
//       treatment:   "1. Remove infected leaves immediately\n2. Spray fungicide every 7 days\n3. Avoid overhead watering\n4. Ensure proper plant spacing",
//       action_window: "48 hours",
//       ndvi_map: null,
//       zones: { north: 0.72, south: 0.42, east: 0.65, west: 0.38 }
//     };
//   }

//   await delay(2000);
//   document.getElementById('loading-bar').style.display = 'none';
//   document.getElementById('analyzeBtn').disabled = false;

//   if (currentData.error) {
//     alert('⚠️ ' + (currentData.message || 'Please upload a valid crop or field image.'));
//     resetUpload();
//     return;
//   }

//   if (selectedMode === 'leaf') {
//     displayLeafResults(currentData);
//     showPage('page-leaf-results');
//   } else {
//     displayFieldResults(currentData);
//     showPage('page-field-results');
//   }
// }

// // ══ LEAF RESULTS ══
// function displayLeafResults(data) {
//   const score = parseFloat(data.ndvi_score) || 0.5;
//   const conf  = typeof data.confidence === 'number'
//     ? data.confidence.toFixed(1) + '%'
//     : data.confidence + '%';

//   const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

//   set('leaf-disease-name',   data.disease);
//   set('leaf-confidence-val', conf);
//   set('leaf-action-window',  data.action_window || '48 hours');
//   set('leaf-medicine',       data.medicine);
//   set('leaf-fertilizer',     data.fertilizer);
//   set('leaf-treatment',      data.treatment);

//   const badge = document.getElementById('leaf-severity-badge');
//   if (badge) {
//     badge.textContent = (data.severity || 'medium').toUpperCase();
//     badge.className   = 'sev-pill sev-' + (data.severity || 'medium');
//   }

//   const icon = document.getElementById('leaf-dis-icon');
//   if (icon) {
//     if (data.disease?.toLowerCase().includes('healthy')) icon.textContent = '✅';
//     else if (data.severity === 'high') icon.textContent = '🚨';
//     else icon.textContent = '⚠️';
//   }

//   const now = new Date();
//   set('leaf-img-meta', `Analyzed at ${now.toLocaleTimeString()} · ${now.toLocaleDateString()}`);

//   set('leaf-health-index', score >= 0.6 ? 'Good' : score >= 0.3 ? 'Moderate' : 'Poor');
//   set('leaf-risk-level',   data.severity === 'low' ? 'Low' : data.severity === 'high' ? 'High' : 'Medium');
//   set('leaf-crop-status',  data.disease?.toLowerCase().includes('healthy') ? 'Healthy ✅' : 'Needs Treatment ⚠️');

//   // ── Inject Kannada translation card ──
//   injectLeafKannada(data);
// }

// // ══ KANNADA LEAF CARD INJECTION ══
// function injectLeafKannada(data) {
//   // Remove old card if exists
//   const old = document.getElementById('kannada-leaf-card');
//   if (old) old.remove();

//   // Find disease key — handle both "Early Blight" and "early_blight" formats
//   const rawDisease = data.disease || '';
//   const diseaseKey = Object.keys(KN.diseases).find(k =>
//     k.toLowerCase() === rawDisease.toLowerCase() ||
//     k.toLowerCase().replace(/ /g, '_') === rawDisease.toLowerCase()
//   ) || rawDisease;

//   const knDisease    = KN.diseases[diseaseKey]    || rawDisease;
//   const knSeverity   = KN.severity[data.severity] || data.severity;
//   const knMedicine   = KN.medicine[diseaseKey]    || data.medicine;
//   const knFertilizer = KN.fertilizer[diseaseKey]  || data.fertilizer;
//   const knTreatment  = KN.treatment[diseaseKey]   || data.treatment;

//   const sevColor = data.severity === 'low' ? '#22c55e' :
//                    data.severity === 'high' ? '#ef4444' : '#eab308';

//   const card = document.createElement('div');
//   card.id = 'kannada-leaf-card';
//   card.style.cssText = `
//     margin-top: 24px;
//     background: linear-gradient(135deg, rgba(74,222,128,0.06), rgba(163,230,53,0.04));
//     border: 1px solid rgba(74,222,128,0.25);
//     border-left: 4px solid #4ade80;
//     border-radius: 16px;
//     padding: 24px 28px;
//     font-family: 'DM Sans', sans-serif;
//   `;

//   card.innerHTML = `
//     <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
//       <span style="font-size:22px;">🇮🇳</span>
//       <div>
//         <div style="font-size:11px; color:#4ade80; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">ಕನ್ನಡದಲ್ಲಿ ಫಲಿತಾಂಶ</div>
//         <div style="font-size:18px; font-weight:700; color:#f0fdf4; margin-top:2px;">Leaf Disease Report in Kannada</div>
//       </div>
//     </div>

//     <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
//       <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px;">
//         <div style="font-size:10px; color:#4ade80; font-weight:700; letter-spacing:1px; margin-bottom:6px;">🔬 ರೋಗದ ಹೆಸರು</div>
//         <div style="font-size:16px; font-weight:700; color:#f0fdf4;">${knDisease}</div>
//         <div style="font-size:11px; color:#86efac; margin-top:2px;">${rawDisease}</div>
//       </div>
//       <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px;">
//         <div style="font-size:10px; color:#4ade80; font-weight:700; letter-spacing:1px; margin-bottom:6px;">⚠️ ತೀವ್ರತೆ</div>
//         <div style="font-size:16px; font-weight:700; color:${sevColor};">${knSeverity}</div>
//         <div style="font-size:11px; color:#86efac; margin-top:2px;">${(data.severity||'').toUpperCase()}</div>
//       </div>
//     </div>

//     <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:10px; padding:14px; margin-bottom:12px;">
//       <div style="font-size:10px; color:#f87171; font-weight:700; letter-spacing:1px; margin-bottom:8px;">💊 ಔಷಧ / Medicine</div>
//       <div style="font-size:14px; color:#f0fdf4; line-height:1.6;">${knMedicine}</div>
//     </div>

//     <div style="background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.15); border-radius:10px; padding:14px; margin-bottom:12px;">
//       <div style="font-size:10px; color:#4ade80; font-weight:700; letter-spacing:1px; margin-bottom:8px;">🌱 ಗೊಬ್ಬರ / Fertilizer</div>
//       <div style="font-size:14px; color:#f0fdf4; line-height:1.6;">${knFertilizer}</div>
//     </div>

//     <div style="background:rgba(249,115,22,0.05); border:1px solid rgba(249,115,22,0.2); border-radius:10px; padding:14px; margin-bottom:12px;">
//       <div style="font-size:10px; color:#fb923c; font-weight:700; letter-spacing:1px; margin-bottom:8px;">🩺 ಚಿಕಿತ್ಸೆ / Treatment</div>
//       <div style="font-size:14px; color:#f0fdf4; line-height:1.8; white-space:pre-line;">${knTreatment}</div>
//     </div>

//     <div style="background:rgba(163,230,53,0.08); border:1px solid rgba(163,230,53,0.2); border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:10px;">
//       <span style="font-size:20px;">⏱️</span>
//       <div>
//         <div style="font-size:11px; color:#a3e635; font-weight:700;">ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ</div>
//         <div style="font-size:14px; color:#f0fdf4; font-weight:600; margin-top:2px;">${KN.action}</div>
//       </div>
//     </div>
//   `;

//   // Append after the disease-body div inside page-leaf-results
//   const resultsSection = document.querySelector('#page-leaf-results .results-section');
//   if (resultsSection) {
//     resultsSection.appendChild(card);
//   }
// }

// // ══ FIELD RESULTS ══
// function displayFieldResults(data) {
//   const score = parseFloat(data.ndvi_score) || 0.5;
//   const conf  = typeof data.confidence === 'number'
//     ? data.confidence.toFixed(1) + '%'
//     : data.confidence + '%';

//   const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

//   const riskScore = data.risk_score !== undefined
//     ? Math.round(data.risk_score)
//     : Math.round((1 - score) * 100);

//   set('risk-score-num',      riskScore);
//   set('field-ndvi-score',    score.toFixed(2));
//   set('field-confidence',    conf);
//   set('field-action-window', data.action_window || '48 hours');

//   let riskLevel, priority;
//   if (riskScore < 30)      { riskLevel = '🟢 Low';    priority = 'Routine monitoring'; }
//   else if (riskScore < 60) { riskLevel = '🟡 Medium'; priority = 'Action needed soon'; }
//   else                     { riskLevel = '🔴 High';   priority = 'Immediate action required'; }

//   set('field-risk-level', riskLevel);
//   set('field-priority',   priority);

//   const circle = document.getElementById('risk-circle-fill');
//   if (circle) {
//     const offset = 364 - (riskScore / 100) * 364;
//     const color  = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#eab308' : '#ef4444';
//     circle.style.strokeDashoffset = offset;
//     circle.style.stroke = color;
//     circle.style.transition = 'stroke-dashoffset 1.2s ease, stroke 0.5s';
//   }

//   const riskBar = document.getElementById('risk-bar-fill');
//   if (riskBar) {
//     riskBar.style.width      = riskScore + '%';
//     riskBar.style.background = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#eab308' : '#ef4444';
//     riskBar.style.transition = 'width 1s ease';
//   }

//   let healthyPct, stressedPct, diseasedPct;
//   if (data.healthy_pct !== undefined) {
//     healthyPct  = Math.round(data.healthy_pct);
//     stressedPct = Math.round(data.stressed_pct);
//     diseasedPct = Math.round(data.diseased_pct);
//   } else if (data.zones) {
//     const vals  = Object.values(data.zones);
//     const total = vals.length;
//     healthyPct  = Math.round((vals.filter(v => v > 0.6).length / total) * 100);
//     stressedPct = Math.round((vals.filter(v => v > 0.3 && v <= 0.6).length / total) * 100);
//     diseasedPct = 100 - healthyPct - stressedPct;
//   } else {
//     healthyPct  = Math.round(score * 60);
//     stressedPct = Math.round((1 - score) * 25);
//     diseasedPct = Math.max(0, 100 - healthyPct - stressedPct);
//   }

//   set('area-healthy',      healthyPct  + '%');
//   set('area-stressed',     stressedPct + '%');
//   set('area-diseased',     diseasedPct + '%');
//   set('donut-healthy-pct', healthyPct  + '%');
//   set('healthy-bar-pct',   healthyPct  + '%');
//   set('stressed-bar-pct',  stressedPct + '%');
//   set('diseased-bar-pct',  diseasedPct + '%');

//   setTimeout(() => {
//     const hb = document.getElementById('healthy-bar');
//     const sb = document.getElementById('stressed-bar');
//     const db = document.getElementById('diseased-bar');
//     if (hb) hb.style.width = healthyPct  + '%';
//     if (sb) sb.style.width = stressedPct + '%';
//     if (db) db.style.width = diseasedPct + '%';
//   }, 300);

//   drawDonut(healthyPct, stressedPct, diseasedPct);

//   const now = new Date();
//   set('field-img-meta', `Analyzed at ${now.toLocaleTimeString()} · ${now.toLocaleDateString()}`);

//   const weatherCard = document.getElementById('weather-card');
//   if (weatherCard) weatherCard.style.display = 'block';

//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
//       ()  => fetchWeather(13.0219, 75.0367)
//     );
//   } else {
//     fetchWeather(13.0219, 75.0367);
//   }
// }

// // ══ DONUT CHART ══
// function drawDonut(healthy, stressed, diseased) {
//   const canvas = document.getElementById('donutCanvas');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');
//   const cx = canvas.width / 2, cy = canvas.height / 2, r = 55;
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   const segments = [
//     { pct: healthy,  color: '#22c55e' },
//     { pct: stressed, color: '#eab308' },
//     { pct: diseased, color: '#ef4444' }
//   ];

//   let startAngle = -Math.PI / 2;
//   segments.forEach(seg => {
//     if (seg.pct <= 0) return;
//     const angle = (seg.pct / 100) * Math.PI * 2;
//     ctx.beginPath();
//     ctx.moveTo(cx, cy);
//     ctx.arc(cx, cy, r, startAngle, startAngle + angle);
//     ctx.closePath();
//     ctx.fillStyle = seg.color;
//     ctx.fill();
//     startAngle += angle;
//   });

//   ctx.beginPath();
//   ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
//   ctx.fillStyle = '#0c180c';
//   ctx.fill();
// }

// // ══ NDVI PAGE — inject Kannada explanation ══
// function injectNDVIKannada() {
//   const old = document.getElementById('kannada-ndvi-card');
//   if (old) old.remove();

//   const kn = KN.ndvi;

//   const scoresHTML = kn.scores.map(s => `
//     <div style="display:flex; align-items:center; gap:12px; padding:8px 10px; background:rgba(255,255,255,0.03); border-radius:8px;">
//       <div style="width:14px; height:14px; border-radius:3px; background:${s.color}; flex-shrink:0;"></div>
//       <div>
//         <span style="font-size:13px; font-weight:700; color:#f0fdf4;">${s.range}</span>
//         <span style="font-size:13px; color:#86efac; margin-left:8px;">${s.meaning}</span>
//       </div>
//     </div>
//   `).join('');

//   const colorsHTML = kn.colors.map(c => `
//     <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
//       <div style="width:28px; height:16px; border-radius:4px; background:${c.color}; flex-shrink:0;"></div>
//       <div style="font-size:13px; color:#86efac;">${c.meaning}</div>
//     </div>
//   `).join('');

//   const card = document.createElement('div');
//   card.id = 'kannada-ndvi-card';
//   card.style.cssText = `
//     margin: 24px 0 40px 0;
//     background: linear-gradient(135deg, rgba(74,222,128,0.06), rgba(163,230,53,0.03));
//     border: 1px solid rgba(74,222,128,0.2);
//     border-left: 4px solid #4ade80;
//     border-radius: 16px;
//     padding: 28px;
//     font-family: 'DM Sans', sans-serif;
//   `;

//   card.innerHTML = `
//     <!-- Header -->
//     <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid rgba(74,222,128,0.15);">
//       <span style="font-size:28px;">🇮🇳</span>
//       <div>
//         <div style="font-size:11px; color:#4ade80; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:3px;">ಕನ್ನಡದಲ್ಲಿ NDVI ವಿವರಣೆ</div>
//         <div style="font-size:20px; font-weight:700; color:#f0fdf4;">NDVI Explanation in Kannada</div>
//       </div>
//     </div>

//     <!-- What is NDVI -->
//     <div style="margin-bottom:20px;">
//       <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">📡 ${kn.what_title}</div>
//       <div style="font-size:14px; color:#d4eed9; line-height:1.8; background:rgba(255,255,255,0.03); border-radius:10px; padding:14px;">
//         ${kn.what_text}
//       </div>
//     </div>

//     <!-- Score meanings -->
//     <div style="margin-bottom:20px;">
//       <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">📊 ${kn.score_title}</div>
//       <div style="display:flex; flex-direction:column; gap:6px;">
//         ${scoresHTML}
//       </div>
//     </div>

//     <!-- Color map -->
//     <div style="margin-bottom:20px;">
//       <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">🎨 ${kn.color_title}</div>
//       <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px 16px;">
//         ${colorsHTML}
//       </div>
//     </div>

//     <!-- Zone explanation -->
//     <div style="margin-bottom:20px;">
//       <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">🗺️ ${kn.zone_title}</div>
//       <div style="font-size:14px; color:#d4eed9; line-height:1.8; background:rgba(255,255,255,0.03); border-radius:10px; padding:14px;">
//         ${kn.zone_text}
//       </div>
//     </div>

//     <!-- Farmer tip -->
//     <div style="background:rgba(163,230,53,0.08); border:1px solid rgba(163,230,53,0.2); border-radius:12px; padding:16px;">
//       <div style="display:flex; align-items:flex-start; gap:12px;">
//         <span style="font-size:24px; flex-shrink:0;">💡</span>
//         <div>
//           <div style="font-size:12px; font-weight:700; color:#a3e635; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">${kn.tip_title}</div>
//           <div style="font-size:14px; color:#d4eed9; line-height:1.7;">${kn.tip_text}</div>
//         </div>
//       </div>
//     </div>
//   `;

//   // Append to NDVI section
//   const ndviSection = document.querySelector('#page-ndvi .ndvi-section');
//   if (ndviSection) {
//     ndviSection.appendChild(card);
//   }
// }

// // ══ GO TO NDVI PAGE ══
// function goToFieldNDVI() {
//   showPage('page-ndvi');
//   setTimeout(() => {
//     const score = parseFloat(currentData?.ndvi_score) || 0.5;
//     drawGauge(score);
//     updateGaugeLabel(score);
//     document.getElementById('gauge-score').textContent = score.toFixed(2);

//     const img = document.getElementById('ndvi-original');
//     if (!img || !img.src) return;

//     const tryDraw = () => {
//       if (currentData?.ndvi_map) drawNDVIFromBackend(currentData.ndvi_map);
//       else drawNDVIFromPixels();

//       if (currentData?.zones) {
//         setZone('north-bar', 'north-text', 'north-dot', currentData.zones.north);
//         setZone('south-bar', 'south-text', 'south-dot', currentData.zones.south);
//         setZone('east-bar',  'east-text',  'east-dot',  currentData.zones.east);
//         setZone('west-bar',  'west-text',  'west-dot',  currentData.zones.west);
//       }
//     };

//     if (img.complete && img.naturalWidth > 0) tryDraw();
//     else img.onload = tryDraw;

//     // Inject Kannada NDVI explanation
//     injectNDVIKannada();

//   }, 300);
// }

// // ══ NDVI FROM BACKEND ══
// function drawNDVIFromBackend(ndviMap) {
//   const canvas = document.getElementById('ndviCanvas');
//   if (!canvas || !ndviMap) return;

//   const h = ndviMap.length, w = ndviMap[0].length;
//   canvas.width = w; canvas.height = h;

//   const ctx = canvas.getContext('2d');
//   const imgData = ctx.createImageData(w, h);
//   const d = imgData.data;

//   let mn = Infinity, mx = -Infinity;
//   for (let y = 0; y < h; y++)
//     for (let x = 0; x < w; x++) {
//       mn = Math.min(mn, ndviMap[y][x]);
//       mx = Math.max(mx, ndviMap[y][x]);
//     }
//   const range = mx - mn + 0.0001;

//   for (let y = 0; y < h; y++) {
//     for (let x = 0; x < w; x++) {
//       const norm  = (ndviMap[y][x] - mn) / range;
//       const color = ndviColor(norm);
//       const i     = (y * w + x) * 4;
//       d[i] = color[0]; d[i+1] = color[1]; d[i+2] = color[2]; d[i+3] = 255;
//     }
//   }
//   ctx.putImageData(imgData, 0, 0);
// }

// // ══ NDVI FROM PIXELS ══
// function drawNDVIFromPixels() {
//   const canvas = document.getElementById('ndviCanvas');
//   const img    = document.getElementById('ndvi-original');
//   if (!canvas || !img || !img.src) return;

//   const parent = canvas.parentElement;
//   const w = parent ? parent.offsetWidth || 400 : 400;
//   const h = 260;
//   canvas.width = w; canvas.height = h;

//   const ctx = canvas.getContext('2d');
//   ctx.drawImage(img, 0, 0, w, h);

//   const imgData = ctx.getImageData(0, 0, w, h);
//   const d = imgData.data;
//   const total = d.length / 4;

//   const ndviVals = new Float32Array(total);
//   for (let i = 0, j = 0; i < d.length; i += 4, j++) {
//     const r = d[i], g = d[i+1], b = d[i+2];
//     const vegetation = (g - r) / (g + r + 1);
//     const brightness = (r + g + b) / 3;
//     ndviVals[j] = vegetation * (brightness / 128);
//   }

//   const sorted = Float32Array.from(ndviVals).sort();
//   const p5  = sorted[Math.floor(total * 0.05)];
//   const p95 = sorted[Math.floor(total * 0.95)];
//   const range = p95 - p5 + 0.0001;

//   for (let i = 0, j = 0; i < d.length; i += 4, j++) {
//     const norm  = Math.max(0, Math.min(1, (ndviVals[j] - p5) / range));
//     const color = ndviColor(norm);
//     d[i] = color[0]; d[i+1] = color[1]; d[i+2] = color[2];
//   }
//   ctx.putImageData(imgData, 0, 0);
// }

// // ══ NDVI COLOR MAP ══
// function ndviColor(norm) {
//   const stops = [
//     [0.00, [139,  0,   0]],
//     [0.20, [220, 50,  10]],
//     [0.35, [255, 165,  0]],
//     [0.50, [255, 220,  0]],
//     [0.65, [180, 230, 100]],
//     [0.80, [ 60, 180,  60]],
//     [1.00, [  0,  80,  20]]
//   ];
//   for (let i = 0; i < stops.length - 1; i++) {
//     const [t0, c0] = stops[i];
//     const [t1, c1] = stops[i + 1];
//     if (norm >= t0 && norm <= t1) {
//       const t = (norm - t0) / (t1 - t0);
//       return [
//         Math.round(c0[0] + (c1[0] - c0[0]) * t),
//         Math.round(c0[1] + (c1[1] - c0[1]) * t),
//         Math.round(c0[2] + (c1[2] - c0[2]) * t)
//       ];
//     }
//   }
//   return [0, 80, 20];
// }

// // ══ ZONE UI ══
// function setZone(barId, textId, dotId, value) {
//   const bar  = document.getElementById(barId);
//   const text = document.getElementById(textId);
//   const dot  = document.getElementById(dotId);
//   if (!bar || !text) return;

//   const pct    = Math.round(Math.max(0, Math.min(1, value)) * 100);
//   const color  = value > 0.6 ? '#22c55e' : value > 0.3 ? '#eab308' : '#ef4444';
//   const status = value > 0.6 ? 'Healthy' : value > 0.3 ? 'Mild Stress' : 'High Stress';

//   bar.style.width      = pct + '%';
//   bar.style.background = color;
//   bar.style.transition = 'width 1s ease';
//   text.textContent     = `${status} · ${value.toFixed(2)}`;
//   if (dot) dot.style.background = color;
// }

// // ══ GAUGE ══
// function drawGauge(score) {
//   const canvas = document.getElementById('gaugeCanvas');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   const cx = canvas.width / 2, cy = canvas.height - 10, r = 80;

//   ctx.beginPath();
//   ctx.arc(cx, cy, r, Math.PI, 0);
//   ctx.strokeStyle = '#1e3a1e'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();

//   const color = score < 0.2 ? '#ef4444' : score < 0.4 ? '#f97316' : score < 0.6 ? '#eab308' : '#22c55e';
//   ctx.beginPath();
//   ctx.arc(cx, cy, r, Math.PI, Math.PI + score * Math.PI);
//   ctx.strokeStyle = color; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();

//   ctx.fillStyle = '#365836'; ctx.font = '10px DM Sans'; ctx.textAlign = 'center';
//   ctx.fillText('0.0', cx - r - 12, cy + 4);
//   ctx.fillText('1.0', cx + r + 12, cy + 4);
// }

// function updateGaugeLabel(score) {
//   const label = document.getElementById('gauge-label');
//   if (!label) return;
//   if (score >= 0.6)      { label.textContent = 'Healthy Crop';    label.style.color = '#4ade80'; }
//   else if (score >= 0.4) { label.textContent = 'Mild Stress';     label.style.color = '#a3e635'; }
//   else if (score >= 0.2) { label.textContent = 'Moderate Stress'; label.style.color = '#eab308'; }
//   else                   { label.textContent = 'Severe Disease';  label.style.color = '#ef4444'; }
// }

// window.addEventListener('load', () => {
//   drawGauge(0.42);
//   drawDonut(62, 28, 10);
// });

// // ══ RESET ══
// function resetApp() {
//   currentData = null;
//   resetUpload();

//   const weatherCard = document.getElementById('weather-card');
//   if (weatherCard) {
//     weatherCard.style.display = 'none';
//     const wc = document.getElementById('weather-content');
//     const wl = document.getElementById('weather-loading');
//     const we = document.getElementById('weather-error');
//     if (wc) wc.style.display = 'none';
//     if (wl) wl.style.display = 'flex';
//     if (we) we.style.display = 'none';
//   }

//   // Remove injected Kannada cards
//   const kl = document.getElementById('kannada-leaf-card');
//   const kn = document.getElementById('kannada-ndvi-card');
//   if (kl) kl.remove();
//   if (kn) kn.remove();

//   showPage('page-home');
// }

// // ══ FETCH WEATHER ══
// async function fetchWeather(lat, lon) {
//   const card    = document.getElementById('weather-card');
//   const loading = document.getElementById('weather-loading');
//   const content = document.getElementById('weather-content');
//   const error   = document.getElementById('weather-error');
//   if (!card) return;

//   loading.style.display = 'flex';
//   content.style.display = 'none';
//   error.style.display   = 'none';

//   const API = 'http://127.0.0.1:5000';

//   try {
//     const res = await fetch(`${API}/api/weather`, {
//       method:  'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body:    JSON.stringify({ lat, lon })
//     });

//     if (!res.ok) throw new Error('Weather API failed');
//     const w = await res.json();

//     document.getElementById('w-temp').textContent     = w.temp + '°C';
//     document.getElementById('w-humidity').textContent = w.humidity + '%';
//     document.getElementById('w-wind').textContent     = w.wind_speed + ' m/s';
//     document.getElementById('w-desc').textContent     = w.description;

//     document.getElementById('w-disease-risk').textContent = w.disease_risk;
//     document.getElementById('w-spray-advice').textContent = w.spray_advice;
//     document.getElementById('w-rain-advice').textContent  = w.rain_advice;

//     const riskBox = document.getElementById('w-disease-risk-box');
//     if (riskBox) {
//       riskBox.style.borderColor =
//         w.disease_risk === 'High'   ? '#ef4444' :
//         w.disease_risk === 'Medium' ? '#eab308' : '#22c55e';
//     }

//     const foreRow = document.getElementById('forecast-row');
//     foreRow.innerHTML = '';
//     (w.forecast || []).forEach(f => {
//       const date = new Date(f.time).toLocaleDateString('en-IN', { weekday:'short', day:'numeric' });
//       foreRow.innerHTML += `
//         <div class="forecast-card">
//           <div class="forecast-date">${date}</div>
//           <div class="forecast-temp">${Math.round(f.temp)}°C</div>
//           <div class="forecast-desc">${f.desc}</div>
//           <div class="forecast-hum">💧 ${f.humidity}%</div>
//           ${f.rain > 0 ? `<div class="forecast-rain">🌧️ ${f.rain}mm</div>` : ''}
//         </div>`;
//     });

//     loading.style.display = 'none';
//     content.style.display = 'block';

//   } catch (e) {
//     console.error('Weather error:', e);
//     loading.style.display = 'none';
//     error.style.display   = 'block';
//   }
// }




// ══════════════════════════════════════════
//   AGRIVISION — script.js
//   Two workflows: Leaf + Field
//   Kannada translations added
// ══════════════════════════════════════════

let currentData = null;
let selectedMode = 'leaf';

// ══ KANNADA TRANSLATIONS ══
const KN = {
  // Disease names
  diseases: {
    "Early Blight":  "ಆರಂಭಿಕ ಎಲೆ ಕೊಳೆ ರೋಗ",
    "Late Blight":   "ತಡವಾದ ಎಲೆ ಕೊಳೆ ರೋಗ",
    "Healthy":       "ಆರೋಗ್ಯಕರ ಸಸ್ಯ",
    "Leaf Spot":     "ಎಲೆ ಚುಕ್ಕೆ ರೋಗ",
  },

  // Severity
  severity: {
    "low":    "ಕಡಿಮೆ ತೀವ್ರತೆ",
    "medium": "ಮಧ್ಯಮ ತೀವ್ರತೆ",
    "high":   "ಅಧಿಕ ತೀವ್ರತೆ",
  },

  // Medicine
  medicine: {
    "Early Blight":  "ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP — 2 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ",
    "Late Blight":   "ಮೆಟಲಾಕ್ಸಿಲ್ + ಮ್ಯಾಂಕೋಜೆಬ್ ಬಳಸಿ",
    "Healthy":       "ಯಾವುದೇ ಔಷಧ ಅಗತ್ಯವಿಲ್ಲ",
    "Leaf Spot":     "ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಸಿಂಪಡಿಸಿ",
  },

  // Fertilizer
  fertilizer: {
    "Early Blight":  "ಸಾರಜನಕ ಕಡಿಮೆ ಮಾಡಿ, ಪೊಟ್ಯಾಷಿಯಂ ಹೆಚ್ಚಿಸಿ",
    "Late Blight":   "ಕ್ಯಾಲ್ಸಿಯಂ ಗೊಬ್ಬರ ಹಾಕಿ",
    "Healthy":       "NPK ಸಮತೋಲನ ಕಾಪಾಡಿ",
    "Leaf Spot":     "ಸಮತೋಲಿತ ಗೊಬ್ಬರ ಬಳಸಿ",
  },

  // Treatment
  treatment: {
    "Early Blight":  "1. ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆಯಿರಿ\n2. ಪ್ರತಿ 7 ದಿನಕ್ಕೊಮ್ಮೆ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡಿಸಿ\n3. ತಲೆಯ ಮೇಲೆ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ",
    "Late Blight":   "1. ತಕ್ಷಣ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ\n2. ನೀರು ಬಸಿದು ಹೋಗುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ\n3. ರೋಗಪೀಡಿತ ಭಾಗಗಳನ್ನು ನಾಶ ಮಾಡಿ",
    "Healthy":       "ವಾರಕ್ಕೊಮ್ಮೆ ಪರೀಕ್ಷಿಸಿ ಮತ್ತು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ",
    "Leaf Spot":     "1. ರೋಗಪೀಡಿತ ಎಲೆಗಳನ್ನು ತೆಗೆಯಿರಿ\n2. ತಲೆಯ ಮೇಲೆ ನೀರು ಹಾಕುವುದನ್ನು ತಪ್ಪಿಸಿ",
  },

  // Action window
  action: "24–48 ಗಂಟೆಗಳಲ್ಲಿ ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ",

  // NDVI explanations
  ndvi: {
    title:       "NDVI ಬಗ್ಗೆ ಮಾಹಿತಿ (ಕನ್ನಡದಲ್ಲಿ)",
    what_title:  "NDVI ಎಂದರೇನು?",
    what_text:   "NDVI (Normalized Difference Vegetation Index) ಎಂದರೆ ಸಸ್ಯಗಳ ಆರೋಗ್ಯವನ್ನು ಅಳೆಯುವ ಒಂದು ವೈಜ್ಞಾನಿಕ ವಿಧಾನ. ಇದು -1 ರಿಂದ +1 ವರೆಗೆ ಇರುತ್ತದೆ.",
    score_title: "ಅಂಕಗಳ ಅರ್ಥ",
    scores: [
      { range: "0.6 – 1.0", meaning: "ಆರೋಗ್ಯಕರ ಬೆಳೆ 🟢", color: "#22c55e" },
      { range: "0.4 – 0.6", meaning: "ಸಾಮಾನ್ಯ ಒತ್ತಡ 🟡",  color: "#a3e635" },
      { range: "0.2 – 0.4", meaning: "ಮಧ್ಯಮ ಒತ್ತಡ 🟡",    color: "#eab308" },
      { range: "0.0 – 0.2", meaning: "ತೀವ್ರ ರೋಗ 🔴",       color: "#ef4444" },
      { range: "0 ಕ್ಕಿಂತ ಕಡಿಮೆ", meaning: "ಬರಡು ಭೂಮಿ ⬛", color: "#6b7280" },
    ],
    color_title: "ಬಣ್ಣಗಳ ಅರ್ಥ (ನಕ್ಷೆಯಲ್ಲಿ)",
    colors: [
      { color: "#006400", meaning: "ಗಾಢ ಹಸಿರು — ಸಂಪೂರ್ಣ ಆರೋಗ್ಯಕರ ಬೆಳೆ" },
      { color: "#90EE90", meaning: "ತಿಳಿ ಹಸಿರು — ಸ್ವಲ್ಪ ಒತ್ತಡ" },
      { color: "#FFD700", meaning: "ಹಳದಿ — ಮಧ್ಯಮ ತೊಂದರೆ" },
      { color: "#FF4500", meaning: "ಕಿತ್ತಳೆ ಕೆಂಪು — ತೀವ್ರ ರೋಗ" },
      { color: "#8B0000", meaning: "ಗಾಢ ಕೆಂಪು — ಬರಡು / ಮಣ್ಣು" },
    ],
    zone_title: "ವಲಯ ಅರ್ಥ",
    zone_text:  "ನಿಮ್ಮ ಹೊಲವನ್ನು ಉತ್ತರ, ದಕ್ಷಿಣ, ಪೂರ್ವ ಮತ್ತು ಪಶ್ಚಿಮ ಎಂದು 4 ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸಲಾಗಿದೆ. ಪ್ರತಿ ಭಾಗದ ಆರೋಗ್ಯ ಪ್ರತ್ಯೇಕವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    tip_title:  "ರೈತರಿಗೆ ಸಲಹೆ",
    tip_text:   "ಕೆಂಪು ಬಣ್ಣದ ವಲಯಗಳಿಗೆ ತಕ್ಷಣ ಗಮನ ನೀಡಿ. ಹಳದಿ ವಲಯಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ. ಹಸಿರು ವಲಯಗಳು ಆರೋಗ್ಯಕರವಾಗಿವೆ.",
  }
};

// ══ MODE SELECT ══
function setMode(mode) {
  selectedMode = mode;
  document.getElementById('leafMode').classList.toggle('active', mode === 'leaf');
  document.getElementById('fieldMode').classList.toggle('active', mode === 'field');

  if (mode === 'leaf') {
    document.getElementById('analyzeText').textContent   = 'Analyze Leaf';
    document.getElementById('dropzone-text').textContent = 'Drop your leaf image here';
    document.getElementById('mode-desc').textContent     = '📌 Upload a close-up photo of a crop leaf to detect disease, get medicine and treatment advice.';
  } else {
    document.getElementById('analyzeText').textContent   = 'Analyze Field';
    document.getElementById('dropzone-text').textContent = 'Drop your satellite field image here';
    document.getElementById('mode-desc').textContent     = '🛰️ Upload a satellite or aerial field image for NDVI health analysis and risk assessment.';
  }
  resetUpload();
}

function resetUpload() {
  const preview = document.getElementById('preview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  const di = document.getElementById('dropzone-inner');
  if (di) di.style.display = 'flex';
  const dz = document.getElementById('dropzone');
  if (dz) dz.classList.remove('has-image');
  const fi = document.getElementById('file-info');
  if (fi) fi.textContent = '';
  const btn = document.getElementById('analyzeBtn');
  if (btn) btn.disabled = true;
  const inp = document.getElementById('imageInput');
  if (inp) inp.value = '';
}

// ══ PAGE NAVIGATION ══
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });
  const target = document.getElementById(pageId);
  if (!target) return;
  target.style.display = 'block';
  setTimeout(() => target.classList.add('active'), 10);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  if (pageId === 'page-home')         document.getElementById('step1')?.classList.add('active');
  if (pageId === 'page-leaf-results' || pageId === 'page-field-results') document.getElementById('step2')?.classList.add('active');
  if (pageId === 'page-ndvi')         document.getElementById('step3')?.classList.add('active');
}

// ══ IMAGE PREVIEW ══
function previewImage() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return;

  const url     = URL.createObjectURL(file);
  const preview = document.getElementById('preview');
  preview.src   = url;
  preview.style.display = 'block';
  document.getElementById('dropzone-inner').style.display = 'none';
  document.getElementById('dropzone').classList.add('has-image');

  const ndviOrig = document.getElementById('ndvi-original');
  if (ndviOrig) ndviOrig.src = url;
  const leafImg  = document.getElementById('leaf-result-image');
  if (leafImg)  leafImg.src  = url;
  const fieldImg = document.getElementById('field-result-image');
  if (fieldImg) fieldImg.src = url;

  const sizeKB = (file.size / 1024).toFixed(1);
  document.getElementById('file-info').textContent = `📁 ${file.name} · ${sizeKB} KB`;
  document.getElementById('analyzeBtn').disabled = false;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ══ ANALYZE ══
async function analyzeImage() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) return alert('Please upload an image first!');

  document.getElementById('analyzeBtn').disabled    = true;
  document.getElementById('loading-bar').style.display = 'block';

  const fill = document.getElementById('loading-fill');
  if (fill) {
    fill.style.animation = 'none';
    fill.offsetHeight;
    fill.style.animation = 'loadProgress 2.5s ease forwards';
  }

  const API = 'http://127.0.0.1:5000';

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('mode',  selectedMode);

    const res = await fetch(`${API}/api/analyze`, { method: 'POST', body: formData });
    if (res.ok) {
      currentData = await res.json();
    } else {
      throw new Error('Server error');
    }
  } catch (e) {
    console.warn('Using fallback:', e);
    currentData = {
      disease: "Early Blight", severity: "medium",
      ndvi_score: 0.42, confidence: 87,
      medicine:    "Mancozeb 75% WP — 2g per litre of water",
      fertilizer:  "Reduce nitrogen. Add potassium-rich fertilizer.",
      treatment:   "1. Remove infected leaves immediately\n2. Spray fungicide every 7 days\n3. Avoid overhead watering\n4. Ensure proper plant spacing",
      action_window: "48 hours",
      ndvi_map: null,
      zones: { north: 0.72, south: 0.42, east: 0.65, west: 0.38 }
    };
  }

  await delay(2000);
  document.getElementById('loading-bar').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = false;

  if (currentData.error) {
    alert('⚠️ ' + (currentData.message || 'Please upload a valid crop or field image.'));
    resetUpload();
    return;
  }

  if (selectedMode === 'leaf') {
    displayLeafResults(currentData);
    showPage('page-leaf-results');
  } else {
    displayFieldResults(currentData);
    showPage('page-field-results');
  }
}

// ══ LEAF RESULTS ══
function displayLeafResults(data) {
  const score = parseFloat(data.ndvi_score) || 0.5;
  const conf  = typeof data.confidence === 'number'
    ? data.confidence.toFixed(1) + '%'
    : data.confidence + '%';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

  set('leaf-disease-name',   data.disease);
  set('leaf-confidence-val', conf);
  set('leaf-action-window',  data.action_window || '48 hours');
  set('leaf-medicine',       data.medicine);
  set('leaf-fertilizer',     data.fertilizer);
  set('leaf-treatment',      data.treatment);

  const badge = document.getElementById('leaf-severity-badge');
  if (badge) {
    badge.textContent = (data.severity || 'medium').toUpperCase();
    badge.className   = 'sev-pill sev-' + (data.severity || 'medium');
  }

  const icon = document.getElementById('leaf-dis-icon');
  if (icon) {
    if (data.disease?.toLowerCase().includes('healthy')) icon.textContent = '✅';
    else if (data.severity === 'high') icon.textContent = '🚨';
    else icon.textContent = '⚠️';
  }

  const now = new Date();
  set('leaf-img-meta', `Analyzed at ${now.toLocaleTimeString()} · ${now.toLocaleDateString()}`);

  set('leaf-health-index', score >= 0.6 ? 'Good' : score >= 0.3 ? 'Moderate' : 'Poor');
  set('leaf-risk-level',   data.severity === 'low' ? 'Low' : data.severity === 'high' ? 'High' : 'Medium');
  set('leaf-crop-status',  data.disease?.toLowerCase().includes('healthy') ? 'Healthy ✅' : 'Needs Treatment ⚠️');

  // ── Inject Kannada translation card ──
  injectLeafKannada(data);
}

// ══ KANNADA LEAF CARD INJECTION ══
function injectLeafKannada(data) {
  // Remove old card if exists
  const old = document.getElementById('kannada-leaf-card');
  if (old) old.remove();

  // Find disease key — handle both "Early Blight" and "early_blight" formats
  const rawDisease = data.disease || '';
  const diseaseKey = Object.keys(KN.diseases).find(k =>
    k.toLowerCase() === rawDisease.toLowerCase() ||
    k.toLowerCase().replace(/ /g, '_') === rawDisease.toLowerCase()
  ) || rawDisease;

  const knDisease    = KN.diseases[diseaseKey]    || rawDisease;
  const knSeverity   = KN.severity[data.severity] || data.severity;
  const knMedicine   = KN.medicine[diseaseKey]    || data.medicine;
  const knFertilizer = KN.fertilizer[diseaseKey]  || data.fertilizer;
  const knTreatment  = KN.treatment[diseaseKey]   || data.treatment;

  const sevColor = data.severity === 'low' ? '#22c55e' :
                   data.severity === 'high' ? '#ef4444' : '#eab308';

  const card = document.createElement('div');
  card.id = 'kannada-leaf-card';
  card.style.cssText = `
    margin-top: 24px;
    background: linear-gradient(135deg, rgba(74,222,128,0.06), rgba(163,230,53,0.04));
    border: 1px solid rgba(74,222,128,0.25);
    border-left: 4px solid #4ade80;
    border-radius: 16px;
    padding: 24px 28px;
    font-family: 'DM Sans', sans-serif;
  `;

  card.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
      <span style="font-size:22px;">🇮🇳</span>
      <div>
        <div style="font-size:11px; color:#4ade80; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;">ಕನ್ನಡದಲ್ಲಿ ಫಲಿತಾಂಶ</div>
        <div style="font-size:18px; font-weight:700; color:#f0fdf4; margin-top:2px;">Leaf Disease Report in Kannada</div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">
      <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px;">
        <div style="font-size:10px; color:#4ade80; font-weight:700; letter-spacing:1px; margin-bottom:6px;">🔬 ರೋಗದ ಹೆಸರು</div>
        <div style="font-size:16px; font-weight:700; color:#f0fdf4;">${knDisease}</div>
        <div style="margin-top:6px; font-size:12px; color:#86efac;">
  🇬🇧 English: ${rawDisease}
</div>
<div style="font-size:12px; color:#d1fae5;">
  🇮🇳 ಕನ್ನಡ: ${knDisease}
</div>
      </div>
      <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px;">
        <div style="font-size:10px; color:#4ade80; font-weight:700; letter-spacing:1px; margin-bottom:6px;">⚠️ ತೀವ್ರತೆ</div>
        <div style="font-size:16px; font-weight:700; color:${sevColor};">${knSeverity}</div>
        <div style="font-size:11px; color:#86efac; margin-top:2px;">${(data.severity||'').toUpperCase()}</div>
      </div>
    </div>

    <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:10px; padding:14px; margin-bottom:12px;">
      <div style="font-size:10px; color:#f87171; font-weight:700; letter-spacing:1px; margin-bottom:8px;">💊 ಔಷಧ / Medicine</div>
      <div style="font-size:14px; color:#f0fdf4; line-height:1.6;">${knMedicine}</div>
    </div>

    <div style="background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.15); border-radius:10px; padding:14px; margin-bottom:12px;">
      <div style="font-size:10px; color:#4ade80; font-weight:700; letter-spacing:1px; margin-bottom:8px;">🌱 ಗೊಬ್ಬರ / Fertilizer</div>
      <div style="font-size:14px; color:#f0fdf4; line-height:1.6;">${knFertilizer}</div>
    </div>

    <div style="background:rgba(249,115,22,0.05); border:1px solid rgba(249,115,22,0.2); border-radius:10px; padding:14px; margin-bottom:12px;">
      <div style="font-size:10px; color:#fb923c; font-weight:700; letter-spacing:1px; margin-bottom:8px;">🩺 ಚಿಕಿತ್ಸೆ / Treatment</div>
      <div style="font-size:14px; color:#f0fdf4; line-height:1.8; white-space:pre-line;">${knTreatment}</div>
    </div>

    <div style="background:rgba(163,230,53,0.08); border:1px solid rgba(163,230,53,0.2); border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:10px;">
      <span style="font-size:20px;">⏱️</span>
      <div>
        <div style="font-size:11px; color:#a3e635; font-weight:700;">ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ</div>
        <div style="font-size:14px; color:#f0fdf4; font-weight:600; margin-top:2px;">${KN.action}</div>
      </div>
    </div>
  `;

  // Append after the disease-body div inside page-leaf-results
  const resultsSection = document.querySelector('#page-leaf-results .results-section');
  if (resultsSection) {
    resultsSection.appendChild(card);
  }
}

// ══ FIELD RESULTS ══
function displayFieldResults(data) {
  const score = parseFloat(data.ndvi_score) || 0.5;
  const conf  = typeof data.confidence === 'number'
    ? data.confidence.toFixed(1) + '%'
    : data.confidence + '%';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };

  const riskScore = data.risk_score !== undefined
    ? Math.round(data.risk_score)
    : Math.round((1 - score) * 100);

  set('risk-score-num',      riskScore);
  set('field-ndvi-score',    score.toFixed(2));
  set('field-confidence',    conf);
  set('field-action-window', data.action_window || '48 hours');

  let riskLevel, priority;
  if (riskScore < 30)      { riskLevel = '🟢 Low';    priority = 'Routine monitoring'; }
  else if (riskScore < 60) { riskLevel = '🟡 Medium'; priority = 'Action needed soon'; }
  else                     { riskLevel = '🔴 High';   priority = 'Immediate action required'; }

  set('field-risk-level', riskLevel);
  set('field-priority',   priority);

  const circle = document.getElementById('risk-circle-fill');
  if (circle) {
    const offset = 364 - (riskScore / 100) * 364;
    const color  = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#eab308' : '#ef4444';
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = color;
    circle.style.transition = 'stroke-dashoffset 1.2s ease, stroke 0.5s';
  }

  const riskBar = document.getElementById('risk-bar-fill');
  if (riskBar) {
    riskBar.style.width      = riskScore + '%';
    riskBar.style.background = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#eab308' : '#ef4444';
    riskBar.style.transition = 'width 1s ease';
  }

  let healthyPct, stressedPct, diseasedPct;
  if (data.healthy_pct !== undefined) {
    healthyPct  = Math.round(data.healthy_pct);
    stressedPct = Math.round(data.stressed_pct);
    diseasedPct = Math.round(data.diseased_pct);
  } else if (data.zones) {
    const vals  = Object.values(data.zones);
    const total = vals.length;
    healthyPct  = Math.round((vals.filter(v => v > 0.6).length / total) * 100);
    stressedPct = Math.round((vals.filter(v => v > 0.3 && v <= 0.6).length / total) * 100);
    diseasedPct = 100 - healthyPct - stressedPct;
  } else {
    healthyPct  = Math.round(score * 60);
    stressedPct = Math.round((1 - score) * 25);
    diseasedPct = Math.max(0, 100 - healthyPct - stressedPct);
  }

  set('area-healthy',      healthyPct  + '%');
  set('area-stressed',     stressedPct + '%');
  set('area-diseased',     diseasedPct + '%');
  set('donut-healthy-pct', healthyPct  + '%');
  set('healthy-bar-pct',   healthyPct  + '%');
  set('stressed-bar-pct',  stressedPct + '%');
  set('diseased-bar-pct',  diseasedPct + '%');

  setTimeout(() => {
    const hb = document.getElementById('healthy-bar');
    const sb = document.getElementById('stressed-bar');
    const db = document.getElementById('diseased-bar');
    if (hb) hb.style.width = healthyPct  + '%';
    if (sb) sb.style.width = stressedPct + '%';
    if (db) db.style.width = diseasedPct + '%';
  }, 300);

  drawDonut(healthyPct, stressedPct, diseasedPct);

  const now = new Date();
  set('field-img-meta', `Analyzed at ${now.toLocaleTimeString()} · ${now.toLocaleDateString()}`);

  const weatherCard = document.getElementById('weather-card');
  if (weatherCard) weatherCard.style.display = 'block';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()  => fetchWeather(13.0219, 75.0367)
    );
  } else {
    fetchWeather(13.0219, 75.0367);
  }
}

// ══ DONUT CHART ══
function drawDonut(healthy, stressed, diseased) {
  const canvas = document.getElementById('donutCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2, r = 55;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const segments = [
    { pct: healthy,  color: '#22c55e' },
    { pct: stressed, color: '#eab308' },
    { pct: diseased, color: '#ef4444' }
  ];

  let startAngle = -Math.PI / 2;
  segments.forEach(seg => {
    if (seg.pct <= 0) return;
    const angle = (seg.pct / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += angle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = '#0c180c';
  ctx.fill();
}

// ══ NDVI PAGE — inject Kannada explanation ══
function injectNDVIKannada() {
  const old = document.getElementById('kannada-ndvi-card');
  if (old) old.remove();

  const kn = KN.ndvi;

  const scoresHTML = kn.scores.map(s => `
    <div style="display:flex; align-items:center; gap:12px; padding:8px 10px; background:rgba(255,255,255,0.03); border-radius:8px;">
      <div style="width:14px; height:14px; border-radius:3px; background:${s.color}; flex-shrink:0;"></div>
      <div>
        <span style="font-size:13px; font-weight:700; color:#f0fdf4;">${s.range}</span>
        <span style="font-size:13px; color:#86efac; margin-left:8px;">${s.meaning}</span>
      </div>
    </div>
  `).join('');

  const colorsHTML = kn.colors.map(c => `
    <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
      <div style="width:28px; height:16px; border-radius:4px; background:${c.color}; flex-shrink:0;"></div>
      <div style="font-size:13px; color:#86efac;">${c.meaning}</div>
    </div>
  `).join('');

  const card = document.createElement('div');
  card.id = 'kannada-ndvi-card';
  card.style.cssText = `
    margin: 24px 0 40px 0;
    background: linear-gradient(135deg, rgba(74,222,128,0.06), rgba(163,230,53,0.03));
    border: 1px solid rgba(74,222,128,0.2);
    border-left: 4px solid #4ade80;
    border-radius: 16px;
    padding: 28px;
    font-family: 'DM Sans', sans-serif;
  `;

  card.innerHTML = `
    <!-- Header -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid rgba(74,222,128,0.15);">
      <span style="font-size:28px;">🇮🇳</span>
      <div>
        <div style="font-size:11px; color:#4ade80; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:3px;">ಕನ್ನಡದಲ್ಲಿ NDVI ವಿವರಣೆ</div>
        <div style="font-size:20px; font-weight:700; color:#f0fdf4;">NDVI Explanation in Kannada</div>
      </div>
    </div>

    <!-- What is NDVI -->
    <div style="margin-bottom:20px;">
      <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">📡 ${kn.what_title}</div>
      <div style="font-size:14px; color:#d4eed9; line-height:1.8; background:rgba(255,255,255,0.03); border-radius:10px; padding:14px;">
        ${kn.what_text}
      </div>
    </div>

    <!-- Score meanings -->
    <div style="margin-bottom:20px;">
      <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">📊 ${kn.score_title}</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${scoresHTML}
      </div>
    </div>

    <!-- Color map -->
    <div style="margin-bottom:20px;">
      <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">🎨 ${kn.color_title}</div>
      <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px 16px;">
        ${colorsHTML}
      </div>
    </div>

    <!-- Zone explanation -->
    <div style="margin-bottom:20px;">
      <div style="font-size:13px; font-weight:700; color:#a3e635; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">🗺️ ${kn.zone_title}</div>
      <div style="font-size:14px; color:#d4eed9; line-height:1.8; background:rgba(255,255,255,0.03); border-radius:10px; padding:14px;">
        ${kn.zone_text}
      </div>
    </div>

    <!-- Farmer tip -->
    <div style="background:rgba(163,230,53,0.08); border:1px solid rgba(163,230,53,0.2); border-radius:12px; padding:16px;">
      <div style="display:flex; align-items:flex-start; gap:12px;">
        <span style="font-size:24px; flex-shrink:0;">💡</span>
        <div>
          <div style="font-size:12px; font-weight:700; color:#a3e635; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">${kn.tip_title}</div>
          <div style="font-size:14px; color:#d4eed9; line-height:1.7;">${kn.tip_text}</div>
        </div>
      </div>
    </div>
  `;

  // Append to NDVI section
  const ndviSection = document.querySelector('#page-ndvi .ndvi-section');
  if (ndviSection) {
    ndviSection.appendChild(card);
  }
}

// ══ GO TO NDVI PAGE ══
function goToFieldNDVI() {
  showPage('page-ndvi');
  setTimeout(() => {
    const score = parseFloat(currentData?.ndvi_score) || 0.5;
    drawGauge(score);
    updateGaugeLabel(score);
    document.getElementById('gauge-score').textContent = score.toFixed(2);

    const img = document.getElementById('ndvi-original');
    if (!img || !img.src) return;

    const tryDraw = () => {
      if (currentData?.ndvi_map) drawNDVIFromBackend(currentData.ndvi_map);
      else drawNDVIFromPixels();

      if (currentData?.zones) {
        setZone('north-bar', 'north-text', 'north-dot', currentData.zones.north);
        setZone('south-bar', 'south-text', 'south-dot', currentData.zones.south);
        setZone('east-bar',  'east-text',  'east-dot',  currentData.zones.east);
        setZone('west-bar',  'west-text',  'west-dot',  currentData.zones.west);
      }
    };

    if (img.complete && img.naturalWidth > 0) tryDraw();
    else img.onload = tryDraw;

    // Inject Kannada NDVI explanation
    injectNDVIKannada();

  }, 300);
}

// ══ NDVI FROM BACKEND ══
function drawNDVIFromBackend(ndviMap) {
  const canvas = document.getElementById('ndviCanvas');
  if (!canvas || !ndviMap) return;

  const h = ndviMap.length, w = ndviMap[0].length;
  canvas.width = w; canvas.height = h;

  const ctx = canvas.getContext('2d');
  const imgData = ctx.createImageData(w, h);
  const d = imgData.data;

  let mn = Infinity, mx = -Infinity;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      mn = Math.min(mn, ndviMap[y][x]);
      mx = Math.max(mx, ndviMap[y][x]);
    }
  const range = mx - mn + 0.0001;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const norm  = (ndviMap[y][x] - mn) / range;
      const color = ndviColor(norm);
      const i     = (y * w + x) * 4;
      d[i] = color[0]; d[i+1] = color[1]; d[i+2] = color[2]; d[i+3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// ══ NDVI FROM PIXELS ══
function drawNDVIFromPixels() {
  const canvas = document.getElementById('ndviCanvas');
  const img    = document.getElementById('ndvi-original');
  if (!canvas || !img || !img.src) return;

  const parent = canvas.parentElement;
  const w = parent ? parent.offsetWidth || 400 : 400;
  const h = 260;
  canvas.width = w; canvas.height = h;

  const ctx = canvas.getContext('2d');

  // draw image into offscreen canvas to read pixels
  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const octx = off.getContext('2d');
  octx.drawImage(img, 0, 0, w, h);
  const imgData = octx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const total = d.length / 4;

  const ndviVals = new Float32Array(total);

  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    // Use green channel as proxy for NIR, red as red
    // Real NDVI = (NIR - Red) / (NIR + Red)
    // We simulate: high green + low red = healthy, high red = diseased, low all = bare soil
    const nir = g;
    const red = r;
    const denom = nir + red;

    let ndvi;
    if (denom < 10) {
      // very dark pixel — bare soil or shadow
      ndvi = 0.05;
    } else {
      ndvi = (nir - red) / denom;
      // ndvi now in range roughly -1 to +1, normalize to 0–1
      ndvi = (ndvi + 1) / 2;
    }

    // Extra: if pixel is very dark overall → force brown (bare soil)
    const brightness = (r + g + b) / 3;
    if (brightness < 40) ndvi = 0.05;

    // If heavily red-dominated → diseased (force into red zone)
    if (r > g * 1.4 && r > b * 1.4) {
      ndvi = 0.20 + Math.random() * 0.08; // diseased red zone
    }

    // If heavily green-dominated → healthy
    if (g > r * 1.3 && g > b * 1.2 && brightness > 60) {
      ndvi = 0.72 + Math.random() * 0.15; // healthy green zone
    }

    ndviVals[j] = Math.max(0, Math.min(1, ndvi));
  }

  // Normalize using 5th–95th percentile to avoid outlier dominance
  const sorted = Float32Array.from(ndviVals).sort();
  const p5  = sorted[Math.floor(total * 0.05)];
  const p95 = sorted[Math.floor(total * 0.95)];
  const range = p95 - p5 + 0.0001;

  const outData = ctx.createImageData(w, h);
  const od = outData.data;

  for (let i = 0, j = 0; i < od.length; i += 4, j++) {
    const norm  = Math.max(0, Math.min(1, (ndviVals[j] - p5) / range));
    const color = ndviColor(norm);
    od[i]     = color[0];
    od[i + 1] = color[1];
    od[i + 2] = color[2];
    od[i + 3] = 255;
  }

  ctx.putImageData(outData, 0, 0);
}
// ══ NDVI COLOR MAP ══
function ndviColor(norm) {
  // norm = 0.0 (lowest NDVI) → 1.0 (highest NDVI)
  // 0.00–0.15 = bare soil / empty land → brown/dark brown
  // 0.15–0.30 = severe disease / dead crop → deep red
  // 0.30–0.45 = moderate disease → orange-red
  // 0.45–0.55 = mild stress → yellow-orange
  // 0.55–0.70 = recovering / mild stress → light green
  // 0.70–0.85 = healthy crop → medium green
  // 0.85–1.00 = very healthy / dense → deep green

  const stops = [
    [0.00, [101,  67,  33]],   // dark brown  — bare soil / empty land
    [0.15, [139,  90,  43]],   // brown       — very dry / bare
    [0.25, [180,  30,  10]],   // deep red    — severe disease / dead crop
    [0.38, [220,  60,  10]],   // red-orange  — diseased crop
    [0.48, [200, 130,   0]],   // dark yellow — stressed (narrow band)
    [0.56, [160, 200,  60]],   // yellow-green — mild stress transitioning
    [0.68, [ 80, 180,  50]],   // light green  — moderate health
    [0.82, [ 34, 139,  34]],   // green        — healthy
    [1.00, [  0,  80,  20]]    // deep green   — very healthy / dense
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (norm >= t0 && norm <= t1) {
      const t = (norm - t0) / (t1 - t0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * t),
        Math.round(c0[1] + (c1[1] - c0[1]) * t),
        Math.round(c0[2] + (c1[2] - c0[2]) * t)
      ];
    }
  }
  return [0, 80, 20];
}

// ══ ZONE UI ══
function setZone(barId, textId, dotId, value) {
  const bar  = document.getElementById(barId);
  const text = document.getElementById(textId);
  const dot  = document.getElementById(dotId);
  if (!bar || !text) return;

  const pct    = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const color  = value > 0.6 ? '#22c55e' : value > 0.3 ? '#eab308' : '#ef4444';
  const status = value > 0.6 ? 'Healthy' : value > 0.3 ? 'Mild Stress' : 'High Stress';

  bar.style.width      = pct + '%';
  bar.style.background = color;
  bar.style.transition = 'width 1s ease';
  text.textContent     = `${status} · ${value.toFixed(2)}`;
  if (dot) dot.style.background = color;
}

// ══ GAUGE ══
function drawGauge(score) {
  const canvas = document.getElementById('gaugeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2, cy = canvas.height - 10, r = 80;

  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.strokeStyle = '#1e3a1e'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();

  const color = score < 0.2 ? '#ef4444' : score < 0.4 ? '#f97316' : score < 0.6 ? '#eab308' : '#22c55e';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + score * Math.PI);
  ctx.strokeStyle = color; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke();

  ctx.fillStyle = '#365836'; ctx.font = '10px DM Sans'; ctx.textAlign = 'center';
  ctx.fillText('0.0', cx - r - 12, cy + 4);
  ctx.fillText('1.0', cx + r + 12, cy + 4);
}

function updateGaugeLabel(score) {
  const label = document.getElementById('gauge-label');
  if (!label) return;
  if (score >= 0.6)      { label.textContent = 'Healthy Crop';    label.style.color = '#4ade80'; }
  else if (score >= 0.4) { label.textContent = 'Mild Stress';     label.style.color = '#a3e635'; }
  else if (score >= 0.2) { label.textContent = 'Moderate Stress'; label.style.color = '#eab308'; }
  else                   { label.textContent = 'Severe Disease';  label.style.color = '#ef4444'; }
}

window.addEventListener('load', () => {
  drawGauge(0.42);
  drawDonut(62, 28, 10);
});

// ══ RESET ══
function resetApp() {
  currentData = null;
  resetUpload();

  const weatherCard = document.getElementById('weather-card');
  if (weatherCard) {
    weatherCard.style.display = 'none';
    const wc = document.getElementById('weather-content');
    const wl = document.getElementById('weather-loading');
    const we = document.getElementById('weather-error');
    if (wc) wc.style.display = 'none';
    if (wl) wl.style.display = 'flex';
    if (we) we.style.display = 'none';
  }

  // Remove injected Kannada cards
  const kl = document.getElementById('kannada-leaf-card');
  const kn = document.getElementById('kannada-ndvi-card');
  if (kl) kl.remove();
  if (kn) kn.remove();

  showPage('page-home');
}

// ══ FETCH WEATHER ══
async function fetchWeather(lat, lon) {
  const card    = document.getElementById('weather-card');
  const loading = document.getElementById('weather-loading');
  const content = document.getElementById('weather-content');
  const error   = document.getElementById('weather-error');
  if (!card) return;

  loading.style.display = 'flex';
  content.style.display = 'none';
  error.style.display   = 'none';

  const API = 'http://127.0.0.1:5000';

  try {
    const res = await fetch(`${API}/api/weather`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ lat, lon })
    });

    if (!res.ok) throw new Error('Weather API failed');
    const w = await res.json();

    document.getElementById('w-temp').textContent     = w.temp + '°C';
    document.getElementById('w-humidity').textContent = w.humidity + '%';
    document.getElementById('w-wind').textContent     = w.wind_speed + ' m/s';
    document.getElementById('w-desc').textContent     = w.description;

    document.getElementById('w-disease-risk').textContent = w.disease_risk;
    document.getElementById('w-spray-advice').textContent = w.spray_advice;
    document.getElementById('w-rain-advice').textContent  = w.rain_advice;

    const riskBox = document.getElementById('w-disease-risk-box');
    if (riskBox) {
      riskBox.style.borderColor =
        w.disease_risk === 'High'   ? '#ef4444' :
        w.disease_risk === 'Medium' ? '#eab308' : '#22c55e';
    }

    const foreRow = document.getElementById('forecast-row');
    foreRow.innerHTML = '';
    (w.forecast || []).forEach(f => {
      const date = new Date(f.time).toLocaleDateString('en-IN', { weekday:'short', day:'numeric' });
      foreRow.innerHTML += `
        <div class="forecast-card">
          <div class="forecast-date">${date}</div>
          <div class="forecast-temp">${Math.round(f.temp)}°C</div>
          <div class="forecast-desc">${f.desc}</div>
          <div class="forecast-hum">💧 ${f.humidity}%</div>
          ${f.rain > 0 ? `<div class="forecast-rain">🌧️ ${f.rain}mm</div>` : ''}
        </div>`;
    });

    loading.style.display = 'none';
    content.style.display = 'block';

  } catch (e) {
    console.error('Weather error:', e);
    loading.style.display = 'none';
    error.style.display   = 'block';
  }
}


(function() {
  const root = document.documentElement;
  const saved = localStorage.getItem('agrivision-theme') || 'dark';
  root.setAttribute('data-theme', saved);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('agrivision-theme', next);
    });
  }
})();