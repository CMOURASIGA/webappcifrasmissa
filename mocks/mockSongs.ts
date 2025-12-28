
import { Cifra, CategoriaLiturgica } from '../types/models';
import { generateId } from '../utils/idUtils';

export const INITIAL_CATEGORIES: CategoriaLiturgica[] = [
  { id: '1', nome: 'Entrada' },
  { id: '2', nome: 'Ato Penitencial' },
  { id: '3', nome: 'Glória' },
  { id: '4', nome: 'Salmo' },
  { id: '5', nome: 'Aclamação' },
  { id: '6', nome: 'Ofertório' },
  { id: '7', nome: 'Santo' },
  { id: '8', nome: 'Cordeiro' },
  { id: '9', nome: 'Comunhão' },
  { id: '10', nome: 'Final' }
];

export const INITIAL_SONGS: Cifra[] = [
  {
    id: generateId(),
    titulo: 'Vou Te Oferecer',
    tomBase: 'D',
    categorias: ['6'],
    tags: ['ofertório', 'alegre'],
    criadoEm: new Date().toISOString(),
    conteudo: `
D         A           Bm         F#m
Vou te oferecer a minha vida em Teu altar
G         D           Em         A
Vou te entregar o meu amor pra Te louvar
D         A           Bm         F#m
Tudo o que tenho, tudo o que sou
G         D           A          D
Minha esperança, meu Deus e meu Senhor

    D      A      Bm     F#m
1. Recebe ó Pai os dons do pão e vinho
    G      D      Em     A
   Fruto da terra e do nosso trabalho
    D      A      Bm     F#m
   Transforma-os em Corpo e Sangue
    G      D      A      D
   Pelo poder do Teu Espírito`
  },
  {
    id: generateId(),
    titulo: 'Pai Nosso (G. Rezende)',
    tomBase: 'G',
    categorias: ['9'],
    tags: ['clássico', 'solene'],
    criadoEm: new Date().toISOString(),
    conteudo: `
G       D/F#     Em     Em/D
Pai nosso que estais no céu
C       G/B      Am7    D7
Santificado seja o Vosso nome
G       D/F#     Em     Em/D
Venha a nós o Vosso reino
C       D        G      D
Seja feita a Vossa vontade

G       D/F#     Em     Em/D
Assim na terra como no céu
C       G/B      Am7    D7
O pão nosso de cada dia nos dai hoje
G       D/F#     Em     Em/D
Perdoai as nossas ofensas
C       D        G      D
Assim como nós perdoamos a quem nos tem ofendido`
  }
];
