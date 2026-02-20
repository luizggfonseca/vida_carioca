
import React from 'react';

interface HeaderProps {
    currentDate: string;
    t: any;
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentDate, t, onMenuClick }) => {
    return (
        <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-40">
            <div className="flex justify-between items-center max-w-7xl mx-auto">

                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-lg">
                            RJ
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-black text-gray-900 tracking-tight italic leading-tight">
                                Rio de Janeiro <span className="text-gray-400 font-medium not-italic ml-0.5">por Vida Carioca</span>
                            </h1>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Ao Vivo • Brasil</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-0.5 leading-none">Hoje</div>
                        <div className="text-[10px] font-bold text-gray-600 leading-none">{currentDate}</div>
                    </div>
                    <div className="h-6 w-[1px] bg-gray-100 hidden sm:block"></div>
                    <div className="flex items-center gap-2 pr-2">
                        <span className="text-lg">☀️</span>
                        <span className="text-[10px] font-black text-gray-900 tracking-tighter">28°C</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
