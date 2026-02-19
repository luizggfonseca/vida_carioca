
import React, { useState } from 'react';
import { CategoryConfig, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (n: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAdminClick: () => void;
  isAdmin: boolean;
  onLogout: () => void;
  neighborhoods: string[];
  categories: CategoryConfig[];
  menuLabels: { categories: string; neighborhoods: string };
  currentDate: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedNeighborhood, 
  setSelectedNeighborhood,
  isOpen,
  setIsOpen,
  onAdminClick,
  isAdmin,
  onLogout,
  neighborhoods,
  categories,
  menuLabels,
  currentDate,
  language,
  setLanguage
}) => {
  const [openSection, setOpenSection] = useState<string | null>('categorias');
  const t = translations[language];

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const renderIcon = (icon: string) => {
    const isImage = icon.startsWith('http') || icon.startsWith('data:image');
    if (isImage) {
      return <img src={icon} alt="" className="w-5 h-5 object-contain" />;
    }
    return <span className="text-lg leading-none">{icon}</span>;
  };

  return (
    <>
      {/* Overlay para Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 z-[55] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-8 border-b border-gray-50 bg-gradient-to-br from-blue-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg rotate-3">
                RJ
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold">Rio de Janeiro por</span>
                <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Vida Carioca</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Seção Categorias */}
            <div className="space-y-2">
              <button 
                onClick={() => toggleSection('categorias')}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span className="text-sm uppercase tracking-widest">
                    {menuLabels.categories === 'Categorias' ? t.categoriesTitle : menuLabels.categories}
                  </span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${openSection === 'categorias' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'categorias' && (
                <div className="pl-4 space-y-1 animate-in slide-in-from-top-2">
                  <button
                    onClick={() => setSelectedCategory('Todos')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedCategory === 'Todos' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {t.exploreAll}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedCategory === cat.name ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {renderIcon(cat.icon)}
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Seção Bairros */}
            <div className="space-y-2">
              <button 
                onClick={() => toggleSection('bairros')}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-bold transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏙️</span>
                  <span className="text-sm uppercase tracking-widest">
                    {menuLabels.neighborhoods === 'Bairros' ? t.neighborhoodsTitle : menuLabels.neighborhoods}
                  </span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${openSection === 'bairros' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openSection === 'bairros' && (
                <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => setSelectedNeighborhood('Todos')}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedNeighborhood === 'Todos' ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {t.all}
                  </button>
                  {neighborhoods.map(nb => (
                    <button
                      key={nb}
                      onClick={() => setSelectedNeighborhood(nb)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedNeighborhood === nb ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {nb}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botão Admin */}
          <div className="p-8 border-t border-gray-50 bg-gray-50/50">
            <button 
              onClick={isAdmin ? onLogout : onAdminClick}
              className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${
                isAdmin 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-white text-gray-400 hover:text-gray-900 border border-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {isAdmin ? t.exitAdmin : t.adminAccess}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
