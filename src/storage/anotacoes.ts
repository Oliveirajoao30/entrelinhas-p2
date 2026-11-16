import { ler, salvar } from '@/storage/armazenamento';
import { Anotacao } from '@/types/livro';

// Anotações e avaliações dos livros, salvas no AsyncStorage (chave 'anotacoes').
// Cada livro tem no máximo uma anotação.

const CHAVE = 'anotacoes';

export async function listarAnotacoes(): Promise<Anotacao[]> {
  const anotacoes = await ler<Anotacao[]>(CHAVE, []);
  // Mais recentes primeiro.
  return [...anotacoes].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export async function lerAnotacao(livroId: string): Promise<Anotacao | null> {
  const anotacoes = await ler<Anotacao[]>(CHAVE, []);
  return anotacoes.find((a) => a.livroId === livroId) ?? null;
}

// Cria ou substitui a anotação do livro.
export async function salvarAnotacao(anotacao: Anotacao): Promise<void> {
  const anotacoes = await ler<Anotacao[]>(CHAVE, []);
  await salvar(CHAVE, [anotacao, ...anotacoes.filter((a) => a.livroId !== anotacao.livroId)]);
}

export async function removerAnotacao(livroId: string): Promise<void> {
  const anotacoes = await ler<Anotacao[]>(CHAVE, []);
  await salvar(
    CHAVE,
    anotacoes.filter((a) => a.livroId !== livroId),
  );
}
