import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ComponentProps, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/components/ui/Botao';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { salvar } from '@/storage/armazenamento';

type Slide = { icone: ComponentProps<typeof Ionicons>['name']; titulo: string; texto: string };

const slides: Slide[] = [
  { icone: 'search', titulo: 'Descubra livros', texto: 'Busque milhões de títulos e autores da Open Library.' },
  { icone: 'library', titulo: 'Monte sua estante', texto: 'Separe o que quer ler, o que está lendo e o que já leu.' },
  { icone: 'create', titulo: 'Anote e avalie', texto: 'Guarde suas impressões e dê estrelas para cada leitura.' },
];

export const CHAVE_ONBOARDING = 'onboarding-visto';

// Rota /onboarding: aparece só na primeira abertura do app.
export default function Onboarding() {
  const c = useCores();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const lista = useRef<FlatList<Slide>>(null);
  const [atual, setAtual] = useState(0);

  const ultimo = atual === slides.length - 1;

  async function concluir() {
    await salvar(CHAVE_ONBOARDING, true);
    router.replace('/login');
  }

  function avancar() {
    if (ultimo) return concluir();
    lista.current?.scrollToIndex({ index: atual + 1 });
  }

  return (
    <SafeAreaView style={[styles.raiz, { backgroundColor: c.fundo }]}>
      <Pressable style={styles.pular} onPress={concluir} hitSlop={10}>
        <Text style={[styles.pularTexto, { color: c.textoSuave }]}>Pular</Text>
      </Pressable>

      <FlatList
        ref={lista}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.titulo}
        onMomentumScrollEnd={(e) => setAtual(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.circulo, { backgroundColor: c.superficieAlta, borderColor: c.borda }]}>
              <Ionicons name={item.icone} size={56} color={c.primaria} />
            </View>
            <Text style={[styles.titulo, { color: c.texto }]}>{item.titulo}</Text>
            <Text style={[styles.texto, { color: c.textoSuave }]}>{item.texto}</Text>
          </View>
        )}
      />

      <View style={styles.rodape}>
        <View style={styles.pontos}>
          {slides.map((s, i) => (
            <View
              key={s.titulo}
              style={[styles.ponto, { backgroundColor: i === atual ? c.primaria : c.borda }, i === atual && styles.pontoAtivo]}
            />
          ))}
        </View>
        <Botao titulo={ultimo ? 'Começar' : 'Próximo'} onPress={avancar} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  pular: { alignSelf: 'flex-end', padding: spacing.lg },
  pularTexto: { fontSize: fonts.corpo, fontWeight: '600' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  circulo: {
    width: 140,
    height: 140,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontSize: fonts.titulo, fontFamily: fonts.serifa, fontWeight: '700', textAlign: 'center' },
  texto: { fontSize: fonts.corpo, textAlign: 'center', lineHeight: 22 },
  rodape: { padding: spacing.xl, gap: spacing.xl },
  pontos: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  ponto: { width: 8, height: 8, borderRadius: radius.pill },
  pontoAtivo: { width: 24 },
});
