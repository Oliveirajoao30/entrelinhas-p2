import { Redirect, Stack, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { ler } from '@/storage/armazenamento';

// Grupo (auth): telas de quem ainda não entrou.
// - Se já existe sessão, vai direto para a home.
// - Na primeira abertura do app, mostra o onboarding antes do login.
export default function AuthLayout() {
  const { usuario, carregando } = useAuth();
  const segmentos = useSegments();
  const [onboardingVisto, setOnboardingVisto] = useState<boolean | null>(null);

  useEffect(() => {
    ler('onboarding-visto', false).then(setOnboardingVisto);
  }, [segmentos]);

  if (carregando || onboardingVisto === null) return null;
  if (usuario) return <Redirect href="/" />;

  const naTelaDeOnboarding = segmentos[segmentos.length - 1] === 'onboarding';
  if (!onboardingVisto && !naTelaDeOnboarding) return <Redirect href="/onboarding" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
