import { StyleSheet, Text } from 'react-native';

import { CarrosselLivros } from '@/components/livro/CarrosselLivros';
import { Tela } from '@/components/ui/Tela';
import { fonts, useCores } from '@/constants/theme';

// Gêneros exibidos na Início (slug da Open Library + nome em português).
const GENEROS = [
  { slug: 'fantasy', titulo: 'Fantasia' },
  { slug: 'romance', titulo: 'Romance' },
  { slug: 'science_fiction', titulo: 'Ficção científica' },
  { slug: 'mystery', titulo: 'Mistério' },
] as const;

// Aba Início: carrosséis de livros por gênero. A tela inteira rola.
export default function Inicio() {
  const c = useCores();

  return (
    <Tela rolavel>
      <Text style={[styles.titulo, { color: c.texto }]}>Início</Text>
      {GENEROS.map((genero) => (
        <CarrosselLivros key={genero.slug} titulo={genero.titulo} slug={genero.slug} />
      ))}
    </Tela>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: fonts.titulo,
    fontFamily: fonts.serifa,
    fontWeight: '700',
  },
});
