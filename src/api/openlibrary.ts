// Camada de acesso à Open Library (https://openlibrary.org).
// Converte o JSON da API (em inglês) para os tipos do app em types/livro.ts.
// As telas nunca leem o JSON cru: usam só as funções deste arquivo.

import type { LivroResumo } from '@/types/livro';

export const API = 'https://openlibrary.org';
const CAPAS = 'https://covers.openlibrary.org';
const LIMITE_POR_PAGINA = 20;

type Tamanho = 'S' | 'M' | 'L';
type CampoBusca = 'q' | 'title' | 'author';

// URL da capa de um livro, ou null quando não há capa.
export function capaUrl(capaId?: number, tamanho: Tamanho = 'M'): string | null {
  if (!capaId) return null;
  return `${CAPAS}/b/id/${capaId}-${tamanho}.jpg`;
}

// URL da foto de um autor, ou null quando não há foto.
export function fotoAutorUrl(fotoId?: number, tamanho: Tamanho = 'M'): string | null {
  if (!fotoId) return null;
  return `${CAPAS}/a/id/${fotoId}-${tamanho}.jpg`;
}

// Formato de cada item devolvido por /search.json (só os campos pedidos).
type DocBusca = {
  key: string;
  title?: string;
  author_name?: string[];
  author_key?: string[];
  cover_i?: number;
  first_publish_year?: number;
};

type RespostaBusca = { docs?: DocBusca[] };

function semPrefixo(chave: string, prefixo: string): string {
  return chave.replace(prefixo, '');
}

function docParaLivro(doc: DocBusca): LivroResumo {
  return {
    id: semPrefixo(doc.key, '/works/'),
    titulo: doc.title ?? 'Sem título',
    autores: doc.author_name ?? [],
    autorIds: doc.author_key ?? [],
    capaId: doc.cover_i,
    ano: doc.first_publish_year,
  };
}

// Busca livros por termo. campo: 'q' (tudo), 'title' (título) ou 'author' (autor).
export async function buscarLivros(
  termo: string,
  campo: CampoBusca = 'q',
  pagina = 1,
): Promise<LivroResumo[]> {
  const params = new URLSearchParams({
    [campo]: termo,
    page: String(pagina),
    limit: String(LIMITE_POR_PAGINA),
    fields: 'key,title,author_name,author_key,cover_i,first_publish_year',
  });

  const resposta = await fetch(`${API}/search.json?${params.toString()}`);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  const json = (await resposta.json()) as RespostaBusca;
  return (json.docs ?? []).map(docParaLivro);
}
