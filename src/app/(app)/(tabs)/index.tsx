import { StyleSheet, Text } from 'react-native';

import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';

// Aba Início (provisória): os destaques por gênero entram aqui.
export default function Inicio() {
  const c = useCores();

  return (
    <Tela centralizada>
      <Text style={[styles.titulo, { color: c.texto }]}>Início</Text>
      <Text style={[styles.texto, { color: c.textoSuave }]}>Em breve: destaques por gênero.</Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: fonts.titulo, fontFamily: fonts.serifa, fontWeight: '700', textAlign: 'center' },
  texto: { fontSize: fonts.corpo, textAlign: 'center' },
});
