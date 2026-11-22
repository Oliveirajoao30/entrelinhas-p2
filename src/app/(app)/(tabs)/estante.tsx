import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { confirmar } from '@/utils/confirmar';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { listarEstante, mudarStatus, removerDaEstante } from '@/storage/estante';
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

  async function mover(item: ItemEstante, status: StatusLeitura) {
    await mudarStatus(item.livro.id, status);
    setItens(await listarEstante());
  }

  function confirmarRemocao(item: ItemEstante) {
    confirmar('Remover da estante', `Remover "${item.livro.titulo}" da sua estante?`, 'Remover', async () => {
      await removerDaEstante(item.livro.id);
      setItens(await listarEstante());
    });
  }

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
          <View style={styles.item}>
            <CartaoLivro
              livro={item.livro}
              onPress={() =>
                router.push({ pathname: '/livro/[id]', params: { id: item.livro.id, titulo: item.livro.titulo } })
              }
            />
            {/* Ações: mover para outro status ou remover */}
            <View style={styles.acoes}>
              {ordemStatus
                .filter((s) => s !== item.status)
                .map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => mover(item, s)}
                    accessibilityLabel={`Mover ${item.livro.titulo} para ${rotulosStatus[s]}`}
                    style={[styles.acao, { borderColor: c.borda }]}
                  >
                    <Ionicons name="swap-horizontal" size={14} color={c.textoSuave} />
                    <Text style={[styles.acaoTexto, { color: c.texto }]}>{rotulosStatus[s]}</Text>
                  </Pressable>
                ))}
              <Pressable
                onPress={() => confirmarRemocao(item)}
                accessibilityLabel={`Remover ${item.livro.titulo} da estante`}
                style={[styles.acao, styles.remover, { borderColor: c.erro }]}
              >
                <Ionicons name="trash-outline" size={14} color={c.erro} />
                <Text style={[styles.acaoTexto, { color: c.erro }]}>Remover</Text>
              </Pressable>
            </View>
          </View>
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
  item: {
    gap: spacing.sm,
  },
  acoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  remover: {
    marginLeft: 'auto',
  },
  acaoTexto: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
  lista: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
