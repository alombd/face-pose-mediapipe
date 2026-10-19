import { useEffect, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export type HeadPose = {
  pitch: number;
  yaw: number;
  roll: number;
};

export function useFaceLandmarker() {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (isMounted) {
          setFaceLandmarker(landmarker);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load MediaPipe model");
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  return { faceLandmarker, isLoading, error };
}