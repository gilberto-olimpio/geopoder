# GeoPoder — Alpha 2.0b

Esta versão adiciona o **motor multiplayer estrutural da partida** sobre a Alpha 2.0a.1 já validada.

## O que entra nesta entrega

- 8 rodadas automáticas.
- Evento Mundial em todas as rodadas.
- 16 Eventos com efeitos estruturais já executados pelo servidor.
- Desafios Geográficos simultâneos nas rodadas 2, 4, 6 e 8.
- Telemetria de respostas, acertos, erros e tempo de resposta.
- Compra de cartas.
- Renovação de carta com visualização completa da mão.
- Limite de 5 cartas.
- Vantagem Geográfica:
  - reduzir uma perda em 1;
  - rerrolar um d6;
  - na compra, ver 2 cartas e ficar com 1.
- Recuperação Nacional (0 → 1).
- Redirecionamento de perdas quando o atributo-alvo está zerado.
- Cronômetros autoritativos pelo servidor.
- Passagem automática da vez quando o tempo acaba.
- Rotação do primeiro jogador a cada rodada.
- Pontuação final com bônus de +2 por Potência Equilibrada.
- Desempate por menor atributo, soma dos dois menores e d6, se necessário.
- Telemetria ampliada.
- Professor pode adicionar 30 segundos ou forçar o fim de um turno.
- Jogador pode **Sair / entrar em outra sala**.
- Ao abrir o site com uma sala antiga salva, aparece uma escolha entre **Continuar partida** e **Entrar em outra sala**, em vez de reconectar silenciosamente.

## Limite intencional desta versão

A Alpha 2.0b valida o ciclo:

**Evento → Desafio → Compra → Turnos → Fim da rodada → Próxima rodada**

As 28 cartas já aparecem completas nas mãos e nas decisões de descarte/renovação, mas **seus efeitos de Ação ainda não são executados nesta entrega**. A integração carta por carta, Reações e o sistema completo de Diplomacia entram no próximo incremento da Alpha 2.

O Evento 14 já contém uma implementação básica de Acordo Comercial para testar a interação entre dois aparelhos. Nesta etapa, ele só oferece países que ainda tenham vaga no limite de Acordos; a regra completa de substituição de um terceiro Acordo será ligada ao motor de Diplomacia posteriormente.

## Atualização sobre a 2.0a.1

Não há nova migration obrigatória nesta entrega.

### 1. Supabase — Edge Function

No painel do Supabase:

1. Abra **Edge Functions → game-api → Code**.
2. Substitua todo o conteúdo pelo arquivo:
   `supabase/functions/game-api/index.ts`
3. Clique em **Deploy**.

### 2. GitHub Pages — frontend

Na raiz do repositório publicado, substitua:

- `index.html`
- `app.js`
- `styles.css`

**Não substitua `config.js`.** Mantenha o arquivo que já contém a URL e a Publishable Key corretas do seu projeto.

O `index.html` desta versão usa `?v=220` nos arquivos locais para reduzir problemas de cache do GitHub Pages.

### 3. Aguarde o deploy do GitHub Pages

Verifique a aba **Actions** e espere o deploy ficar verde. Depois abra o site com `Ctrl + F5`.

## Teste recomendado da Alpha 2.0b

1. Professor faz login.
2. Cria uma sala de teste.
3. Quatro navegadores/aparelhos entram como Aurora, Montária, Pacífica e Solária.
4. Professor inicia a partida.
5. Confirme que o primeiro Evento aparece automaticamente.
6. Resolva decisões pedidas pelo Evento.
7. Observe a compra de cartas.
8. No turno, use apenas **Passar** ou **Recuperação Nacional**.
9. Deixe pelo menos um cronômetro chegar a zero para testar passagem automática.
10. Na rodada 2, confirme que o Desafio aparece simultaneamente nos quatro aparelhos.
11. Teste um acerto de líder e um acerto de não-líder para verificar Renovação e Vantagem.
12. Continue até ao menos a rodada 3 ou, idealmente, até o resultado final da rodada 8.
13. Abra o relatório no Dashboard e confira `QUESTION_ANSWERED`, `EVENT_REVEALED`, `ATTRIBUTE_CHANGED`, `TURN_EXPIRED`, `ADVANTAGE_USED`, `CARD_DRAWN` e `CARD_DISCARDED`.

## Teste de troca de sala

Em um aparelho de jogador:

1. Abra uma partida.
2. Clique em **Sair / outra sala**.
3. Confirme que volta para a tela inicial.
4. Entre em outra sala.
5. Feche e reabra o navegador: se houver uma sala salva, o site deve oferecer **Continuar partida** ou **Entrar em outra sala**.

