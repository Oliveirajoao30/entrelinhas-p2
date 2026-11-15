import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';

import { useCores } from '@/constants/theme';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

// Ícone da aba: preenchido quando ativa, contorno quando inativa.
function icone(ativo: NomeIcone, inativo: NomeIcone) {
  return ({ color, focused, size }: { color: unknown; focused: boolean; size: number }) => (
    <Ionicons name={focused ? ativo : inativo} size={size} color={color as string} />
  );
}

// Abas: destinos de mesmo nível, sempre visíveis. Cada aba tem sua própria pilha.
export default function TabsLayout() {
  const c = useCores();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primaria,
        tabBarInactiveTintColor: c.textoSuave,
        tabBarStyle: { backgroundColor: c.superficie, borderTopColor: c.borda },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icone('home', 'home-outline') }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar', tabBarIcon: icone('search', 'search-outline') }} />
      <Tabs.Screen name="estante" options={{ title: 'Estante', tabBarIcon: icone('library', 'library-outline') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icone('person', 'person-outline') }} />
    </Tabs>
  );
}
