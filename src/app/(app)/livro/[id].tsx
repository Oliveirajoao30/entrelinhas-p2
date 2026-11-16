import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { buscarLivro } from '@/api/openlibrary';
import { Capa } from '@/components/livro/Capa';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { AcoesLivro } from '@/components/ui/AcoesLivro';
import { Botao } from '@/components/ui/Botao';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';

const LARGURA_CAPA = 180;

// 'Science Fiction' -> 'science_fiction' (formato usado em /subjects/{slug}).
function slugDoAssunto(assunto: string): string {
  return assunto.toLowerCase().replace(/ /g, '_');
}

function abrirGenero(assunto: string) {
  router.push({ pathname: '/genero/[slug]', params: { slug: slugDoAssunto(assunto), nome: assunto } });
}

function abrirAutor(autorId: string) {
  router.push({ pathname: '/autor/[id]', params: { id: autorId } });
}

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

      <AcoesLivro livro={livro} />

      {livro.autorIds.length > 0 ? (
        <View style={styles.autores}>
          {livro.autorIds.map((autorId, indice) => (
            <Botao
              key={autorId}
              titulo={livro.autorIds.length > 1 ? `Ver autor ${indice + 1}` : 'Ver autor'}
              variante="secundario"
              onPress={() => abrirAutor(autorId)}
            />
          ))}
        </View>
      ) : null}

      <Text style={[styles.secao, { color: c.texto }]}>Sinopse</Text>
      <Text style={[styles.descricao, { color: c.textoSuave }]}>
        {livro.descricao || 'Sinopse não disponível.'}
      </Text>

      {livro.assuntos.length > 0 ? (
        <>
          <Text style={[styles.secao, { color: c.texto }]}>Assuntos</Text>
          <View style={styles.chips}>
            {livro.assuntos.map((assunto) => (
              <Pressable
                key={assunto}
                onPress={() => abrirGenero(assunto)}
                accessibilityRole="button"
                accessibilityLabel={`Ver livros de ${assunto}`}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: c.superficieAlta, borderColor: c.borda },
                  pressed && styles.pressionado,
                ]}
              >
                <Text style={[styles.chipTexto, { color: c.texto }]} numberOfLines={1}>
                  {assunto}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
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
  autores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipTexto: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
  pressionado: {
    opacity: 0.7,
  },
});
