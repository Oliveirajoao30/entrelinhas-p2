import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { buscarAutor, buscarObrasAutor } from '@/api/openlibrary';
import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { fonts, spacing, useCores } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import type { Autor, LivroResumo } from '@/types/livro';

function abrirLivro(livro: LivroResumo) {
  router.push({ pathname: '/livro/[id]', params: { id: livro.id, titulo: livro.titulo } });
}

type PropsObras = {
  obras: LivroResumo[] | null;
  loading: boolean;
  erro: string | null;
  nomeAutor: string;
};

// Seção "Obras": lista de livros do autor, com os estados de carregamento.
function SecaoObras({ obras, loading, erro, nomeAutor }: PropsObras) {
  if (loading) return <EstadoTela tipo="carregando" mensagem="Carregando obras..." />;
  if (erro) return <EstadoTela tipo="erro" mensagem={`Não foi possível carregar as obras (${erro}).`} />;
  if (!obras || obras.length === 0) return <EstadoTela tipo="vazio" mensagem="Nenhuma obra encontrada." />;

  return (
    <View style={styles.lista}>
      {obras.map((obra) => {
        // A API de obras não traz nomes: usa o nome do autor desta tela.
        const livro = obra.autores.length > 0 ? obra : { ...obra, autores: [nomeAutor] };
        return <CartaoLivro key={obra.id} livro={livro} onPress={() => abrirLivro(livro)} />;
      })}
    </View>
  );
}

// "1916 – 1990", "Nascido em 1950" ou '' quando a API não traz datas.
function textoDatas(autor: Autor): string {
  const { nascimento, falecimento } = autor;
  if (nascimento && falecimento) return `${nascimento} – ${falecimento}`;
  if (nascimento) return `Nascido em ${nascimento}`;
  if (falecimento) return `Falecido em ${falecimento}`;
  return '';
}

// Tela do autor: nome, datas e biografia vindos da Open Library.
export default function TelaAutor() {
  const c = useCores();
  const { id, nome } = useLocalSearchParams<{ id: string; nome?: string }>();
  const { dados: autor, loading, erro } = useFetch(() => buscarAutor(id), [id]);
  const obras = useFetch(() => buscarObrasAutor(id), [id]);

  const cabecalho = (
    <Stack.Screen
      options={{
        title: autor?.nome ?? nome ?? 'Autor',
        headerStyle: { backgroundColor: c.fundo },
        headerTintColor: c.texto,
      }}
    />
  );

  if (loading) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="carregando" mensagem="Carregando autor..." />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="erro" mensagem={`Não foi possível carregar o autor (${erro}).`} />
      </View>
    );
  }

  if (!autor) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela tipo="vazio" mensagem="Autor não encontrado." />
      </View>
    );
  }

  const datas = textoDatas(autor);

  return (
    <ScrollView
      style={[styles.tela, { backgroundColor: c.fundo }]}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {cabecalho}
      <View style={styles.topo}>
        <Text style={[styles.nome, { color: c.texto }]}>{autor.nome}</Text>
        {datas ? <Text style={[styles.datas, { color: c.textoSuave }]}>{datas}</Text> : null}
      </View>

      <Text style={[styles.secao, { color: c.texto }]}>Biografia</Text>
      <Text style={[styles.bio, { color: c.textoSuave }]}>{autor.bio || 'Biografia não disponível.'}</Text>

      <Text style={[styles.secao, styles.secaoObras, { color: c.texto }]}>Obras</Text>
      <SecaoObras obras={obras.dados} loading={obras.loading} erro={obras.erro} nomeAutor={autor.nome} />
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
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  nome: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  datas: {
    fontSize: fonts.corpo,
  },
  secao: {
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  bio: {
    fontSize: fonts.corpo,
    lineHeight: 22,
  },
  secaoObras: {
    marginTop: spacing.md,
  },
  lista: {
    gap: spacing.sm,
  },
});
