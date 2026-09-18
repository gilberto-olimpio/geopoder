# GeoPoder — Alpha 2.0e.1

**Nome interno:** Sala de Comando — Motor 0.4-C consolidado  
**Regras:** 0.4-C  
**Base:** Alpha 2.0e visual + motor multiplayer da 2.0d.3

## O que esta versão conclui

A Alpha 2.0e.1 aplica ao motor as regras 0.4-C consolidadas depois da revisão das 28 cartas e dos 16 Eventos Globais. A interface de Sala de Comando, o onboarding e as cinco artes piloto permanecem.

### Estados diplomáticos

- **Acordo sob Tensão:** continua existindo e ocupando limite, mas não concede bônus nem cumpre requisitos de cartas `RELAÇÃO`/`ACORDO` até o fim da rodada.
- **Acordo Suspenso:** continua existindo e ocupando limite, mas fica inativo para os dois países até o início da próxima Cúpula Diplomática.
- **Bloco em Crise:** continua existindo, mas bônus e proteções de `BLOCO` ficam desativados até o fim da rodada.
- **Cláusula de Salvaguarda:** pode cancelar Tensão, Suspensão ou Crise causada por carta/Evento, sem custo extra além de jogar a própria Reação.

### Diplomacia

- Acordos e Blocos permanecem difíceis de destruir involuntariamente: Interferências e Eventos agora preferem Tensão, Suspensão e Crise.
- **Expansão do Comércio Mundial** concede uma proposta extra de Acordo **durante a Cúpula**, sem consumir a iniciativa normal.
- **Cooperação Multilateral** recompensa a primeira iniciativa aceita do proponente; se a própria iniciativa já renovar o proponente, o Evento não empilha uma segunda renovação.
- Suspensões terminam no início da Cúpula; Tensão e Crise terminam no fim da rodada.

### Cartas — mudanças centrais

- #01 compara Redes do parceiro **antes** do ganho.
- #02 recebe +2 Diplomacia com 1 Acordo utilizável; filtragem do topo só com 2.
- #09 passa a ser coprodução cultural: +2 para quem joga e +1 para o parceiro.
- #10 Sanções Econômicas não rompem Acordos.
- #11 Barreiras Tarifárias: absorver (-1 Economia) ou retaliar (atacante -1 Economia, alvo -1 Diplomacia, Acordo sob Tensão).
- #13 Guerra de Narrativas não pode mirar parceiro de Bloco.
- #14 Pressão Geopolítica pode tensionar um Acordo em vez de encerrá-lo.
- #15 parceiro de Bloco pode gastar 1 Vantagem para impedir a perda de Redes.
- #16 Tensão no Bloco não pode ser usada contra o próprio Bloco; cria custo diplomático ou Crise temporária.
- #17 Embargo Secundário suspende Acordo em vez de encerrá-lo.
- #19 Retaliação Comercial tensiona Acordo em vez de encerrá-lo.
- #22 Solidariedade do Bloco não funciona durante Crise.
- #23 Salvaguarda protege estados diplomáticos temporários.
- #25 IED: 5–6 = jogador +2 Economia; parceiro +1.
- #28 decisões de rerrolagem com Vantagem são registradas de forma reservada e reveladas juntas.

### Eventos — mudanças centrais

- Ruptura das Cadeias: Economia, Suspensão de Acordo ou Crise de Bloco (quando não houver Acordo).
- Guerra Comercial: Economia ou Acordo sob Tensão.
- Embargo Internacional: Economia ou Suspensão; nenhum novo Acordo na rodada.
- Crise de Confiança: relações permanecem, mas bônus diplomáticos das cartas ficam inativos.
- Conflito Geopolítico Global: Acordos sob Tensão, Blocos em Crise, -1 Diplomacia e sem novas relações.
- Expansão do Comércio Mundial: proposta extra na Cúpula.
- Cooperação Multilateral: recompensa apenas iniciativa aceita e evita empilhamento de renovação.

## Artes das cartas

A estratégia híbrida foi mantida:

- 5 Dossiês possuem arte piloto completa em `assets/cards/`:
  - #04 Investimento Produtivo
  - #06 Fórum Econômico Regional
  - #12 Fuga de Capitais
  - #13 Guerra de Narrativas
  - #27 Abertura Comercial
- As outras 23 cartas usam o layout definitivo e um placeholder visual de categoria. As artes finais podem ser adicionadas depois do playtest sem alterar o motor.

## Publicação

### 1. Supabase

Substitua o conteúdo da Edge Function `game-api` pelo arquivo `game-api.ts` deste pacote e faça **Deploy**.

**Não há migration SQL nova.** Os estados diplomáticos são armazenados no JSON autoritativo da partida.

### 2. GitHub Pages

Substitua:

- `index.html`
- `app.js`
- `styles.css`
- `assets/`

**Mantenha o seu `config.js` atual.** Ele não está incluído no ZIP para evitar sobrescrever a configuração já funcional.

O cache-bust desta versão é `?v=20e1`.

## Compatibilidade

Recomenda-se iniciar **uma sala nova** para testar a 2.0e.1. O backend mantém alguns caminhos de compatibilidade com snapshots antigos, mas as novas propriedades `tension`, `suspended` e `crisis` foram desenhadas para partidas iniciadas nesta versão.

## Validação executada

- `node --check app.js`: OK.
- `tsc --noEmit --noResolve --target ES2022 --module ESNext game-api.ts`: apenas o erro esperado de resolução do import `jsr:@supabase/server`, inexistente no TypeScript local; não foram encontrados outros erros de sintaxe/tipagem local.
- Assets das cinco cartas piloto presentes.
- Cache-bust atualizado para `20e1`.
- A resolução docente de pendências também cobre a janela da **Cláusula de Salvaguarda** para Tensão, Suspensão e Crise.

## Playtest recomendado

Priorize testar deliberadamente:

1. Acordo sob Tensão e retorno ao normal no fim da rodada.
2. Suspensão e reativação no início da Cúpula.
3. Bloco em Crise e desativação de bônus/proteções.
4. Cláusula de Salvaguarda cancelando cada um dos três estados.
5. Barreiras Tarifárias nas duas respostas.
6. Ataque às Redes com Vantagem do parceiro de Bloco.
7. Expansão do Comércio Mundial antes/depois da iniciativa normal.
8. Cooperação Multilateral com Abertura Comercial e troca de cartas, verificando que não há renovação duplicada.
9. Disputa de Influência com Vantagem em ambos os países.
10. Guerra Comercial, Embargo Internacional e Conflito Geopolítico Global.

