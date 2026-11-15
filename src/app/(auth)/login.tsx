import { StyleSheet, Text } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

// Login provisório: entra com a conta de demonstração para testar o Redirect.
// O formulário completo vem na próxima etapa.
export default function LoginProvisorio() {
  const c = useCores();
  const { entrar } = useAuth();

  return (
    <Tela centralizada>
      <Text style={[styles.titulo, { color: c.texto }]}>Entrelinhas</Text>
      <Text style={[styles.texto, { color: c.textoSuave }]}>Grupo (auth): tela de quem ainda não entrou.</Text>
      <Botao titulo="Entrar com a conta demo" onPress={() => entrar('aluno@entrelinhas.com', '123')} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  texto: {
    fontSize: fonts.corpo,
  },
});
