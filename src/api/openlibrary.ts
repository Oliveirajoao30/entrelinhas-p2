// Camada de acesso à Open Library (https://openlibrary.org).
// Converte o JSON da API (em inglês) para os tipos do app em types/livro.ts.
// As telas nunca leem o JSON cru: usam só as funções deste arquivo.

import type { Autor, LivroDetalhe, LivroResumo } from '@/types/livro';

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

// Textos longos da API (descrição, biografia) vêm como string ou { value }.
type TextoApi = string | { value?: string };

// Também remove as notas de rodapé em markdown que a API costuma trazer,
// como "([Source][1].)" e linhas "[1]: http://...".
function textoDaApi(texto?: TextoApi): string {
  if (!texto) return '';
  const bruto = typeof texto === 'string' ? texto : (texto.value ?? '');
  return bruto
    .replace(/\r\n/g, '\n')
    .replace(/^\s*\[\d+\]:\s*\S+.*$/gm, '')
    .replace(/\(\[[^\]]+\]\[\d+\]\.?\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Formato de /works/{id}.json (só os campos usados).
type RespostaObra = {
  key: string;
  title?: string;
  description?: TextoApi;
  subjects?: string[];
  covers?: number[];
  authors?: { author?: { key?: string } }[];
};

const MAX_ASSUNTOS = 8;

// Detalhe de uma obra. Este endpoint não traz o nome dos autores, só os ids.
export async function buscarLivro(id: string): Promise<LivroDetalhe> {
  const resposta = await fetch(`${API}/works/${encodeURIComponent(id)}.json`);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  const json = (await resposta.json()) as RespostaObra;
  const autorIds = (json.authors ?? [])
    .map((a) => a.author?.key)
    .filter((chave): chave is string => Boolean(chave))
    .map((chave) => semPrefixo(chave, '/authors/'));

  return {
    id: semPrefixo(json.key, '/works/'),
    titulo: json.title ?? 'Sem título',
    autores: [],
    autorIds,
    capaId: json.covers?.find((capa) => capa > 0),
    descricao: textoDaApi(json.description).trim(),
    assuntos: (json.subjects ?? []).slice(0, MAX_ASSUNTOS),
  };
}

// Formato de /authors/{id}.json (só os campos usados).
type RespostaAutor = {
  key: string;
  name?: string;
  personal_name?: string;
  bio?: TextoApi;
  birth_date?: string;
  death_date?: string;
  photos?: number[];
};

// Dados de um autor: nome, datas, biografia e foto.
export async function buscarAutor(id: string): Promise<Autor> {
  const resposta = await fetch(`${API}/authors/${encodeURIComponent(id)}.json`);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  const json = (await resposta.json()) as RespostaAutor;
  return {
    id: semPrefixo(json.key, '/authors/'),
    nome: json.name ?? json.personal_name ?? 'Autor desconhecido',
    bio: textoDaApi(json.bio),
    nascimento: json.birth_date,
    falecimento: json.death_date,
    fotoId: json.photos?.find((foto) => foto > 0),
  };
}

// Formato de /authors/{id}/works.json (só os campos usados).
type RespostaObrasAutor = {
  entries?: {
    key: string;
    title?: string;
    covers?: number[];
    authors?: { author?: { key?: string } }[];
  }[];
};

const LIMITE_OBRAS_AUTOR = 20;

// Obras de um autor. Este endpoint não traz nomes de autores nem o ano.
export async function buscarObrasAutor(id: string): Promise<LivroResumo[]> {
  const resposta = await fetch(
    `${API}/authors/${encodeURIComponent(id)}/works.json?limit=${LIMITE_OBRAS_AUTOR}`,
  );
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  const json = (await resposta.json()) as RespostaObrasAutor;
  return (json.entries ?? []).map((obra) => ({
    id: semPrefixo(obra.key, '/works/'),
    titulo: obra.title ?? 'Sem título',
    autores: [],
    autorIds: (obra.authors ?? [])
      .map((a) => a.author?.key)
      .filter((chave): chave is string => Boolean(chave))
      .map((chave) => semPrefixo(chave, '/authors/')),
    capaId: obra.covers?.find((capa) => capa > 0),
  }));
}

// Formato de /subjects/{slug}.json (só os campos usados).
type RespostaGenero = {
  works?: {
    key: string;
    title?: string;
    authors?: { key?: string; name?: string }[];
    cover_id?: number;
    first_publish_year?: number;
  }[];
};

// Livros de um gênero (assunto), 20 por página.
export async function buscarPorGenero(slug: string, pagina = 1): Promise<LivroResumo[]> {
  const offset = (pagina - 1) * LIMITE_POR_PAGINA;
  const resposta = await fetch(
    `${API}/subjects/${encodeURIComponent(slug)}.json?limit=${LIMITE_POR_PAGINA}&offset=${offset}`,
  );
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  const json = (await resposta.json()) as RespostaGenero;
  return (json.works ?? []).map((obra) => {
    const autores = obra.authors ?? [];
    return {
      id: semPrefixo(obra.key, '/works/'),
      titulo: obra.title ?? 'Sem título',
      autores: autores.map((a) => a.name).filter((nome): nome is string => Boolean(nome)),
      autorIds: autores
        .map((a) => a.key)
        .filter((chave): chave is string => Boolean(chave))
        .map((chave) => semPrefixo(chave, '/authors/')),
      capaId: obra.cover_id ?? undefined,
      ano: obra.first_publish_year ?? undefined,
    };
  });
}
