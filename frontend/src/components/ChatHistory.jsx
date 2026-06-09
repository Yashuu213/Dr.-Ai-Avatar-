import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Safe text renderer to replace react-markdown which was crashing
const renderText = (text) => {
    if (!text) return null;
    
    // Split by double newlines for paragraphs
    return text.split('\n').map((paragraph, pIdx) => {
        if (!paragraph.trim()) return null;
        
        // Split by ** for bold
        const parts = paragraph.split('**');
        return (
            <p key={pIdx} className="mb-2 last:mb-0">
                {parts.map((part, i) => {
                    if (i % 2 === 1) {
                        return <strong key={i} className="text-blue-600 font-semibold">{part}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </p>
        );
    });
};

const ChatHistory = ({ messages }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full w-full glass rounded-3xl overflow-hidden shadow-xl"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/40 bg-white/40 flex justify-between items-center z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <h2 className="text-slate-800 font-bold text-xs tracking-widest uppercase">LIVE TRANSCRIPT</h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono font-semibold tracking-wider">SECURE CONNECTION</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-white/10" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className="flex flex-col relative pl-4 border-l-2 border-slate-200"
                    >
                        {/* Speaker Label */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold tracking-widest font-mono uppercase ${msg.role === 'user' ? 'text-teal-600' : 'text-blue-600'}`}>
                                {msg.role === 'user' ? 'PATIENT' : 'DR. AI AVATAR'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>

                        {/* Message Content */}
                        <div className="text-sm leading-relaxed text-slate-700 font-medium">
                            {msg.role === 'user' ? (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                                <div>{renderText(msg.content)}</div>
                            )}
                        </div>
                    </motion.div>
                ))}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 gap-3">
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                        <div className="text-[10px] font-mono tracking-widest uppercase">Awaiting Audio Input...</div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatHistory;
