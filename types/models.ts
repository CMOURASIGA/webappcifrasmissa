
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
  chordFontSize: number;
  theme: 'light' | 'dark';
  driveFolderId?: string;
  googleApiUrl?: string; // Novo campo para configuração manual
  lastSync?: string;
}
