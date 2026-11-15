import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Capa } from '@/components/livro/Capa';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import type { LivroResumo } from '@/types/livro';

type Props = {
  livro: LivroResumo;
  onPress: () => void;
};

// Linha de lista com capa, título, autores e ano de um livro.
export function CartaoLivro({ livro, onPress }: Props) {
  const c = useCores();
  const autores = livro.autores.length > 0 ? livro.autores.join(', ') : 'Autor desconhecido';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${livro.titulo}, de ${autores}`}
      style={({ pressed }) => [
        styles.cartao,
        { backgroundColor: c.superficie, borderColor: c.borda },
        pressed && styles.pressionado,
      ]}
    >
      <Capa capaId={livro.capaId} titulo={livro.titulo} largura={56} tamanho="S" />
      <View style={styles.info}>
        <Text style={[styles.titulo, { color: c.texto }]} numberOfLines={2}>
          {livro.titulo}
        </Text>
        <Text style={[styles.autores, { color: c.textoSuave }]} numberOfLines={1}>
          {autores}
        </Text>
        {livro.ano ? <Text style={[styles.ano, { color: c.textoSuave }]}>{livro.ano}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pressionado: {
    opacity: 0.8,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  titulo: {
    fontSize: fonts.corpo,
    fontWeight: '700',
    fontFamily: fonts.serifa,
  },
  autores: {
    fontSize: fonts.pequeno,
  },
  ano: {
    fontSize: fonts.pequeno,
  },
});
