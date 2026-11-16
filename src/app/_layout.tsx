import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

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
    <>
      {/* Ícones da barra de status claros no modo escuro e vice-versa */}
      <StatusBar style={modo === 'escuro' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
    </>
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
