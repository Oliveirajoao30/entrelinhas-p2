// Camada de acesso à Open Library (https://openlibrary.org).
// Converte o JSON da API (em inglês) para os tipos do app em types/livro.ts.
// As telas nunca leem o JSON cru: usam só as funções deste arquivo.

import type { Autor, LivroDetalhe, LivroResumo } from '@/types/livro';

export const API = 'https://openlibrary.org';
const CAPAS = 'https://covers.openlibrary.org';
const LIMITE_POR_PAGINA = 20;
const LIMITE_OBRAS_AUTOR = 20;
const MAX_ASSUNTOS = 8;
const MAX_AUTORES = 5;
const SEM_TITULO = 'Sem título';
const AUTOR_DESCONHECIDO = 'Autor desconhecido';

export type TamanhoImagem = 'S' | 'M' | 'L';
export type CampoBusca = 'q' | 'title' | 'author';

// ---------- Formatos do JSON da API (só os campos usados) ----------

// Textos longos (descrição, biografia) vêm como string ou { value }.
type TextoApi = string | { value?: string };
type ReferenciaAutor = { author?: { key?: string } };

type RespostaBusca = {
  docs?: {
    key: string;
    title?: string;
    author_name?: string[];
    author_key?: string[];
    cover_i?: number;
    first_publish_year?: number;
  }[];
};

type RespostaObra = {
  key: string;
  title?: string;
  description?: TextoApi;
  subjects?: string[];
  covers?: number[];
  authors?: ReferenciaAutor[];
};

type RespostaAutor = {
  key: string;
  name?: string;
  personal_name?: string;
  bio?: TextoApi;
  birth_date?: string;
  death_date?: string;
  photos?: number[];
};

type RespostaObrasAutor = {
  entries?: {
    key: string;
    title?: string;
    covers?: number[];
    authors?: ReferenciaAutor[];
  }[];
};

type RespostaGenero = {
  works?: {
    key: string;
    title?: string;
    authors?: { key?: string; name?: string }[];
    cover_id?: number | null;
    first_publish_year?: number | null;
  }[];
};

// ---------- Funções auxiliares ----------

// Faz o GET, checa resposta.ok e devolve o JSON já tipado.
async function obterJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API}${caminho}`);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }
  return (await resposta.json()) as T;
}

// '/works/OL45804W' -> 'OL45804W'
function semPrefixo(chave: string, prefixo: string): string {
  return chave.replace(prefixo, '');
}

// A API às vezes manda -1 no lugar de uma imagem: pega a primeira válida.
function primeiraImagem(ids?: number[]): number | undefined {
  return ids?.find((id) => id > 0);
}

function idsDeAutores(chaves: (string | undefined)[]): string[] {
  return chaves
    .filter((chave): chave is string => Boolean(chave))
    .map((chave) => semPrefixo(chave, '/authors/'));
}

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

// ---------- Imagens ----------

// URL da capa de um livro, ou null quando não há capa.
export function capaUrl(capaId?: number, tamanho: TamanhoImagem = 'M'): string | null {
  if (!capaId) return null;
  return `${CAPAS}/b/id/${capaId}-${tamanho}.jpg`;
}

// URL da foto de um autor, ou null quando não há foto.
export function fotoAutorUrl(fotoId?: number, tamanho: TamanhoImagem = 'M'): string | null {
  if (!fotoId) return null;
  return `${CAPAS}/a/id/${fotoId}-${tamanho}.jpg`;
}

// ---------- Endpoints ----------

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

  const json = await obterJson<RespostaBusca>(`/search.json?${params.toString()}`);
  return (json.docs ?? []).map((doc) => ({
    id: semPrefixo(doc.key, '/works/'),
    titulo: doc.title ?? SEM_TITULO,
    autores: doc.author_name ?? [],
    autorIds: doc.author_key ?? [],
    capaId: doc.cover_i,
    ano: doc.first_publish_year,
  }));
}

// Nome de um autor pelo id. Se a requisição falhar, o detalhe do livro
// continua abrindo e o autor aparece como desconhecido.
async function nomeDoAutor(autorId: string): Promise<string> {
  try {
    const autor = await buscarAutor(autorId);
    return autor.nome;
  } catch {
    return AUTOR_DESCONHECIDO;
  }
}

// Detalhe de uma obra. Este endpoint não traz o nome dos autores, só os ids,
// então os nomes são buscados em /authors/{id}.json (em paralelo).
// autores[i] corresponde a autorIds[i].
export async function buscarLivro(id: string): Promise<LivroDetalhe> {
  const json = await obterJson<RespostaObra>(`/works/${encodeURIComponent(id)}.json`);
  const autorIds = idsDeAutores((json.authors ?? []).map((a) => a.author?.key)).slice(0, MAX_AUTORES);
  const autores = await Promise.all(autorIds.map(nomeDoAutor));
  return {
    id: semPrefixo(json.key, '/works/'),
    titulo: json.title ?? SEM_TITULO,
    autores,
    autorIds,
    capaId: primeiraImagem(json.covers),
    descricao: textoDaApi(json.description),
    assuntos: (json.subjects ?? []).slice(0, MAX_ASSUNTOS),
  };
}

// Dados de um autor: nome, datas, biografia e foto.
export async function buscarAutor(id: string): Promise<Autor> {
  const json = await obterJson<RespostaAutor>(`/authors/${encodeURIComponent(id)}.json`);
  return {
    id: semPrefixo(json.key, '/authors/'),
    nome: json.name ?? json.personal_name ?? AUTOR_DESCONHECIDO,
    bio: textoDaApi(json.bio),
    nascimento: json.birth_date,
    falecimento: json.death_date,
    fotoId: primeiraImagem(json.photos),
  };
}

// Obras de um autor. Este endpoint não traz nomes de autores nem o ano.
export async function buscarObrasAutor(id: string): Promise<LivroResumo[]> {
  const json = await obterJson<RespostaObrasAutor>(
    `/authors/${encodeURIComponent(id)}/works.json?limit=${LIMITE_OBRAS_AUTOR}`,
  );
  return (json.entries ?? []).map((obra) => ({
    id: semPrefixo(obra.key, '/works/'),
    titulo: obra.title ?? SEM_TITULO,
    autores: [],
    autorIds: idsDeAutores((obra.authors ?? []).map((a) => a.author?.key)),
    capaId: primeiraImagem(obra.covers),
  }));
}

// Livros de um gênero (assunto), 20 por página.
export async function buscarPorGenero(slug: string, pagina = 1): Promise<LivroResumo[]> {
  const offset = (pagina - 1) * LIMITE_POR_PAGINA;
  const json = await obterJson<RespostaGenero>(
    `/subjects/${encodeURIComponent(slug)}.json?limit=${LIMITE_POR_PAGINA}&offset=${offset}`,
  );
  return (json.works ?? []).map((obra) => {
    const autores = obra.authors ?? [];
    return {
      id: semPrefixo(obra.key, '/works/'),
      titulo: obra.title ?? SEM_TITULO,
      autores: autores.map((a) => a.name).filter((nome): nome is string => Boolean(nome)),
      autorIds: idsDeAutores(autores.map((a) => a.key)),
      capaId: obra.cover_id ?? undefined,
      ano: obra.first_publish_year ?? undefined,
    };
  });
}
