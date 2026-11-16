import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EstadoTela } from '@/components/livro/EstadoTela';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { listarAnotacoes } from '@/storage/anotacoes';
import { Anotacao } from '@/types/livro';

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Rota /anotacoes: todas as anotações e avaliações do leitor.
export default function MinhasAnotacoes() {
  const c = useCores();
  const [anotacoes, setAnotacoes] = useState<Anotacao[] | null>(null);

  // Recarrega ao voltar do modal de edição.
  useFocusEffect(
    useCallback(() => {
      listarAnotacoes().then(setAnotacoes);
    }, []),
  );

  function abrir(a: Anotacao) {
    router.push({ pathname: '/anotar', params: { id: a.livroId, titulo: a.titulo } });
  }

  function renderConteudo() {
    if (anotacoes === null) return <EstadoTela tipo="carregando" />;
    if (anotacoes.length === 0) {
      return <EstadoTela tipo="vazio" mensagem='Nenhuma anotação ainda. Abra um livro e toque em "Anotar".' />;
    }
    return (
      <FlatList
        data={anotacoes}
        keyExtractor={(a) => a.livroId}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => abrir(item)}
            accessibilityRole="button"
            accessibilityLabel={`Editar anotação de ${item.titulo}`}
            style={({ pressed }) => [
              styles.cartao,
              { backgroundColor: c.superficie, borderColor: c.borda },
              pressed && styles.pressionado,
            ]}
          >
            <View style={styles.topo}>
              <Text style={[styles.livro, { color: c.texto }]} numberOfLines={1}>
                {item.titulo}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={c.textoSuave} />
            </View>

            {item.nota > 0 ? (
              <View style={styles.estrelas}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons key={n} name={n <= item.nota ? 'star' : 'star-outline'} size={14} color={c.aviso} />
                ))}
              </View>
            ) : null}

            {item.texto ? (
              <Text style={[styles.texto, { color: c.textoSuave }]} numberOfLines={3}>
                {item.texto}
              </Text>
            ) : null}

            <Text style={[styles.data, { color: c.textoSuave }]}>Atualizado em {formatarData(item.atualizadoEm)}</Text>
          </Pressable>
        )}
      />
    );
  }

  return (
    <Tela>
      <Stack.Screen options={{ title: 'Minhas anotações' }} />
      {renderConteudo()}
    </Tela>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  cartao: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  pressionado: {
    opacity: 0.8,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  livro: {
    flex: 1,
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  estrelas: {
    flexDirection: 'row',
    gap: 2,
  },
  texto: {
    fontSize: fonts.corpo,
    lineHeight: 21,
  },
  data: {
    fontSize: fonts.pequeno,
  },
});
