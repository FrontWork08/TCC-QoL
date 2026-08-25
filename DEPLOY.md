# Deploy do VitaIA no Vercel

## 1. Antes de publicar

- Confirme que `.env`, `serviceAccountKey.json` e outras credenciais privadas não estão no GitHub.
- Rode localmente com `npm start` e teste login, banco de dados e IA.
- Confirme que `http://localhost:3000/api/ai/status` retorna `keyConfigured: true`.

## 2. Criar o projeto no Vercel

1. Entre no Vercel com sua conta GitHub.
2. Importe o repositório `FrontWork08/TCC-QoL`.
3. Use a raiz do repositório como Root Directory.
4. Não é necessário informar comando de build para o frontend atual.

## 3. Variáveis de ambiente

Em Vercel → Project Settings → Environment Variables, adicione:

- `GEMINI_API_KEY` = sua chave real do Google AI Studio.
- `GEMINI_MODEL` = `gemini-3.5-flash-lite` (opcional; o código já possui fallback).

Nunca coloque a chave real em arquivos versionados.

## 4. Publicar

Faça o deploy e anote o domínio gerado, por exemplo:

`tcc-qol.vercel.app`

## 5. Autorizar o domínio no Firebase

No Firebase Console:

Authentication → Configurações → Domínios autorizados → Adicionar domínio.

Adicione apenas o host do Vercel, sem `https://` e sem caminhos.

Exemplo:

`tcc-qol.vercel.app`

Se usar um domínio próprio depois, adicione esse domínio também.

## 6. Testes obrigatórios em produção

- Cadastro por e-mail e senha.
- Login por e-mail e senha.
- Login com Google.
- Logout e novo login.
- Salvar dados e confirmar em Realtime Database.
- Abrir em outro navegador e confirmar sincronização.
- Enviar mensagem em Conversar com IA.
- Entrar com a conta admin e abrir `/admin.html`.
- Tentar abrir o painel com uma conta comum e confirmar acesso negado.
- Verificar o Console do navegador e corrigir erros restantes.
- Testar o site em tela de celular.

## 7. Pós-deploy

- Atualizar SEO e sitemap com o domínio definitivo.
- Revisar Política de Privacidade.
- Considerar domínio próprio.
- Avaliar proteção adicional/rate limiting para `/api/ai` caso o site seja aberto ao público.
