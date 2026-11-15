import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { fonts, spacing, useCores } from '@/constants/theme';

type Props = {
  tipo: 'carregando' | 'erro' | 'vazio';
  mensagem?: string;
  onTentarDeNovo?: () => void;
};

const MENSAGENS_PADRAO: Record<Props['tipo'], string> = {
  carregando: 'Carregando...',
  erro: 'Não foi possível carregar. Verifique sua conexão.',
  vazio: 'Nada encontrado por aqui.',
};

// Estados padrão de uma tela que busca dados: carregando, erro e vazio.
export function EstadoTela({ tipo, mensagem, onTentarDeNovo }: Props) {
  const c = useCores();
  const texto = mensagem ?? MENSAGENS_PADRAO[tipo];

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {tipo === 'carregando' && <ActivityIndicator size="large" color={c.primaria} />}
      <Text style={[styles.mensagem, { color: tipo === 'erro' ? c.erro : c.textoSuave }]}>{texto}</Text>
      {tipo === 'erro' && onTentarDeNovo ? (
        <Botao titulo="Tentar de novo" variante="secundario" onPress={onTentarDeNovo} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  mensagem: {
    fontSize: fonts.corpo,
    textAlign: 'center',
  },
});
