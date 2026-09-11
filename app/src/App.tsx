import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Group from './pages/Group.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0f] relative">
        {/* Background Mesh */}
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <div className="fixed inset-0 noise pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <a href="/" className="flex items-center space-x-3 group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4c6ef5] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#4c6ef5]/20 group-hover:shadow-[#4c6ef5]/40 transition-shadow">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold gradient-text">CryptoSplit</span>
                </a>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-surface-500 hidden sm:inline font-mono">Midnight Network</span>
                  <a
                    href="https://x.com/CryptoSplit4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-surface-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/Aryann-4/cryptosplit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-surface-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/group/:address" element={<Group />} />
            </Routes>
          </main>

          <footer className="border-t border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4c6ef5] to-[#7c3aed] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-surface-400">CryptoSplit</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-surface-500">
                  <span>Privacy-Preserving Bill Splitter</span>
                  <span className="hidden sm:inline text-surface-700">|</span>
                  <span className="hidden sm:inline">Built on Midnight Network</span>
                  <span className="hidden sm:inline text-surface-700">|</span>
                  <a href="https://x.com/CryptoSplit4" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@CryptoSplit4</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}
