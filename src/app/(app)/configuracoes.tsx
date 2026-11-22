import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/ui/Botao';
import { avisar, confirmar } from '@/utils/confirmar';
import { Tela } from '@/components/ui/Tela';
import { fonts, PreferenciaTema, radius, spacing, useCores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTema } from '@/context/TemaContext';
import { remover } from '@/storage/armazenamento';

type Opcao = { valor: PreferenciaTema; rotulo: string; icone: ComponentProps<typeof Ionicons>['name'] };

const opcoesTema: Opcao[] = [
  { valor: 'sistema', rotulo: 'Sistema', icone: 'phone-portrait-outline' },
  { valor: 'claro', rotulo: 'Claro', icone: 'sunny-outline' },
  { valor: 'escuro', rotulo: 'Escuro', icone: 'moon-outline' },
];

// Dados de leitura guardados no aparelho (não inclui conta, sessão nem tema).
const chavesDeLeitura = ['estante', 'favoritos', 'anotacoes', 'buscas-recentes'];

// Rota /configuracoes: tema, limpeza dos dados locais e saída da conta.
export default function Configuracoes() {
  const c = useCores();
  const { preferencia, setPreferencia } = useTema();
  const { sair } = useAuth();

  function confirmarLimpeza() {
    confirmar(
      'Limpar dados locais',
      'Isso apaga sua estante, favoritos, anotações e buscas recentes deste aparelho. Sua conta continua.',
      'Limpar',
      async () => {
        await Promise.all(chavesDeLeitura.map(remover));
        avisar('Pronto', 'Os dados de leitura foram apagados.');
      },
    );
  }

  function confirmarSaida() {
    confirmar('Sair', 'Deseja sair da sua conta?', 'Sair', async () => {
      await sair();
      router.replace('/login');
    });
  }

  return (
    <Tela rolavel>
      <Stack.Screen options={{ title: 'Configurações' }} />

      {/* Tema */}
      <View style={[styles.secao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        <Text style={[styles.secaoTitulo, { color: c.texto }]}>Aparência</Text>
        <Text style={[styles.secaoTexto, { color: c.textoSuave }]}>A escolha fica salva neste aparelho.</Text>
        <View style={styles.opcoes}>
          {opcoesTema.map((o) => {
            const ativa = o.valor === preferencia;
            return (
              <Pressable
                key={o.valor}
                onPress={() => setPreferencia(o.valor)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativa }}
                style={[
                  styles.opcao,
                  { borderColor: ativa ? c.primaria : c.borda, backgroundColor: ativa ? c.superficieAlta : 'transparent' },
                ]}
              >
                <Ionicons name={o.icone} size={22} color={ativa ? c.primaria : c.textoSuave} />
                <Text style={[styles.opcaoTexto, { color: ativa ? c.texto : c.textoSuave }]}>{o.rotulo}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Dados */}
      <View style={[styles.secao, { backgroundColor: c.superficie, borderColor: c.borda }]}>
        <Text style={[styles.secaoTitulo, { color: c.texto }]}>Dados</Text>
        <Text style={[styles.secaoTexto, { color: c.textoSuave }]}>
          Estante, favoritos e anotações ficam guardados só neste aparelho.
        </Text>
        <Botao titulo="Limpar dados locais" variante="secundario" onPress={confirmarLimpeza} />
      </View>

      <Botao titulo="Sair da conta" variante="perigo" onPress={confirmarSaida} />
    </Tela>
  );
}

const styles = StyleSheet.create({
  secao: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  secaoTitulo: {
    fontSize: fonts.subtitulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
  secaoTexto: {
    fontSize: fonts.pequeno,
  },
  opcoes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  opcao: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  opcaoTexto: {
    fontSize: fonts.pequeno,
    fontWeight: '600',
  },
});
