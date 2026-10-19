import WebcamFeed from "./components/WebcamFeed";

function App() {
    return (
        <div className="app">
            <header className="header">
                <h1>Real-time Head Pose Estimation</h1>
                <p>MediaPipe Face Landmarker + React + TypeScript</p>
            </header>

            <main className="main">
                <WebcamFeed />
            </main>
        </div>
    );
}

export default App;
