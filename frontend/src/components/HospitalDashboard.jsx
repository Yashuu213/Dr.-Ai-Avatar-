import React, { useState } from 'react';
import { Users, Activity, FileText, Settings, Search, Bell, Menu } from 'lucide-react';

const mockQueue = [
  { id: 'PT-1092', name: 'Unknown (Live)', age: 45, gender: 'Male', symptom: 'Severe chest pain, left arm numbness', level: 1, time: '2 mins ago', status: 'WAITING' },
  { id: 'PT-1091', name: 'Sarah Connor', age: 32, gender: 'Female', symptom: 'High fever, continuous cough', level: 3, time: '14 mins ago', status: 'TRIAGED' },
  { id: 'PT-1090', name: 'Amit Patel', age: 58, gender: 'Male', symptom: 'Routine diabetes checkup', level: 5, time: '45 mins ago', status: 'IN_CONSULT' },
  { id: 'PT-1089', name: 'Priya Sharma', age: 24, gender: 'Female', symptom: 'Severe migraine with aura', level: 2, time: '1 hr ago', status: 'WAITING' },
  { id: 'PT-1088', name: 'John Doe', age: 41, gender: 'Male', symptom: 'Sprained ankle', level: 4, time: '2 hrs ago', status: 'DISCHARGED' },
];

const getLevelColor = (level) => {
  switch (level) {
    case 1: return 'bg-red-100 text-red-700 border-red-200';
    case 2: return 'bg-orange-100 text-orange-700 border-orange-200';
    case 3: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 4: return 'bg-blue-100 text-blue-700 border-blue-200';
    case 5: return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getLevelLabel = (level) => {
  switch (level) {
    case 1: return 'CRITICAL';
    case 2: return 'URGENT';
    case 3: return 'ELEVATED';
    case 4: return 'STANDARD';
    case 5: return 'ROUTINE';
    default: return 'UNKNOWN';
  }
};

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('queue');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <Activity className="text-blue-400 w-8 h-8" />
          <h1 className="text-white font-bold tracking-wider uppercase text-sm">Aegis EMR</h1>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-2">
          <button onClick={() => setActiveTab('queue')} className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-colors ${activeTab === 'queue' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5" /> Live Queue
          </button>
          <button onClick={() => setActiveTab('records')} className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-colors ${activeTab === 'records' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}>
            <FileText className="w-5 h-5" /> Patient Records
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-6 py-3 w-full text-left transition-colors ${activeTab === 'settings' ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Settings className="w-5 h-5" /> Settings
          </button>
        </div>
        <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
          Logged in as Dr. Sharma<br/>Cardiology Dept.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-slate-500">
            <Menu className="w-5 h-5 cursor-pointer" />
            <span className="font-semibold text-slate-800">Live AI Triage Queue</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search Patient ID..." className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-800" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="flex-1 overflow-auto p-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <span className="text-slate-500 text-sm font-semibold">Total Waiting</span>
              <span className="text-3xl font-bold text-slate-800">14</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <span className="text-slate-500 text-sm font-semibold">Critical (L1/L2)</span>
              <span className="text-3xl font-bold text-red-600">2</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <span className="text-slate-500 text-sm font-semibold">Avg Triage Time</span>
              <span className="text-3xl font-bold text-slate-800">1.2m</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
              <span className="text-slate-500 text-sm font-semibold">AI Confidence</span>
              <span className="text-3xl font-bold text-emerald-600">96%</span>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">Incoming Patients</h2>
              <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-white">
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Patient ID</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Name & Demographics</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Primary Symptom</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">AI Triage Level</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Time</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockQueue.map((patient, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">{patient.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{patient.name}</div>
                        <div className="text-xs text-slate-500">{patient.age}y • {patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{patient.symptom}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getLevelColor(patient.level)}`}>
                          LVL {patient.level} - {getLevelLabel(patient.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{patient.time}</td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
                          View SOAP Note
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
