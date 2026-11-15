import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

// Rota /login: o grupo (auth) não aparece na URL.
export default function Login() {
  const c = useCores();
  const router = useRouter();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    setEnviando(true);
    const ok = await entrar(email, senha);
    setEnviando(false);

    if (ok) {
      // replace (e não push): o botão voltar não retorna ao login.
      router.replace('/');
    } else {
      setErro('E-mail ou senha inválidos.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela rolavel centralizada>
        {/* Marca */}
        <View style={styles.marca}>
          <View style={[styles.logo, { backgroundColor: c.primaria }]}>
            <Ionicons name="bookmark" size={22} color={c.primariaTexto} />
          </View>
          <Text style={[styles.nomeApp, { color: c.texto }]}>Entrelinhas</Text>
          <Text style={[styles.subtitulo, { color: c.textoSuave }]}>
            Descubra livros, monte sua estante e anote o que leu.
          </Text>
        </View>

        {/* Formulário */}
        <View style={[styles.cartao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
          <CampoTexto
            rotulo="E-mail"
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErro('');
            }}
          />

          <View>
            <CampoTexto
              rotulo="Senha"
              placeholder="Sua senha"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={(t) => {
                setSenha(t);
                setErro('');
              }}
              onSubmitEditing={handleEntrar}
            />
            <Pressable
              style={styles.olho}
              hitSlop={10}
              onPress={() => setMostrarSenha((v) => !v)}
              accessibilityLabel={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}
            >
              <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textoSuave} />
            </Pressable>
          </View>

          {erro ? (
            <View style={styles.erro}>
              <Ionicons name="alert-circle" size={16} color={c.erro} />
              <Text style={[styles.erroTexto, { color: c.erro }]}>{erro}</Text>
            </View>
          ) : null}

          <Botao titulo="Entrar" onPress={handleEntrar} carregando={enviando} />
        </View>

        <Text style={[styles.dica, { color: c.textoSuave }]}>Conta de teste: aluno@entrelinhas.com · senha 123</Text>
      </Tela>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  marca: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nomeApp: {
    fontSize: fonts.titulo + 6,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  subtitulo: {
    fontSize: fonts.corpo,
    textAlign: 'center',
  },
  cartao: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
  },
  olho: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 15,
  },
  erro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  erroTexto: {
    fontSize: fonts.pequeno,
  },
  dica: {
    fontSize: fonts.pequeno,
    textAlign: 'center',
  },
});
