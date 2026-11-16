import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarrosselLivros } from '@/components/livro/CarrosselLivros';
import { fonts, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

// Gêneros exibidos na Início (slug da Open Library + nome em português).
const GENEROS = [
  { slug: 'fantasy', titulo: 'Fantasia' },
  { slug: 'romance', titulo: 'Romance' },
  { slug: 'science_fiction', titulo: 'Ficção científica' },
  { slug: 'mystery', titulo: 'Mistério' },
] as const;

// Tempo do indicador de "atualizando"; cada carrossel mostra o próprio carregamento.
const DURACAO_ATUALIZANDO_MS = 600;

function primeiroNome(nome?: string): string {
  return nome?.trim().split(/\s+/)[0] ?? '';
}

// Aba Início: saudação e carrosséis de livros por gênero. Puxar para baixo atualiza.
export default function Inicio() {
  const c = useCores();
  const { usuario } = useAuth();
  const [versao, setVersao] = useState(0);
  const [atualizando, setAtualizando] = useState(false);

  const nome = primeiroNome(usuario?.nome);

  function atualizar() {
    setAtualizando(true);
    // Trocar a key remonta os carrosséis, que buscam os livros de novo.
    setVersao((v) => v + 1);
    setTimeout(() => setAtualizando(false), DURACAO_ATUALIZANDO_MS);
  }

  return (
    <SafeAreaView style={[styles.raiz, { backgroundColor: c.fundo }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            tintColor={c.primaria}
            colors={[c.primaria]}
            progressBackgroundColor={c.superficie}
          />
        }
      >
        <View style={styles.saudacao}>
          <Text style={[styles.ola, { color: c.texto }]} numberOfLines={1}>
            {nome ? `Olá, ${nome}` : 'Olá!'}
          </Text>
          <Text style={[styles.frase, { color: c.textoSuave }]}>Qual será a sua próxima leitura?</Text>
        </View>

        {GENEROS.map((genero) => (
          <CarrosselLivros key={`${genero.slug}-${versao}`} titulo={genero.titulo} slug={genero.slug} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
  },
  conteudo: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  saudacao: {
    gap: spacing.xs,
  },
  ola: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  frase: {
    fontSize: fonts.corpo,
  },
});
