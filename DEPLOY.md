# Deploy do VitaIA no Vercel

## Status atual

Produção: **https://tcc-qo-l.vercel.app**

O projeto já está conectado à branch `main` do GitHub. Novos commits nessa branch geram novos deployments automaticamente no Vercel.

## Configuração do Vercel

- Framework Preset: `Other`
- Root Directory: `./`
- Build Command: sem override
- Output Directory: sem override
- Variável `GEMINI_API_KEY`: configurada em Production/Preview
- Variável `GEMINI_MODEL`: `gemini-3.5-flash-lite`

A chave real nunca deve ser colocada em arquivos versionados.

## Firebase em produção

O domínio abaixo precisa permanecer em Firebase Authentication → Configurações → Domínios autorizados:

```text
tcc-qo-l.vercel.app
```

Caso o projeto ganhe um domínio próprio, o novo host também deverá ser autorizado.

## Checklist funcional

- [x] Frontend abre pela raiz do domínio.
- [x] Firebase Authentication conectado.
- [x] Login Google autorizado no domínio do Vercel.
- [x] Realtime Database usando dados por UID.
- [x] Painel administrativo protegido por custom claim.
- [x] Endpoint `/api/ai` usando Gemini pelo backend.
- [x] Variável secreta da IA fora do frontend/GitHub.
- [x] Botão de Facebook não configurado removido.
- [x] Recuperação de senha integrada ao Firebase.
- [x] Política de Privacidade e Termos de Uso publicados.
- [x] `robots.txt` e `sitemap.xml` configurados.
- [x] Headers básicos de segurança configurados no Vercel.
- [x] Limites de tamanho, timeout e rate limiting básico na API de IA.
- [x] Favicon e página 404 adicionados.

## Testes manuais recomendados após cada alteração importante

1. Entrar com e-mail/senha.
2. Entrar com Google.
3. Usar "Esqueci minha senha" e confirmar o recebimento do e-mail.
4. Alterar um registro, sair e entrar novamente.
5. Abrir a mesma conta em outro navegador e conferir a sincronização.
6. Enviar mensagens para a IA.
7. Abrir `/admin.html` com a conta administrativa.
8. Confirmar que uma conta comum não consegue ler dados de outros usuários.
9. Abrir o Console do navegador e confirmar que não há erros recorrentes.
10. Testar pelo menos uma tela de celular estreita e uma tela desktop.

## Segurança operacional

- Nunca versionar `.env`.
- Nunca versionar `serviceAccountKey.json`.
- Não publicar capturas contendo credenciais ou tokens.
- Se uma chave privada for exposta, revogue-a e gere outra imediatamente.
- Acompanhe a cota do Gemini se o site for compartilhado publicamente.

## Próximas melhorias opcionais

- Domínio próprio.
- Analytics/Speed Insights após consentimento e avaliação de privacidade.
- Monitoramento externo de disponibilidade.
- Testes automatizados de interface e autenticação.
- Autenticação do endpoint de IA por token Firebase, caso o projeto evolua para uso público mais amplo.
