import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { buscarPorGenero } from '@/api/openlibrary';
import { Capa } from '@/components/livro/Capa';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { Botao } from '@/components/ui/Botao';
import { fonts, spacing, useCores } from '@/constants/theme';
import type { LivroResumo } from '@/types/livro';

const COLUNAS = 2;
const LIVROS_POR_PAGINA = 20;

function abrirLivro(livro: LivroResumo) {
  router.push({ pathname: '/livro/[id]', params: { id: livro.id, titulo: livro.titulo } });
}

// Junta páginas sem repetir livros (a API às vezes devolve o mesmo id de novo).
function juntarSemRepetir(atuais: LivroResumo[], novos: LivroResumo[]): LivroResumo[] {
  const ids = new Set(atuais.map((l) => l.id));
  return [...atuais, ...novos.filter((l) => !ids.has(l.id))];
}

// Tela de gênero: grade de 2 colunas com paginação infinita.
export default function TelaGenero() {
  const c = useCores();
  const { width } = useWindowDimensions();
  const { slug, nome } = useLocalSearchParams<{ slug: string; nome?: string }>();

  const [livros, setLivros] = useState<LivroResumo[]>([]);
  const [pagina, setPagina] = useState(0); // última página carregada
  const [loading, setLoading] = useState(true); // primeira página
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [acabou, setAcabou] = useState(false);
  const ocupado = useRef(false);

  const larguraItem = (width - spacing.lg * 2 - spacing.md * (COLUNAS - 1)) / COLUNAS;

  const carregarPagina = useCallback(
    async (numero: number) => {
      if (ocupado.current) return;
      ocupado.current = true;
      if (numero === 1) setLoading(true);
      else setCarregandoMais(true);
      setErro(null);
      try {
        const novos = await buscarPorGenero(slug, numero);
        setLivros((atuais) => (numero === 1 ? novos : juntarSemRepetir(atuais, novos)));
        setPagina(numero);
        setAcabou(novos.length < LIVROS_POR_PAGINA);
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Não foi possível carregar os livros.');
      } finally {
        ocupado.current = false;
        setLoading(false);
        setCarregandoMais(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    carregarPagina(1);
  }, [carregarPagina]);

  function carregarMais() {
    if (acabou || erro || loading || carregandoMais) return;
    carregarPagina(pagina + 1);
  }

  const cabecalho = (
    <Stack.Screen
      options={{
        title: nome ?? 'Gênero',
        headerStyle: { backgroundColor: c.fundo },
        headerTintColor: c.texto,
      }}
    />
  );

  if (loading) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="carregando" mensagem="Carregando livros..." />
      </View>
    );
  }

  if (erro && livros.length === 0) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela
          tipo="erro"
          mensagem={`Não foi possível carregar os livros (${erro}).`}
          onTentarDeNovo={() => carregarPagina(1)}
        />
      </View>
    );
  }

  if (livros.length === 0) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="vazio" mensagem="Nenhum livro encontrado neste gênero." />
      </View>
    );
  }

  function renderRodape() {
    if (carregandoMais) return <ActivityIndicator style={styles.rodape} color={c.primaria} />;
    if (erro) {
      return (
        <View style={styles.rodape}>
          <Botao titulo="Tentar carregar mais" variante="secundario" onPress={() => carregarPagina(pagina + 1)} />
        </View>
      );
    }
    return null;
  }

  return (
    <View style={[styles.tela, { backgroundColor: c.fundo }]}>
      {cabecalho}
      <FlatList
        data={livros}
        keyExtractor={(l) => l.id}
        numColumns={COLUNAS}
        columnWrapperStyle={styles.linha}
        contentContainerStyle={styles.conteudo}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderRodape() ?? undefined}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => abrirLivro(item)}
            accessibilityRole="button"
            accessibilityLabel={item.titulo}
            style={({ pressed }) => [styles.item, { width: larguraItem }, pressed && styles.pressionado]}
          >
            <Capa capaId={item.capaId} titulo={item.titulo} largura={larguraItem} />
            <Text style={[styles.titulo, { color: c.texto }]} numberOfLines={2}>
              {item.titulo}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  linha: {
    gap: spacing.md,
  },
  item: {
    gap: spacing.sm,
  },
  titulo: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
  rodape: {
    paddingVertical: spacing.lg,
  },
  pressionado: {
    opacity: 0.7,
  },
});
