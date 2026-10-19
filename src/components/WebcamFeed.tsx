import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import type { HeadPose } from "../hooks/useFaceLandmarker";

type CapturedItem = {
    id: number;
    timestamp: string;
    pose: HeadPose;
    image: string | null;
};

const WebcamFeed = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const lastVideoTimeRef = useRef<number>(-1);
    const smoothPose = useRef<HeadPose>({ pitch: 0, yaw: 0, roll: 0 });

    const [isCameraReady, setIsCameraReady] = useState(false);
    const [headPose, setHeadPose] = useState<HeadPose | null>(null);
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [capturedData, setCapturedData] = useState<CapturedItem[]>([]);

    const { faceLandmarker, isLoading, error } = useFaceLandmarker();

    const handleUserMedia = useCallback(() => {
        setIsCameraReady(true);
    }, []);

    const calculateHeadPose = (matrix: any): HeadPose | null => {
        if (!matrix?.data) return null;

        const data = matrix.data;
        const pitch = Math.asin(-data[6]) * (180 / Math.PI);
        const yaw = Math.atan2(data[8], data[9]) * (180 / Math.PI);
        const roll = Math.atan2(data[1], data[0]) * (180 / Math.PI);

        const alpha = 0.4;
        smoothPose.current = {
            pitch: smoothPose.current.pitch * (1 - alpha) + pitch * alpha,
            yaw: smoothPose.current.yaw * (1 - alpha) + yaw * alpha,
            roll: smoothPose.current.roll * (1 - alpha) + roll * alpha,
        };

        return {
            pitch: Math.round(smoothPose.current.pitch * 10) / 10,
            yaw: Math.round(smoothPose.current.yaw * 10) / 10,
            roll: Math.round(smoothPose.current.roll * 10) / 10,
        };
    };

    const handleDownloadJSON = () => {
        const dataToDownload = capturedData.map(({ id, timestamp, pose }) => ({
            id,
            timestamp,
            pitch: pose.pitch,
            yaw: pose.yaw,
            roll: pose.roll,
        }));

        const jsonString = JSON.stringify(dataToDownload, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `head-pose-data-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (!faceLandmarker || !isCameraReady) return;

        const detect = () => {
            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;

            if (video && canvas && video.readyState === 4) {
                const currentTime = video.currentTime;

                if (currentTime !== lastVideoTimeRef.current) {
                    lastVideoTimeRef.current = currentTime;

                    const results = faceLandmarker.detectForVideo(
                        video,
                        performance.now(),
                    );

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext("2d");

                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        if (
                            results.faceLandmarks &&
                            results.faceLandmarks.length > 0
                        ) {
                            setIsFaceDetected(true);
                            const landmarks = results.faceLandmarks[0];

                            ctx.fillStyle = "#38bdf8";
                            for (const point of landmarks) {
                                const x = point.x * canvas.width;
                                const y = point.y * canvas.height;
                                ctx.beginPath();
                                ctx.arc(x, y, 1.2, 0, 2 * Math.PI);
                                ctx.fill();
                            }

                            if (results.facialTransformationMatrixes?.[0]) {
                                const pose = calculateHeadPose(
                                    results.facialTransformationMatrixes[0],
                                );
                                if (pose) setHeadPose(pose);
                            }
                        } else {
                            setIsFaceDetected(false);
                            setHeadPose(null);
                        }
                    }
                }
            }

            requestRef.current = requestAnimationFrame(detect);
        };

        requestRef.current = requestAnimationFrame(detect);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [faceLandmarker, isCameraReady]);

    const handleCapture = () => {
        if (!webcamRef.current || !headPose) return;

        const imageSrc = webcamRef.current.getScreenshot();
        const data: CapturedItem = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            pose: { ...headPose },
            image: imageSrc,
        };

        setCapturedData((prev) => [data, ...prev]);
    };

    const handleDelete = (id: number) => {
        setCapturedData((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="webcam-wrapper">
            {/* Camera Section */}
            <div className="webcam-container">
                {isLoading && (
                    <div className="camera-loading">
                        Loading MediaPipe model...
                    </div>
                )}
                {error && <div className="camera-error">{error}</div>}

                <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={true}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 640, height: 480 }}
                    onUserMedia={handleUserMedia}
                    className="webcam"
                    style={{
                        width: "100%",
                        borderRadius: "12px",
                        display: isCameraReady ? "block" : "none",
                    }}
                />

                <canvas ref={canvasRef} className="overlay-canvas" />

                <div
                    className={`status-badge ${isFaceDetected ? "detected" : "not-detected"}`}
                >
                    {isFaceDetected ? "Face Detected" : "No Face"}
                </div>
            </div>

            {/* Pose Values */}
            <div className="pose-info">
                {headPose ? (
                    <>
                        <div className="pose-item">
                            <span className="label">Pitch</span>
                            <span className="value">{headPose.pitch}°</span>
                        </div>
                        <div className="pose-item">
                            <span className="label">Yaw</span>
                            <span className="value">{headPose.yaw}°</span>
                        </div>
                        <div className="pose-item">
                            <span className="label">Roll</span>
                            <span className="value">{headPose.roll}°</span>
                        </div>
                    </>
                ) : (
                    <p className="no-face">Looking for face...</p>
                )}
            </div>

            {/* Capture Button */}
            <button
                className="capture-btn"
                onClick={handleCapture}
                disabled={!headPose}
            >
                Capture Photo + Pose Data
            </button>

            {/* Gallery Section */}
            {capturedData.length > 0 && (
                <div className="gallery-section">
                    <h3 className="gallery-title">
                        Captured Samples ({capturedData.length})
                    </h3>

                    <div className="gallery-grid">
                        {capturedData.map((item) => (
                            <div key={item.id} className="gallery-item">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt="Captured"
                                        className="gallery-image"
                                    />
                                )}
                                <div className="gallery-info">
                                    <div className="gallery-pose">
                                        <span>P: {item.pose.pitch}°</span>
                                        <span>Y: {item.pose.yaw}°</span>
                                        <span>R: {item.pose.roll}°</span>
                                    </div>
                                    <div className="gallery-time">
                                        {item.timestamp}
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* JSON Data Section */}
            {capturedData.length > 0 && (
                <div className="json-section">
                    <div className="json-header">
                        <h3>Captured Data (JSON)</h3>
                        <button
                            className="download-btn"
                            onClick={handleDownloadJSON}
                        >
                            Download JSON
                        </button>
                    </div>

                    <pre className="json-viewer">
                        {JSON.stringify(
                            capturedData.map(({ id, timestamp, pose }) => ({
                                id,
                                timestamp,
                                pitch: pose.pitch,
                                yaw: pose.yaw,
                                roll: pose.roll,
                            })),
                            null,
                            2,
                        )}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default WebcamFeed;
