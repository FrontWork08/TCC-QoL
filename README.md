# 🚀 VitaIA — TCC-QoL

O **VitaIA** é um projeto acadêmico de Trabalho de Conclusão de Curso (TCC) voltado à qualidade de vida. A plataforma reúne acompanhamento de hábitos, autenticação, sincronização em nuvem, recursos de acessibilidade e assistência por inteligência artificial.

## 🌐 Site publicado

**Produção:** https://tcc-qo-l.vercel.app

## 🎯 Objetivo

Criar uma experiência simples e acessível para ajudar o usuário a acompanhar aspectos do dia a dia, como hidratação, alimentação, sono, exercícios e humor, utilizando tecnologia para organizar os registros e oferecer apoio informativo.

> O VitaIA é um projeto acadêmico e não substitui avaliação, diagnóstico ou tratamento realizado por profissionais qualificados.

## ✅ Recursos principais

- Cadastro e login com e-mail/senha pelo Firebase Authentication
- Login com Google
- Recuperação de senha por e-mail
- Realtime Database com dados separados por UID
- Sincronização de informações entre navegadores/dispositivos
- Painel administrativo protegido por permissão `admin`
- Chat com IA utilizando Google Gemini por endpoint serverless
- Registro de hidratação, nutrição, sono, exercícios e humor
- Recursos de acessibilidade e modo simplificado
- Interface responsiva para celular e desktop
- Política de Privacidade e Termos de Uso

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- Node.js / Express para desenvolvimento local
- Firebase Authentication
- Firebase Realtime Database
- Google Gemini API
- Vercel para hospedagem e função serverless
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

## 🔐 Segurança e dados

- Regras do Realtime Database negam acesso global por padrão.
- Usuários comuns acessam somente seus próprios dados em `users/{uid}`.
- O painel administrativo depende de uma custom claim `admin: true`.
- Arquivos `.env`, `serviceAccountKey.json`, `.vercel/` e `node_modules/` são ignorados pelo Git.
- O endpoint de IA possui validação de entrada, limite de tamanho, timeout e limitação básica de requisições.

Consulte também:

- [Política de Privacidade](https://tcc-qo-l.vercel.app/privacidade.html)
- [Termos de Uso](https://tcc-qo-l.vercel.app/termos.html)

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

Este repositório registra o desenvolvimento e a evolução do TCC, incluindo frontend, autenticação, banco de dados, inteligência artificial, segurança e publicação do sistema.
