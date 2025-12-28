
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cifra, Lista, CategoriaLiturgica, AppConfig } from '../types/models';
import { storage } from '../services/storageService';
import { googleDriveService } from '../services/googleDriveService';

interface SyncResult {
  success: boolean;
  count?: number;
  error?: string;
}

interface AppContextType {
  cifras: Cifra[];
  listas: Lista[];
  categorias: CategoriaLiturgica[];
  config: AppConfig;
  isSyncing: boolean;
  syncFromDrive: () => Promise<SyncResult>;
  saveToDrive: () => Promise<void>;
  addCifra: (cifra: Omit<Cifra, 'id' | 'criadoEm'>) => void;
  updateCifra: (id: string, cifra: Partial<Cifra>) => void;
  deleteCifra: (id: string) => void;
  addLista: (lista: Omit<Lista, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  updateLista: (id: string, lista: Partial<Lista>) => void;
  deleteLista: (id: string) => void;
  addCategoria: (nome: string) => void;
  deleteCategoria: (id: string) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cifras, setCifras] = useState<Cifra[]>(() => storage.get<Cifra[]>('CIFRAS') || []);
  const [listas, setListas] = useState<Lista[]>(() => storage.get<Lista[]>('LISTAS') || []);
  const [categorias, setCategorias] = useState<CategoriaLiturgica[]>(() => storage.get<CategoriaLiturgica[]>('CATEGORIAS') || []);
  const [config, setConfig] = useState<AppConfig>(() => storage.get<AppConfig>('CONFIG') || { fontSize: 16, theme: 'light' });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => storage.set('CIFRAS', cifras), [cifras]);
  useEffect(() => storage.set('LISTAS', listas), [listas]);
  useEffect(() => storage.set('CATEGORIAS', categorias), [categorias]);
  useEffect(() => storage.set('CONFIG', config), [config]);

  const clearAllData = () => {
    setCifras([]);
    setListas([]);
    setCategorias([]);
    localStorage.removeItem('cifras_missa_cifras');
    localStorage.removeItem('cifras_missa_listas');
    localStorage.removeItem('cifras_missa_categorias');
  };

  const syncFromDrive = async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const driveFiles = await googleDriveService.getAllTextFiles();
      
      if (Array.isArray(driveFiles)) {
        setCifras(prev => {
          const updatedCifras = [...prev];
          driveFiles.forEach((file: any) => {
            const index = updatedCifras.findIndex(c => c.driveId === file.id || c.titulo === file.nome);
            const cifraData: Cifra = {
              id: index >= 0 ? updatedCifras[index].id : Math.random().toString(36).substring(2, 11),
              driveId: file.id,
              titulo: file.nome,
              conteudo: file.conteudo,
              tomBase: updatedCifras[index]?.tomBase || 'C',
              categorias: updatedCifras[index]?.categorias || [],
              tags: updatedCifras[index]?.tags || [],
              criadoEm: updatedCifras[index]?.criadoEm || new Date().toISOString(),
              ultimaAtualizacao: file.ultimaAtualizacao
            };

            if (index >= 0) updatedCifras[index] = cifraData;
            else updatedCifras.push(cifraData);
          });
          return updatedCifras;
        });
        setConfig(prev => ({ ...prev, lastSync: new Date().toISOString() }));
        return { success: true, count: driveFiles.length };
      }
      return { success: false, error: 'Resposta do servidor não é uma lista de arquivos.' };
    } catch (e: any) {
      console.error('Erro ao sincronizar do Drive:', e);
      return { success: false, error: e.message || 'Erro de conexão com o Drive.' };
    } finally {
      setIsSyncing(false);
    }
  };

  const saveToDrive = async () => {
    setIsSyncing(true);
    try {
      await googleDriveService.saveUserLists(listas);
      const meta = { 
        metaPorCifraId: cifras.reduce((acc, c) => ({
          ...acc, 
          [c.id]: { tom: c.tomBase, categorias: c.categorias }
        }), {})
      };
      await googleDriveService.saveUserMeta(meta);
    } catch (e) {
      console.error('Erro ao salvar no Drive:', e);
    } finally {
      setIsSyncing(false);
    }
  };

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

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <AppContext.Provider value={{
      cifras, listas, categorias, config, isSyncing,
      syncFromDrive, saveToDrive,
      addCifra, updateCifra, deleteCifra,
      addLista, updateLista, deleteLista,
      addCategoria, deleteCategoria, updateConfig, clearAllData
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
