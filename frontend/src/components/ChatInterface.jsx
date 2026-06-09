import React, { useEffect, useRef } from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInterface = ({ messages, input, setInput, onSend, isListening, toggleListening }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-slate-200 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-black/20 backdrop-blur-md flex justify-between items-center">
                <h2 className="text-teal-700 font-mono text-sm tracking-wider">MEDICAL LOG</h2>
                <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl backdrop-blur-sm ${msg.role === 'user'
                                ? 'bg-teal-500/20 border border-teal-200 text-teal-800 rounded-tr-none'
                                : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <span className="text-[10px] opacity-40 mt-1 block uppercase">{msg.role}</span>
                        </div>
                    </div>
                ))}
                {messages.length === 0 && (
                    <div className="text-center text-slate-900/20 text-sm mt-10 font-mono">
                        SYSTEM READY. WAITING FOR INPUT...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black/20 border-t border-slate-200">
                <form
                    onSubmit={(e) => { e.preventDefault(); onSend(); }}
                    className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 p-2 focus-within:border-teal-300 transition-colors"
                >
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-teal-500/10 text-teal-700'}`}
                    >
                        <Mic size={20} />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your symptoms..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 text-sm h-full"
                    />

                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 bg-teal-500/20 text-teal-700 rounded-lg hover:bg-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
