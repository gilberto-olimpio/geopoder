# GeoPoder — Alpha 2.0a.1

Esta atualização adiciona uma **Área do Professor protegida por conta autorizada**, um **Dashboard** e um **Histórico de partidas/playtests** com exportação em Markdown, CSV e JSON.

> Esta versão ainda é a infraestrutura anterior ao motor 2.0b. Ela não adiciona Eventos/turnos jogáveis. O objetivo é proteger o acesso docente e começar a armazenar/consultar o histórico antes dos playtests completos.

## O que muda

- As equipes continuam entrando anonimamente por código de sala.
- O professor passa a entrar com **e-mail e senha** do Supabase Auth.
- Ter uma conta no Supabase não basta: o usuário também precisa estar em `gp_teacher_profiles` com `is_active = true`.
- Somente professores autorizados podem criar salas, iniciar partidas, ver mãos de todas as equipes, registrar notas e consultar histórico.
- O painel do professor mostra salas abertas e partidas anteriores.
- Partidas podem ser marcadas como **interrompidas** sem perder a telemetria.
- Cada partida passa a registrar `game_version` e `rules_version`.
- O relatório histórico já está preparado para consolidar futuramente `QUESTION_ANSWERED`, `CARD_PLAYED`, `CARD_DISCARDED`, `CARD_NO_VALID_TARGET` etc.

---

# Atualização a partir da Alpha 2.0a atual

## 1. NÃO substitua seu `config.js`

Seu `config.js` do GitHub já contém a URL e a publishable key corretas. **Mantenha esse arquivo como está.**

Neste pacote existe apenas `config.example.js` como referência.

## 2. Execute a migration 002

No Supabase, abra **SQL Editor** e execute:

`supabase/migrations/002_geopoder_alpha2_0a1_teacher_area.sql`

Ela cria a tabela de professores e acrescenta os campos de histórico/versionamento.

## 3. Crie sua conta de professor

No Supabase:

**Authentication → Users → Add user**

Crie um usuário com seu e-mail e uma senha forte. Não use login anônimo para o professor.

## 4. Autorize essa conta no GeoPoder

Abra:

`supabase/migrations/003_authorize_teacher_TEMPLATE.sql`

Substitua:

- `SEU NOME`
- `SEU_EMAIL@EXEMPLO.COM`

pelo seu nome e pelo MESMO e-mail criado em Authentication.

Execute o SQL no SQL Editor. A consulta final deve retornar exatamente uma linha com `is_active = true`.

## 5. Opcional: assumir as salas antigas da Alpha 2.0a

As salas de teste que você criou anteriormente pertencem ao usuário anônimo usado pela versão antiga. Se quiser que elas apareçam no novo histórico, há um script opcional:

`004_adopt_legacy_rooms_OPTIONAL.sql`

**Atenção:** o modelo fornecido transfere todas as salas atuais para o e-mail indicado. Só use agora se este projeto Supabase contém apenas seus próprios testes.

## 6. Atualize a Edge Function `game-api`

Supabase:

**Edge Functions → game-api → Code**

Substitua TODO o código pelo arquivo:

`supabase/functions/game-api/index.ts`

Depois clique em **Deploy** e aguarde a publicação terminar.

## 7. Atualize o frontend no GitHub

No repositório publicado pelo GitHub Pages, substitua apenas:

- `index.html`
- `app.js`
- `styles.css`

pelos arquivos da pasta `web/` deste pacote.

**Não sobrescreva o seu `config.js` configurado.**

O repositório publicado deve continuar assim:

```text
index.html
app.js
styles.css
config.js   ← seu arquivo atual, já configurado
```

## 8. Aguarde o GitHub Pages publicar

Em **Actions**, aguarde o deploy ficar verde. Depois abra o site com `Ctrl + F5` ou em janela anônima.

---

# Primeiro teste da 2.0a.1

1. Abra o site.
2. Clique em **Área do Professor**.
3. Faça login com o e-mail/senha criados no Supabase.
4. O sistema deve abrir o **Painel do Professor**.
5. Crie uma sala de teste.
6. Abra quatro navegadores/aparelhos e entre como Aurora, Montária, Pacífica e Solária.
7. Volte ao painel do professor e verifique se a sala aparece em **Salas abertas**.
8. Abra a sala e inicie a partida.
9. Registre uma nota de playtest.
10. Marque a sessão como interrompida.
11. Volte ao Dashboard. Ela deve aparecer em **Partidas anteriores**.
12. Abra **Relatório** e teste as exportações Markdown, CSV e JSON.

---

# Segurança

O botão de Professor não concede privilégios. A Edge Function verifica `gp_teacher_profiles` antes de:

- criar sala;
- iniciar partida;
- consultar histórico;
- acessar telemetria;
- ver todas as mãos;
- registrar notas;
- interromper uma sessão.

Portanto, mesmo que outra pessoa descubra a interface de login, uma conta que não esteja autorizada em `gp_teacher_profiles` não recebe os privilégios docentes.

As equipes continuam usando Anonymous Sign-In, que deve permanecer ativado no Supabase.

---

# Histórico e telemetria

O Dashboard diferencia:

- **Salas abertas**: lobby ou partida ativa.
- **Partidas anteriores**: finalizadas ou interrompidas.

O relatório de uma partida mostra:

- turma, código, data, status e versão;
- equipes e países;
- duração e última rodada, quando disponíveis;
- contagem dos eventos de telemetria;
- notas do professor;
- dados pedagógicos quando `QUESTION_ANSWERED` existir;
- uso de cartas quando os eventos da Alpha 2.0b forem registrados;
- exportação Markdown, CSV e JSON.

O Markdown é o formato recomendado para enviar ao ChatGPT durante os debates de playtest.
