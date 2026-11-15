import { createContext, ReactNode, useContext, useState } from 'react';

import { Usuario } from '@/types/livro';

// Sessão do app (Aula 8): um Context guarda o usuário logado e
// qualquer tela consulta o mesmo dado para decidir a rota.
// Por enquanto tudo fica em memória: some ao fechar o app.

type Conta = Usuario & { senha: string };

type AuthCtx = {
  usuario: Usuario | null;
  carregando: boolean; // true enquanto lê a sessão salva
  entrar: (email: string, senha: string) => Promise<boolean>;
  cadastrar: (dados: Conta) => Promise<void>;
  sair: () => Promise<void>;
  atualizarUsuario: (dados: Partial<Usuario>) => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

// Conta de demonstração para testar sem cadastro.
const contaDemo: Conta = { nome: 'Aluno Entrelinhas', email: 'aluno@entrelinhas.com', senha: '123' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [contas, setContas] = useState<Conta[]>([contaDemo]);

  async function entrar(email: string, senha: string) {
    const conta = contas.find((c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.senha === senha);
    if (!conta) return false;
    const { senha: _senha, ...dados } = conta;
    setUsuario(dados);
    return true;
  }

  async function cadastrar(dados: Conta) {
    const email = dados.email.trim().toLowerCase();
    setContas((atuais) => [...atuais.filter((c) => c.email.toLowerCase() !== email), { ...dados, email }]);
    const { senha: _senha, ...publico } = dados;
    setUsuario({ ...publico, email });
  }

  async function sair() {
    setUsuario(null);
  }

  async function atualizarUsuario(dados: Partial<Usuario>) {
    setUsuario((atual) => (atual ? { ...atual, ...dados } : atual));
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando: false, entrar, cadastrar, sair, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro do AuthProvider');
  return ctx;
}
