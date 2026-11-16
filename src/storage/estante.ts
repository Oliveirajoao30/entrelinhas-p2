import { ler, salvar } from '@/storage/armazenamento';
import { ItemEstante, LivroResumo, StatusLeitura } from '@/types/livro';

// Estante pessoal do leitor, salva no AsyncStorage (chave 'estante').
// Cada livro aparece uma única vez, com o status de leitura atual.

const CHAVE = 'estante';

export async function listarEstante(): Promise<ItemEstante[]> {
  return ler<ItemEstante[]>(CHAVE, []);
}

// Adiciona o livro; se ele já estiver na estante, só atualiza o status.
export async function adicionarNaEstante(livro: LivroResumo, status: StatusLeitura): Promise<void> {
  const itens = await listarEstante();
  const existente = itens.find((i) => i.livro.id === livro.id);

  if (existente) {
    existente.status = status;
    await salvar(CHAVE, itens);
    return;
  }

  // Mais recente primeiro.
  await salvar(CHAVE, [{ livro, status, adicionadoEm: new Date().toISOString() }, ...itens]);
}

export async function mudarStatus(id: string, status: StatusLeitura): Promise<void> {
  const itens = await listarEstante();
  await salvar(
    CHAVE,
    itens.map((i) => (i.livro.id === id ? { ...i, status } : i)),
  );
}

export async function removerDaEstante(id: string): Promise<void> {
  const itens = await listarEstante();
  await salvar(
    CHAVE,
    itens.filter((i) => i.livro.id !== id),
  );
}

// Status do livro na estante, ou null se ele não estiver lá.
export async function statusDoLivro(id: string): Promise<StatusLeitura | null> {
  const itens = await listarEstante();
  return itens.find((i) => i.livro.id === id)?.status ?? null;
}
