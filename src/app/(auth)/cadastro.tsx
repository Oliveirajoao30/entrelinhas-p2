import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { CampoTexto } from '@/components/ui/CampoTexto';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import {
  SENHA_MINIMA,
  validarConfirmacao,
  validarEmail,
  validarNome,
  validarSenhaNova,
} from '@/utils/validacao';

type Erros = { nome: string; email: string; senha: string; confirmacao: string };

const semErros: Erros = { nome: '', email: '', senha: '', confirmacao: '' };

// Rota /cadastro: cria a conta e já entra no app.
export default function Cadastro() {
  const c = useCores();
  const router = useRouter();
  const { cadastrar } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erros, setErros] = useState<Erros>(semErros);
  const [enviando, setEnviando] = useState(false);

  async function handleCadastrar() {
    const novos: Erros = {
      nome: validarNome(nome),
      email: validarEmail(email),
      senha: validarSenhaNova(senha),
      confirmacao: validarConfirmacao(senha, confirmacao),
    };
    setErros(novos);
    if (Object.values(novos).some(Boolean)) return;

    setEnviando(true);
    const criou = await cadastrar({ nome: nome.trim(), email, senha });
    setEnviando(false);

    if (!criou) {
      setErros({ ...semErros, email: 'Já existe uma conta com este e-mail. Faça login.' });
      return;
    }
    // replace: depois de criar a conta, voltar não deve levar ao cadastro.
    router.replace('/');
  }

  // Ao digitar, some o erro só daquele campo.
  function alterar(campo: keyof Erros, setValor: (t: string) => void) {
    return (t: string) => {
      setValor(t);
      setErros((e) => (e[campo] ? { ...e, [campo]: '' } : e));
    };
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
            erro={erros.nome}
            onChangeText={alterar('nome', setNome)}
          />
          <CampoTexto
            rotulo="E-mail"
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            erro={erros.email}
            onChangeText={alterar('email', setEmail)}
          />
          <CampoTexto
            rotulo="Senha"
            placeholder={`Pelo menos ${SENHA_MINIMA} caracteres`}
            secureTextEntry
            value={senha}
            erro={erros.senha}
            onChangeText={alterar('senha', setSenha)}
          />
          <CampoTexto
            rotulo="Confirmar senha"
            placeholder="Repita a senha"
            secureTextEntry
            value={confirmacao}
            erro={erros.confirmacao}
            onChangeText={alterar('confirmacao', setConfirmacao)}
            onSubmitEditing={handleCadastrar}
          />

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
