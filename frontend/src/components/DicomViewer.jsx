import React, { useState, useRef } from 'react';
import { Upload, Activity } from 'lucide-react';

const DicomViewer = ({ onDicomAnalyzed }) => {
  const [metadata, setMetadata] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
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
        if (data.image_base64) {
          setImageBase64(data.image_base64);
        }
        if (onDicomAnalyzed) {
          onDicomAnalyzed(data.metadata, data.image_base64);
        }
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
    <div className="w-full h-full flex flex-col glass rounded-3xl overflow-hidden shadow-xl relative">
      <div className="p-4 border-b border-white/40 bg-white/40 flex justify-between items-center z-10 relative">
        <h3 className="text-slate-800 font-bold flex items-center gap-2 text-sm tracking-wide">
          <Activity size={16} className="text-slate-800" />
          3D DICOM AI
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs glass hover:bg-white/60 text-slate-700 px-4 py-2 rounded-full flex items-center gap-2 transition-colors font-semibold"
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

      <div className="flex-1 relative flex items-center justify-center bg-white/20 overflow-hidden">
        {metadata ? (
          <>
            {/* Scan Image or Simulation */}
            {imageBase64 ? (
              <img src={`data:image/jpeg;base64,${imageBase64}`} alt="DICOM Scan" className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-80" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-60">
                <div className="w-48 h-48 border-4 border-blue-200 rounded-full animate-[spin_4s_linear_infinite] shadow-[0_0_30px_rgba(59,130,246,0.3)] border-t-transparent border-l-transparent"></div>
                <div className="absolute w-32 h-32 border-4 border-blue-500 rounded-full animate-[spin_3s_linear_infinite_reverse] border-b-transparent border-r-transparent"></div>
              </div>
            )}
            
            {/* Scanning Line overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/0 to-blue-500/10 border-b border-blue-200 animate-pulse"></div>

            {/* Metadata Overlay */}
            <div className="absolute bottom-4 left-4 right-4 glass p-3 rounded-2xl text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-slate-500">PATIENT: <span className="text-slate-800 font-semibold">{metadata.PatientName}</span></div>
                <div className="text-slate-500">ID: <span className="text-slate-800 font-semibold">{metadata.PatientID}</span></div>
                <div className="text-slate-500">MODALITY: <span className="text-slate-800 font-semibold">{metadata.Modality}</span></div>
                <div className="text-slate-500">BODY PART: <span className="text-slate-800 font-semibold">{metadata.BodyPartExamined}</span></div>
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
