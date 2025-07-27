import React from 'react';
import { ForexDataProvider } from './contexts/ForexDataContext';
import ForexDashboard from './components/ForexDashboard';
import './App.css';

function App() {
  return (
    <ForexDataProvider>
      <div className="App">
        <header className="bg-slate-900 text-white p-4 shadow-lg">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold">
              Perfect Retail Forex Macro Scoring Model V07
            </h1>
            <p className="text-slate-300 mt-2">
              Professional-grade forex analysis made simple
            </p>
          </div>
        </header>
        
        <main className="container mx-auto p-4">
          <ForexDashboard />
        </main>
        
        <footer className="bg-slate-100 p-4 mt-8">
          <div className="container mx-auto text-center text-slate-600">
            <p>© 2025 Forex Macro Model V07 - Trade with institutional-grade analysis</p>
          </div>
        </footer>
      </div>
    </ForexDataProvider>
  );
}

export default App;