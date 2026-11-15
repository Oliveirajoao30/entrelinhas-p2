// Tipos compartilhados do app. A camada api/ converte o JSON da Open Library
// para estes formatos; as telas e o armazenamento local só usam estes tipos.

// Livro como aparece em listas (busca, gênero, estante, favoritos).
export type LivroResumo = {
  id: string; // chave da obra na Open Library, ex.: 'OL45804W' (sem '/works/')
  titulo: string;
  autores: string[]; // nomes dos autores
  autorIds: string[]; // ex.: ['OL23919A'] (sem '/authors/')
  capaId?: number; // id da capa em covers.openlibrary.org
  ano?: number; // ano da primeira publicação
};

// Livro com as informações da tela de detalhe.
export type LivroDetalhe = LivroResumo & {
  descricao: string; // '' quando a API não tiver sinopse
  assuntos: string[];
};

export type Autor = {
  id: string;
  nome: string;
  bio: string;
  nascimento?: string;
  falecimento?: string;
  fotoId?: number; // id da foto em covers.openlibrary.org/a/id/
};

// Estante pessoal do leitor.
export type StatusLeitura = 'quero-ler' | 'lendo' | 'lido';

export const rotulosStatus: Record<StatusLeitura, string> = {
  'quero-ler': 'Quero ler',
  lendo: 'Lendo',
  lido: 'Lido',
};

export type ItemEstante = {
  livro: LivroResumo;
  status: StatusLeitura;
  adicionadoEm: string; // data ISO
};

// Anotação e avaliação de um livro.
export type Anotacao = {
  livroId: string;
  titulo: string; // título do livro, para listar sem chamar a API
  texto: string;
  nota: number; // 0 a 5 estrelas
  atualizadoEm: string; // data ISO
};

// Dados do usuário logado.
export type Usuario = {
  nome: string;
  email: string;
  bio?: string;
};
