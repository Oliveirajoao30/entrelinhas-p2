import { createContext, useContext } from 'react';
import { Platform } from 'react-native';

// Tema central do app (padrão da Aula 7): nenhuma cor "solta" nas telas.
// Toda tela pega as cores com `const c = useCores();` e o layout com
// spacing, radius e fonts.

export type Cores = {
  fundo: string; // fundo das telas
  superficie: string; // cartões
  superficieAlta: string; // campos, chips e blocos internos
  texto: string; // texto principal
  textoSuave: string; // texto secundário
  primaria: string; // destaque (botões, aba ativa)
  primariaTexto: string; // texto sobre a cor primária
  borda: string; // bordas finas
  erro: string; // erros, sair, remover
  sucesso: string; // confirmações
  aviso: string; // alertas leves, estrelas
};

export type ModoTema = 'escuro' | 'claro';

export const paletas: Record<ModoTema, Cores> = {
  // Modo escuro: fundo quase preto, cartões grafite e destaque âmbar.
  escuro: {
    fundo: '#0B0C10',
    superficie: '#15171D',
    superficieAlta: '#1D2028',
    texto: '#F5F5F4',
    textoSuave: '#9A9CA8',
    primaria: '#F2B544',
    primariaTexto: '#1B1405',
    borda: '#262A34',
    erro: '#F87171',
    sucesso: '#4ADE80',
    aviso: '#FBBF24',
  },
  // Modo claro: papel creme, tinta escura e o mesmo âmbar mais fechado.
  claro: {
    fundo: '#FAF7F2',
    superficie: '#FFFFFF',
    superficieAlta: '#F1ECE3',
    texto: '#1C1B19',
    textoSuave: '#6B6760',
    primaria: '#C98A12',
    primariaTexto: '#FFFFFF',
    borda: '#E4DED3',
    erro: '#DC2626',
    sucesso: '#16A34A',
    aviso: '#D97706',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 6, md: 12, lg: 20, pill: 999 } as const;

export const fonts = {
  titulo: 26,
  subtitulo: 19,
  corpo: 15,
  pequeno: 13,
  // Serifada nos títulos dá o "ar de livro" sem baixar fontes.
  serifa: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
} as const;

// Preferência do usuário: seguir o sistema ou forçar claro/escuro.
export type PreferenciaTema = 'sistema' | ModoTema;

export type TemaCtx = {
  cores: Cores;
  modo: ModoTema; // modo efetivo (já resolvido quando a preferência é 'sistema')
  preferencia: PreferenciaTema;
  setPreferencia: (p: PreferenciaTema) => void;
};

// O provider fica em context/TemaContext.tsx. Sem provider, vale o modo escuro.
export const TemaContext = createContext<TemaCtx>({
  cores: paletas.escuro,
  modo: 'escuro',
  preferencia: 'sistema',
  setPreferencia: () => {},
});

// Hook usado por todas as telas e componentes: devolve as cores do tema ativo.
export function useCores(): Cores {
  return useContext(TemaContext).cores;
}
