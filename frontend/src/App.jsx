import React, { useState, useEffect, useRef } from 'react';
import WebcamFeed from './components/WebcamFeed';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import ReportModal from './components/ReportModal';
import { FileText, Power } from 'lucide-react';

// Simple TTS helper
const speak = (text, setTalking) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Stop overlap
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.onstart = () => setTalking(true);
  utterance.onend = () => setTalking(false);
  window.speechSynthesis.speak(utterance);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [talking, setTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Report State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);

    let imageBase64 = null;
    if (webcamRef.current && webcamRef.current.readyState >= 2) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = webcamRef.current.videoWidth;
        canvas.height = webcamRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);
        imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
      } catch (err) {
        console.error("Failed to capture webcam frame", err);
      }
    }

    let attachedFileData = null;
    if (attachedFile) {
      try {
        const base64Str = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(attachedFile);
        });
        attachedFileData = {
          name: attachedFile.name,
          type: attachedFile.type,
          data: base64Str
        };
      } catch (err) {
        console.error("Failed to read attached file", err);
      }
    }

    // Clear input and attached file immediately
    setInput('');
    setAttachedFile(null);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.content, 
          image: imageBase64,
          attached_file: attachedFileData
        })
      });

      const data = await res.json();
      const aiMsg = { role: 'assistant', content: data.text || "Error retrieving response." };

      setMessages(prev => [...prev, aiMsg]);
      speak(data.audio_text || data.text, setTalking);

    } catch (error) {
      console.error("Backend Error:", error);
      const errorMsg = { role: 'assistant', content: "Connection Error." };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleEndSession = async () => {
    setIsReportOpen(true);
    setIsGeneratingReport(true);

    try {
      const res = await fetch('http://localhost:5000/api/report');
      const data = await res.json();
      setReportContent(data.report);
    } catch (error) {
      console.error("Report Generation Error:", error);
      setReportContent("Error generating report. Please check the backend connection.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const initialMessage = "System Online. Medical AI Assistant Ready. Hello. I am here to help. What is your full name?";
      setMessages([{
        role: 'assistant',
        content: initialMessage
      }]);
      speak(initialMessage, setTalking);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900 text-white font-sans selection:bg-cyan-500/30">

      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">

        {/* Header Actions (End Session) */}


        {/* Top Section */}
        <div className="flex-1 flex flex-row">

          {/* Left: Chat History */}
          <div className="w-1/3 h-full flex items-center justify-start pl-8 pt-12">
            <ChatHistory messages={messages} />
          </div>

          {/* Center: Spacer */}
          <div className="w-1/3 h-full flex items-center justify-center">
          </div>

          {/* Right: User Webcam (Large) */}
          <div className="w-1/3 h-full flex items-start justify-end pr-8 pt-12">
            <div className="w-full aspect-video max-w-lg rounded-2xl overflow-hidden glass shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20">
              <WebcamFeed feedRef={webcamRef} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Input */}
        <div className="p-4 bg-black/40 border-t border-white/10 relative z-10">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isListening={isListening}
            toggleListening={toggleListening}
            attachedFile={attachedFile}
            setAttachedFile={setAttachedFile}
          />
        </div>

          {/* End Session Button - Bottom Right */}
          <div className="absolute right-8 bottom-8 z-50">
            <button
              onClick={handleEndSession}
              className="flex items-center space-x-3 bg-red-950/40 hover:bg-red-900/60 text-red-100 border border-red-500/40 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] group"
            >
              <Power size={18} className="group-hover:scale-110 transition-transform text-red-400" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold">End Session</span>
            </button>
          </div>
        </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={reportContent}
        isLoading={isGeneratingReport}
      />

    </div>
  );
}

export default App;
