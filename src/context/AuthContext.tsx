import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { ler, remover, salvar } from '@/storage/armazenamento';
import { Usuario } from '@/types/livro';

// Sessão do app (Aulas 8 e 10).
// - Contas (com senha) e a sessão ativa ficam no SecureStore: são dados sensíveis.
// - Os dados públicos do usuário (nome, e-mail, bio) ficam no AsyncStorage.
// Assim o usuário continua logado ao fechar e abrir o app.

type Conta = Usuario & { senha: string };

type AuthCtx = {
  usuario: Usuario | null;
  carregando: boolean; // true enquanto lê a sessão salva
  entrar: (email: string, senha: string) => Promise<boolean>;
  cadastrar: (dados: Conta) => Promise<boolean>; // false se o e-mail já tem conta
  sair: () => Promise<void>;
  atualizarUsuario: (dados: Partial<Usuario>) => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

// Chaves do SecureStore aceitam só letras, números, '.', '-' e '_'.
const CHAVE_CONTAS = 'contas';
const CHAVE_SESSAO = 'sessao_email';
const CHAVE_USUARIO = 'usuario'; // AsyncStorage

// Conta de demonstração para testar sem cadastro.
const contaDemo: Conta = { nome: 'Aluno Entrelinhas', email: 'aluno@entrelinhas.com', senha: '123' };

async function lerContas(): Promise<Conta[]> {
  try {
    const bruto = await SecureStore.getItemAsync(CHAVE_CONTAS);
    const contas: Conta[] = bruto ? JSON.parse(bruto) : [];
    return contas.some((c) => c.email === contaDemo.email) ? contas : [contaDemo, ...contas];
  } catch {
    return [contaDemo];
  }
}

async function salvarContas(contas: Conta[]) {
  await SecureStore.setItemAsync(CHAVE_CONTAS, JSON.stringify(contas));
}

function semSenha({ senha: _senha, ...publico }: Conta): Usuario {
  return publico;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Ao abrir o app: se houver sessão salva, restaura o usuário.
  useEffect(() => {
    (async () => {
      try {
        const email = await SecureStore.getItemAsync(CHAVE_SESSAO);
        if (email) {
          const salvo = await ler<Usuario | null>(CHAVE_USUARIO, null);
          if (salvo && salvo.email === email) {
            setUsuario(salvo);
          } else {
            const conta = (await lerContas()).find((c) => c.email === email);
            if (conta) setUsuario(semSenha(conta));
          }
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  async function iniciarSessao(dados: Usuario) {
    await SecureStore.setItemAsync(CHAVE_SESSAO, dados.email);
    await salvar(CHAVE_USUARIO, dados);
    setUsuario(dados);
  }

  async function entrar(email: string, senha: string) {
    const alvo = email.trim().toLowerCase();
    const conta = (await lerContas()).find((c) => c.email.toLowerCase() === alvo && c.senha === senha);
    if (!conta) return false;
    await iniciarSessao(semSenha(conta));
    return true;
  }

  async function cadastrar(dados: Conta) {
    const email = dados.email.trim().toLowerCase();
    const nova: Conta = { ...dados, email };
    const contas = await lerContas();
    // Não sobrescreve uma conta que já existe com o mesmo e-mail.
    if (contas.some((c) => c.email.toLowerCase() === email)) return false;
    await salvarContas([...contas, nova]);
    await iniciarSessao(semSenha(nova));
    return true;
  }

  async function sair() {
    await SecureStore.deleteItemAsync(CHAVE_SESSAO);
    await remover(CHAVE_USUARIO);
    setUsuario(null);
  }

  async function atualizarUsuario(dados: Partial<Usuario>) {
    if (!usuario) return;
    const atualizado = { ...usuario, ...dados, email: usuario.email };
    await salvar(CHAVE_USUARIO, atualizado);
    // Mantém a conta (usada no próximo login) com os dados novos.
    const contas = await lerContas();
    await salvarContas(contas.map((c) => (c.email === usuario.email ? { ...c, ...atualizado } : c)));
    setUsuario(atualizado);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, cadastrar, sair, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro do AuthProvider');
  return ctx;
}
