
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
  effectiveFolderId: string; // O ID real que será usado (Manual ou ENV)
  isUsingEnvFallback: boolean; // Indica se está usando o fallback do servidor
  syncFromDrive: () => Promise<SyncResult>;
  saveToDrive: () => Promise<boolean>;
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

// Pega o ID da variável de ambiente injetada pelo Vite/Vercel
const ENV_DRIVE_ID = (process.env as any).DRIVE_FOLDER_ID || '';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cifras, setCifras] = useState<Cifra[]>(() => storage.get<Cifra[]>('CIFRAS') || []);
  const [listas, setListas] = useState<Lista[]>(() => storage.get<Lista[]>('LISTAS') || []);
  const [categorias, setCategorias] = useState<CategoriaLiturgica[]>(() => storage.get<CategoriaLiturgica[]>('CATEGORIAS') || []);
  
  const [config, setConfig] = useState<AppConfig>(() => {
    return storage.get<AppConfig>('CONFIG') || { fontSize: 16, chordFontSize: 14, theme: 'light', driveFolderId: '' };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const syncTimeoutRef = useRef<number | null>(null);

  // Lógica de Prioridade Conforme Solicitado:
  // Se o usuário definiu algo no sistema (config.driveFolderId), esse é o mandatório.
  // Se estiver em branco/vazio, busca da chave de ambiente (ENV).
  const effectiveFolderId = (config.driveFolderId && config.driveFolderId.trim() !== '') 
    ? config.driveFolderId.trim() 
    : ENV_DRIVE_ID;

  const isUsingEnvFallback = !config.driveFolderId && !!ENV_DRIVE_ID;

  useEffect(() => storage.set('CIFRAS', cifras), [cifras]);
  useEffect(() => storage.set('LISTAS', listas), [listas]);
  useEffect(() => storage.set('CATEGORIAS', categorias), [categorias]);
  useEffect(() => storage.set('CONFIG', config), [config]);

  const scheduleDriveSave = () => {
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => {
      saveToDrive();
    }, 5000);
  };

  const clearAllData = () => {
    setCifras([]);
    setListas([]);
    setCategorias([]);
    localStorage.clear();
  };

  const syncFromDrive = async (): Promise<SyncResult> => {
    if (!effectiveFolderId) {
      return { success: false, error: 'Configure o ID da pasta nos Ajustes antes de sincronizar.' };
    }

    setIsSyncing(true);
    setSyncStatus('Conectando ao Google Drive...');
    
    let newCount = 0;
    let updatedCount = 0;
    let keptCount = 0;

    try {
      // Configuramos o ID no serviço antes de qualquer chamada
      await googleDriveService.setConfiguredFolderId(effectiveFolderId);
      
      setSyncStatus('Lendo arquivos da pasta...');
      const driveFiles = await googleDriveService.getAllTextFiles();
      
      setSyncStatus('Sincronizando listas e preferências...');
      const driveListas = await googleDriveService.getUserLists();
      
      if (Array.isArray(driveFiles)) {
        setSyncStatus(`Comparando ${driveFiles.length} arquivos...`);
        const localCifrasMap = new Map(cifras.map(c => [c.driveId || c.titulo, c]));
        const updatedList: Cifra[] = [];

        driveFiles.forEach((file: any) => {
          const localMatch = localCifrasMap.get(file.id) || localCifrasMap.get(file.nome);
          const hasChanged = !localMatch || localMatch.ultimaAtualizacao !== file.ultimaAtualizacao;

          if (hasChanged) {
            const cifraData: Cifra = {
              id: localMatch ? localMatch.id : Math.random().toString(36).substring(2, 11),
              driveId: file.id,
              titulo: file.nome,
              conteudo: file.conteudo,
              tomBase: localMatch ? localMatch.tomBase : 'C',
              categorias: localMatch ? localMatch.categorias : [],
              tags: localMatch ? localMatch.tags : [],
              criadoEm: localMatch ? localMatch.criadoEm : new Date().toISOString(),
              ultimaAtualizacao: file.ultimaAtualizacao
            };
            if (localMatch) updatedCount++; else newCount++;
            updatedList.push(cifraData);
          } else {
            keptCount++;
            if (localMatch) updatedList.push(localMatch);
          }
        });

        cifras.forEach(local => {
          const driveTitles = new Set(driveFiles.map((f: any) => f.nome));
          if (!local.driveId && !driveTitles.has(local.titulo)) {
            updatedList.push(local);
          }
        });
        setCifras(updatedList);
      }

      if (Array.isArray(driveListas) && driveListas.length > 0) {
        setListas(driveListas);
      }

      const totalCount = driveFiles?.length || 0;
      setConfig(prev => ({ ...prev, lastSync: new Date().toISOString() }));
      setSyncStatus('Sincronização concluída!');
      
      return { success: true, count: totalCount, newCount, updatedCount, keptCount };
    } catch (e: any) {
      console.error('Erro na sincronização:', e);
      return { success: false, error: e.message || 'Erro de conexão.' };
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const saveToDrive = async (): Promise<boolean> => {
    if (!effectiveFolderId) return false;
    setIsSyncing(true);
    try {
      await googleDriveService.setConfiguredFolderId(effectiveFolderId);
      await googleDriveService.saveUserLists(listas);
      const meta = { 
        metaPorCifraId: cifras.reduce((acc, c) => ({
          ...acc, 
          [c.id]: { tom: c.tomBase, categorias: c.categorias }
        }), {})
      };
      await googleDriveService.saveUserMeta(meta);
      return true;
    } catch (e) {
      console.error('Erro ao salvar:', e);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const addCifra = (data: Omit<Cifra, 'id' | 'criadoEm'>) => {
    const newCifra: Cifra = { ...data, id: Math.random().toString(36).substring(2, 11), criadoEm: new Date().toISOString() };
    setCifras(prev => [newCifra, ...prev]);
    scheduleDriveSave();
  };

  const updateCifra = (id: string, data: Partial<Cifra>) => {
    setCifras(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    scheduleDriveSave();
  };

  const deleteCifra = (id: string) => {
    setCifras(prev => prev.filter(c => c.id !== id));
    scheduleDriveSave();
  };

  const addLista = (data: Omit<Lista, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const now = new Date().toISOString();
    const newLista: Lista = { ...data, id: Math.random().toString(36).substring(2, 11), criadoEm: now, atualizadoEm: now };
    setListas(prev => [newLista, ...prev]);
    scheduleDriveSave();
  };

  const updateLista = (id: string, data: Partial<Lista>) => {
    setListas(prev => prev.map(l => l.id === id ? { ...l, ...data, atualizadoEm: new Date().toISOString() } : l));
    scheduleDriveSave();
  };

  const deleteLista = (id: string) => {
    setListas(prev => prev.filter(l => l.id !== id));
    scheduleDriveSave();
  };

  const addCategoria = (nome: string) => setCategorias(prev => [...prev, { id: Math.random().toString(36).substring(2, 11), nome }]);
  const deleteCategoria = (id: string) => setCategorias(prev => prev.filter(c => c.id !== id));
  const updateConfig = (newConfig: Partial<AppConfig>) => setConfig(prev => ({ ...prev, ...newConfig }));

  return (
    <AppContext.Provider value={{
      cifras, listas, categorias, config, isSyncing, syncStatus, effectiveFolderId, isUsingEnvFallback,
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
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
