import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { buscarPorGenero } from '@/api/openlibrary';
import { Capa } from '@/components/livro/Capa';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { fonts, spacing, useCores } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import type { LivroResumo } from '@/types/livro';

type Props = {
  titulo: string;
  slug: string;
};

const LARGURA_CAPA = 110;
// Altura reservada para o conteúdo, para a tela não "pular" ao carregar.
const ALTURA_CONTEUDO = Math.round(LARGURA_CAPA * 1.5) + 48;

function abrirLivro(livro: LivroResumo) {
  router.push({ pathname: '/livro/[id]', params: { id: livro.id, titulo: livro.titulo } });
}

// Seção da Início: título do gênero, "Ver todos" e uma fileira de capas.
export function CarrosselLivros({ titulo, slug }: Props) {
  const c = useCores();
  const { dados: livros, loading, erro, recarregar } = useFetch(() => buscarPorGenero(slug), [slug]);

  function verTodos() {
    router.push({ pathname: '/genero/[slug]', params: { slug, nome: titulo } });
  }

  function renderConteudo() {
    if (loading) return <EstadoTela tipo="carregando" mensagem={`Carregando ${titulo.toLowerCase()}...`} />;
    if (erro) {
      return <EstadoTela tipo="erro" mensagem="Não foi possível carregar esta seção." onTentarDeNovo={recarregar} />;
    }
    if (!livros || livros.length === 0) return <EstadoTela tipo="vazio" mensagem="Nenhum livro neste gênero." />;

    return (
      <FlatList
        horizontal
        data={livros}
        keyExtractor={(l) => l.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => abrirLivro(item)}
            accessibilityRole="button"
            accessibilityLabel={item.titulo}
            style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
          >
            <Capa capaId={item.capaId} titulo={item.titulo} largura={LARGURA_CAPA} />
            <Text style={[styles.tituloLivro, { color: c.texto }]} numberOfLines={2}>
              {item.titulo}
            </Text>
          </Pressable>
        )}
      />
    );
  }

  return (
    <View style={styles.secao}>
      <View style={styles.cabecalho}>
        <Text style={[styles.titulo, { color: c.texto }]}>{titulo}</Text>
        <Pressable onPress={verTodos} accessibilityRole="link" hitSlop={spacing.sm}>
          <Text style={[styles.verTodos, { color: c.primaria }]}>Ver todos</Text>
        </Pressable>
      </View>
      <View style={styles.conteudo}>{renderConteudo()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  secao: {
    gap: spacing.md,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titulo: {
    flex: 1,
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  verTodos: {
    fontSize: fonts.pequeno,
    fontWeight: '700',
  },
  conteudo: {
    minHeight: ALTURA_CONTEUDO,
  },
  lista: {
    gap: spacing.md,
  },
  item: {
    width: LARGURA_CAPA,
    gap: spacing.sm,
  },
  tituloLivro: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
  pressionado: {
    opacity: 0.7,
  },
});
