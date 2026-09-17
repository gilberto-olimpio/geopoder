# GeoPoder Alpha 2.0d.2 — Hotfix dos Desafios simultâneos

Correção direcionada ao travamento observado na rodada 4 quando três equipes responderam quase ao mesmo tempo.

## O que foi corrigido

- `QUESTION_ANSWERED` passa a ser tratado como fonte canônica das respostas do Desafio.
- Após responder, o servidor recarrega o estado mais recente e tenta reconciliar `challenge_answered` até 4 vezes, evitando perda por conflito de versão otimista.
- O `snapshot` reconcilia as respostas diretamente da telemetria enquanto a fase é `challenge`, portanto uma resposta já recebida nunca fica invisível apenas porque uma gravação concorrente perdeu o lock.
- Se o jogador tocar novamente após uma resposta já registrada, o servidor tenta reparar o estado em vez de simplesmente retornar `already_answered`.
- Ao tocar numa alternativa, a interface imediatamente destaca a opção e bloqueia temporariamente as quatro alternativas enquanto envia a resposta.

## Publicação

1. Supabase: substituir a Edge Function `game-api` pelo novo `game-api.ts` e fazer Deploy.
2. GitHub Pages: substituir `app.js`, `styles.css` e `index.html`.
3. Manter `config.js` sem alterações.
4. Não há migration SQL.

O `index.html` usa `?v=20d2` para evitar cache da versão anterior.
