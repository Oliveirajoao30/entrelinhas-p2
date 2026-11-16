import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { CartaoLivro } from '@/components/livro/CartaoLivro';
import { EstadoTela } from '@/components/livro/EstadoTela';
import { Tela } from '@/components/ui/Tela';
import { spacing, useCores } from '@/constants/theme';
import { alternarFavorito, listarFavoritos } from '@/storage/favoritos';
import { LivroResumo } from '@/types/livro';

// Rota /favoritos: livros marcados com coração, salvos no aparelho.
export default function Favoritos() {
  const c = useCores();
  const [livros, setLivros] = useState<LivroResumo[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      listarFavoritos().then(setLivros);
    }, []),
  );

  async function desfavoritar(livro: LivroResumo) {
    await alternarFavorito(livro);
    setLivros(await listarFavoritos());
  }

  function renderConteudo() {
    if (livros === null) return <EstadoTela tipo="carregando" />;
    if (livros.length === 0) {
      return <EstadoTela tipo="vazio" mensagem="Você ainda não tem favoritos. Toque no coração de um livro para salvá-lo aqui." />;
    }
    return (
      <FlatList
        data={livros}
        keyExtractor={(l) => l.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.linha}>
            <View style={styles.cartao}>
              <CartaoLivro
                livro={item}
                onPress={() => router.push({ pathname: '/livro/[id]', params: { id: item.id, titulo: item.titulo } })}
              />
            </View>
            <Pressable
              onPress={() => desfavoritar(item)}
              hitSlop={10}
              accessibilityLabel={`Remover ${item.titulo} dos favoritos`}
              style={[styles.coracao, { backgroundColor: c.superficieAlta }]}
            >
              <Ionicons name="heart" size={20} color={c.erro} />
            </Pressable>
          </View>
        )}
      />
    );
  }

  return (
    <Tela>
      <Stack.Screen options={{ title: 'Favoritos' }} />
      {renderConteudo()}
    </Tela>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cartao: {
    flex: 1,
  },
  coracao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
