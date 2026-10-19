# Real-Time Head Pose Estimation

A browser-based tool to detect human face orientation (**Pitch, Yaw, Roll**) in real-time using **MediaPipe Face Landmarker** and **React**.

This project is designed for easy collection of head pose data, which can be used for 3D human model rendering, emotion research, behavioral analysis, and more.

![Demo](./demo.png)

---

## 🌟 Features

* Real-time face detection using MediaPipe Face Landmarker
* Live calculation of **Pitch**, **Yaw**, and **Roll**
* Face landmarks visualization
* Smooth angle values
* One-click capture of photo + pose data
* Gallery view of captured samples
* Download collected data as JSON
* Clean and modern dark UI
* Fully runs in the browser (no backend required)

---

## 🚀 Why This Tool?

Head pose data (Pitch, Yaw, Roll) is widely used in:
* 3D human model animation and rendering
* Mapping real human movement to virtual characters
* Emotion and expression research
* Attention & engagement tracking
* Behavioral data collection
* Computer vision dataset creation

This tool makes it simple to collect structured head pose data along with the corresponding face image.

---

## 🛠️ Tech Stack

* **React** + **TypeScript**
* **Vite**
* **MediaPipe Face Landmarker**
* **react-webcam**
* **HTML5 Canvas API**

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/alombd/face-pose-mediapipe.git
cd face-pose-mediapipe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the project
```bash
npm run dev
```

Open `http://localhost:5173` in your browser and allow camera permission.

---

## 🖥️ How to Use

1. Allow camera access when prompted.
2. Position your face in front of the camera.
3. Move your head to see live Pitch, Yaw, and Roll values.
4. Click **Capture Photo + Pose Data** to save a sample.
5. View captured samples in the gallery.
6. Click **Download JSON** to export all data.

---

## 📊 Data Format

Each captured sample contains:

```json
{
  "id": 1729399608317,
  "timestamp": "19/10/2026, 14:46:48",
  "pitch": -9.7,
  "yaw": -169.1,
  "roll": 7.4
}
```

---

## 📁 Project Structure

```text
src/
├── components/
│   └── WebcamFeed.tsx      # Main camera, detection & capture logic
├── hooks/
│   └── useFaceLandmarker.ts # MediaPipe initialization
├── App.tsx
└── index.css
```

---

## 🎯 Use Cases

* Collecting head pose datasets
* 3D character animation reference
* Emotion / expression research
* Human-Computer Interaction experiments
* Student projects & research work

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

Developed with ❤️ by [alombd](https://github.com/alombd) for easy and practical head pose data collection.