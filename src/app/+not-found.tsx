import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';

const TAMANHO_ICONE = 56;

// Tela 404: aparece quando a rota não existe.
export default function NaoEncontrada() {
  const c = useCores();

  return (
    <Tela centralizada>
      <Stack.Screen
        options={{
          title: 'Ops!',
          headerShown: true,
          headerStyle: { backgroundColor: c.fundo },
          headerTintColor: c.texto,
        }}
      />

      <View style={styles.conteudo}>
        <Ionicons name="book-outline" size={TAMANHO_ICONE} color={c.primaria} />
        <Text style={[styles.titulo, { color: c.texto }]}>Página não encontrada</Text>
        <Text style={[styles.texto, { color: c.textoSuave }]}>
          Parece que esta página saiu da estante. Que tal voltar e escolher outra leitura?
        </Text>

        <Link href="/" replace style={[styles.link, { backgroundColor: c.primaria, color: c.primariaTexto }]}>
          Voltar ao início
        </Link>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    alignItems: 'center',
    gap: spacing.md,
  },
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
    textAlign: 'center',
  },
  texto: {
    fontSize: fonts.corpo,
    textAlign: 'center',
    lineHeight: 22,
  },
  link: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    fontSize: fonts.corpo,
    fontWeight: '700',
    overflow: 'hidden',
  },
});
