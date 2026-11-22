import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Capa } from '@/components/livro/Capa';
import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { validarEmail, validarSenhaLogin } from '@/utils/validacao';

// Rota /login: o grupo (auth) não aparece na URL.
// Três clássicos em leque no topo do login (ids de capa da Open Library).
const capasDoLeque = {
  esquerda: { capaId: 15231557, titulo: 'Dom Casmurro' },
  centro: { capaId: 12370356, titulo: 'A Hora da Estrela' },
  direita: { capaId: 15236135, titulo: 'Capitães da Areia' },
};

export default function Login() {
  const c = useCores();
  const router = useRouter();
  const { entrar } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState(''); // erro geral (credenciais)
  const [erros, setErros] = useState({ email: '', senha: '' }); // erro de cada campo
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    // Valida antes de consultar as contas salvas.
    const novos = { email: validarEmail(email), senha: validarSenhaLogin(senha) };
    setErros(novos);
    if (novos.email || novos.senha) return;

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
        {/* Capas em leque */}
        <View style={styles.leque}>
          <View style={[styles.capaLado, styles.capaEsquerda]}>
            <Capa {...capasDoLeque.esquerda} largura={84} />
          </View>
          <View style={[styles.capaLado, styles.capaDireita]}>
            <Capa {...capasDoLeque.direita} largura={84} />
          </View>
          <View style={styles.capaCentro}>
            <Capa {...capasDoLeque.centro} largura={104} />
          </View>
        </View>

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
            erro={erros.email}
            onChangeText={(t) => {
              setEmail(t);
              setErro('');
              setErros((e) => ({ ...e, email: '' }));
            }}
          />

          <View>
            <CampoTexto
              rotulo="Senha"
              placeholder="Sua senha"
              secureTextEntry={!mostrarSenha}
              value={senha}
              erro={erros.senha}
              onChangeText={(t) => {
                setSenha(t);
                setErro('');
                setErros((e) => ({ ...e, senha: '' }));
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

        <View style={styles.rodape}>
          <Text style={[styles.rodapeTexto, { color: c.textoSuave }]}>Não tem conta?</Text>
          <Link href="/cadastro" style={[styles.link, { color: c.primaria }]}>
            Criar conta
          </Link>
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
  leque: {
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  capaCentro: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  capaLado: {
    position: 'absolute',
    opacity: 0.75,
  },
  capaEsquerda: {
    transform: [{ translateX: -62 }, { rotate: '-12deg' }],
  },
  capaDireita: {
    transform: [{ translateX: 62 }, { rotate: '12deg' }],
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
  // Ancorado pelo topo (rótulo + metade do campo), assim não sai do lugar
  // quando aparece a mensagem de erro embaixo da senha.
  olho: {
    position: 'absolute',
    right: spacing.lg,
    top: 36,
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
  dica: {
    fontSize: fonts.pequeno,
    textAlign: 'center',
  },
});
