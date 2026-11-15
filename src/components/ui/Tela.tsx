import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, useCores } from '@/constants/theme';

type Props = {
  children: ReactNode;
  rolavel?: boolean; // usa ScrollView quando o conteúdo pode passar da tela
  centralizada?: boolean; // centraliza o conteúdo na vertical (login, cadastro)
};

// Moldura padrão de todas as telas: área segura, fundo do tema e respiro lateral.
export function Tela({ children, rolavel = false, centralizada = false }: Props) {
  const c = useCores();

  return (
    <SafeAreaView style={[styles.raiz, { backgroundColor: c.fundo }]} edges={['top', 'left', 'right']}>
      {rolavel ? (
        <ScrollView
          contentContainerStyle={[styles.conteudo, centralizada && styles.centro]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.raiz, styles.conteudo, centralizada && styles.centro]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centro: {
    justifyContent: 'center',
  },
});
