import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { lerAnotacao } from '@/storage/anotacoes';
import { adicionarNaEstante, removerDaEstante, statusDoLivro } from '@/storage/estante';
import { alternarFavorito, ehFavorito } from '@/storage/favoritos';
import { LivroResumo, rotulosStatus, StatusLeitura } from '@/types/livro';

const ordemStatus: StatusLeitura[] = ['quero-ler', 'lendo', 'lido'];

type Props = {
  livro: LivroResumo;
};

// Ações do detalhe do livro: estante (status de leitura), favoritar e anotar.
export function AcoesLivro({ livro }: Props) {
  const c = useCores();
  const [status, setStatus] = useState<StatusLeitura | null>(null);
  const [favorito, setFavorito] = useState(false);
  const [temAnotacao, setTemAnotacao] = useState(false);

  // Só o resumo vai para o armazenamento (sem sinopse e assuntos).
  const resumo: LivroResumo = {
    id: livro.id,
    titulo: livro.titulo,
    autores: livro.autores,
    autorIds: livro.autorIds,
    capaId: livro.capaId,
    ano: livro.ano,
  };

  // Atualiza ao voltar do modal de anotação ou de outra tela.
  useFocusEffect(
    useCallback(() => {
      statusDoLivro(livro.id).then(setStatus);
      ehFavorito(livro.id).then(setFavorito);
      lerAnotacao(livro.id).then((a) => setTemAnotacao(a !== null));
    }, [livro.id]),
  );

  // Tocar no status atual tira o livro da estante.
  async function escolherStatus(novo: StatusLeitura) {
    if (novo === status) {
      await removerDaEstante(livro.id);
      setStatus(null);
    } else {
      await adicionarNaEstante(resumo, novo);
      setStatus(novo);
    }
  }

  async function favoritar() {
    setFavorito(await alternarFavorito(resumo));
  }

  function anotar() {
    router.push({ pathname: '/anotar', params: { id: livro.id, titulo: livro.titulo } });
  }

  return (
    <View style={[styles.caixa, { backgroundColor: c.superficie, borderColor: c.borda }]}>
      <Text style={[styles.rotulo, { color: c.textoSuave }]}>
        {status ? 'Na sua estante' : 'Adicionar à estante'}
      </Text>
      <View style={styles.status}>
        {ordemStatus.map((s) => {
          const ativo = s === status;
          return (
            <Pressable
              key={s}
              onPress={() => escolherStatus(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              style={[
                styles.statusBotao,
                { borderColor: ativo ? c.primaria : c.borda, backgroundColor: ativo ? c.primaria : 'transparent' },
              ]}
            >
              <Text style={[styles.statusTexto, { color: ativo ? c.primariaTexto : c.texto }]}>{rotulosStatus[s]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.linha}>
        <Pressable
          onPress={favoritar}
          accessibilityRole="button"
          accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          style={[styles.acao, { borderColor: c.borda }]}
        >
          <Ionicons name={favorito ? 'heart' : 'heart-outline'} size={20} color={favorito ? c.erro : c.texto} />
          <Text style={[styles.acaoTexto, { color: c.texto }]}>{favorito ? 'Favorito' : 'Favoritar'}</Text>
        </Pressable>

        <Pressable
          onPress={anotar}
          accessibilityRole="button"
          style={[styles.acao, { borderColor: c.borda }]}
        >
          <Ionicons name={temAnotacao ? 'create' : 'create-outline'} size={20} color={c.texto} />
          <Text style={[styles.acaoTexto, { color: c.texto }]}>{temAnotacao ? 'Editar anotação' : 'Anotar'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  rotulo: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
  status: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusBotao: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusTexto: {
    fontSize: fonts.pequeno,
    fontWeight: '700',
  },
  linha: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  acaoTexto: {
    fontSize: fonts.corpo,
    fontWeight: '600',
  },
});
