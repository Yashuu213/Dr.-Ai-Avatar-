import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import HospitalDashboard from './components/HospitalDashboard.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary fallback={<div className="p-10 text-red-600 bg-red-100 rounded-lg m-10 border border-red-500 font-mono text-sm"><h1>Fatal Application Error</h1><p>Check the browser console for exact error.</p></div>}>
      {path === '/hospital' ? <HospitalDashboard /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
)
