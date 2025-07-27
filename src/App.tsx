import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ForexDataProvider } from './contexts/ForexDataContext';
import { ThemeProvider } from './components/ThemeProvider';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import DataInput from './pages/DataInput';
import Navigation from './components/Navigation';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="forex-navigator-theme">
      <ForexDataProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/data" element={<DataInput />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </ForexDataProvider>
    </ThemeProvider>
  );
}

export default App;