
export interface CategoriaLiturgica {
  id: string;
  nome: string;
}

export interface Cifra {
  id: string;
  driveId?: string;
  titulo: string;
  conteudo: string;
  tomBase: string;
  tags: string[];
  categorias: string[];
  criadoEm: string;
  ultimaAtualizacao?: string;
  checksum?: string;
}

export interface Lista {
  id: string;
  nome: string;
  descricao?: string;
  cifraIds: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface AppConfig {
  fontSize: number;
  theme: 'light' | 'dark';
  driveFolderId?: string;
  gasApiUrl?: string; // URL do Web App publicado no Google Apps Script
  lastSync?: string;
}
