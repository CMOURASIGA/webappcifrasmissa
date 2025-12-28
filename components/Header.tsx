
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, Book, List, Settings, HelpCircle, Home } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/biblioteca', icon: Book, label: 'Biblioteca' },
    { path: '/listas', icon: List, label: 'Listas' },
    { path: '/configuracoes', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Music size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">Cifras MISSA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                location.pathname === item.path ? 'bg-slate-800 text-blue-400' : 'hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <Link
            to="/como-usar"
            className="ml-2 px-3 py-2 rounded-md text-sm font-medium border border-slate-700 flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle size={18} />
            Como Usar
          </Link>
        </nav>

        {/* Mobile quick icons */}
        <div className="flex md:hidden items-center gap-4">
          <Link to="/biblioteca" className={location.pathname === '/biblioteca' ? 'text-blue-400' : ''}>
            <Book size={24} />
          </Link>
          <Link to="/listas" className={location.pathname === '/listas' ? 'text-blue-400' : ''}>
            <List size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
