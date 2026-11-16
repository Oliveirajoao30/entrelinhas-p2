import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Tela } from '@/components/ui/Tela';
import { fonts, radius, spacing, useCores } from '@/constants/theme';

type NomeIcone = ComponentProps<typeof Ionicons>['name'];

const recursos: { icone: NomeIcone; texto: string }[] = [
  { icone: 'search-outline', texto: 'Busca de livros e autores na Open Library' },
  { icone: 'library-outline', texto: 'Estante com quero ler, lendo e lido' },
  { icone: 'heart-outline', texto: 'Favoritos e anotações com nota de 1 a 5' },
  { icone: 'contrast-outline', texto: 'Tema claro e escuro' },
];

const dupla = ['João Victor Oliveira', 'Sérgio'];

// Versão lida do app.json em tempo de execução.
const versao = Constants.expoConfig?.version ?? '1.0.0';

// Rota /sobre: o que o app faz, de onde vêm os dados e quem fez.
export default function Sobre() {
  const c = useCores();

  return (
    <Tela rolavel>
      <Stack.Screen options={{ title: 'Sobre o app' }} />

      <View style={styles.topo}>
        <View style={[styles.logo, { backgroundColor: c.primaria }]}>
          <Ionicons name="book" size={36} color={c.primariaTexto} />
        </View>
        <Text style={[styles.nome, { color: c.texto }]}>Entrelinhas</Text>
        <Text style={[styles.versao, { color: c.textoSuave }]}>Versão {versao}</Text>
        <Text style={[styles.slogan, { color: c.textoSuave }]}>
          Seu diário de leituras: descubra livros, organize a estante e guarde o que achou de cada um.
        </Text>
      </View>

      <View style={[styles.secao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        <Text style={[styles.secaoTitulo, { color: c.texto }]}>O que dá para fazer</Text>
        {recursos.map((r) => (
          <View key={r.texto} style={styles.linha}>
            <Ionicons name={r.icone} size={20} color={c.primaria} />
            <Text style={[styles.linhaTexto, { color: c.texto }]}>{r.texto}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.secao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        <Text style={[styles.secaoTitulo, { color: c.texto }]}>Dados dos livros</Text>
        <Text style={[styles.secaoTexto, { color: c.textoSuave }]}>
          Títulos, capas, autores e assuntos vêm da API pública da Open Library, do Internet Archive.
          Estante, favoritos e anotações ficam só neste aparelho.
        </Text>
        <Pressable
          onPress={() => WebBrowser.openBrowserAsync('https://openlibrary.org')}
          accessibilityRole="link"
          style={({ pressed }) => [styles.link, pressed && styles.pressionado]}
        >
          <Text style={[styles.linkTexto, { color: c.primaria }]}>openlibrary.org</Text>
          <Ionicons name="open-outline" size={16} color={c.primaria} />
        </Pressable>
      </View>

      <View style={[styles.secao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        <Text style={[styles.secaoTitulo, { color: c.texto }]}>Feito por</Text>
        {dupla.map((pessoa) => (
          <View key={pessoa} style={styles.linha}>
            <Ionicons name="person-circle-outline" size={20} color={c.textoSuave} />
            <Text style={[styles.linhaTexto, { color: c.texto }]}>{pessoa}</Text>
          </View>
        ))}
        <Text style={[styles.secaoTexto, { color: c.textoSuave }]}>
          Projeto da P2 de desenvolvimento mobile, feito com Expo, Expo Router e TypeScript.
        </Text>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  nome: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  versao: {
    fontSize: fonts.pequeno,
  },
  slogan: {
    fontSize: fonts.corpo,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  secao: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  secaoTitulo: {
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  secaoTexto: {
    fontSize: fonts.pequeno,
    lineHeight: 19,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linhaTexto: {
    flex: 1,
    fontSize: fonts.corpo,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  linkTexto: {
    fontSize: fonts.corpo,
    fontWeight: '600',
  },
  pressionado: {
    opacity: 0.7,
  },
});
