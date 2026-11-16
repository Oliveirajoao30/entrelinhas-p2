import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { capaUrl, type TamanhoImagem } from '@/api/openlibrary';
import { fonts, radius, useCores } from '@/constants/theme';

type Props = {
  capaId?: number;
  titulo: string;
  largura?: number;
  tamanho?: TamanhoImagem;
};

// Proporção padrão de capa de livro (largura : altura = 2 : 3).
const PROPORCAO = 1.5;

function iniciais(titulo: string): string {
  return titulo
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palavra) => palavra[0].toUpperCase())
    .join('');
}

// Capa do livro vinda da Open Library. Sem capa, mostra as iniciais do título.
export function Capa({ capaId, titulo, largura = 64, tamanho = 'M' }: Props) {
  const c = useCores();
  const url = capaUrl(capaId, tamanho);
  const dimensoes = { width: largura, height: Math.round(largura * PROPORCAO) };

  if (!url) {
    return (
      <View
        style={[styles.base, styles.semCapa, dimensoes, { backgroundColor: c.superficieAlta, borderColor: c.borda }]}
        accessibilityLabel={`Livro sem capa: ${titulo}`}
      >
        <Text style={[styles.iniciais, { color: c.primaria, fontSize: Math.max(fonts.pequeno, largura / 3) }]}>
          {iniciais(titulo) || '?'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={[styles.base, dimensoes, { backgroundColor: c.superficieAlta }]}
      contentFit="cover"
      transition={200}
      accessibilityLabel={`Capa de ${titulo}`}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  semCapa: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: {
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
});
