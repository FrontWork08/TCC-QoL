# Firebase — checklist do TCC-QoL

O projeto usa **Firebase Authentication** e **Realtime Database**.

## Authentication

No Firebase Console, em **Authentication > Método de login**, deixe ativados:

- E-mail/senha
- Google

O login principal do VitaIA utiliza contas autenticadas. O provedor anônimo não é necessário para a nova Comunidade global.

O `firebase.js` expõe estes métodos para o restante do app:

- `window.firebaseSignInGoogle()`
- `window.firebaseSignInEmail(email, password)`
- `window.firebaseCreateEmailAccount(email, password, displayName)`
- `window.firebaseResetPassword(email)`
- `window.firebaseSignOut()`
- `window.firebaseGetUser()`
- `window.firebaseOnAuthStateChanged(callback)`

O login Google usa o Firebase Authentication. Em desktop, tenta popup; se o navegador bloquear o popup, usa redirect.

## Domínios autorizados

Em **Authentication > Configurações > Domínios autorizados**, adicione os domínios onde o site realmente será executado.

Durante desenvolvimento, use `localhost`. Em produção, o domínio atual é:

```text
tcc-qo-l.vercel.app
```

Não use `file:///` como ambiente final de autenticação.

## Realtime Database

Os arquivos `database.rules.json` e `firebase-rules.json` mantêm uma cópia das regras do projeto. As regras devem ser publicadas na aba **Realtime Database > Regras**.

As regras:

- negam acesso global por padrão;
- mantêm `users/{uid}` restrito ao proprietário e ao administrador autorizado;
- exigem usuário autenticado para a Comunidade global;
- permitem leitura apenas com consulta limitada às mensagens recentes;
- restringem presença ao próprio UID para escrita;
- limitam nomes a 80 caracteres;
- limitam mensagens a 500 caracteres;
- permitem ao autor apagar a própria mensagem;
- permitem a uma conta com custom claim `admin: true` apagar mensagens para moderação;
- mantêm salas privadas restritas aos usuários participantes.

## Comunidade global

A comunidade visível no site utiliza:

```text
rooms/comunidade/messages
```

Todos os usuários autenticados enxergam a mesma sala em tempo real.

A presença usa:

```text
presence/{uid}
```

O módulo `community-global.js` utiliza `onDisconnect()` para atualizar o status do usuário quando a conexão com o Firebase é encerrada.

O chat antigo armazenado apenas no `localStorage` não é mais utilizado. Os contatos de demonstração também são removidos da interface e a lista mostra somente usuários presentes no Firebase.

### Filtro de linguagem

O navegador aplica uma moderação básica antes de gravar mensagens e oferece um filtro visual opcional para mascarar linguagem sensível. Essa proteção é complementar às regras de acesso do Firebase; para um ambiente público de grande escala, recomenda-se futuramente adicionar moderação no servidor e sistema de denúncias/bloqueios.

### Importante

Salvar as regras no GitHub **não publica as regras no Firebase**. Depois de mudanças em `database.rules.json`, publique o mesmo conteúdo no Console do Firebase ou use a Firebase CLI.

## Ambiente local

Para testar o sistema completo, use o servidor Node do projeto:

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000/
```

## Deploy

O Firebase Authentication e o Realtime Database são serviços hospedados e não exigem Firebase Hosting. O site continua hospedado no Vercel.

Depois de cada alteração importante, confirme que o domínio de produção continua nos **domínios autorizados** do Authentication.

## Teste recomendado da Comunidade

1. Entrar com uma conta em um navegador.
2. Entrar com outra conta em outro navegador ou guia anônima.
3. Abrir a aba Comunidade nos dois.
4. Confirmar que os dois nomes aparecem na lista de usuários online.
5. Enviar uma mensagem no primeiro navegador.
6. Confirmar que ela aparece em tempo real no segundo.
7. Ativar e desativar o filtro de linguagem para testar a preferência local.
8. Testar uma expressão ofensiva bloqueada e confirmar que ela não é enviada.
9. Apagar uma mensagem própria e confirmar que ela desaparece nos dois navegadores.
10. Abrir o Realtime Database e confirmar os registros em `rooms/comunidade/messages`.
