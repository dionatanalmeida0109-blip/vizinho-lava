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
- Tabela de preços embutida (`src/lib/precos.ts`): prato R$ 0,50 · copo R$ 0,30 · talher R$ 0,10 · panela a partir de R$ 2,00 (conforme a condição).
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

## Observações

- Os ícones (`public/icon.svg`) são **provisórios** — substituir por ícones definitivos (PNG 192×192 e 512×512).
- Deploy: Vercel em https://vizinho-lava.vercel.app (upload do `dist`).
