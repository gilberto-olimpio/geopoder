# GeoPoder Alpha 2.0b.2 — Correção de renovação pós-Desafio e notas do professor

## O que esta revisão corrige

1. **Travamento após Desafio quando o líder acerta**
   - A decisão `renew_discard` agora tem prioridade tanto no servidor quanto na interface.
   - O `tick` não volta mais indefinidamente para `challenge_result` quando existe uma decisão pendente.
   - O país beneficiado vê imediatamente as cartas completas e escolhe qual descartar.
   - Se não responder dentro do prazo, o servidor aplica o descarte automático e continua a partida.

2. **Notas do professor**
   - A interface deixa de reconstruir a caixa de notas enquanto ela está em foco.
   - O texto continua salvo em `localStorage` a cada alteração.
   - Ao sair da caixa, o painel recebe o estado mais recente da partida.
   - O botão Salvar preserva o texto até a confirmação do servidor.

## Atualização

- Supabase: substituir `game-api` pelo novo `index.ts` e fazer Deploy.
- GitHub Pages: substituir `app.js` e `index.html`. `styles.css` pode ser substituído também, embora não haja alteração funcional importante nele.
- Não alterar `config.js`.
- Não há migration SQL nova.

## Teste prioritário

1. Começar partida e chegar à Rodada 2.
2. Fazer o líder de Influência acertar o Desafio.
3. Confirmar que aparece para esse país a tela **Renovação de carta**, mostrando as cartas completas.
4. Escolher o descarte e verificar que a partida segue para compra/turnos.
5. Durante a partida, manter o cursor na nota do professor por 20–30 segundos, digitando enquanto outras decisões acontecem; confirmar que o texto não some.
6. Salvar a nota e confirmar no histórico.
