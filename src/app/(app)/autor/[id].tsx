import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { buscarAutor, buscarObrasAutor, fotoAutorUrl } from '@/api/openlibrary';
import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useFetch } from '@/hooks/useFetch';
import type { Autor, LivroResumo } from '@/types/livro';

function abrirLivro(livro: LivroResumo) {
  router.push({ pathname: '/livro/[id]', params: { id: livro.id, titulo: livro.titulo } });
}

const TAMANHO_FOTO = 96;

function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase() || '?';
}

// Foto circular do autor. Sem foto, mostra as iniciais do nome.
function FotoAutor({ fotoId, nome }: { fotoId?: number; nome: string }) {
  const c = useCores();
  const url = fotoAutorUrl(fotoId, 'M');

  if (!url) {
    return (
      <View
        style={[styles.foto, styles.semFoto, { backgroundColor: c.superficieAlta }]}
        accessibilityLabel={`${nome}, sem foto`}
      >
        <Text style={[styles.iniciais, { color: c.primaria }]}>{iniciaisDoNome(nome)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={[styles.foto, { backgroundColor: c.superficieAlta }]}
      contentFit="cover"
      transition={200}
      accessibilityLabel={`Foto de ${nome}`}
    />
  );
}

type PropsObras = {
  obras: LivroResumo[] | null;
  loading: boolean;
  erro: string | null;
  nomeAutor: string;
  onTentarDeNovo: () => void;
};

// Seção "Obras": lista de livros do autor, com os estados de carregamento.
function SecaoObras({ obras, loading, erro, nomeAutor, onTentarDeNovo }: PropsObras) {
  if (loading) return <EstadoTela tipo="carregando" mensagem="Carregando obras..." />;
  if (erro) {
    return (
      <EstadoTela
        tipo="erro"
        mensagem={`Não foi possível carregar as obras (${erro}).`}
        onTentarDeNovo={onTentarDeNovo}
      />
    );
  }
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

// Placeholder no formato do nome, das datas e da biografia enquanto o autor carrega.
function PlaceholderAutor() {
  const c = useCores();
  const bloco = { backgroundColor: c.superficieAlta };

  return (
    <View style={styles.conteudo} accessibilityLabel="Carregando autor" accessibilityRole="progressbar">
      <View style={styles.topo}>
        <View style={[styles.foto, bloco]} />
        <View style={styles.info}>
          <View style={[styles.placeholderNome, bloco]} />
          <View style={[styles.placeholderDatas, bloco]} />
        </View>
      </View>
      <View style={[styles.placeholderLinha, styles.placeholderSecao, bloco]} />
      <View style={[styles.placeholderLinha, bloco]} />
      <View style={[styles.placeholderLinha, bloco]} />
      <View style={[styles.placeholderLinha, styles.placeholderLinhaCurta, bloco]} />
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
  const { dados: autor, loading, erro, recarregar } = useFetch(() => buscarAutor(id), [id]);
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
        <PlaceholderAutor />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.tela, { backgroundColor: c.fundo }]}>
        {cabecalho}
        <EstadoTela
          tipo="erro"
          mensagem={`Não foi possível carregar o autor (${erro}).`}
          onTentarDeNovo={recarregar}
        />
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
        <FotoAutor fotoId={autor.fotoId} nome={autor.nome} />
        <View style={styles.info}>
          <Text style={[styles.nome, { color: c.texto }]} numberOfLines={3}>
            {autor.nome}
          </Text>
          {datas ? <Text style={[styles.datas, { color: c.textoSuave }]}>{datas}</Text> : null}
        </View>
      </View>

      <Text style={[styles.secao, { color: c.texto }]}>Biografia</Text>
      <Text style={[styles.bio, { color: c.textoSuave }]}>{autor.bio || 'Biografia não disponível.'}</Text>

      <Text style={[styles.secao, styles.secaoObras, { color: c.texto }]}>Obras</Text>
      <SecaoObras
        obras={obras.dados}
        loading={obras.loading}
        erro={obras.erro}
        nomeAutor={autor.nome}
        onTentarDeNovo={obras.recarregar}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  foto: {
    width: TAMANHO_FOTO,
    height: TAMANHO_FOTO,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  semFoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
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
  placeholderNome: {
    width: '65%',
    height: fonts.titulo,
    borderRadius: radius.sm,
  },
  placeholderDatas: {
    width: '40%',
    height: fonts.corpo,
    borderRadius: radius.sm,
  },
  placeholderSecao: {
    width: '35%',
    height: fonts.subtitulo,
  },
  placeholderLinha: {
    height: fonts.corpo,
    borderRadius: radius.sm,
  },
  placeholderLinhaCurta: {
    width: '60%',
  },
});
