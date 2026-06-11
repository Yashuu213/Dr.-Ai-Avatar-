import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

const WebcamFeed = ({ feedRef, onEmotionChange, onGenderDetect }) => {
    const defaultVideoRef = useRef(null);
    const activeRef = feedRef || defaultVideoRef;
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState("neutral");

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; // Ensure models are in public/models
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (e) {
                console.error("Failed to load face-api models", e);
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (activeRef.current) {
                    activeRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startVideo();
    }, [activeRef]);

    const handleVideoPlay = () => {
        setInterval(async () => {
            if (activeRef.current && modelsLoaded) {
                const detections = await faceapi.detectAllFaces(
                    activeRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceExpressions().withAgeAndGender();

                if (detections && detections.length > 0) {
                    const expressions = detections[0].expressions;
                    // Find the dominant emotion
                    const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                    if (dominantEmotion !== currentEmotion) {
                        setCurrentEmotion(dominantEmotion);
                        if (onEmotionChange) {
                            onEmotionChange(dominantEmotion);
                        }
                    }
                    
                    // Trigger Gender Detect
                    if (onGenderDetect) {
                        onGenderDetect(detections[0].gender); // 'male' or 'female'
                    }
                }
            }
        }, 1000); // Check every second
    };

    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden glass shadow-xl">
            <video
                ref={activeRef}
                autoPlay
                muted
                onPlay={handleVideoPlay}
                className="w-full h-full object-cover"
            />

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 glass border-white/50 text-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span>LIVE CAMERA</span>
            </div>

            {/* Emotion Badge */}
            {modelsLoaded && (
                <div className="absolute top-4 right-4 glass border-white/50 text-teal-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase backdrop-blur-md">
                    {currentEmotion}
                </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 glass border-white/50 p-3 rounded-2xl">
                <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-800 w-2/3 animate-pulse" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono font-semibold">
                    <span>BIO-METRICS: ACTIVE</span>
                    <span>ID: USER-001</span>
                </div>
            </div>
        </div>
    );
};

export default WebcamFeed;
