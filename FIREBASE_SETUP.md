# Firebase — checklist do TCC-QoL

O projeto usa **Firebase Authentication** e **Realtime Database**.

## Authentication

No Firebase Console, em **Authentication > Método de login**, deixe ativados:

- E-mail/senha
- Google
- Anônimo

O `firebase.js` agora expõe estes métodos para o restante do app:

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

Durante desenvolvimento, se usar servidor local, adicione `localhost`.

Quando publicar, adicione o domínio do deploy, por exemplo o domínio `*.vercel.app` específico do projeto.

Não use `file:///` como ambiente final de autenticação.

## Realtime Database

O arquivo `firebase-rules.json` contém as regras que devem ser publicadas na aba **Realtime Database > Regras**.

As regras:

- negam acesso global por padrão;
- exigem usuário autenticado para comunidade;
- restringem presença ao próprio UID para escrita;
- restringem amigos ao próprio UID;
- permitem apagar/editar apenas mensagens do próprio usuário;
- restringem salas privadas aos dois UIDs presentes no ID da sala;
- validam nome, UID e tamanho do texto.

### Importante

Salvar `firebase-rules.json` no GitHub **não publica as regras no Firebase**. Elas precisam ser coladas/publicadas no Console do Firebase ou implantadas pela Firebase CLI.

## Ambiente local

Não abra o projeto diretamente por `file:///C:/...` para testar autenticação. Use um servidor HTTP local, por exemplo:

```bash
python -m http.server 5500
```

Depois acesse:

`http://localhost:5500/`

ou use o Live Server do VS Code.

## Deploy

O Firebase Authentication e o Realtime Database são serviços hospedados e não exigem que o site seja hospedado no Firebase Hosting. O site pode continuar hospedado em Vercel ou outro servidor HTTPS.

Depois do deploy, adicione o domínio de produção aos **domínios autorizados** do Authentication e teste novamente Google, e-mail/senha e comunidade.

## Teste recomendado

1. Criar uma conta com e-mail/senha.
2. Sair.
3. Entrar novamente com e-mail/senha.
4. Sair.
5. Entrar com Google.
6. Abrir Comunidade.
7. Enviar uma mensagem.
8. Abrir o Realtime Database e confirmar o registro.
9. Testar outro usuário e confirmar que ele não consegue apagar a mensagem do primeiro.
10. Testar uma sala privada entre dois usuários.
