import React, { useState, useRef } from 'react';
import { Upload, Activity } from 'lucide-react';

const DicomViewer = () => {
  const [metadata, setMetadata] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload_dicom', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMetadata(data.metadata);
      } else {
        setError(data.error || 'Failed to upload DICOM');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl overflow-hidden glass shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
      <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center z-10 relative">
        <h3 className="text-cyan-400 font-mono font-bold flex items-center gap-2 text-sm">
          <Activity size={16} />
          3D DICOM AI
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs bg-cyan-950 hover:bg-cyan-900 text-cyan-200 px-3 py-1.5 rounded flex items-center gap-2 transition-colors border border-cyan-500/50"
          disabled={isUploading}
        >
          <Upload size={14} />
          {isUploading ? 'SCANNING...' : 'UPLOAD .DCM'}
        </button>
        <input 
          type="file" 
          accept=".dcm" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
        />
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black/60 overflow-hidden">
        {metadata ? (
          <>
            {/* Simulated 3D Scan View */}
            <div className="absolute inset-0 flex items-center justify-center opacity-60">
              <div className="w-48 h-48 border-4 border-cyan-500 rounded-full animate-[spin_4s_linear_infinite] shadow-[0_0_50px_rgba(6,182,212,0.8)] border-t-transparent border-l-transparent"></div>
              <div className="absolute w-32 h-32 border-4 border-blue-500 rounded-full animate-[spin_3s_linear_infinite_reverse] border-b-transparent border-r-transparent"></div>
            </div>
            
            {/* Scanning Line overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-500/0 to-cyan-500/20 border-b border-cyan-400 animate-pulse"></div>

            {/* Metadata Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/80 border border-cyan-500/30 p-3 rounded-xl text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-slate-400">PATIENT: <span className="text-cyan-400">{metadata.PatientName}</span></div>
                <div className="text-slate-400">ID: <span className="text-cyan-400">{metadata.PatientID}</span></div>
                <div className="text-slate-400">MODALITY: <span className="text-cyan-400">{metadata.Modality}</span></div>
                <div className="text-slate-400">BODY PART: <span className="text-cyan-400">{metadata.BodyPartExamined}</span></div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
            <Activity size={24} className="opacity-50" />
            <p>AWAITING DICOM FILE</p>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default DicomViewer;
