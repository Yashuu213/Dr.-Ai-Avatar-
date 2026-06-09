import React, { useState, useEffect, useRef } from 'react';
import WebcamFeed from './components/WebcamFeed';
import ChatHistory from './components/ChatHistory';
import ChatInput from './components/ChatInput';
import ReportModal from './components/ReportModal';
import ApiKeyModal from './components/ApiKeyModal';
import DicomViewer from './components/DicomViewer';
import DoctorAvatar3D from './components/DoctorAvatar3D';
import AIAvatarOrb from './components/AIAvatarOrb';
import { Power } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

// Simple TTS helper
const speak = (text, setTalking, voiceGender = 'female') => {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => setTalking(true);
  utterance.onend = () => setTalking(false);
  
  // Try to pick a matching voice
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voiceGender === 'female' 
    ? voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
    : voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'));
    
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [talking, setTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true); // default true to avoid flash
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState('female');
  const [interactionWarning, setInteractionWarning] = useState(null);
  const [triageAlert, setTriageAlert] = useState(null);
  const [emotion, setEmotion] = useState('neutral');

  // Report State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const audioRef = useRef(null);

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
      // Voice Interruption: Stop AI if it's currently speaking
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setTalking(false);
      
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
          attached_file: attachedFileData,
          voice_gender: voiceGender,
          emotion: emotion
        })
      });

      const data = await res.json();
      const aiMsg = { role: 'assistant', content: data.text || "Error retrieving response." };

      setMessages(prev => [...prev, aiMsg]);
      
      // Phase 3: Criticality Scoring
      if (data.criticality_level && data.criticality_level <= 2) {
        setTriageAlert({ level: data.criticality_level, department: data.department });
      } else {
        setTriageAlert(null);
      }
      
      if (data.audio_base64) {
        const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
        audioRef.current = audio;
        audio.onplay = () => setTalking(true);
        audio.onended = () => {
          setTalking(false);
          if (audioRef.current === audio) audioRef.current = null;
        };
        audio.play().catch(err => {
          console.error("Audio playback failed:", err);
          setTalking(false);
        });
      } else {
        speak(data.audio_text || data.text, setTalking, voiceGender);
      }

      // Phase 2: Check for Drug Interactions
      try {
        const intRes = await fetch('http://localhost:5000/api/check_interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicine: data.text })
        });
        const intData = await intRes.json();
        if (intData.has_interaction) {
          setInteractionWarning(intData.message);
          // Auto-clear warning after 15 seconds
          setTimeout(() => setInteractionWarning(null), 15000);
        }
      } catch (err) {
        console.error("Failed to check interaction:", err);
      }

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

  const handleGenerateSOAP = async () => {
    setIsReportOpen(true);
    setIsGeneratingReport(true);

    try {
      const res = await fetch('http://localhost:5000/api/generate_soap');
      const data = await res.json();
      setReportContent(data.soap_note);
    } catch (error) {
      console.error("SOAP Generation Error:", error);
      setReportContent("Error generating SOAP note. Please check the backend connection.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    // Check if backend has keys
    fetch('http://localhost:5000/api/config-status')
      .then(res => res.json())
      .then(data => {
        setIsConfigured(data.configured);
        setIsLoadingConfig(false);
        
        if (data.configured) {
          startGreetingTimer();
        }
      })
      .catch(err => {
        console.error("Failed to fetch config status", err);
        setIsLoadingConfig(false);
      });
  }, []);

  const startGreetingTimer = () => {
    const timer = setTimeout(() => {
      const initialMessage = "System Online. Medical AI Assistant Ready. Hello. I am here to help. What is your full name?";
      setMessages([{
        role: 'assistant',
        content: initialMessage
      }]);
      speak(initialMessage, setTalking, voiceGender);
    }, 2000);

    return () => clearTimeout(timer);
  };

  const handleConfigSaved = () => {
    setIsConfigured(true);
    startGreetingTimer();
  };

  if (isLoadingConfig) {
    return <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-cyan-500 font-mono">Initializing System...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden text-slate-800 font-sans bg-slate-50">
      
      {!isConfigured && <ApiKeyModal onSave={handleConfigSaved} />}

      {/* Modern Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
        
        {/* Animated Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-300/40 blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-300/30 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-300/30 blur-[90px] animate-[pulse_12s_ease-in-out_infinite]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
        
        {/* Top Header with Voice Toggle */}
        <div className="absolute top-6 right-8 flex items-center gap-4 z-50">
          <div className="bg-white/40 backdrop-blur-md rounded-full px-1 py-1 flex border border-white/50 shadow-sm text-xs font-semibold">
            <button 
              onClick={() => setVoiceGender('female')} 
              className={`px-4 py-1.5 rounded-full transition-all ${voiceGender === 'female' ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              👩‍⚕️ Dr. Sarah
            </button>
            <button 
              onClick={() => setVoiceGender('male')} 
              className={`px-4 py-1.5 rounded-full transition-all ${voiceGender === 'male' ? 'bg-white shadow-md text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              👨‍⚕️ Dr. John
            </button>
          </div>
        </div>

        {/* Header Actions & Warnings */}
        {interactionWarning && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500 text-red-200 px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center gap-4 max-w-2xl animate-pulse">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-bold text-red-400">PHARMACOGENOMICS ALERT</p>
              <p className="text-sm">{interactionWarning}</p>
            </div>
            <button onClick={() => setInteractionWarning(null)} className="ml-auto text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Phase 3: Triage Alert Box */}
        {triageAlert && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-50 border-2 border-red-500 text-red-900 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-2xl animate-pulse">
            <span className="text-5xl">🚑</span>
            <div className="text-center">
              <p className="font-bold text-2xl mb-2 text-red-700">CRITICAL EMERGENCY DETECTED</p>
              <p className="text-lg">Your symptoms indicate a Level {triageAlert.level} criticality. Please bypass AI intake immediately.</p>
              <p className="font-semibold mt-2">Recommended Department: {triageAlert.department}</p>
            </div>
            <div className="flex gap-4 mt-4">
               <button onClick={() => setTriageAlert(null)} className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors">Continue Intake</button>
               <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-transform hover:scale-105">Book Emergency Appointment</button>
            </div>
          </div>
        )}

        {/* Main 3-Column Telehealth Layout */}
        <div className="flex-1 flex flex-row px-8 pt-10 pb-4 gap-8 relative z-10 w-full max-w-[1800px] mx-auto min-h-0">
          
          {/* Left Column: Live Transcript */}
          <div className="w-[32%] h-full flex flex-col justify-start min-h-0">
            <ChatHistory messages={messages} />
          </div>

          {/* Center Column: AI Avatar Orb / 3D Avatar */}
          <div className="w-[36%] h-full flex items-center justify-center relative">
            <ErrorBoundary fallback={<AIAvatarOrb isTalking={talking} />}>
              <React.Suspense fallback={<div className="glass rounded-3xl w-full h-full flex items-center justify-center">Loading 3D Avatar...</div>}>
                <DoctorAvatar3D isTalking={talking} />
              </React.Suspense>
            </ErrorBoundary>
          </div>

          {/* Right Column: Diagnostics (Webcam & DICOM) */}
          <div className="w-[32%] h-full flex flex-col justify-start gap-8">
            <div className="w-full aspect-video rounded-3xl overflow-hidden shrink-0">
              <WebcamFeed feedRef={webcamRef} onEmotionChange={setEmotion} />
            </div>
            <div className="w-full flex-1 min-h-[250px] shrink-0">
              <DicomViewer />
            </div>
          </div>

        </div>

        {/* Bottom Section: Input */}
        <div className="py-6 px-4 bg-white/40 backdrop-blur-2xl border-t border-white/60 relative z-10">
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

          {/* Action Buttons - Bottom Right */}
          <div className="absolute right-8 bottom-8 z-50 flex flex-col gap-3">
            <button
              onClick={handleGenerateSOAP}
              className="flex items-center justify-center space-x-3 glass hover:bg-white/80 text-slate-900 px-6 py-3 rounded-full transition-all duration-300 group"
            >
              <span className="font-semibold text-sm tracking-wide">Generate SOAP Note</span>
            </button>
            <button
              onClick={handleEndSession}
              className="flex items-center justify-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-xl shadow-slate-900/20 group"
            >
              <Power size={18} className="group-hover:scale-110 transition-transform text-white/80" />
              <span className="font-semibold text-sm tracking-wide">End Session</span>
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
