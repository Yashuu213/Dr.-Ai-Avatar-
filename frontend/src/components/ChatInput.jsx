import React, { useRef } from 'react';
import { Send, Mic, Paperclip, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInput = ({ input, setInput, onSend, isListening, toggleListening, attachedFile, setAttachedFile }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedFile(e.target.files[0]);
        }
    };
    return (
        <div className="w-full max-w-2xl mx-auto">
            <motion.form
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onSubmit={(e) => { e.preventDefault(); onSend(); }}
                className="relative flex items-center glass rounded-full px-2 py-2"
            >
                {/* Mic Button */}
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-slate-900 animate-pulse shadow-[0_0_20px_red]' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                >
                    <Mic size={20} />
                </button>

                {/* Attach Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full transition-all duration-300 hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                >
                    <Paperclip size={20} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden"
                />

                {/* Text Input */}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type here..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 px-4 text-base"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!input.trim() && !attachedFile}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-900/20"
                >
                    <span className="text-xs tracking-widest">SEND</span>
                </button>
            </motion.form>

            {/* Attached File Badge */}
            {attachedFile && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-16 left-4 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs backdrop-blur-md shadow-lg"
                >
                    <Paperclip size={14} />
                    <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                    <button 
                        onClick={() => setAttachedFile(null)}
                        className="ml-2 hover:bg-cyan-800 rounded-full p-0.5 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ChatInput;
