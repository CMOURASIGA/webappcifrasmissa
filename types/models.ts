
export interface CategoriaLiturgica {
  id: string;
  nome: string;
}

export interface Cifra {
  id: string;
  titulo: string;
  conteudo: string; // Raw text with chords
  tomBase: string;
  tags: string[];
  categorias: string[]; // Array of CategoriaLiturgica IDs
  criadoEm: string;
}

export interface Lista {
  id: string;
  nome: string;
  descricao?: string;
  cifraIds: string[]; // Ordered list of Cifra IDs
  criadoEm: string;
  atualizadoEm: string;
}

export interface AppConfig {
  fontSize: number;
  theme: 'light' | 'dark';
}
