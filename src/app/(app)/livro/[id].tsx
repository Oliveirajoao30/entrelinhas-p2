import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { buscarLivro } from '@/api/openlibrary';
import { Capa } from '@/components/livro/Capa';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { fonts, spacing, useCores } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';

const LARGURA_CAPA = 180;

// Detalhe de um livro: busca a obra na Open Library pelo id da rota.
export default function DetalheLivro() {
  const c = useCores();
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo?: string }>();
  const { dados: livro, loading, erro } = useFetch(() => buscarLivro(id), [id]);

  const cabecalho = (
    <Stack.Screen
      options={{
        title: titulo ?? 'Livro',
        headerStyle: { backgroundColor: c.fundo },
        headerTintColor: c.texto,
      }}
    />
  );

  if (loading) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="carregando" mensagem="Carregando livro..." />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="erro" mensagem={`Não foi possível carregar o livro (${erro}).`} />
      </View>
    );
  }

  if (!livro) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="vazio" mensagem="Livro não encontrado." />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.tela, { backgroundColor: c.fundo }]}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {cabecalho}
      <View style={styles.topo}>
        <Capa capaId={livro.capaId} titulo={livro.titulo} largura={LARGURA_CAPA} tamanho="L" />
        <Text style={[styles.titulo, { color: c.texto }]}>{livro.titulo}</Text>
      </View>

      <Text style={[styles.secao, { color: c.texto }]}>Sinopse</Text>
      <Text style={[styles.descricao, { color: c.textoSuave }]}>{livro.descricao}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
  },
  conteudo: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topo: {
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
    textAlign: 'center',
  },
  secao: {
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  descricao: {
    fontSize: fonts.corpo,
    lineHeight: 22,
  },
});
