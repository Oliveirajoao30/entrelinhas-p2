import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { confirmar } from '@/utils/confirmar';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { lerAnotacao, removerAnotacao, salvarAnotacao } from '@/storage/anotacoes';

// Rota /anotar?id=...&titulo=... aberta como modal (sobe por cima da tela atual).
export default function Anotar() {
  const c = useCores();
  const { id, titulo } = useLocalSearchParams<{ id: string; titulo?: string }>();

  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState('');
  const [existente, setExistente] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Se o livro já tem anotação, carrega para editar.
  useEffect(() => {
    lerAnotacao(id).then((a) => {
      if (!a) return;
      setNota(a.nota);
      setTexto(a.texto);
      setExistente(true);
    });
  }, [id]);

  async function handleSalvar() {
    setSalvando(true);
    await salvarAnotacao({
      livroId: id,
      titulo: titulo ?? 'Livro',
      texto: texto.trim(),
      nota,
      atualizadoEm: new Date().toISOString(),
    });
    setSalvando(false);
    router.back();
  }

  function handleExcluir() {
    confirmar('Excluir anotação', 'Deseja apagar a anotação deste livro?', 'Excluir', async () => {
      await removerAnotacao(id);
      router.back();
    });
  }

  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela rolavel>
        <Stack.Screen options={{ title: existente ? 'Editar anotação' : 'Nova anotação' }} />

        <Text style={[styles.livro, { color: c.texto }]} numberOfLines={2}>
          {titulo ?? 'Livro'}
        </Text>

        {/* Avaliação de 0 a 5 estrelas: tocar na estrela marcada de novo zera */}
        <View style={styles.bloco}>
          <Text style={[styles.rotulo, { color: c.textoSuave }]}>Sua avaliação</Text>
          <View style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setNota(n === nota ? 0 : n)}
                hitSlop={6}
                accessibilityLabel={`${n} estrela${n > 1 ? 's' : ''}`}
              >
                <Ionicons name={n <= nota ? 'star' : 'star-outline'} size={34} color={c.aviso} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.bloco}>
          <Text style={[styles.rotulo, { color: c.textoSuave }]}>Anotações</Text>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            multiline
            textAlignVertical="top"
            placeholder="O que achou? Trechos favoritos, personagens, ideias..."
            placeholderTextColor={c.textoSuave}
            style={[styles.campo, { backgroundColor: c.superficieAlta, borderColor: c.borda, color: c.texto }]}
          />
        </View>

        <Botao titulo="Salvar" onPress={handleSalvar} carregando={salvando} desabilitado={!texto.trim() && nota === 0} />
        {existente ? <Botao titulo="Excluir anotação" variante="perigo" onPress={handleExcluir} /> : null}
      </Tela>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  livro: {
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  bloco: { gap: spacing.sm },
  rotulo: { fontSize: fonts.pequeno, fontWeight: '600' },
  estrelas: { flexDirection: 'row', gap: spacing.sm },
  campo: {
    minHeight: 180,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    fontSize: fonts.corpo,
    lineHeight: 22,
  },
});
