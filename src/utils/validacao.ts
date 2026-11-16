// Regras de validação dos formulários de conta.
// Cada função devolve a mensagem de erro, ou '' quando o valor está certo.

export const SENHA_MINIMA = 6;

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNome(nome: string): string {
  const limpo = nome.trim();
  if (!limpo) return 'Informe seu nome.';
  if (limpo.length < 2) return 'O nome precisa ter pelo menos 2 letras.';
  return '';
}

export function validarEmail(email: string): string {
  const limpo = email.trim();
  if (!limpo) return 'Informe seu e-mail.';
  if (!formatoEmail.test(limpo)) return 'Digite um e-mail válido, como voce@email.com.';
  return '';
}

// No login só exigimos a senha preenchida: a conta de teste usa "123".
export function validarSenhaLogin(senha: string): string {
  return senha ? '' : 'Informe sua senha.';
}

export function validarSenhaNova(senha: string): string {
  if (!senha) return 'Crie uma senha.';
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (/^\s+$/.test(senha)) return 'A senha não pode ter só espaços.';
  return '';
}

export function validarConfirmacao(senha: string, confirmacao: string): string {
  if (!confirmacao) return 'Repita a senha.';
  if (senha !== confirmacao) return 'As senhas não são iguais.';
  return '';
}
