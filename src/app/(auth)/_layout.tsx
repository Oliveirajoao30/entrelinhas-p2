import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

// Grupo (auth): telas de quem ainda não entrou.
// Se já existe sessão, não faz sentido ver o login: vai direto para a home.
export default function AuthLayout() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;
  if (usuario) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
