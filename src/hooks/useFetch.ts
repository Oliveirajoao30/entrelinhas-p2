// Hook genérico de busca de dados (padrão da Aula 9).
// Recebe uma função que devolve uma Promise e a lista de dependências;
// refaz a busca quando alguma dependência muda.

import { useCallback, useEffect, useRef, useState } from 'react';

type ResultadoFetch<T> = {
  dados: T | null;
  loading: boolean;
  erro: string | null;
  recarregar: () => Promise<void>;
};

export function useFetch<T>(buscar: () => Promise<T>, deps: unknown[]): ResultadoFetch<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Guarda o número da última requisição para ignorar respostas antigas
  // (ex.: o usuário trocou de livro antes da busca anterior terminar).
  const ultimaRequisicao = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(buscar, deps);

  const recarregar = useCallback(async () => {
    const numero = ++ultimaRequisicao.current;
    setLoading(true);
    setErro(null);
    try {
      const resultado = await executar();
      if (numero === ultimaRequisicao.current) setDados(resultado);
    } catch (e) {
      if (numero === ultimaRequisicao.current) {
        setErro(e instanceof Error ? e.message : 'Não foi possível carregar os dados.');
      }
    } finally {
      if (numero === ultimaRequisicao.current) setLoading(false);
    }
  }, [executar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, loading, erro, recarregar };
}
