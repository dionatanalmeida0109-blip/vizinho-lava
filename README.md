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

## Observações

- Os ícones (`public/icon.svg`) são **provisórios** — substituir por ícones definitivos (PNG 192×192 e 512×512).
- Deploy: Vercel em https://vizinho-lava.vercel.app (upload do `dist`).
