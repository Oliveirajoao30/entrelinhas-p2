import AsyncStorage from '@react-native-async-storage/async-storage';

// Camada de armazenamento local (Aula 10).
// As telas não sabem que por baixo é AsyncStorage: só usam ler/salvar/remover.
// Guarda apenas dados não sensíveis (preferências, estante, cache).
// Senha e sessão ficam no SecureStore.

// Lê um valor salvo como JSON. Se não existir ou estiver corrompido, devolve o padrão.
export async function ler<T>(chave: string, padrao: T): Promise<T> {
  try {
    const bruto = await AsyncStorage.getItem(chave);
    return bruto === null ? padrao : (JSON.parse(bruto) as T);
  } catch {
    return padrao;
  }
}

export async function salvar<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function remover(chave: string): Promise<void> {
  await AsyncStorage.removeItem(chave);
}

// Apaga todos os dados locais do app (usado em Configurações).
export async function limparTudo(): Promise<void> {
  await AsyncStorage.clear();
}
