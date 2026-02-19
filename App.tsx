
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatAssistant from './components/ChatAssistant';
import { Spot, CategoryConfig, Language } from './types';
import { translations } from './translations';
import { FEATURED_SPOTS, INITIAL_CATEGORIES, INITIAL_NEIGHBORHOODS } from './constants';
import { translateContent } from './geminiService';

function App() {
  // Dados "Fonte da Verdade" (Sempre em Português)
  const [sourceSpots, setSourceSpots] = useState<Spot[]>(FEATURED_SPOTS);
  const [sourceCategories, setSourceCategories] = useState<CategoryConfig[]>(INITIAL_CATEGORIES);
  
  // Dados de Exibição (Podem estar traduzidos)
  const [displaySpots, setDisplaySpots] = useState<Spot[]>(FEATURED_SPOTS);
  const [displayCategories, setDisplayCategories] = useState<CategoryConfig[]>(INITIAL_CATEGORIES);

  const [neighborhoods, setNeighborhoods] = useState<string[]>(INITIAL_NEIGHBORHOODS);
  const [menuLabels, setMenuLabels] = useState({ categories: 'Categorias', neighborhoods: 'Bairros' });
  const [language, setLanguage] = useState<Language>('pt');
  const [isTranslating, setIsTranslating] = useState(false);

  // Cache de traduções para evitar recarregar
  const translationCache = useRef<{
    [key in Language]?: { spots: Spot[], categories: CategoryConfig[] }
  }>({});

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'geral' | 'bairros' | 'categorias' | 'locais'>('locais');
  
  // Admin Form States
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);
  
  const [newSpot, setNewSpot] = useState<Partial<Spot>>({
    name: '',
    neighborhood: INITIAL_NEIGHBORHOODS[0],
    category: INITIAL_CATEGORIES[0].name,
    rating: 5,
    description: '',
    images: ['https://picsum.photos/seed/rio/800/600'],
    link: ''
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', icon: '', color: '#3b82f6' });

  // Get Translation Text UI
  const t = translations[language];

  // Effect: Handle Translation Logic
  useEffect(() => {
    const handleTranslation = async () => {
      // 1. Se for PT, usa a fonte original
      if (language === 'pt') {
        setDisplaySpots(sourceSpots);
        setDisplayCategories(sourceCategories);
        return;
      }

      // 2. Se já tiver no cache (e os dados originais não mudaram significativamente), usa o cache
      // Nota: Em um app real, precisaríamos invalidar o cache se sourceSpots mudar. 
      // Para simplicidade, se o usuário adicionar um local, vamos forçar tradução.
      if (translationCache.current[language] && sourceSpots.length === translationCache.current[language]?.spots.length) {
        setDisplaySpots(translationCache.current[language]!.spots);
        setDisplayCategories(translationCache.current[language]!.categories);
        return;
      }

      // 3. Traduzir via API
      setIsTranslating(true);
      try {
        const result = await translateContent(sourceSpots, sourceCategories, language);
        
        // Salva no cache
        translationCache.current[language] = result;
        
        // Atualiza a UI
        setDisplaySpots(result.spots);
        setDisplayCategories(result.categories);
        
        // Se a categoria selecionada não for 'Todos', tenta mapear para a nova língua
        if (selectedCategory !== 'Todos') {
           // Encontra o índice da categoria original
           const index = sourceCategories.findIndex(c => c.name === selectedCategory);
           if (index !== -1 && result.categories[index]) {
             setSelectedCategory(result.categories[index].name);
           } else {
             setSelectedCategory('Todos'); // Fallback
           }
        }

      } catch (error) {
        console.error("Failed to translate", error);
        // Fallback para PT
        setDisplaySpots(sourceSpots);
        setDisplayCategories(sourceCategories);
      } finally {
        setIsTranslating(false);
      }
    };

    handleTranslation();
  }, [language, sourceSpots, sourceCategories]); // Recalcula se mudar lingua ou dados fonte

  // Date Logic
  const getFormattedDate = (lang: Language) => {
    const localeMap = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES'
    };
    
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString(localeMap[lang], options);
  };

  const [currentDate, setCurrentDate] = useState(getFormattedDate('pt'));

  useEffect(() => {
    setCurrentDate(getFormattedDate(language));
  }, [language]);

  // Helper: Calculate Contrast
  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#1f2937' : '#ffffff'; 
  };

  // Helper: Render Icon (Emoji or Image)
  const renderIcon = (icon: string) => {
    const isImage = icon.startsWith('http') || icon.startsWith('data:image');
    if (isImage) {
      return <img src={icon} alt="" className="w-5 h-5 object-contain" />;
    }
    return <span className="text-xl leading-none">{icon}</span>;
  };

  // Filter Logic (Usando displaySpots)
  const filteredSpots = displaySpots.filter(spot => {
    const matchesCategory = selectedCategory === 'Todos' || spot.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === 'Todos' || spot.neighborhood === selectedNeighborhood;
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          spot.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesNeighborhood && matchesSearch;
  });

  // Admin Actions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.user === 'admin' && loginData.pass === 'admin') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError(false);
      setLoginData({ user: '', pass: '' });
      setShowAdminPanel(true);
    } else {
      setLoginError(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if ((newSpot.images?.length || 0) >= 5) {
        alert("Máximo de 5 imagens permitido.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSpot({ ...newSpot, images: [...(newSpot.images || []), reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput) return;
    if ((newSpot.images?.length || 0) >= 5) {
      alert("Máximo de 5 imagens permitido.");
      return;
    }
    setNewSpot({ ...newSpot, images: [...(newSpot.images || []), imageUrlInput] });
    setImageUrlInput('');
  };

  const removeImage = (indexToRemove: number) => {
    setNewSpot({
      ...newSpot,
      images: newSpot.images?.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleCategoryIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategory({ ...newCategory, icon: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Ao adicionar, atualizamos o SOURCE (PT)
  const handleAddSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpot.images || newSpot.images.length === 0) {
      alert("Adicione pelo menos uma imagem.");
      return;
    }

    const id = (sourceSpots.length + 1).toString();
    const spotToAdd = { ...newSpot, id } as Spot;
    
    // Atualiza a fonte. O useEffect vai disparar e retraduzir se necessário.
    setSourceSpots([spotToAdd, ...sourceSpots]);
    
    // Invalida cache pois temos dados novos
    translationCache.current = {};

    alert('Local adicionado com sucesso!');
    setNewSpot({
      name: '',
      neighborhood: neighborhoods[0],
      category: sourceCategories[0].name,
      rating: 5,
      description: '',
      images: ['https://picsum.photos/seed/rio/800/600'],
      link: ''
    });
  };

  const handleAddNeighborhood = () => {
    if (newNeighborhood && !neighborhoods.includes(newNeighborhood)) {
      setNeighborhoods([...neighborhoods, newNeighborhood]);
      setNewNeighborhood('');
    }
  };

  const removeNeighborhood = (name: string) => {
    setNeighborhoods(neighborhoods.filter(n => n !== name));
  };

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.icon) {
      setSourceCategories([...sourceCategories, newCategory]);
      translationCache.current = {}; // Invalida cache
      setNewCategory({ name: '', icon: '', color: '#3b82f6' });
    }
  };

  const removeCategory = (name: string) => {
    setSourceCategories(sourceCategories.filter(c => c.name !== name));
    translationCache.current = {}; // Invalida cache
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        currentDate={currentDate} 
        language={language} 
        setLanguage={setLanguage} 
        t={t} 
      />
      
      {/* Loading Overlay for Translation */}
      {isTranslating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
           <p className="text-gray-600 font-bold uppercase tracking-widest text-xs animate-pulse">
             Traduzindo conteúdo com IA...
           </p>
        </div>
      )}

      <div className="flex flex-1 relative">
        <Sidebar 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedNeighborhood={selectedNeighborhood}
          setSelectedNeighborhood={setSelectedNeighborhood}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onAdminClick={() => setShowLoginModal(true)}
          isAdmin={isAdmin}
          onLogout={() => { setIsAdmin(false); setShowAdminPanel(false); }}
          neighborhoods={neighborhoods}
          categories={displayCategories} 
          menuLabels={menuLabels}
          currentDate={currentDate}
          language={language}
          setLanguage={setLanguage}
        />

        <div className="flex-1 lg:pl-72 flex flex-col">
          {/* Desktop/Tablet Header - Main Content Area */}
          <header className="hidden lg:flex justify-between items-center px-8 py-6 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg">RJ</div>
              <h1 className="text-2xl font-black text-blue-600 tracking-tighter uppercase">Vida Carioca</h1>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-4">
                {/* Language Flags - Top Right */}
                <div className="flex gap-2">
                    <button 
                      onClick={() => setLanguage('pt')} 
                      className={`text-xl hover:scale-110 transition-transform ${language === 'pt' ? 'opacity-100' : 'opacity-50 grayscale hover:grayscale-0'}`}
                      title="Português"
                    >
                      🇧🇷
                    </button>
                    <button 
                      onClick={() => setLanguage('en')} 
                      className={`text-xl hover:scale-110 transition-transform ${language === 'en' ? 'opacity-100' : 'opacity-50 grayscale hover:grayscale-0'}`}
                      title="English"
                    >
                      🇺🇸
                    </button>
                    <button 
                      onClick={() => setLanguage('es')} 
                      className={`text-xl hover:scale-110 transition-transform ${language === 'es' ? 'opacity-100' : 'opacity-50 grayscale hover:grayscale-0'}`}
                      title="Español"
                    >
                      🇪🇸
                    </button>
                </div>
                <span className="text-sm font-black text-gray-300 uppercase tracking-widest">Rio de Janeiro</span>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-blue-900 font-bold text-[11px] uppercase tracking-wider">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   {t.location}
                </div>
                <p className="text-[10px] text-gray-400 font-medium capitalize mt-0.5">{currentDate}</p>
              </div>
            </div>
          </header>

          <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2070&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Rio de Janeiro Panorâmica" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-gray-50"></div>
            <div className="relative z-10 text-center px-4 max-w-4xl w-full">
              
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 drop-shadow-lg italic tracking-tight">
                Rio de Janeiro por <span className="text-yellow-400 not-italic font-black block md:inline">Vida Carioca</span>
              </h2>

              <div className="relative max-w-xl mx-auto">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-[2rem] border border-white/30 shadow-2xl">
                  <div className="relative bg-white rounded-[1.5rem] shadow-inner flex items-center transition-all focus-within:ring-4 focus-within:ring-blue-500/20">
                    <div className="pl-6 pr-2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder={t.searchPlaceholder}
                      className="w-full py-4 pr-6 rounded-[1.5rem] focus:outline-none text-gray-800 bg-transparent font-medium placeholder:text-gray-400 text-sm md:text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 lg:hidden">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl mx-auto hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {t.filtersAndCats}
                </button>
              </div>

            </div>
          </section>

          {(selectedCategory !== 'Todos' || selectedNeighborhood !== 'Todos') && (
            <div className="px-8 py-4 bg-white border-b border-gray-100 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">{t.activeFilters}</span>
              {selectedCategory !== 'Todos' && (
                <button onClick={() => setSelectedCategory('Todos')} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-100">
                  {selectedCategory}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              {selectedNeighborhood !== 'Todos' && (
                <button onClick={() => setSelectedNeighborhood('Todos')} className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-xs font-bold flex items-center gap-1 border border-teal-100">
                  {selectedNeighborhood}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              <button onClick={() => {setSelectedCategory('Todos'); setSelectedNeighborhood('Todos');}} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                {t.clearAll}
              </button>
            </div>
          )}

          <main className="px-8 py-12 flex-1 w-full relative">
            {isAdmin && (
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-blue-900 rounded-[2rem] text-white flex justify-between items-center shadow-2xl">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-widest">{t.adminPanelTitle}</h3>
                  <p className="text-xs text-gray-300 font-medium">{t.adminPanelDesc}</p>
                </div>
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-yellow-300 transition-all shadow-lg"
                >
                  {t.enterPanel}
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
                <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">{t.curatorship}</span>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {selectedCategory === 'Todos' ? t.bestOfCity : `${t.bestIn} ${selectedCategory}`}
                </h3>
              </div>
              <div className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full uppercase tracking-widest">
                {filteredSpots.length} {t.results}
              </div>
            </div>

            {filteredSpots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredSpots.map(spot => {
                  const categoryConfig = displayCategories.find(c => c.name === spot.category);
                  const bgColor = categoryConfig?.color || '#1f2937';
                  const textColor = getContrastColor(bgColor);

                  // Fallback para gerar link do Google Maps se não houver link
                  const cardLink = spot.link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${spot.address || ''} Rio de Janeiro`)}`;

                  return (
                    <div key={spot.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={spot.images[0]} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg">
                          <span className="text-yellow-500">★</span> {spot.rating}
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span 
                            style={{ backgroundColor: bgColor, color: textColor }}
                            className="text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-xl shadow-lg border border-white/20"
                          >
                            {spot.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                          {spot.neighborhood}
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{spot.name}</h4>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">{spot.description}</p>
                        <a 
                          href={cardLink}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-auto w-full py-2.5 rounded-xl border border-gray-100 text-gray-900 font-bold text-xs hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center text-center"
                        >
                          {t.exploreSpot}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="text-5xl mb-6 opacity-40">🏖️</div>
                <h4 className="text-xl font-black text-gray-800">{t.noResultsTitle}</h4>
                <button onClick={() => {setSearchQuery(''); setSelectedCategory('Todos'); setSelectedNeighborhood('Todos');}} className="mt-10 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs uppercase tracking-widest">{t.cleanFiltersBtn}</button>
              </div>
            )}
          </main>

          <footer className="px-8 py-10 border-t border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center md:text-left">
                Rio de Janeiro por <span className="text-gray-900">Vida Carioca</span> — {t.footerMadeBy}
              </p>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">© 2025 {t.rightsReserved}</div>
            </div>
          </footer>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 text-white">🔐</div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t.loginTitle}</h2>
              <p className="text-sm text-gray-400 font-medium">{t.loginDesc}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">{t.userLabel}</label>
                <input 
                  type="text" 
                  value={loginData.user}
                  onChange={e => setLoginData({...loginData, user: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">{t.passLabel}</label>
                <input 
                  type="password" 
                  value={loginData.pass}
                  onChange={e => setLoginData({...loginData, pass: e.target.value})}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                  placeholder="••••••"
                />
              </div>
              {loginError && <p className="text-xs text-red-500 font-bold text-center">Credenciais inválidas! Tenta de novo.</p>}
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">{t.enterPanel}</button>
              <p className="text-[9px] text-gray-300 text-center uppercase tracking-[0.2em] font-bold pt-4">Credenciais de teste: admin / admin</p>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative my-8 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
            <button onClick={() => setShowAdminPanel(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 z-10 md:hidden"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            
            {/* Sidebar Admin */}
            <div className="w-full md:w-64 bg-gray-900 text-white p-8 flex flex-col">
              <div className="mb-8">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">{t.adminPanelTitle}</h2>
                <p className="text-xs text-gray-400 font-medium">{t.adminPanelDesc}</p>
              </div>
              <nav className="space-y-2 flex-1">
                <button onClick={() => setAdminTab('locais')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${adminTab === 'locais' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>{t.spotsTab}</button>
                <button onClick={() => setAdminTab('bairros')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${adminTab === 'bairros' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>{t.hoodsTab}</button>
                <button onClick={() => setAdminTab('categorias')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${adminTab === 'categorias' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>{t.catsTab}</button>
                <button onClick={() => setAdminTab('geral')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${adminTab === 'geral' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>{t.configTab}</button>
              </nav>
              <button onClick={() => setShowAdminPanel(false)} className="mt-auto flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                {t.backToSite}
              </button>
            </div>

            {/* Content Admin */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-gray-50">
              
              {/* Tab: Locais */}
              {adminTab === 'locais' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">{t.addSpotTitle}</h3>
                  <div className="mb-4 text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    ⚠️ Nota: Você está editando os dados originais em Português. As traduções serão atualizadas automaticamente.
                  </div>
                  <form onSubmit={handleAddSpot} className="grid grid-cols-1 gap-6 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Nome</label>
                        <input required type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newSpot.name} onChange={e => setNewSpot({...newSpot, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Bairro</label>
                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newSpot.neighborhood} onChange={e => setNewSpot({...newSpot, neighborhood: e.target.value})}>
                          {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Categoria</label>
                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newSpot.category} onChange={e => setNewSpot({...newSpot, category: e.target.value})}>
                          {sourceCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Nota</label>
                        <input type="number" step="0.1" max="5" min="0" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={newSpot.rating} onChange={e => setNewSpot({...newSpot, rating: parseFloat(e.target.value)})} />
                      </div>
                    </div>
                    
                    {/* Link Input */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">{t.linkLabel}</label>
                      <input 
                        type="url" 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={newSpot.link || ''} 
                        onChange={e => setNewSpot({...newSpot, link: e.target.value})} 
                        placeholder="https://maps.google.com/..."
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2 px-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Imagens ({newSpot.images?.length || 0}/5)</label>
                        {(newSpot.images?.length || 0) >= 5 && <span className="text-[10px] text-red-500 font-bold">Limite atingido</span>}
                      </div>

                      {/* Image Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                        {newSpot.images?.map((img, idx) => (
                           <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200">
                             <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                             <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                           </div>
                        ))}
                        
                        {/* Add Button Placeholder (if limit not reached) */}
                        {(newSpot.images?.length || 0) < 5 && (
                           <label className="cursor-pointer bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all rounded-xl aspect-square flex flex-col items-center justify-center gap-2 text-center group">
                             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                             <span className="text-xl group-hover:scale-110 transition-transform">📸</span>
                             <span className="text-[8px] font-bold text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">Adicionar</span>
                           </label>
                        )}
                      </div>

                      {/* URL Input (if limit not reached) */}
                      {(newSpot.images?.length || 0) < 5 && (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Ou cole uma URL aqui..."
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            value={imageUrlInput} 
                            onChange={e => setImageUrlInput(e.target.value)}
                          />
                          <button 
                            type="button" 
                            onClick={addImageUrl}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Descrição</label>
                      <textarea rows={3} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={newSpot.description} onChange={e => setNewSpot({...newSpot, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">{t.saveSpot}</button>
                  </form>
                </div>
              )}

              {/* Tab: Bairros */}
              {adminTab === 'bairros' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Gerenciar Bairros</h3>
                  <div className="flex gap-2 mb-8 max-w-lg">
                    <input 
                      type="text" 
                      placeholder="Nome do novo bairro" 
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newNeighborhood}
                      onChange={e => setNewNeighborhood(e.target.value)}
                    />
                    <button onClick={handleAddNeighborhood} className="px-6 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors">
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {neighborhoods.map(nb => (
                      <div key={nb} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                        <span className="text-sm font-medium">{nb}</span>
                        <button onClick={() => removeNeighborhood(nb)} className="text-red-400 hover:text-red-600 font-bold px-2">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Categorias */}
              {adminTab === 'categorias' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Gerenciar Categorias</h3>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 max-w-2xl shadow-sm">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Adicionar Nova</h4>
                    
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Nome</label>
                          <input 
                            type="text" placeholder="Ex: Museus" 
                            className="px-4 py-3 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Cor do Badge</label>
                          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200 h-[46px]">
                            <input 
                              type="color" 
                              className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                              value={newCategory.color} 
                              onChange={e => setNewCategory({...newCategory, color: e.target.value})}
                            />
                            <div 
                              style={{ backgroundColor: newCategory.color, color: getContrastColor(newCategory.color) }}
                              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest flex-1 text-center shadow-sm truncate"
                            >
                              Preview
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block px-2">Ícone (Emoji ou Upload)</label>
                        <div className="flex gap-2">
                           {/* Upload Button */}
                           <label className="cursor-pointer bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all rounded-xl p-3 flex items-center justify-center gap-2 group w-1/3">
                             <input type="file" accept="image/*" className="hidden" onChange={handleCategoryIconUpload} />
                             <span className="text-lg group-hover:scale-110 transition-transform">📁</span>
                             <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600 uppercase">Upload</span>
                           </label>
                           
                           {/* Text Input for Emoji */}
                           <div className="flex-1 relative">
                             <input 
                              type="text" placeholder="Cole um Emoji ou use o Upload" 
                              className="px-4 py-3 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                              value={newCategory.icon.startsWith('data:') ? '' : newCategory.icon} 
                              onChange={e => setNewCategory({...newCategory, icon: e.target.value})}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              {newCategory.icon.startsWith('data:') ? (
                                <img src={newCategory.icon} className="w-5 h-5 object-contain" alt="" />
                              ) : (
                                <span className="text-lg">{newCategory.icon || '☺'}</span>
                              )}
                            </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={handleAddCategory} className="w-full py-3 bg-teal-500 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-teal-600 transition-colors text-xs">Adicionar Categoria</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sourceCategories.map(cat => (
                      <div key={cat.name} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden">
                             {renderIcon(cat.icon)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{cat.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <div className="w-4 h-4 rounded-full shadow-sm border border-gray-100" style={{ backgroundColor: cat.color }}></div>
                               <p className="text-[10px] text-gray-400 uppercase">{cat.color}</p>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeCategory(cat.name)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Geral */}
              {adminTab === 'geral' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Configurações Gerais</h3>
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-xl">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-6">Títulos da Sidebar</h4>
                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Título da Seção de Categorias</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          value={menuLabels.categories}
                          onChange={e => setMenuLabels({...menuLabels, categories: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Título da Seção de Bairros</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          value={menuLabels.neighborhoods}
                          onChange={e => setMenuLabels({...menuLabels, neighborhoods: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <ChatAssistant />
    </div>
  );
}

export default App;
