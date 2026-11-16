import { ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { paletas, PreferenciaTema, TemaContext } from '@/constants/theme';
import { ler, salvar } from '@/storage/armazenamento';

// Tema claro/escuro (Aulas 7 e 10): a preferência fica salva no AsyncStorage
// (chave 'tema') e todo o app lê as cores pelo hook useCores().

const CHAVE = 'tema';

export function TemaProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme(); // 'light' | 'dark' do aparelho
  const [preferencia, setPreferenciaState] = useState<PreferenciaTema>('sistema');

  // Ao abrir o app, recupera a escolha salva.
  useEffect(() => {
    ler<PreferenciaTema>(CHAVE, 'sistema').then(setPreferenciaState);
  }, []);

  function setPreferencia(p: PreferenciaTema) {
    setPreferenciaState(p);
    salvar(CHAVE, p);
  }

  const modo = preferencia === 'sistema' ? (sistema === 'light' ? 'claro' : 'escuro') : preferencia;

  return (
    <TemaContext.Provider value={{ cores: paletas[modo], modo, preferencia, setPreferencia }}>
      {children}
    </TemaContext.Provider>
  );
}

// Acesso à preferência e ao modo (usado em Configurações e na barra de status).
export function useTema() {
  return useContext(TemaContext);
}
