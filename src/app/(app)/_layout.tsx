import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

// Grupo (app): tudo que precisa de sessão.
// Guarda na porta: sem usuário logado, qualquer tela daqui manda para o login.
export default function AppLayout() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Redirect href="/login" />;

  return <Stack />;
}
