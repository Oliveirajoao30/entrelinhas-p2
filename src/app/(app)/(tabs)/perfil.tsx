import { StyleSheet, Text } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

// Aba Perfil (provisória): por enquanto mostra o usuário e permite sair.
export default function Perfil() {
  const c = useCores();
  const { usuario, sair } = useAuth();

  return (
    <Tela centralizada>
      <Text style={[styles.titulo, { color: c.texto }]}>{usuario?.nome}</Text>
      <Text style={[styles.texto, { color: c.textoSuave }]}>{usuario?.email}</Text>
      <Botao titulo="Sair" variante="perigo" onPress={sair} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: fonts.titulo, fontFamily: fonts.serifa, fontWeight: '700', textAlign: 'center' },
  texto: { fontSize: fonts.corpo, textAlign: 'center' },
});
