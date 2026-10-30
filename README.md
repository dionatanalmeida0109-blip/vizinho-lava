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
- [Supabase](https://supabase.com/) (`@supabase/supabase-js`) — apenas o cliente configurado em `src/lib/supabase.ts`; nenhum projeto Supabase foi criado ainda

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Login (nome + senha)

Rotas: `/` (landing), `/login`, `/home` (protegida).

O login usa Supabase Auth com e-mail/senha, mas o usuário digita só **nome** e **senha**. O nome vira um e-mail sintético (veja `src/lib/authName.ts`):

`"João da Silva"` → `joao.da.silva@vizinhollava.local` (minúsculas, sem acentos, espaços viram `.`).

- **Entrar:** `signInWithPassword` com o e-mail sintético.
- **Criar conta:** `signUp` com o mesmo nome+senha; o nome original fica em `user_metadata.name` e aparece na home.
- Senha mínima: 6 caracteres.
- Como os e-mails são fictícios, **desative a confirmação de e-mail** no Supabase (Authentication → Providers → Email → "Confirm email").
- Sem `.env` configurado, a tela de login mostra um aviso em vez de quebrar.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |

Nunca faça commit do `.env` nem coloque chaves reais no código.

## Observações

- Os ícones (`public/icon.svg`) são **provisórios** — substituir por ícones definitivos (PNG 192×192 e 512×512).
- Ainda **não há deploy**.
