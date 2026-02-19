
import React from 'react';
import { Language } from '../types';

interface HeaderProps {
  currentDate: string;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const Header: React.FC<HeaderProps> = ({ currentDate, language, setLanguage, t }) => {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-gray-100 lg:hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-lg font-black text-white shadow shadow-yellow-200">
              RJ
            </div>
            <h1 className="text-sm font-black bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent uppercase tracking-widest hidden xs:block">
              Vida Carioca
            </h1>
          </div>

          {/* Info & Flags */}
          <div className="flex flex-col items-end gap-1">
            {/* Flags */}
            <div className="flex gap-2 mb-0.5">
              <button 
                onClick={() => setLanguage('pt')} 
                className={`text-lg hover:scale-110 transition-transform ${language === 'pt' ? 'opacity-100' : 'opacity-40 grayscale'}`}
              >
                🇧🇷
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`text-lg hover:scale-110 transition-transform ${language === 'en' ? 'opacity-100' : 'opacity-40 grayscale'}`}
              >
                🇺🇸
              </button>
              <button 
                onClick={() => setLanguage('es')} 
                className={`text-lg hover:scale-110 transition-transform ${language === 'es' ? 'opacity-100' : 'opacity-40 grayscale'}`}
              >
                🇪🇸
              </button>
            </div>

            {/* Location & Date */}
            <div className="flex flex-col items-end">
              <div className="flex items-center justify-end gap-1 text-blue-900 font-bold text-[10px] uppercase tracking-wider">
                  <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {t.location}
              </div>
              <p className="text-[9px] text-gray-500 font-medium capitalize leading-tight">
                {currentDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
