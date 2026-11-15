import { Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

// Home provisória: só confirma que a rota protegida abriu.
// Será substituída pelas abas (Início, Buscar, Estante, Perfil).
export default function HomeProvisoria() {
  const c = useCores();
  const { usuario, sair } = useAuth();

  return (
    <Tela centralizada>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={[styles.titulo, { color: c.texto }]}>Olá, {usuario?.nome}</Text>
      <Text style={[styles.texto, { color: c.textoSuave }]}>Você está numa tela protegida do grupo (app).</Text>
      <Botao titulo="Sair" variante="secundario" onPress={sair} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  texto: {
    fontSize: fonts.corpo,
  },
});
