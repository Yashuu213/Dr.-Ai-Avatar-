import React from 'react';
import { motion } from 'framer-motion';

const Avatar = ({ talking }) => {
    return (
        <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
            {/* Sci-fi ring animation */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-cyan-500/30 rounded-full border-t-cyan-400"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-2 border-blue-500/20 rounded-full border-b-blue-400"
            />

            {/* Avatar Image Placeholder */}
            <div className="relative z-10 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-b from-slate-800 to-slate-900 rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.5)]">
                {/* Simple "Face" representation */}
                <div className="flex space-x-8">
                    <motion.div
                        animate={{ height: talking ? [10, 30, 10] : 10 }}
                        transition={{ duration: 0.2, repeat: talking ? Infinity : 0 }}
                        className="w-8 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
                    />
                    <motion.div
                        animate={{ height: talking ? [10, 30, 10] : 10 }}
                        transition={{ duration: 0.2, repeat: talking ? Infinity : 0, delay: 0.1 }}
                        className="w-8 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
                    />
                </div>
            </div>

            {/* Status indicator */}
            <div className="absolute bottom-[-20px] bg-black/50 px-4 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest backdrop-blur-sm">
                AI Medical System Online
            </div>
        </div>
    );
};

export default Avatar;
