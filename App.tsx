
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Home from './routes/Home';
import Biblioteca from './routes/Biblioteca';
import VerCifra from './routes/VerCifra';
import Listas from './routes/Listas';
import NovaLista from './routes/NovaLista';
import EditarLista from './routes/EditarLista';
import VerLista from './routes/VerLista';
import Configuracoes from './routes/Configuracoes';
import ComoUsar from './routes/ComoUsar';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/cifra/:id" element={<VerCifra />} />
              <Route path="/listas" element={<Listas />} />
              <Route path="/listas/nova" element={<NovaLista />} />
              <Route path="/listas/editar/:id" element={<EditarLista />} />
              <Route path="/listas/:id" element={<VerLista />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/como-usar" element={<ComoUsar />} />
            </Routes>
          </main>
          <footer className="py-8 bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
                &copy; {new Date().getFullYear()} Cifras MISSA - Ministérios de Música
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
