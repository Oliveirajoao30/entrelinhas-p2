import { StyleSheet, Text } from 'react-native';

import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';

// Aba Buscar (provisória): a busca na Open Library entra aqui.
export default function Buscar() {
  const c = useCores();

  return (
    <Tela centralizada>
      <Text style={[styles.titulo, { color: c.texto }]}>Buscar</Text>
      <Text style={[styles.texto, { color: c.textoSuave }]}>Em breve: busca por título ou autor.</Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: fonts.titulo, fontFamily: fonts.serifa, fontWeight: '700', textAlign: 'center' },
  texto: { fontSize: fonts.corpo, textAlign: 'center' },
});
