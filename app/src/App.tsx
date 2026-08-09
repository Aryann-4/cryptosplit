import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Group from './pages/Group.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-midnight-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <span className="text-xl font-bold text-gray-900">CryptoSplit</span>
              </a>
              <p className="text-sm text-gray-500">Decentralized Bill Splitter</p>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/group/:address" element={<Group />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
