import { StyleSheet, Text } from 'react-native';

import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';

// Aba Estante (provisória): os livros salvos por status entram aqui.
export default function Estante() {
  const c = useCores();

  return (
    <Tela centralizada>
      <Text style={[styles.titulo, { color: c.texto }]}>Minha estante</Text>
      <Text style={[styles.texto, { color: c.textoSuave }]}>Em breve: quero ler, lendo e lidos.</Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: fonts.titulo, fontFamily: fonts.serifa, fontWeight: '700', textAlign: 'center' },
  texto: { fontSize: fonts.corpo, textAlign: 'center' },
});
