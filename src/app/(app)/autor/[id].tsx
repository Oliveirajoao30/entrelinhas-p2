import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { buscarAutor } from '@/api/openlibrary';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { fonts, spacing, useCores } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import type { Autor } from '@/types/livro';

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
});
