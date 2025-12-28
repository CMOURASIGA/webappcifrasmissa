
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Cifra, Lista, CategoriaLiturgica, AppConfig } from '../types/models';
import { storage } from '../services/storageService';
import { googleDriveService } from '../services/googleDriveService';

interface SyncResult {
  success: boolean;
  count?: number;
  newCount?: number;
  updatedCount?: number;
  keptCount?: number;
  error?: string;
}

interface AppContextType {
  cifras: Cifra[];
  listas: Lista[];
  categorias: CategoriaLiturgica[];
  config: AppConfig;
  isSyncing: boolean;
  syncStatus: string;
  effectiveFolderId: string;
  effectiveApiUrl: string;
  syncFromDrive: () => Promise<SyncResult>;
  saveToDrive: () => Promise<boolean>;
  sortLibrary: () => void;
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

const ENV_DRIVE_ID = (process.env as any).DRIVE_FOLDER_ID || '';
const ENV_API_URL = (process.env as any).GOOGLE_API || '';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cifras, setCifras] = useState<Cifra[]>(() => storage.get<Cifra[]>('CIFRAS') || []);
  const [listas, setListas] = useState<Lista[]>(() => storage.get<Lista[]>('LISTAS') || []);
  const [categorias, setCategorias] = useState<CategoriaLiturgica[]>(() => storage.get<CategoriaLiturgica[]>('CATEGORIAS') || []);
  
  const [config, setConfig] = useState<AppConfig>(() => {
    return storage.get<AppConfig>('CONFIG') || { fontSize: 16, chordFontSize: 14, theme: 'light', driveFolderId: '', googleApiUrl: '' };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  const effectiveFolderId = config.driveFolderId?.trim() || ENV_DRIVE_ID;
  const effectiveApiUrl = config.googleApiUrl?.trim() || ENV_API_URL;

  // Atualiza o serviço sempre que a URL efetiva mudar
  useEffect(() => {
    if (effectiveApiUrl) {
      googleDriveService.setApiUrl(effectiveApiUrl);
    }
  }, [effectiveApiUrl]);

  useEffect(() => storage.set('CIFRAS', cifras), [cifras]);
  useEffect(() => storage.set('LISTAS', listas), [listas]);
  useEffect(() => storage.set('CATEGORIAS', categorias), [categorias]);
  useEffect(() => storage.set('CONFIG', config), [config]);

  const getSortedCifras = (list: Cifra[]) => {
    return [...list].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR', { sensitivity: 'base' }));
  };

  const sortLibrary = () => setCifras(prev => getSortedCifras(prev));

  const clearAllData = () => {
    setCifras([]);
    setListas([]);
    setCategorias([]);
    localStorage.clear();
  };

  const syncFromDrive = async (): Promise<SyncResult> => {
    if (!effectiveApiUrl) return { success: false, error: 'URL da API não configurada. Verifique os Ajustes.' };
    if (!effectiveFolderId) return { success: false, error: 'ID da Pasta não configurado. Verifique os Ajustes.' };

    setIsSyncing(true);
    setSyncStatus('Conectando...');
    
    try {
      await googleDriveService.setConfiguredFolderId(effectiveFolderId);
      const driveFiles = await googleDriveService.getAllTextFiles();
      const driveListas = await googleDriveService.getUserLists();
      
      let newCount = 0, updatedCount = 0, keptCount = 0;

      if (Array.isArray(driveFiles)) {
        const localCifrasMap = new Map(cifras.map(c => [c.driveId || c.titulo, c]));
        const updatedList: Cifra[] = [];

        driveFiles.forEach((file: any) => {
          const localMatch = localCifrasMap.get(file.id) || localCifrasMap.get(file.nome);
          const hasChanged = !localMatch || localMatch.ultimaAtualizacao !== file.ultimaAtualizacao;

          if (hasChanged) {
            updatedList.push({
              id: localMatch ? localMatch.id : Math.random().toString(36).substring(2, 11),
              driveId: file.id,
              titulo: file.nome,
              conteudo: file.conteudo,
              tomBase: localMatch ? localMatch.tomBase : 'C',
              categorias: localMatch ? localMatch.categorias : [],
              tags: localMatch ? localMatch.tags : [],
              criadoEm: localMatch ? localMatch.criadoEm : new Date().toISOString(),
              ultimaAtualizacao: file.ultimaAtualizacao
            });
            if (localMatch) updatedCount++; else newCount++;
          } else {
            keptCount++;
            if (localMatch) updatedList.push(localMatch);
          }
        });
        setCifras(getSortedCifras(updatedList));
      }

      if (Array.isArray(driveListas)) setListas(driveListas);

      setConfig(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      return { success: true, count: driveFiles.length, newCount, updatedCount, keptCount };
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const saveToDrive = async (): Promise<boolean> => {
    if (!effectiveApiUrl || !effectiveFolderId) return false;
    setIsSyncing(true);
    try {
      await googleDriveService.setConfiguredFolderId(effectiveFolderId);
      await googleDriveService.saveUserLists(listas);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const addCifra = (data: Omit<Cifra, 'id' | 'criadoEm'>) => {
    const n = { ...data, id: Math.random().toString(36).substring(2, 11), criadoEm: new Date().toISOString() };
    setCifras(prev => getSortedCifras([n, ...prev]));
  };

  const updateCifra = (id: string, data: Partial<Cifra>) => {
    setCifras(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCifra = (id: string) => setCifras(prev => prev.filter(c => c.id !== id));
  
  const addLista = (data: Omit<Lista, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const now = new Date().toISOString();
    setListas(prev => [{ ...data, id: Math.random().toString(36).substring(2, 11), criadoEm: now, atualizadoEm: now }, ...prev]);
  };

  const updateLista = (id: string, data: Partial<Lista>) => {
    setListas(prev => prev.map(l => l.id === id ? { ...l, ...data, atualizadoEm: new Date().toISOString() } : l));
  };

  const deleteLista = (id: string) => setListas(prev => prev.filter(l => l.id !== id));
  const addCategoria = (nome: string) => setCategorias(prev => [...prev, { id: Math.random().toString(36).substring(2, 11), nome }]);
  const deleteCategoria = (id: string) => setCategorias(prev => prev.filter(c => c.id !== id));
  const updateConfig = (newConfig: Partial<AppConfig>) => setConfig(prev => ({ ...prev, ...newConfig }));

  return (
    <AppContext.Provider value={{
      cifras, listas, categorias, config, isSyncing, syncStatus, effectiveFolderId, effectiveApiUrl,
      syncFromDrive, saveToDrive, sortLibrary,
      addCifra, updateCifra, deleteCifra, addLista, updateLista, deleteLista,
      addCategoria, deleteCategoria, updateConfig, clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
