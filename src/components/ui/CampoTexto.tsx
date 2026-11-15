import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { fonts, radius, spacing, useCores } from '@/constants/theme';

type Props = TextInputProps & {
  rotulo: string;
  erro?: string; // mensagem exibida abaixo do campo
};

// Campo de texto com rótulo, destaque ao focar e mensagem de erro.
export function CampoTexto({ rotulo, erro, onFocus, onBlur, ...resto }: Props) {
  const c = useCores();
  const [focado, setFocado] = useState(false);

  const corBorda = erro ? c.erro : focado ? c.primaria : c.borda;

  return (
    <View style={styles.grupo}>
      <Text style={[styles.rotulo, { color: c.textoSuave }]}>{rotulo}</Text>
      <TextInput
        placeholderTextColor={c.textoSuave}
        {...resto}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        style={[styles.campo, { backgroundColor: c.superficieAlta, borderColor: corBorda, color: c.texto }]}
      />
      {erro ? <Text style={[styles.erro, { color: c.erro }]}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: spacing.xs,
  },
  rotulo: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
  campo: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fonts.corpo,
  },
  erro: {
    fontSize: fonts.pequeno,
  },
});
