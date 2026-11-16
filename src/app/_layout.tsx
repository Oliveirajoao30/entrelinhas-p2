import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';

// Segura a splash até sabermos se existe sessão salva,
// assim o usuário não vê o login piscar antes de entrar no app.
SplashScreen.preventAutoHideAsync();

function Navegacao() {
  const { carregando } = useAuth();

  useEffect(() => {
    if (!carregando) SplashScreen.hideAsync();
  }, [carregando]);

  if (carregando) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

// Layout raiz: o AuthProvider envolve o app inteiro,
// assim todas as telas enxergam a mesma sessão.
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navegacao />
    </AuthProvider>
  );
}
