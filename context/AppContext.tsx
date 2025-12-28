
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cifra, Lista, CategoriaLiturgica, AppConfig } from '../types/models';
import { storage } from '../services/storageService';
import { INITIAL_SONGS, INITIAL_CATEGORIES } from '../mocks/mockSongs';

interface AppContextType {
  cifras: Cifra[];
  listas: Lista[];
  categorias: CategoriaLiturgica[];
  config: AppConfig;
  addCifra: (cifra: Omit<Cifra, 'id' | 'criadoEm'>) => void;
  updateCifra: (id: string, cifra: Partial<Cifra>) => void;
  deleteCifra: (id: string) => void;
  addLista: (lista: Omit<Lista, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateLista: (id: string, lista: Partial<Lista>) => void;
  deleteLista: (id: string) => void;
  addCategoria: (nome: string) => void;
  deleteCategoria: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cifras, setCifras] = useState<Cifra[]>(() => storage.get<Cifra[]>('CIFRAS') || INITIAL_SONGS);
  const [listas, setListas] = useState<Lista[]>(() => storage.get<Lista[]>('LISTAS') || []);
  const [categorias, setCategorias] = useState<CategoriaLiturgica[]>(() => storage.get<CategoriaLiturgica[]>('CATEGORIAS') || INITIAL_CATEGORIES);
  const [config, setConfig] = useState<AppConfig>(() => storage.get<AppConfig>('CONFIG') || { fontSize: 16, theme: 'light' });

  useEffect(() => storage.set('CIFRAS', cifras), [cifras]);
  useEffect(() => storage.set('LISTAS', listas), [listas]);
  useEffect(() => storage.set('CATEGORIAS', categorias), [categorias]);
  useEffect(() => storage.set('CONFIG', config), [config]);

  const addCifra = (data: Omit<Cifra, 'id' | 'criadoEm'>) => {
    const newCifra: Cifra = {
      ...data,
      id: Math.random().toString(36).substring(2, 11),
      criadoEm: new Date().toISOString()
    };
    setCifras(prev => [newCifra, ...prev]);
  };

  const updateCifra = (id: string, data: Partial<Cifra>) => {
    setCifras(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCifra = (id: string) => {
    setCifras(prev => prev.filter(c => c.id !== id));
    // Also remove from any list
    setListas(prev => prev.map(l => ({
      ...l,
      cifraIds: l.cifraIds.filter(cid => cid !== id)
    })));
  };

  const addLista = (data: Omit<Lista, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const now = new Date().toISOString();
    const newLista: Lista = {
      ...data,
      id: Math.random().toString(36).substring(2, 11),
      criadoEm: now,
      atualizadoEm: now
    };
    setListas(prev => [newLista, ...prev]);
  };

  const updateLista = (id: string, data: Partial<Lista>) => {
    setListas(prev => prev.map(l => l.id === id ? { ...l, ...data, atualizadoEm: new Date().toISOString() } : l));
  };

  const deleteLista = (id: string) => {
    setListas(prev => prev.filter(l => l.id !== id));
  };

  const addCategoria = (nome: string) => {
    setCategorias(prev => [...prev, { id: Math.random().toString(36).substring(2, 11), nome }]);
  };

  const deleteCategoria = (id: string) => {
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider value={{
      cifras, listas, categorias, config,
      addCifra, updateCifra, deleteCifra,
      addLista, updateLista, deleteLista,
      addCategoria, deleteCategoria
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
