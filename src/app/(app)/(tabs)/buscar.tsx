import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { buscarLivros } from '@/api/openlibrary';
import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { ler, salvar } from '@/storage/armazenamento';
import type { LivroResumo } from '@/types/livro';

type CampoBusca = 'q' | 'title' | 'author';

const FILTROS: { campo: CampoBusca; rotulo: string; dica: string }[] = [
  { campo: 'q', rotulo: 'Tudo', dica: 'Título ou autor' },
  { campo: 'title', rotulo: 'Título', dica: 'Título do livro' },
  { campo: 'author', rotulo: 'Autor', dica: 'Nome do autor' },
];

const CHAVE_RECENTES = 'buscas-recentes';
const MAX_RECENTES = 8;

// Coloca o termo no topo, sem repetir (ignorando maiúsculas) e com no máximo 8 itens.
function adicionarRecente(lista: string[], termo: string): string[] {
  const semRepetir = lista.filter((t) => t.toLowerCase() !== termo.toLowerCase());
  return [termo, ...semRepetir].slice(0, MAX_RECENTES);
}

// Aba Buscar: pesquisa livros na Open Library por título ou autor.
export default function Buscar() {
  const c = useCores();
  const [termo, setTermo] = useState('');
  const [recentes, setRecentes] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<CampoBusca>('q');
  const [termoBuscado, setTermoBuscado] = useState<string | null>(null);
  const [livros, setLivros] = useState<LivroResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ignora respostas de buscas antigas quando o usuário busca de novo rápido.
  const ultimaBusca = useRef(0);

  useEffect(() => {
    ler<string[]>(CHAVE_RECENTES, []).then(setRecentes);
  }, []);

  function registrarRecente(limpo: string) {
    setRecentes((atuais) => {
      const nova = adicionarRecente(atuais, limpo);
      salvar(CHAVE_RECENTES, nova).catch(() => {
        // Falha ao gravar o histórico não impede a busca.
      });
      return nova;
    });
  }

  function limparRecentes() {
    setRecentes([]);
    salvar<string[]>(CHAVE_RECENTES, []).catch(() => {});
  }

  function alterarTermo(texto: string) {
    setTermo(texto);
    // Campo vazio volta para a tela inicial, com as buscas recentes.
    if (!texto.trim()) setTermoBuscado(null);
  }

  function buscarRecente(recente: string) {
    setTermo(recente);
    buscar(recente);
  }

  function escolherFiltro(campo: CampoBusca) {
    if (campo === filtro) return;
    setFiltro(campo);
    // Com uma busca na tela, refaz a busca já com o novo filtro.
    if (termoBuscado) buscar(termoBuscado, campo);
  }

  async function buscar(texto: string = termo, campo: CampoBusca = filtro) {
    const limpo = texto.trim();
    if (!limpo) return;

    Keyboard.dismiss();
    registrarRecente(limpo);
    const numero = ++ultimaBusca.current;
    setTermoBuscado(limpo);
    setLoading(true);
    setErro(null);
    try {
      const resultado = await buscarLivros(limpo, campo);
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
        <View style={styles.inicio}>
          {recentes.length > 0 ? (
            <View style={styles.recentes}>
              <View style={styles.recentesCabecalho}>
                <Text style={[styles.recentesTitulo, { color: c.texto }]}>Buscas recentes</Text>
                <Pressable onPress={limparRecentes} accessibilityRole="button" hitSlop={spacing.sm}>
                  <Text style={[styles.limpar, { color: c.primaria }]}>Limpar</Text>
                </Pressable>
              </View>
              <View style={styles.chips}>
                {recentes.map((recente) => (
                  <Pressable
                    key={recente}
                    onPress={() => buscarRecente(recente)}
                    accessibilityRole="button"
                    accessibilityLabel={`Buscar ${recente} de novo`}
                    style={({ pressed }) => [
                      styles.chip,
                      { backgroundColor: c.superficieAlta, borderColor: c.borda },
                      pressed && styles.pressionado,
                    ]}
                  >
                    <Text style={[styles.chipTexto, { color: c.texto }]} numberOfLines={1}>
                      {recente}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
          <View style={styles.dica}>
            <Text style={[styles.dicaTitulo, { color: c.texto }]}>O que vamos ler hoje?</Text>
            <Text style={[styles.dicaTexto, { color: c.textoSuave }]}>Digite um título ou autor.</Text>
          </View>
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
            rotulo={FILTROS.find((f) => f.campo === filtro)?.dica ?? 'Título ou autor'}
            placeholder={filtro === 'author' ? 'Ex.: Machado de Assis' : 'Ex.: Dom Casmurro'}
            value={termo}
            onChangeText={alterarTermo}
            onSubmitEditing={() => buscar()}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
        <Botao titulo="Buscar" onPress={() => buscar()} desabilitado={!termo.trim()} />
      </View>
      <View style={styles.filtros} accessibilityRole="tablist">
        {FILTROS.map(({ campo, rotulo }) => {
          const ativo = campo === filtro;
          return (
            <Pressable
              key={campo}
              onPress={() => escolherFiltro(campo)}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              style={({ pressed }) => [
                styles.filtro,
                {
                  backgroundColor: ativo ? c.primaria : c.superficieAlta,
                  borderColor: ativo ? c.primaria : c.borda,
                },
                pressed && styles.pressionado,
              ]}
            >
              <Text style={[styles.filtroTexto, { color: ativo ? c.primariaTexto : c.texto }]}>{rotulo}</Text>
            </Pressable>
          );
        })}
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
  filtros: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filtro: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filtroTexto: {
    fontSize: fonts.pequeno,
    fontWeight: '700',
  },
  inicio: {
    flex: 1,
    gap: spacing.xl,
  },
  recentes: {
    gap: spacing.md,
  },
  recentesCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentesTitulo: {
    fontSize: fonts.corpo,
    fontWeight: '700',
  },
  limpar: {
    fontSize: fonts.pequeno,
    fontWeight: '700',
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
