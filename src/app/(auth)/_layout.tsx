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

  const naTelaDeOnboarding = segmentos[segmentos.length - 1] === 'onboarding';

  useEffect(() => {
    // Lê uma vez; se o onboarding já foi marcado como visto, mantém.
    ler('onboarding-visto', false).then((visto) => setOnboardingVisto((atual) => atual || visto));
  }, []);

  useEffect(() => {
    // Do onboarding só se sai por "Começar" ou "Pular" (que salvam a marca).
    // Marcar aqui evita mandar o usuário de volta antes de o armazenamento ser relido.
    if (naTelaDeOnboarding) setOnboardingVisto(true);
  }, [naTelaDeOnboarding]);

  if (carregando || onboardingVisto === null) return null;
  if (usuario) return <Redirect href="/" />;

  if (!onboardingVisto && !naTelaDeOnboarding) return <Redirect href="/onboarding" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
