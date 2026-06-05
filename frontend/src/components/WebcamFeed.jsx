import React, { useEffect, useRef } from 'react';

const WebcamFeed = ({ feedRef }) => {
    const defaultVideoRef = useRef(null);
    const activeRef = feedRef || defaultVideoRef;

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

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden glass shadow-2xl border border-white/10">
            <video
                ref={activeRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
            />

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 bg-red-500/20 border border-red-500/50 text-red-100 px-3 py-1 rounded-full text-xs font-mono flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>LIVE FEED</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-2/3 animate-pulse" />
                </div>
                <div className="flex justify-between text-[10px] text-cyan-200/50 mt-1 font-mono">
                    <span>BIO-METRICS: ACTIVE</span>
                    <span>ID: USER-001</span>
                </div>
            </div>
        </div>
    );
};

export default WebcamFeed;
