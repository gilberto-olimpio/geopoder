# GeoPoder Alpha 2.0d.3 — Clareza de fluxo, Diplomacia 0.4-B e dados visuais

Atualização construída sobre a Alpha 2.0d.2. Não exige migration SQL.

## 1. Clareza entre recompensa do Desafio e compra da rodada

Nas rodadas com Desafio, o fluxo agora diferencia visualmente duas etapas:

1. **Recompensa do Desafio** — se o líder acertar, ele renova 1 carta. Essa renovação não usa Vantagem Geográfica.
2. **Compra normal da rodada** — depois, cada país realiza sua compra normal. Se possuir Vantagem, escolhe explicitamente entre:
   - comprar 1 carta e manter a Vantagem;
   - gastar 1 Vantagem para revelar 2 cartas, escolher 1 e descartar a outra.

Isso elimina a impressão de que a renovação do líder e a compra normal são uma única ação.

## 2. Revisão das 28 cartas para a nova Cúpula Diplomática

Foi feita uma auditoria de todo o baralho. A maioria das cartas já era compatível com a nova regra e manteve seu efeito original. Foram alteradas apenas as interações que dependiam diretamente da antiga Diplomacia como Ação Principal:

- **Carta 27 — Abertura Comercial:** agora concede +1 Economia imediatamente. Se a iniciativa diplomática do país formar um novo Acordo na Cúpula da mesma rodada, os dois países renovam 1 carta.
- **Carta 25 — Investimento Estrangeiro Direto:** texto esclarece que aceitar o investimento não cria Acordo; o +1 no dado depende de Relação Comercial já existente.
- **Evento 14 — Expansão do Comércio Mundial:** a proposta gratuita passa a ser uma proposta extra e não consome a iniciativa da Cúpula.

As cartas que rompem, protegem ou afetam Acordos/Blocos continuam funcionando imediatamente quando jogadas. Esses efeitos não gastam a iniciativa diplomática da Cúpula.

## 3. Animação de dados na Mesa de Situação

Rolagens públicas agora aparecem na **Mesa de Situação** com animação e resultado final visível para todos os participantes. Isso inclui:

- Capital Especulativo;
- Investimento Estrangeiro Direto;
- Disputa de Influência;
- Grande Crise Financeira Global;
- rerrolagens com Vantagem Geográfica.

O dado anima apenas na primeira vez em que aquele resultado chega ao aparelho; atualizações posteriores mostram o resultado já estabilizado.

## Publicação

### Supabase
Substitua o código de `game-api` por `game-api.ts` desta pasta e faça **Deploy**.

### GitHub Pages
Substitua:
- `index.html`
- `app.js`
- `styles.css`

Mantenha seu `config.js` atual.

O `index.html` usa `?v=20d3` para evitar cache da versão anterior.
