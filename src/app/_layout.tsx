import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { LARGURA_WEB } from '@/constants/theme';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TemaProvider, useTema } from '@/context/TemaContext';

// Segura a splash até sabermos se existe sessão salva,
// assim o usuário não vê o login piscar antes de entrar no app.
SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const { carregando } = useAuth();
  const { modo, cores } = useTema();

  useEffect(() => {
    if (!carregando) SplashScreen.hideAsync();
  }, [carregando]);

  if (carregando) return null;

  return (
    <View style={[styles.fundo, { backgroundColor: cores.superficieAlta }]}>
      {/* Ícones da barra de status claros no modo escuro e vice-versa */}
      <StatusBar style={modo === 'escuro' ? 'light' : 'dark'} />
      {/* No navegador o app vira uma coluna centralizada; no celular ocupa a tela toda */}
      <View style={[styles.coluna, { backgroundColor: cores.fundo }]}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
      </View>
    </View>
  );
}

// Layout raiz: os providers envolvem o app inteiro,
// assim todas as telas enxergam a mesma sessão e o mesmo tema.
export default function RootLayout() {
  return (
    <TemaProvider>
      <AuthProvider>
        <Navegacao />
      </AuthProvider>
    </TemaProvider>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  coluna: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' && { maxWidth: LARGURA_WEB, alignSelf: 'center' as const }),
  },
});
