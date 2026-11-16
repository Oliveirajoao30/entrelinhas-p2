import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const MAX_NOME = 60;
const MAX_BIO = 200;

// Rota /editar-perfil: altera o nome e a bio do usuário logado.
export default function EditarPerfil() {
  const c = useCores();
  const { usuario, atualizarUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [bio, setBio] = useState(usuario?.bio ?? '');
  const [erroNome, setErroNome] = useState<string | undefined>();
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome('Informe o seu nome.');
      return;
    }

    setSalvando(true);
    try {
      await atualizarUsuario({ nome: nomeLimpo, bio: bio.trim() });
      router.back();
    } catch {
      Alert.alert('Não foi possível salvar', 'Tente novamente em instantes.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tela rolavel>
      <Stack.Screen options={{ title: 'Editar perfil' }} />

      <View style={styles.formulario}>
        <CampoTexto
          rotulo="Nome"
          value={nome}
          onChangeText={(texto) => {
            setNome(texto);
            if (erroNome) setErroNome(undefined);
          }}
          erro={erroNome}
          placeholder="Seu nome"
          autoCapitalize="words"
          maxLength={MAX_NOME}
          returnKeyType="next"
        />

        <View style={styles.grupoBio}>
          <CampoTexto
            rotulo="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre o que você gosta de ler"
            multiline
            maxLength={MAX_BIO}
            textAlignVertical="top"
          />
          <Text style={[styles.contador, { color: c.textoSuave }]}>
            {bio.length}/{MAX_BIO}
          </Text>
        </View>
      </View>

      <Botao titulo="Salvar" onPress={salvar} carregando={salvando} />
      <Botao titulo="Cancelar" variante="secundario" onPress={() => router.back()} desabilitado={salvando} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  formulario: {
    gap: spacing.lg,
  },
  grupoBio: {
    gap: spacing.xs,
  },
  contador: {
    fontSize: fonts.pequeno,
    textAlign: 'right',
  },
});
