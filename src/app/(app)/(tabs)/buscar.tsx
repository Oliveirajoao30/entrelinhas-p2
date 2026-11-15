import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, View } from 'react-native';

import { buscarLivros } from '@/api/openlibrary';
import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, spacing, useCores } from '@/constants/theme';
import type { LivroResumo } from '@/types/livro';

// Aba Buscar: pesquisa livros na Open Library por título ou autor.
export default function Buscar() {
  const c = useCores();
  const [termo, setTermo] = useState('');
  const [termoBuscado, setTermoBuscado] = useState<string | null>(null);
  const [livros, setLivros] = useState<LivroResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ignora respostas de buscas antigas quando o usuário busca de novo rápido.
  const ultimaBusca = useRef(0);

  async function buscar(texto: string = termo) {
    const limpo = texto.trim();
    if (!limpo) return;

    Keyboard.dismiss();
    const numero = ++ultimaBusca.current;
    setTermoBuscado(limpo);
    setLoading(true);
    setErro(null);
    try {
      const resultado = await buscarLivros(limpo);
      if (numero === ultimaBusca.current) setLivros(resultado);
    } catch (e) {
      if (numero === ultimaBusca.current) {
        setErro(e instanceof Error ? e.message : 'Não foi possível buscar.');
      }
    } finally {
      if (numero === ultimaBusca.current) setLoading(false);
    }
  }

  function abrirLivro(livro: LivroResumo) {
    router.push({ pathname: '/livro/[id]', params: { id: livro.id, titulo: livro.titulo } });
  }

  function renderConteudo() {
    if (termoBuscado === null) {
      return (
        <View style={styles.dica}>
          <Text style={[styles.dicaTitulo, { color: c.texto }]}>O que vamos ler hoje?</Text>
          <Text style={[styles.dicaTexto, { color: c.textoSuave }]}>Digite um título ou autor.</Text>
        </View>
      );
    }
    if (loading) return <EstadoTela tipo="carregando" mensagem="Buscando livros..." />;
    if (erro) {
      return (
        <EstadoTela
          tipo="erro"
          mensagem={`Não foi possível buscar (${erro}). Verifique sua conexão.`}
          onTentarDeNovo={() => buscar(termoBuscado)}
        />
      );
    }
    if (livros.length === 0) {
      return <EstadoTela tipo="vazio" mensagem={`Nenhum livro encontrado para "${termoBuscado}".`} />;
    }
    return (
      <FlatList
        data={livros}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => <CartaoLivro livro={item} onPress={() => abrirLivro(item)} />}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <Tela>
      <Text style={[styles.titulo, { color: c.texto }]}>Buscar</Text>
      <View style={styles.barraBusca}>
        <View style={styles.campo}>
          <CampoTexto
            rotulo="Título ou autor"
            placeholder="Ex.: Dom Casmurro"
            value={termo}
            onChangeText={setTermo}
            onSubmitEditing={() => buscar()}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
        <Botao titulo="Buscar" onPress={() => buscar()} desabilitado={!termo.trim()} />
      </View>
      {renderConteudo()}
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  campo: {
    flex: 1,
  },
  dica: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dicaTitulo: {
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  dicaTexto: {
    fontSize: fonts.corpo,
    textAlign: 'center',
  },
  lista: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
