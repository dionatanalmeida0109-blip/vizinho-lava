# VizinhoLava

**Alguém vai na sua casa lavar a louça.**

VizinhoLava é um app (PWA) para contratar uma pessoa de confiança — um vizinho — que vai até a sua casa lavar a louça. A ideia começa por regiões densas, como o bairro Água Verde, onde muitos moradores vivem perto uns dos outros.

## Conceito

- **Simples na tela, complexo no código:** o usuário vê poucas opções; a lógica fica por trás.
- **Botão "Quero contratar":** o ponto de entrada do serviço.
- **QR code no condomínio:** um QR na portaria ou no elevador leva direto ao pedido, aproveitando a proximidade entre vizinhos.
- **Pagamento via Pix fora do app:** o app não processa pagamentos. O Pix é combinado e feito diretamente entre as partes, fora do aplicativo.

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- PWA com [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (manifest + service worker)
- `react-router-dom` para as rotas, recursos, foto
- **Autenticação 100% local** (localStorage + WebCrypto). Sem Supabase nem qualquer serviço externo — decisão do projeto por enquanto.

## Rodando localmente

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

Nenhuma variável de ambiente é necessária.

## Login (celular + senha)

Rotas: `/` (landing), `/login`, `/home` (protegida) e `/dev/resets` (oculta, do desenvolvedor).

- **Identificador fixo = celular brasileiro**, digitado **sem +55** (teste só em Curitiba): DDD + número, `(41) 99876-5432` ou `41998765432`, com máscara automática. Por dentro continua `+5541998765432` (contas antigas e link do WhatsApp seguem funcionando) (`src/lib/phone.ts`).
- **Criar conta:** nome + celular + senha (mín. 6 caracteres). **Entrar:** celular + senha.
- Senhas guardadas só como hash PBKDF2-SHA256 com salt (`src/lib/password.ts`).
- Dados no `localStorage` (`src/lib/localAuth.ts`): `users`, `session`, `pending_resets`, `dev_password`.
- **Força bruta:** 5 tentativas erradas de "Entrar" para o mesmo celular bloqueiam o login dele por 5 minutos (`src/lib/loginLimiter.ts`).
- **Esqueci a senha:** o usuário informa celular + nova senha; o pedido fica em `pending_resets`. **A senha atual continua valendo até o desenvolvedor aprovar.**
- **`/dev/resets`:** tela sem link no app, protegida pela senha do desenvolvedor (definida no primeiro acesso naquele navegador). Lista os pedidos com **Aprovar** / **Negar**.

> Limitação: como não há servidor, cada navegador/aparelho tem seus próprios usuários e pedidos. O bloqueio e a aprovação valem só naquele navegador.

## Orçamento (tela pós-login, `/home`)

- Botões **Tirar foto da louça** (`capture="environment"`, câmera traseira) e **Escolher da galeria**. A foto anexada fica visível (reduzida e guardada no `sessionStorage`, então sobrevive se o celular recarregar a página ao voltar da câmera) e aparece o botão **Enviar e analisar foto**, que roda a contagem local e leva ao orçamento. A foto **não sai do aparelho** (`src/lib/foto.ts`).
- **Preço natural R$ 20–30** (`src/lib/precos.ts` → `ORCAMENTO`). A faixa R$ 80–150 foi descartada.
- A foto gera uma **sugestão de valor base** via IA local (`src/lib/estimativa.ts`: densidade de bordas no canvas, sem rede/API). Volumes: pouca R$ 20 · média R$ 25 · cheia R$ 30.
- O lavador **confirma no local** (`/prestador/contagem`): ajusta a base na faixa 20–30 e marca produtos que levou. A foto não mostra gordura queimada — IA precifica, humano valida.
- Opção **"Não tenho os produtos adequados"**: esponja R$ 2,00 e detergente R$ 3,00 (acréscimo explícito).
- **Solicitar prestador** registra o pedido (`src/lib/pedidos.ts`) e abre WhatsApp se houver prestador da região. Histórico local em cliente e prestador (`src/lib/servicos.ts`).
- Promoção desligada (`promocao.ts` `ativa: false`). Pagamento via Pix fora do app.
- Visual: céu profundo, dourado e verde-mar (tokens em `styles/tokens.css`), no espírito do Órbita para portfólio — sem partículas/vórtice.

## Entenda como funciona o trabalho (`/como-funciona`, após login)

- Explica os 4 preços base e mostra a **tabela de utensílios** (`src/lib/catalogo.ts`), só com nomes curtos de peças reais de cozinha: prato, tigela, pote com tampa, tábua de corte; copo, taça, xícara/caneca, garrafa; talher, concha/espátula/escumadeira, faca de cozinha, ralador; panela, caçarola (R$ 1,50), fervedor (R$ 1,50), frigideira (R$ 1,50), panela de pressão (R$ 2,00), travessa, assadeira, forma de bolo, copo do liquidificador, cesto da air fryer (R$ 3,00). Churrasco: grelha R$ 8,00.
- **Churrasco** com preços maiores (espeto, grelha, chapa, tábua, travessa com gordura queimada), também no orçamento.
- **Serviços à parte** (não são louça): limpeza do fogão e do micro-ondas. **Fora do escopo:** geladeira e qualquer serviço de diarista.
- Valores derivados/extras são **de referência** e ajustáveis em `src/lib/catalogo.ts`.

## Cliente e Prestador (dois logins, estilo Uber/99)

- **A entrada mostra Cliente e Prestador (demo completa)** (flag `RECURSOS.MOSTRAR_PRESTADOR = true` em `src/lib/recursos.ts`): Entrar/Cadastre-se vão para `/login`, `/entrar` redireciona para o login do cliente e o cliente novo vai para **Como funciona** → **orçamento por foto** (`/home`). O prestador continua funcionando pelo endereço direto (`/prestador/login`, `/prestador`, `/p/<código>`). Com a flag em `true`, a página inicial e `/entrar` voltam a mostrar **Sou cliente** / **Sou prestador**.
- **Cliente** (`/login` → `/home`): celular + senha, orçamento pela foto, catálogo e "Como funciona".
- **Prestador** (`/prestador/login` → `/prestador`): cadastro com nome, celular (DDD + número), **região de atendimento** e o **WhatsApp que recebe os pedidos**. No cadastro aparece o aviso de compartilhamento de serviço ("o vizinho sai da casa dele para lavar a sua louça e quer receber pelo serviço; o pagamento é combinado antes, não depois") e é preciso marcar "Entendi".
- A área do prestador mostra o perfil (editável), como os pedidos chegam e um **link de pedidos** (`/p/<código>`) e o botão para a **Confirmar serviço no local** (`/prestador/contagem`, `src/pages/ContagemPrestador.tsx` + `src/lib/contagem.ts`): depois de lavar, o prestador marca quantas peças de cada item (louça, churrasco, serviços à parte, produtos usados) foram lavadas; o app soma pela tabela (com a promoção, se ativa) e fecha o **valor final**, guarda no aparelho e pode enviar ao WhatsApp do cliente. Pressão tem seletor de preço R$ 2,50–4,00 conforme a gordura. O cliente que abre esse link fica com o prestador escolhido e, no orçamento, tem o botão **Enviar pedido no WhatsApp** (link `wa.me` com os itens e o total).
- Cadastros separados (`users` para clientes, `prestadores` para prestadores); o mesmo celular pode ter os dois. Cada tipo só acessa a própria área.
- O bloqueio de 5 tentativas vale para os dois tipos (chaves separadas). Trocas de senha dos dois tipos aparecem em `/dev/resets` com o rótulo do tipo.
- Tudo continua **local no navegador**, sem servidor: o encaminhamento é só um link de WhatsApp.

## Padrão de código

Regra geral: **tela em `pages/`, peça visual em `components/ui/`, regra de negócio em `lib/`, cor em `styles/tokens.css`.**

```
src/
  pages/            uma tela por rota (Landing, Entrar, Login, Home, ComoFunciona, Prestador, ContagemPrestador, PrestadorLink, DevResets)
  components/
    ui/             peças visuais genéricas — importe sempre de '../components/ui'
      Pagina        casca da tela: cabeçalho (marca + tag + ações) e largura (estreita | larga | livre)
      Botao         Botao / BotaoLink / BotaoExterno + variante (primario | secundario | texto | topo | topo-destaque), GrupoBotoes
      Cartao        Cartao (titulo, destaque resumo|churrasco) e LinhaValor
      Formulario    Formulario, Campo, Marcar (checkbox), Mensagem (erro|ok), Quantidade (− / +)
      Texto         Titulo (+ sub), Apoio, Nota, Tag, CaixaAviso
    AcessoConta, EscolhaPapel/SeletorPapel, AvisoCompartilhamento, ErroTela   peças do domínio VizinhoLava
  lib/              lógica sem React: localAuth, loginLimiter, phone, password, precos, catalogo, contagem, promocao, estimativa, linkPrestador, rotas
  auth/             AuthContext (sessão reativa)
  styles/
    tokens.css      variáveis: cores (--mar, --borda, --erro, --alerta-*, --promo…), raios
    ui.css          classes dos componentes de ui/
    telas.css       o que é exclusivo de uma tela (agrupado por tela)
    index.css       importa os três, nesta ordem
```

Convenções:

- **Rotas**: nunca escreva `'/home'` na mão — use `ROTAS`, `AREA[role]` e `LOGIN[role]` de `src/lib/rotas.ts`.
- **Botões e cartões**: use os componentes (`<Botao>`, `<BotaoLink>`, `<Cartao>`) em vez de `className="cta"` direto. Nova variante → adicione em `Botao.tsx`.
- **Cores**: só via `var(--token)`. Cor nova → `tokens.css` primeiro.
- **Preços**: só em `lib/precos.ts` (bases), `lib/catalogo.ts` (multiplicadores) e `lib/promocao.ts` (desconto final). Telas só exibem.
- **Textos** em PT-BR; nomes de componentes/funções em português, como no resto do app.
- Antes de subir: `npm run build` (inclui `tsc`) e `npx oxlint src`.

## Observações

- Os ícones (`public/icon.svg`) são **provisórios** — substituir por ícones definitivos (PNG 192×192 e 512×512).
- Deploy: Vercel em https://vizinho-lava.vercel.app (upload do `dist`).
