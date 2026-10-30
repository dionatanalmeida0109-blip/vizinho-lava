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
- `react-router-dom` para as rotas
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

- **Identificador fixo = celular brasileiro**: `+55 (DDD) 9XXXX-XXXX`. Aceita `(41) 99876-5432`, `41998765432` ou `+55 41 99876-5432`; tudo vira `+5541998765432` (`src/lib/phone.ts`).
- **Criar conta:** nome + celular + senha (mín. 6 caracteres). **Entrar:** celular + senha.
- Senhas guardadas só como hash PBKDF2-SHA256 com salt (`src/lib/password.ts`).
- Dados no `localStorage` (`src/lib/localAuth.ts`): `users`, `session`, `pending_resets`, `dev_password`.
- **Força bruta:** 5 tentativas erradas de "Entrar" para o mesmo celular bloqueiam o login dele por 5 minutos (`src/lib/loginLimiter.ts`).
- **Esqueci a senha:** o usuário informa celular + nova senha; o pedido fica em `pending_resets`. **A senha atual continua valendo até o desenvolvedor aprovar.**
- **`/dev/resets`:** tela sem link no app, protegida pela senha do desenvolvedor (definida no primeiro acesso naquele navegador). Lista os pedidos com **Aprovar** / **Negar**.

> Limitação: como não há servidor, cada navegador/aparelho tem seus próprios usuários e pedidos. O bloqueio e a aprovação valem só naquele navegador.

## Orçamento (tela pós-login, `/home`)

- Botão **Tirar foto da louça** (`<input type="file" accept="image/*" capture="environment">` abre a câmera traseira no celular). A foto **não sai do aparelho**.
- Tabela de preços base embutida (`src/lib/precos.ts`), **abaixo do mercado**: prato R$ 0,40 · copo R$ 0,25 · talher R$ 0,08 · panela a partir de R$ 1,50 (conforme a condição). O catálogo inteiro (`src/lib/catalogo.ts`) é calculado como base × multiplicador, então mudar uma base atualiza tudo.
- **Promoção no final do orçamento** (`src/lib/promocao.ts`): a tabela fica com os preços base e o desconto (hoje 20%, "Promoção de lançamento") entra só no total — o resumo mostra "era R$ X, agora R$ Y" e quanto o cliente economiza, e a mensagem de WhatsApp leva os dois valores. Para encerrar, `ativa: false`.
- "IA" de contagem **local** (`src/lib/estimativa.ts`): estimativa grosseira por canvas (densidade de bordas da foto), sem rede e sem API externa. As quantidades vêm preenchidas e o cliente ajusta com − / +. O app avisa que a contagem é estimativa local e que **o lavador confirma o valor no local** (a foto não mostra gordura queimada no fundo da panela).
- Opção **"Não tenho os produtos adequados"**: o lavador leva os seus e cobra pela utilização — detergente R$ 1,00 e esponja R$ 1,50 (**valores de referência provisórios**, editáveis em `src/lib/precos.ts`).
- Mostra o orçamento base (louça + produtos). Pagamento via Pix combinado fora do app.

## Entenda como funciona o trabalho (`/como-funciona`, após login)

- Explica os 4 preços base e mostra uma **tabela expandida** (`src/lib/catalogo.ts`) com os utensílios mais vendidos no Brasil (rankings Amazon.com.br, Mercado Livre e Magalu, out/2026), cada um mapeado para uma base: bowls, potes/marmitas, tábuas, pratos de micro-ondas, copos/xícaras/garrafas, talheres e utensílios de silicone, panelas, frigideiras, panela de pressão, travessas/refratários, assadeiras, formas de silicone, copo de liquidificador, cesto de air fryer.
- **Churrasco** com preços maiores (espeto, grelha, chapa, tábua, travessa com gordura queimada), também no orçamento.
- **Serviços à parte** (não são louça): limpeza do fogão e do micro-ondas. **Geladeira não entra** (escopo de diarista).
- Valores derivados/extras são **de referência** e ajustáveis em `src/lib/catalogo.ts`.

## Cliente e Prestador (dois logins, estilo Uber/99)

- Na página inicial (e em `/entrar`) a pessoa escolhe **Sou cliente** ou **Sou prestador**.
- **Cliente** (`/login` → `/home`): celular + senha, orçamento pela foto, catálogo e "Como funciona".
- **Prestador** (`/prestador/login` → `/prestador`): cadastro com nome, celular (+55), **região de atendimento** e o **WhatsApp que recebe os pedidos**. No cadastro aparece o aviso de compartilhamento de serviço ("o vizinho sai da casa dele para lavar a sua louça e quer receber pelo serviço; o pagamento é combinado antes, não depois") e é preciso marcar "Entendi".
- A área do prestador mostra o perfil (editável), como os pedidos chegam e um **link de pedidos** (`/p/<código>`). O cliente que abre esse link fica com o prestador escolhido e, no orçamento, tem o botão **Enviar pedido no WhatsApp** (link `wa.me` com os itens e o total).
- Cadastros separados (`users` para clientes, `prestadores` para prestadores); o mesmo celular pode ter os dois. Cada tipo só acessa a própria área.
- O bloqueio de 5 tentativas vale para os dois tipos (chaves separadas). Trocas de senha dos dois tipos aparecem em `/dev/resets` com o rótulo do tipo.
- Tudo continua **local no navegador**, sem servidor: o encaminhamento é só um link de WhatsApp.

## Padrão de código

Regra geral: **tela em `pages/`, peça visual em `components/ui/`, regra de negócio em `lib/`, cor em `styles/tokens.css`.**

```
src/
  pages/            uma tela por rota (Landing, Entrar, Login, Home, ComoFunciona, Prestador, PrestadorLink, DevResets)
  components/
    ui/             peças visuais genéricas — importe sempre de '../components/ui'
      Pagina        casca da tela: cabeçalho (marca + tag + ações) e largura (estreita | larga | livre)
      Botao         Botao / BotaoLink / BotaoExterno + variante (primario | secundario | texto | topo | topo-destaque), GrupoBotoes
      Cartao        Cartao (titulo, destaque resumo|churrasco) e LinhaValor
      Formulario    Formulario, Campo, Marcar (checkbox), Mensagem (erro|ok), Quantidade (− / +)
      Texto         Titulo (+ sub), Apoio, Nota, Tag, CaixaAviso
    AcessoConta, EscolhaPapel/SeletorPapel, AvisoCompartilhamento, ErroTela   peças do domínio VizinhoLava
  lib/              lógica sem React: localAuth, loginLimiter, phone, password, precos, catalogo, promocao, estimativa, linkPrestador, rotas
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
