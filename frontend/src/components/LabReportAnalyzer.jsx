import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

const LabReportAnalyzer = ({ onReportAnalyzed }) => {
  const [labData, setLabData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      // Convert image to base64
      const base64Str = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('http://localhost:5000/api/analyze_lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Str }),
      });

      const data = await res.json();
      if (data.success) {
        setLabData(data.data);
        if (onReportAnalyzed) {
          onReportAnalyzed(data.data);
        }
      } else {
        setError(data.error || 'Failed to analyze lab report');
      }
    } catch (err) {
      setError('Connection error while analyzing report');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col glass rounded-3xl overflow-hidden shadow-xl relative mt-4">
      <div className="p-4 border-b border-white/40 bg-white/40 flex justify-between items-center z-10 relative">
        <h3 className="text-slate-800 font-bold flex items-center gap-2 text-sm tracking-wide">
          <FileText size={16} className="text-slate-800" />
          LAB REPORT OCR
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs glass hover:bg-white/60 text-slate-700 px-4 py-2 rounded-full flex items-center gap-2 transition-colors font-semibold"
          disabled={isUploading}
        >
          <Upload size={14} />
          {isUploading ? 'ANALYZING...' : 'UPLOAD IMAGE'}
        </button>
        <input 
          type="file" 
          accept="image/png, image/jpeg" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
        />
      </div>

      <div className="flex-1 relative bg-white/50 overflow-y-auto custom-scrollbar p-2">
        {labData ? (
          <div className="w-full">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 uppercase bg-white/40">
                <tr>
                  <th className="px-3 py-2 rounded-tl-lg">Test Name</th>
                  <th className="px-3 py-2">Result</th>
                  <th className="px-3 py-2">Normal Range</th>
                  <th className="px-3 py-2 rounded-tr-lg text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {labData.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-700">{row.test_name}</td>
                    <td className="px-3 py-2 font-bold text-slate-800">{row.result}</td>
                    <td className="px-3 py-2 text-slate-500">{row.normal_range}</td>
                    <td className="px-3 py-2 text-center">
                      {row.status.toLowerCase() === 'normal' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 size={12} /> NORMAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          <AlertCircle size={12} /> {row.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
            <FileText size={24} className="opacity-50" />
            <p>AWAITING LAB REPORT</p>
            {error && <p className="text-red-500 mt-2 text-center px-4 font-sans">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReportAnalyzer;
