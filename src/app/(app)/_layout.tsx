import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

// Grupo (app): tudo que precisa de sessão.
// Guarda na porta: sem usuário logado, qualquer tela daqui manda para o login.
// O Stack é o contêiner de fora; as abas são só mais uma tela dentro dele,
// por isso telas como o detalhe do livro abrem por cima da barra de abas.
export default function AppLayout() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Redirect href="/login" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Modal: sobe por cima da tela atual, ideal para criar ou editar */}
      <Stack.Screen name="anotar" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
