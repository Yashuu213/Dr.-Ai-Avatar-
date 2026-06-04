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
                        return <strong key={i} className="text-cyan-300 font-semibold">{part}</strong>;
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
            className="flex flex-col h-full max-h-[70vh] w-80 lg:w-96 glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/60"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                    <h2 className="text-cyan-400 font-mono text-xs tracking-widest uppercase">AI AVATAR</h2>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[90%] p-3 rounded-xl backdrop-blur-md border shadow-lg ${msg.role === 'user'
                            ? 'bg-cyan-900/40 border-cyan-500/30 text-cyan-50 rounded-tr-none'
                            : 'bg-slate-800/60 border-slate-600/30 text-gray-100 rounded-tl-none'
                            }`}>
                            {msg.role === 'user' ? (
                                <p className="text-sm leading-relaxed font-light whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                                <div className="text-sm leading-relaxed font-light">
                                    {renderText(msg.content)}
                                </div>
                            )}
                        </div>
                        <span className="text-[9px] opacity-40 mt-1 uppercase font-mono tracking-wider ml-1">{msg.role}</span>
                    </motion.div>
                ))}
                {messages.length === 0 && (
                    <div className="text-center text-white/20 text-xs mt-10 font-mono">
                        INITIALIZING MEDICAL DATABASE...<br />WAITING FOR INPUT.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatHistory;
