import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { fonts, radius, spacing, useCores } from '@/constants/theme';

type Variante = 'primario' | 'secundario' | 'perigo';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  carregando?: boolean;
  desabilitado?: boolean;
};

// Botão padrão do app. As cores mudam conforme a variante.
export function Botao({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false }: Props) {
  const c = useCores();
  const inativo = desabilitado || carregando;

  const fundo = variante === 'primario' ? c.primaria : 'transparent';
  const borda = variante === 'primario' ? c.primaria : variante === 'perigo' ? c.erro : c.borda;
  const corTexto = variante === 'primario' ? c.primariaTexto : variante === 'perigo' ? c.erro : c.texto;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: fundo, borderColor: borda },
        pressed && styles.pressionado,
        inativo && styles.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <Text style={[styles.texto, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontSize: fonts.corpo,
    fontWeight: '700',
  },
  pressionado: {
    opacity: 0.8,
  },
  inativo: {
    opacity: 0.5,
  },
});
