import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Group from './pages/Group.tsx';
import Logo from './components/Logo.tsx';
import GradientOrbs from './components/GradientOrbs.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface-0 relative">
        <GradientOrbs />

        <div className="relative z-10">
          <header className="sticky top-0 z-50 glass border-b border-white/[0.04]">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-14">
                <a href="/" className="flex items-center">
                  <Logo size={30} variant="full" />
                </a>
                <div className="flex items-center gap-2">
                  <a
                    href="https://x.com/CryptoSplit4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-ash hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/Aryann-4/cryptosplit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-ash hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/group/:address" element={<Group />} />
            </Routes>
          </main>

          <footer className="border-t border-white/[0.04]">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <Logo size={18} variant="icon" />
                <div className="flex items-center gap-4">
                  <span className="mono-data text-[11px]">Built on Midnight Network</span>
                  <span className="text-surface-4">|</span>
                  <a href="https://x.com/CryptoSplit4" target="_blank" rel="noopener noreferrer" className="mono-data text-[11px] hover:text-white transition-colors">
                    @CryptoSplit4
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </BrowserRouter>
  );
}
