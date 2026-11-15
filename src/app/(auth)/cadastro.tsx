import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

// Rota /cadastro: cria a conta e já entra no app.
export default function Cadastro() {
  const c = useCores();
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleCadastrar() {
    if (!nome.trim() || !email.trim() || !senha) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }

    setEnviando(true);
    await cadastrar({ nome: nome.trim(), email, senha });
    setEnviando(false);
    // replace: depois de criar a conta, voltar não deve levar ao cadastro.
    router.replace('/');
  }

  function limparErro() {
    if (erro) setErro('');
  }

  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela rolavel centralizada>
        <View style={styles.cabecalho}>
          <Text style={[styles.titulo, { color: c.texto }]}>Criar conta</Text>
          <Text style={[styles.subtitulo, { color: c.textoSuave }]}>
            Leva menos de um minuto e sua estante fica salva neste aparelho.
          </Text>
        </View>

        <View style={[styles.cartao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
          <CampoTexto
            rotulo="Nome"
            placeholder="Como quer ser chamado"
            autoCapitalize="words"
            value={nome}
            onChangeText={(t) => {
              setNome(t);
              limparErro();
            }}
          />
          <CampoTexto
            rotulo="E-mail"
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              limparErro();
            }}
          />
          <CampoTexto
            rotulo="Senha"
            placeholder="Crie uma senha"
            secureTextEntry
            value={senha}
            onChangeText={(t) => {
              setSenha(t);
              limparErro();
            }}
            onSubmitEditing={handleCadastrar}
          />

          {erro ? (
            <View style={styles.erro}>
              <Ionicons name="alert-circle" size={16} color={c.erro} />
              <Text style={[styles.erroTexto, { color: c.erro }]}>{erro}</Text>
            </View>
          ) : null}

          <Botao titulo="Criar conta" onPress={handleCadastrar} carregando={enviando} />
        </View>

        <View style={styles.rodape}>
          <Text style={[styles.rodapeTexto, { color: c.textoSuave }]}>Já tem conta?</Text>
          <Link href="/login" replace style={[styles.link, { color: c.primaria }]}>
            Entrar
          </Link>
        </View>
      </Tela>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  cabecalho: {
    gap: spacing.sm,
  },
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  subtitulo: {
    fontSize: fonts.corpo,
  },
  cartao: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
  },
  erro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  erroTexto: {
    fontSize: fonts.pequeno,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  rodapeTexto: {
    fontSize: fonts.corpo,
  },
  link: {
    fontSize: fonts.corpo,
    fontWeight: '700',
  },
});
