import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';

const ReportModal = ({ isOpen, onClose, report, isLoading }) => {
    const reportRef = useRef(null);

    const handleDownloadPDF = () => {
        if (!reportRef.current) return;
        const opt = {
            margin: 1,
            filename: 'Medical_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(reportRef.current).set(opt).save();
    };
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border border-gray-200 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-800"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <FileText className="text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-800 tracking-wider">MEDICAL SUMMARY REPORT</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="text-gray-500 hover:text-gray-800" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 font-sans text-gray-800 leading-relaxed scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-blue-600 font-mono animate-pulse">ANALYZING SESSION DATA...</p>
                            </div>
                        ) : (
                            <div 
                                ref={reportRef} 
                                className="prose max-w-none prose-headings:text-blue-800 prose-strong:text-gray-900 prose-li:marker:text-blue-500 p-4"
                            >
                                <ReactMarkdown>{report}</ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium">
                            Close
                        </button>
                        <button onClick={handleDownloadPDF} className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center space-x-2 text-sm font-medium">
                            <Download size={16} />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportModal;
