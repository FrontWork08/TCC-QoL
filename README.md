# 🚀 VitaIA — TCC-QoL

O **VitaIA** é um projeto acadêmico de Trabalho de Conclusão de Curso (TCC) voltado à qualidade de vida. A plataforma reúne acompanhamento de hábitos, autenticação, sincronização em nuvem, comunidade em tempo real, recursos de acessibilidade e assistência por inteligência artificial.

## 🌐 Site publicado

**Produção:** https://tcc-qo-l.vercel.app

## 🎯 Objetivo

Criar uma experiência simples e acessível para ajudar o usuário a acompanhar aspectos do dia a dia, como hidratação, alimentação, sono, exercícios e humor, utilizando tecnologia para organizar os registros, oferecer apoio informativo e permitir interação segura entre usuários.

> O VitaIA é um projeto acadêmico e não substitui avaliação, diagnóstico ou tratamento realizado por profissionais qualificados.

## ✅ Recursos principais

- Cadastro e login com e-mail/senha pelo Firebase Authentication
- Login com Google
- Recuperação de senha por e-mail
- Realtime Database com dados separados por UID
- Sincronização de informações entre navegadores e dispositivos
- Painel administrativo protegido por permissão `admin`
- Chat com IA utilizando Google Gemini por endpoint serverless
- Registro de hidratação, nutrição, sono, exercícios e humor
- **Comunidade global em tempo real pelo Firebase Realtime Database**
- **Lista de usuários realmente online, sem perfis demonstrativos/fakes**
- **Filtro opcional de linguagem sensível no chat da comunidade**
- **Bloqueio básico de insultos e linguagem ofensiva antes do envio**
- Limite de tamanho e intervalo mínimo entre mensagens para reduzir spam
- Usuários podem apagar as próprias mensagens; administradores podem moderar mensagens no banco
- Recursos de acessibilidade e modo simplificado
- Interface responsiva para celular e desktop
- Política de Privacidade e Termos de Uso
- SEO básico, sitemap, robots.txt, favicon e headers de segurança no Vercel

## 💬 Comunidade global

A aba **Comunidade** deixou de usar mensagens locais ou nomes de demonstração. O chat agora utiliza uma única sala pública compartilhada entre os usuários autenticados:

```text
rooms/comunidade/messages
```

As mensagens são sincronizadas em tempo real pelo Firebase Realtime Database. Quando um usuário envia uma mensagem em um navegador ou dispositivo, os demais usuários conectados recebem a atualização automaticamente.

A presença online utiliza:

```text
presence/{uid}
```

O sistema usa `onDisconnect()` do Firebase para marcar o usuário como offline quando a conexão é encerrada, melhorando a precisão da lista de pessoas online.

### Moderação da comunidade

A comunidade possui duas camadas básicas de proteção no cliente:

1. **Moderação de envio:** determinados insultos e expressões ofensivas impedem o envio da mensagem.
2. **Filtro de linguagem:** ativado por padrão, mascara palavrões e termos sensíveis na tela do usuário. O filtro pode ser ativado ou desativado individualmente e a preferência fica salva no navegador.

Também são aplicados:

- máximo de **500 caracteres** por mensagem;
- intervalo mínimo entre envios para reduzir spam;
- escape/renderização segura de texto, sem inserir HTML enviado por usuários;
- leitura limitada às mensagens recentes;
- exclusão de mensagens pelo próprio autor;
- possibilidade de exclusão administrativa por contas com claim `admin`.

> A moderação implementada é uma camada básica adequada ao escopo acadêmico. Em uma operação pública de maior escala, recomenda-se complementar com moderação no servidor, denúncias, bloqueio de usuários e rate limiting centralizado.

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js / Express para desenvolvimento local
- Firebase Authentication
- Firebase Realtime Database
- Google Gemini API
- Vercel para hospedagem e funções serverless
- Git e GitHub para versionamento

## 🤖 Inteligência artificial

A chave do Gemini **não fica no frontend**. O navegador envia as solicitações para `/api/ai`, e o endpoint serverless consulta o Google Gemini utilizando a variável de ambiente `GEMINI_API_KEY`.

Para desenvolvimento local, crie um arquivo `.env` na raiz:

```env
GEMINI_API_KEY=sua_chave_gemini
GEMINI_MODEL=gemini-3.5-flash-lite
```

Nunca publique o `.env` ou credenciais administrativas no GitHub.

## ▶️ Executar localmente

Com Node.js instalado:

```bash
npm install
npm start
```

Depois abra:

```text
http://localhost:3000
```

O Live Server pode ser usado para visualizar somente arquivos estáticos, mas o chat de IA local depende do servidor Node na porta 3000.

Para verificar a sintaxe dos principais arquivos JavaScript:

```bash
npm run check
```

## 🔥 Firebase e regras

As regras usadas pelo projeto estão em:

```text
database.rules.json
firebase-rules.json
```

Elas mantêm os dados pessoais em `users/{uid}` restritos ao proprietário ou a contas administrativas autorizadas. A sala global da comunidade pode ser lida por usuários autenticados quando a consulta limita a quantidade de mensagens recentes.

Depois de alterar as regras no repositório, elas também precisam ser **publicadas no Firebase Realtime Database** para entrarem em vigor no ambiente real.

## 🔐 Segurança e dados

- Regras do Realtime Database negam acesso global por padrão.
- Usuários comuns acessam somente seus próprios dados em `users/{uid}`.
- O painel administrativo depende de uma custom claim `admin: true`.
- Arquivos `.env`, `serviceAccountKey.json`, `.vercel/` e `node_modules/` são ignorados pelo Git.
- O endpoint de IA possui validação de entrada, limite de tamanho, timeout e limitação básica de requisições.
- O chat global exige autenticação para leitura e escrita.
- Mensagens da comunidade possuem limite de tamanho nas regras do Firebase.
- Dados inseridos na comunidade devem ser tratados como conteúdo visível aos demais participantes da sala pública.

Consulte também:

- [Política de Privacidade](https://tcc-qo-l.vercel.app/privacidade.html)
- [Termos de Uso](https://tcc-qo-l.vercel.app/termos.html)

## 🚀 Deploy

O frontend é publicado no Vercel usando **Framework Preset: Other**. A API da IA fica em `api/ai.js`.

Variáveis necessárias no Vercel:

```text
GEMINI_API_KEY
GEMINI_MODEL
```

O domínio de produção também precisa permanecer autorizado no Firebase Authentication:

```text
tcc-qo-l.vercel.app
```

## 👨‍💻 Equipe

Projeto desenvolvido por:

- Daniel Luis dos Santos
- Eduarda Chaves Baptista
- Guilherme Teles Meira
- Renato Segura
- Gustavo Luiz Lima
- Matheus Gonzales Jardim

**Curso:** Técnico em Desenvolvimento de Sistemas  
**Ano:** 2026

## 📚 Finalidade

Este repositório registra o desenvolvimento e a evolução do TCC, incluindo frontend, autenticação, banco de dados, comunidade em tempo real, inteligência artificial, segurança e publicação do sistema.
