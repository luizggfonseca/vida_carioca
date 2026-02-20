
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { translations } from './translations';
import { FEATURED_SPOTS, INITIAL_CATEGORIES, INITIAL_NEIGHBORHOODS } from './constants';
import { Spot, CategoryConfig } from './types';

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor) return '#000000';
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

function App() {
  const [sourceSpots, setSourceSpots] = useState<Spot[]>(FEATURED_SPOTS);
  const [sourceCategories, setSourceCategories] = useState<CategoryConfig[]>(INITIAL_CATEGORIES);
  const displayCategories = sourceCategories;

  const [neighborhoods, setNeighborhoods] = useState<string[]>(INITIAL_NEIGHBORHOODS);
  const [menuLabels, setMenuLabels] = useState({ categories: 'Categorias', neighborhoods: 'Bairros' });

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'locais' | 'bairros' | 'categorias' | 'geral'>('locais');

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
  const [newCategory, setNewCategory] = useState<CategoryConfig>({ name: '', icon: '', color: '#3b82f6' });

  const t = translations['pt'];

  const getFormattedDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options).toLowerCase();
  };

  const [currentDate] = useState(getFormattedDate());

  const filteredSpots = sourceSpots.filter(spot => {
    const matchesCategory = selectedCategory === 'Todos' || spot.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === 'Todos' || spot.neighborhood === selectedNeighborhood;
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) || spot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesNeighborhood && matchesSearch;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.user === 'admin' && loginData.pass === 'admin') {
      setIsAdmin(true);
      setShowLoginModal(false);
    } else {
      setLoginError(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSpot({
          ...newSpot,
          images: [...(newSpot.images || []), reader.result as string].slice(0, 5)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput) {
      setNewSpot({ ...newSpot, images: [...(newSpot.images || []), imageUrlInput].slice(0, 5) });
      setImageUrlInput('');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setNewSpot({ ...newSpot, images: (newSpot.images || []).filter((_, index) => index !== indexToRemove) });
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

  const handleAddSpot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpot.images || newSpot.images.length === 0) {
      alert("Adicione pelo menos uma imagem.");
      return;
    }
    const id = Date.now().toString();
    const spotToAdd = { ...newSpot, id } as Spot;
    setSourceSpots([spotToAdd, ...sourceSpots]);
    alert('Local adicionado com sucesso!');
    setNewSpot({ name: '', neighborhood: neighborhoods[0], category: sourceCategories[0].name, rating: 5, description: '', images: ['https://picsum.photos/seed/rio/800/600'], link: '' });
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
      setNewCategory({ name: '', icon: '', color: '#3b82f6' });
    }
  };

  const removeCategory = (name: string) => {
    setSourceCategories(sourceCategories.filter(c => c.name !== name));
  };

  const renderIcon = (icon: string) => {
    const isImage = icon.startsWith('http') || icon.startsWith('data:image');
    if (isImage) return <img src={icon} alt="" className="w-5 h-5 object-contain" />;
    return <span className="text-lg leading-none">{icon}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
      />

      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <Header currentDate={currentDate} t={t} onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-10">
          {(selectedCategory !== 'Todos' || selectedNeighborhood !== 'Todos') && (
            <div className="mb-8 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest mr-2">Filtros Ativos:</span>
              {selectedCategory !== 'Todos' && (
                <button onClick={() => setSelectedCategory('Todos')} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-blue-100 shadow-sm">{selectedCategory}</button>
              )}
              {selectedNeighborhood !== 'Todos' && (
                <button onClick={() => setSelectedNeighborhood('Todos')} className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-teal-100 shadow-sm">{selectedNeighborhood}</button>
              )}
              <button onClick={() => { setSelectedCategory('Todos'); setSelectedNeighborhood('Todos'); }} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors tracking-widest ml-2">Limpar Tudo</button>
            </div>
          )}

          {isAdmin && (
            <div className="mb-10 p-6 bg-gradient-to-r from-gray-900 to-blue-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
              <div>
                <h3 className="text-xl font-black italic tracking-widest">{t.adminPanelTitle}</h3>
                <p className="text-xs text-gray-300 font-medium">{t.adminPanelDesc}</p>
              </div>
              <button onClick={() => setShowAdminPanel(true)} className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold text-xs tracking-widest hover:bg-yellow-300 transition-all shadow-lg">{t.enterPanel}</button>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <span className="text-blue-600 font-bold tracking-widest text-xs uppercase">{t.curatorship}</span>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{selectedCategory === 'Todos' ? t.bestOfCity : `${t.bestIn} ${selectedCategory}`}</h3>
            </div>
            <div className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{filteredSpots.length} {t.results}</div>
          </div>

          <div className="mb-10 max-w-2xl">
            <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500/30">
              <div className="pl-5 pr-2 text-gray-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
              <input type="text" placeholder={t.searchPlaceholder} className="w-full py-4 pr-6 rounded-2xl focus:outline-none text-gray-800 bg-transparent font-medium placeholder:text-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {filteredSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredSpots.map(spot => {
                const categoryConfig = displayCategories.find(c => c.name === spot.category);
                return (
                  <div key={spot.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={spot.images[0]} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg"><span className="text-yellow-500">★</span> {spot.rating}</div>
                      <div className="absolute bottom-4 left-4">
                        <span style={{ backgroundColor: categoryConfig?.color || '#3b82f6', color: getContrastColor(categoryConfig?.color || '#3b82f6') }} className="text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1.5 rounded-xl shadow-lg border border-white/20">{spot.category}</span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>{spot.neighborhood}</div>
                      <h4 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{spot.name}</h4>
                      <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 mb-6">{spot.description}</p>
                      <a href={spot.link} target="_blank" rel="noopener noreferrer" className="mt-auto w-full py-3.5 rounded-2xl border border-gray-100 text-gray-900 font-bold text-xs hover:bg-gray-900 hover:text-white transition-all tracking-widest flex items-center justify-center text-center shadow-sm">{t.exploreSpot}</a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <h4 className="text-xl font-black text-gray-800">{t.noResultsTitle}</h4>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); setSelectedNeighborhood('Todos'); }} className="mt-10 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg text-xs uppercase tracking-widest">{t.cleanFiltersBtn}</button>
            </div>
          )}
        </main>

        <footer className="px-10 py-12 border-t border-gray-100 bg-white mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center md:text-left">Curadoria — {t.footerMadeBy}</p>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">© 2025 {t.rightsReserved}</div>
          </div>
        </footer>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black italic tracking-tighter">{t.loginTitle}</h2>
              <p className="text-sm text-gray-400 font-medium">{t.loginDesc}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" value={loginData.user} onChange={e => setLoginData({ ...loginData, user: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" placeholder="admin" />
              <input type="password" value={loginData.pass} onChange={e => setLoginData({ ...loginData, pass: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800" placeholder="••••••" />
              {loginError && <p className="text-xs text-red-500 font-bold text-center">Erro!</p>}
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">{t.enterPanel}</button>
            </form>
          </div>
        </div>
      )}

      {showAdminPanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative my-8 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
            <div className="w-full md:w-64 bg-gray-900 text-white p-8 flex flex-col">
              <h2 className="text-xl font-black italic tracking-tighter mb-8">{t.adminPanelTitle}</h2>
              <nav className="space-y-2 flex-1">
                <button onClick={() => setAdminTab('locais')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${adminTab === 'locais' ? 'bg-blue-600' : 'text-gray-400 hover:bg-gray-800'}`}>{t.spotsTab}</button>
                <button onClick={() => setAdminTab('bairros')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${adminTab === 'bairros' ? 'bg-blue-600' : 'text-gray-400 hover:bg-gray-800'}`}>{t.hoodsTab}</button>
                <button onClick={() => setAdminTab('categorias')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${adminTab === 'categorias' ? 'bg-blue-600' : 'text-gray-400 hover:bg-gray-800'}`}>{t.catsTab}</button>
                <button onClick={() => setAdminTab('geral')} className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${adminTab === 'geral' ? 'bg-blue-600' : 'text-gray-400 hover:bg-gray-800'}`}>{t.configTab}</button>
              </nav>
              <button onClick={() => setShowAdminPanel(false)} className="mt-8 text-xs font-bold text-gray-500 hover:text-white">{t.backToSite}</button>
            </div>
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-gray-50">
              {adminTab === 'locais' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">{t.addSpotTitle}</h3>
                  <form onSubmit={handleAddSpot} className="grid grid-cols-1 gap-6">
                    <input required type="text" placeholder="Nome" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={newSpot.name} onChange={e => setNewSpot({ ...newSpot, name: e.target.value })} />
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={newSpot.neighborhood} onChange={e => setNewSpot({ ...newSpot, neighborhood: e.target.value })}>
                      {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={newSpot.category} onChange={e => setNewSpot({ ...newSpot, category: e.target.value })}>
                      {sourceCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <textarea placeholder="Descrição" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" rows={3} value={newSpot.description} onChange={e => setNewSpot({ ...newSpot, description: e.target.value })} />
                    <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black">{t.saveSpot}</button>
                  </form>
                </div>
              )}
              {adminTab === 'bairros' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Bairros</h3>
                  <div className="flex gap-2 mb-8">
                    <input type="text" placeholder="Novo bairro" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl" value={newNeighborhood} onChange={e => setNewNeighborhood(e.target.value)} />
                    <button onClick={handleAddNeighborhood} className="px-6 bg-teal-500 text-white rounded-xl">+</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {neighborhoods.map(nb => <div key={nb} className="bg-white p-3 border border-gray-100 rounded-lg flex justify-between">{nb} <button onClick={() => removeNeighborhood(nb)} className="text-red-400">×</button></div>)}
                  </div>
                </div>
              )}
              {adminTab === 'categorias' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Categorias</h3>
                  <div className="flex flex-col gap-4 mb-8">
                    <input type="text" placeholder="Nome" className="px-4 py-3 border border-gray-200 rounded-xl" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} />
                    <input type="text" placeholder="Ícone (Emoji)" className="px-4 py-3 border border-gray-200 rounded-xl" value={newCategory.icon} onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })} />
                    <button onClick={handleAddCategory} className="py-3 bg-teal-500 text-white rounded-xl font-bold">Adicionar</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {sourceCategories.map(cat => <div key={cat.name} className="bg-white p-4 border border-gray-100 rounded-xl flex justify-between items-center"><span>{cat.icon} {cat.name}</span><button onClick={() => removeCategory(cat.name)} className="text-red-500">×</button></div>)}
                  </div>
                </div>
              )}
              {adminTab === 'geral' && (
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-6">Configurações</h3>
                  <div className="space-y-4">
                    <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={menuLabels.categories} onChange={e => setMenuLabels({ ...menuLabels, categories: e.target.value })} />
                    <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl" value={menuLabels.neighborhoods} onChange={e => setMenuLabels({ ...menuLabels, neighborhoods: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
