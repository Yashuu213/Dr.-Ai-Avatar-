import React from 'react';
import { Send, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInput = ({ input, setInput, onSend, isListening, toggleListening }) => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.form
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onSubmit={(e) => { e.preventDefault(); onSend(); }}
                className="relative flex items-center bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                {/* Mic Button */}
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_red]' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                >
                    <Mic size={20} />
                </button>

                {/* Text Input */}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type here..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-4 text-base"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-2 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                >
                    <span className="text-xs tracking-widest">SEND</span>
                </button>
            </motion.form>
        </div>
    );
};

export default ChatInput;
