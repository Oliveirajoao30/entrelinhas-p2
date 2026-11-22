import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ComponentProps, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { confirmar } from '@/utils/confirmar';
import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { listarEstante } from '@/storage/estante';
import type { ItemEstante, StatusLeitura } from '@/types/livro';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

const ESTATISTICAS: { status: StatusLeitura; rotulo: string }[] = [
  { status: 'quero-ler', rotulo: 'Quero ler' },
  { status: 'lendo', rotulo: 'Lendo' },
  { status: 'lido', rotulo: 'Lidos' },
];

const MENU: { rota: string; rotulo: string; icone: NomeIcone }[] = [
  { rota: '/favoritos', rotulo: 'Favoritos', icone: 'heart-outline' },
  { rota: '/anotacoes', rotulo: 'Minhas anotações', icone: 'create-outline' },
  { rota: '/editar-perfil', rotulo: 'Editar perfil', icone: 'person-outline' },
  { rota: '/configuracoes', rotulo: 'Configurações', icone: 'settings-outline' },
  { rota: '/sobre', rotulo: 'Sobre o app', icone: 'information-circle-outline' },
];

function iniciais(nome?: string): string {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase() || '?';
}

function contarPorStatus(itens: ItemEstante[]): Record<StatusLeitura, number> {
  const contagem: Record<StatusLeitura, number> = { 'quero-ler': 0, lendo: 0, lido: 0 };
  return itens.reduce((acc, item) => ({ ...acc, [item.status]: acc[item.status] + 1 }), contagem);
}

// Aba Perfil: dados do usuário, números da estante e menu para as outras telas.
export default function Perfil() {
  const c = useCores();
  const { usuario, sair } = useAuth();
  const [contagem, setContagem] = useState<Record<StatusLeitura, number> | null>(null);
  const [erroEstante, setErroEstante] = useState(false);

  function confirmarSaida() {
    confirmar('Sair da conta', 'Tem certeza de que deseja sair?', 'Sair', async () => {
      await sair();
      router.replace('/login');
    });
  }

  // Recarrega a estante sempre que a aba volta a ficar visível.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      listarEstante()
        .then((itens) => {
          if (!ativo) return;
          setContagem(contarPorStatus(itens));
          setErroEstante(false);
        })
        .catch(() => {
          if (ativo) setErroEstante(true);
        });
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Tela rolavel>
      <View style={styles.topo}>
        <View style={[styles.avatar, { backgroundColor: c.primaria }]}>
          <Text style={[styles.avatarTexto, { color: c.primariaTexto }]}>{iniciais(usuario?.nome)}</Text>
        </View>
        <Text style={[styles.nome, { color: c.texto }]} numberOfLines={1}>
          {usuario?.nome}
        </Text>
        <Text style={[styles.email, { color: c.textoSuave }]} numberOfLines={1}>
          {usuario?.email}
        </Text>
        {usuario?.bio ? (
          <Text style={[styles.bio, { color: c.textoSuave }]} numberOfLines={3}>
            {usuario.bio}
          </Text>
        ) : null}
      </View>

      <View style={[styles.estatisticas, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        {erroEstante ? (
          <Text style={[styles.erroEstante, { color: c.erro }]}>Não foi possível ler a sua estante.</Text>
        ) : (
          ESTATISTICAS.map(({ status, rotulo }) => (
            <View key={status} style={styles.estatistica}>
              <Text style={[styles.numero, { color: c.primaria }]}>{contagem ? contagem[status] : '–'}</Text>
              <Text style={[styles.rotuloNumero, { color: c.textoSuave }]}>{rotulo}</Text>
            </View>
          ))
        )}
      </View>

      <View style={[styles.menu, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        {MENU.map((item, indice) => (
          <Pressable
            key={item.rota}
            onPress={() => router.push(item.rota)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.linha,
              indice > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.borda },
              pressed && { backgroundColor: c.superficieAlta },
            ]}
          >
            <Ionicons name={item.icone} size={fonts.subtitulo} color={c.primaria} />
            <Text style={[styles.linhaTexto, { color: c.texto }]}>{item.rotulo}</Text>
            <Ionicons name="chevron-forward" size={fonts.corpo} color={c.textoSuave} />
          </Pressable>
        ))}
      </View>

      <Botao titulo="Sair" variante="perigo" onPress={confirmarSaida} />
    </Tela>
  );
}

const TAMANHO_AVATAR = 88;

const styles = StyleSheet.create({
  topo: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: TAMANHO_AVATAR,
    height: TAMANHO_AVATAR,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarTexto: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  nome: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  email: {
    fontSize: fonts.corpo,
  },
  bio: {
    fontSize: fonts.corpo,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  estatistica: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  numero: {
    fontSize: fonts.titulo,
    fontWeight: '700',
  },
  rotuloNumero: {
    fontSize: fonts.pequeno,
  },
  erroEstante: {
    flex: 1,
    fontSize: fonts.pequeno,
    textAlign: 'center',
  },
  menu: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  linhaTexto: {
    flex: 1,
    fontSize: fonts.corpo,
  },
});
