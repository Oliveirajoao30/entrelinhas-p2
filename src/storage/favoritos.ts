import { ler, salvar } from '@/storage/armazenamento';
import { LivroResumo } from '@/types/livro';

// Livros favoritos, salvos no AsyncStorage (chave 'favoritos').

const CHAVE = 'favoritos';

export async function listarFavoritos(): Promise<LivroResumo[]> {
  return ler<LivroResumo[]>(CHAVE, []);
}

export async function ehFavorito(id: string): Promise<boolean> {
  const favoritos = await listarFavoritos();
  return favoritos.some((l) => l.id === id);
}

// Liga/desliga o favorito. Devolve true se o livro ficou favorito.
export async function alternarFavorito(livro: LivroResumo): Promise<boolean> {
  const favoritos = await listarFavoritos();
  const jaEra = favoritos.some((l) => l.id === livro.id);

  if (jaEra) {
    await salvar(
      CHAVE,
      favoritos.filter((l) => l.id !== livro.id),
    );
    return false;
  }

  await salvar(CHAVE, [livro, ...favoritos]);
  return true;
}
