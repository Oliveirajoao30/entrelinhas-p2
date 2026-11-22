import { Alert, Platform } from 'react-native';

// Diálogo de confirmação que funciona no celular e na web.
// No celular usa o Alert nativo; no navegador o Alert com botões não faz nada,
// então usamos o window.confirm.
export function confirmar(titulo: string, mensagem: string, textoBotao: string, aoConfirmar: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) aoConfirmar();
    return;
  }
  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoBotao, style: 'destructive', onPress: aoConfirmar },
  ]);
}

// Aviso simples (só com OK), também compatível com a web.
export function avisar(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensagem}`);
  else Alert.alert(titulo, mensagem);
}
