# Entrelinhas

Aplicativo mobile para leitores: descubra livros por gênero, busque títulos e autores na
[Open Library](https://openlibrary.org), monte a sua estante (quero ler, lendo, lido), guarde
favoritos e escreva anotações com nota para cada livro.

Projeto da P2, feito com Expo + React Native + TypeScript.

Vídeo: (link)

## Telas

**Conta**
- **Onboarding**: apresentação do app, exibida só na primeira abertura.
- **Login** e **Cadastro**: com validação dos campos; a sessão fica salva e o usuário continua logado ao reabrir o app.

**Abas**
- **Início**: saudação ao usuário e carrosséis de livros por gênero (Fantasia, Romance, Ficção científica, Mistério). Puxar para atualizar; funciona sem internet usando o cache local.
- **Buscar**: busca na Open Library com filtro Tudo / Título / Autor, histórico de buscas recentes e estados de carregando, erro e vazio.
- **Estante**: livros separados por status de leitura.
- **Perfil**: avatar, nome, e-mail, bio, números da estante e menu para as outras telas; botão Sair com confirmação.

**Telas empilhadas**
- **Detalhe do livro** (`/livro/[id]`): capa, sinopse, assuntos (abrem o gênero), link para o autor e ações de estante, favoritar e anotar.
- **Autor** (`/autor/[id]`): foto, datas, biografia e lista de obras.
- **Gênero** (`/genero/[slug]`): grade de 2 colunas com paginação infinita.
- **Anotar** (modal): texto e nota de 1 a 5 para o livro.
- **Favoritos** e **Minhas anotações**.
- **Editar perfil**: nome e bio.
- **Configurações**: tema claro, escuro ou do sistema e limpeza dos dados locais.
- **Sobre o app**.
- **404**: para rotas que não existem.

## Tecnologias

- **Expo SDK 58** e **Expo Router** (rotas por arquivos, grupos `(auth)` e `(app)`, abas e pilha)
- **React Native** com **TypeScript**
- **StyleSheet + Flexbox** para o layout, com tema central (`useCores`, `spacing`, `radius`, `fonts`)
- **Open Library API** (`openlibrary.org`), sem chave, isolada em `src/api/openlibrary.ts`
- **AsyncStorage** para estante, favoritos, anotações, tema, buscas recentes e cache da Início
- **SecureStore** para a sessão do usuário
- **expo-image** para capas e fotos de autores

## Como rodar

Pré-requisitos: Node.js 22 LTS e o app **Expo Go** no celular (Android ou iOS).

```bash
npm install
npx expo start
```

Depois, escaneie o QR code com o Expo Go (Android) ou com a câmera (iOS). O celular e o computador
precisam estar na mesma rede.

## Estrutura

```
src/
  app/          rotas (Expo Router)
  api/          acesso à Open Library
  components/   ui/ (base) e livro/ (capa, cartões, carrosséis, estados)
  constants/    tema
  context/      sessão e tema
  hooks/        useFetch
  storage/      AsyncStorage (estante, favoritos, anotações)
  types/        tipos compartilhados
```

## Dupla

- João Victor
- Sérgio

---

*Versão 1.0 — 2026-11-16*
