import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { listarEstante } from '@/storage/estante';
import { ItemEstante, rotulosStatus, StatusLeitura } from '@/types/livro';

const ordemStatus: StatusLeitura[] = ['quero-ler', 'lendo', 'lido'];

const mensagensVazio: Record<StatusLeitura, string> = {
  'quero-ler': 'Nenhum livro na lista de desejos. Abra um livro e toque em "Quero ler".',
  lendo: 'Você não está lendo nada agora. Que tal começar um livro?',
  lido: 'Os livros que você terminar aparecem aqui.',
};

// Aba Estante: livros salvos no aparelho, separados por status de leitura.
export default function Estante() {
  const c = useCores();
  const [itens, setItens] = useState<ItemEstante[] | null>(null);
  const [filtro, setFiltro] = useState<StatusLeitura>('quero-ler');

  // Recarrega sempre que a aba ganha foco (o livro pode ter sido adicionado no detalhe).
  useFocusEffect(
    useCallback(() => {
      listarEstante().then(setItens);
    }, []),
  );

  const visiveis = (itens ?? []).filter((i) => i.status === filtro);

  function renderConteudo() {
    if (itens === null) return <EstadoTela tipo="carregando" />;
    if (visiveis.length === 0) return <EstadoTela tipo="vazio" mensagem={mensagensVazio[filtro]} />;
    return (
      <FlatList
        data={visiveis}
        keyExtractor={(i) => i.livro.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CartaoLivro
            livro={item.livro}
            onPress={() =>
              router.push({ pathname: '/livro/[id]', params: { id: item.livro.id, titulo: item.livro.titulo } })
            }
          />
        )}
      />
    );
  }

  return (
    <Tela>
      <Text style={[styles.titulo, { color: c.texto }]}>Minha estante</Text>

      {/* Segmentos: um botão por status, com a contagem de livros */}
      <View style={[styles.segmentos, { backgroundColor: c.superficieAlta }]}>
        {ordemStatus.map((status) => {
          const ativo = status === filtro;
          const total = (itens ?? []).filter((i) => i.status === status).length;
          return (
            <Pressable
              key={status}
              onPress={() => setFiltro(status)}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              style={[styles.segmento, ativo && { backgroundColor: c.primaria }]}
            >
              <Text style={[styles.segmentoTexto, { color: ativo ? c.primariaTexto : c.textoSuave }]}>
                {rotulosStatus[status]} ({total})
              </Text>
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
  segmentos: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  segmento: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentoTexto: {
    fontSize: fonts.pequeno,
    fontWeight: '700',
  },
  lista: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
