
const KEYS = {
  CIFRAS: 'cifras_missa_cifras',
  LISTAS: 'cifras_missa_listas',
  CATEGORIAS: 'cifras_missa_categorias',
  CONFIG: 'cifras_missa_config'
};

export const storage = {
  get: <T,>(key: keyof typeof KEYS): T | null => {
    try {
      const item = localStorage.getItem(KEYS[key]);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  },
  set: <T,>(key: keyof typeof KEYS, value: T): void => {
    try {
      localStorage.setItem(KEYS[key], JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }
};
