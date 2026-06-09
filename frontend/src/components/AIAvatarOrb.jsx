import React from 'react';
import { motion } from 'framer-motion';

const AIAvatarOrb = ({ isTalking }) => {
  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[400px]">
      
      {/* Outer Soundwave Rings (Only active when talking) */}
      {isTalking && (
        <>
          <div className="absolute w-64 h-64 border border-blue-400/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute w-80 h-80 border border-teal-400/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
          <div className="absolute w-96 h-96 border border-purple-400/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </>
      )}

      {/* Main Orb */}
      <motion.div 
        animate={{ 
          scale: isTalking ? [1, 1.1, 1] : [1, 1.02, 1],
          boxShadow: isTalking 
            ? ["0px 0px 40px rgba(59,130,246,0.6)", "0px 0px 80px rgba(59,130,246,0.8)", "0px 0px 40px rgba(59,130,246,0.6)"]
            : ["0px 0px 20px rgba(59,130,246,0.2)", "0px 0px 30px rgba(59,130,246,0.3)", "0px 0px 20px rgba(59,130,246,0.2)"]
        }}
        transition={{ 
          duration: isTalking ? 1 : 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-48 h-48 rounded-full bg-white/20 backdrop-blur-xl border border-white/50 flex items-center justify-center overflow-hidden z-10"
      >
        {/* Inner Core */}
        <div className={`w-32 h-32 rounded-full blur-md mix-blend-screen transition-all duration-500 ${isTalking ? 'bg-gradient-to-tr from-blue-500 to-teal-400' : 'bg-gradient-to-tr from-slate-300 to-slate-100 opacity-50'}`}></div>
        
        {/* Medical Cross Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 mix-blend-overlay">
           <div className="w-16 h-4 bg-white rounded-full absolute shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
           <div className="w-4 h-16 bg-white rounded-full absolute shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
        </div>
      </motion.div>

      {/* Status Text */}
      <div className="absolute bottom-10 flex flex-col items-center">
        <div className="text-xs tracking-[0.3em] font-mono font-bold text-slate-500 mb-2">
          {isTalking ? "ANALYZING & SPEAKING" : "LISTENING & MONITORING"}
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((i) => (
            <motion.div 
              key={i}
              animate={{ height: isTalking ? [4, 16, 4] : 4 }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              className={`w-1 rounded-full ${isTalking ? 'bg-blue-500' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAvatarOrb;
