(() => {
  'use strict';

  const CONFIG = window.GEOPOWER_CONFIG || {};
  const screen = document.getElementById('screen');
  const connection = document.getElementById('connection');
  const COUNTRIES = ['Aurora','Montária','Pacífica','Solária'];
  const GAME_VERSION = 'Alpha 2.0g.2';
  const RULES_VERSION = '0.4-C';
  const ATTRS = {eco:'💰 Economia',net:'🌐 Redes',dip:'🤝 Diplomacia',cult:'🎭 Cultura'};

  const C = (id,name,type,tags,effect,meta={})=>({id,name,type,tags,effect,...meta});
  const CARDS = [
    C(1,'Infraestrutura Digital','Desenvolvimento',['Relação'],'+1 Redes. Com Relação Comercial utilizável: +2 Redes em vez de +1. Se, antes do ganho, um parceiro tiver Redes maiores que as suas, renove 1 carta.'),
    C(2,'Diplomacia Multilateral','Desenvolvimento',['Acordo'],'+1 Diplomacia. Com ao menos 1 Acordo utilizável: +2 em vez de +1. Com 2 Acordos utilizáveis, olhe o topo do baralho e decida mantê-lo ou descartá-lo.'),
    C(3,'Marca Cultural Global','Desenvolvimento',['Relação'],'+1 Cultura. Com Relação Comercial utilizável: +2 Cultura em vez de +1; escolha um parceiro, que pode renovar 1 carta.'),
    C(4,'Investimento Produtivo','Desenvolvimento',['Relação'],'Com parceiro comercial utilizável: você +2 Economia e o parceiro +1 Economia. Sem parceiro válido: você +1 Economia.',{art:'assets/cards/04-investimento-produtivo.webp',headline:'Parceria internacional anuncia novo complexo produtivo',brief:'Capital, infraestrutura e produção aproximam duas economias por meio de um projeto conjunto.',quote:'Investimentos conectam territórios quando interesses econômicos encontram condições para cooperar.',source:'Agência de Desenvolvimento Internacional'}),
    C(5,'Logística Integrada','Desenvolvimento',['Bloco'],'+1 Redes. Em Bloco ativo e fora de Crise: +2 Redes em vez de +1 e o Bloco recebe 1 Proteção Logística compartilhada contra a próxima perda de Economia por Interferência nesta rodada.'),
    C(6,'Fórum Econômico Regional','Desenvolvimento',['Bloco'],'+1 Diplomacia. Em Bloco ativo e fora de Crise: +2 Diplomacia em vez de +1; você e seu parceiro podem renovar 1 carta.',{art:'assets/cards/06-forum-economico-regional.webp',headline:'Líderes encerram cúpula com nova agenda de integração regional',brief:'Governos anunciam maior coordenação econômica e política entre os países do bloco.',quote:'Blocos ganham força quando seus membros transformam diálogo em coordenação.',source:'Observatório de Relações Internacionais'}),
    C(7,'Diversificação de Mercados','Desenvolvimento',['Acordo'],'+1 Economia. Com ao menos 1 Acordo utilizável: +2 Economia em vez de +1. Com 2 Acordos utilizáveis, também renove 1 carta.'),
    C(8,'Conectividade Global','Desenvolvimento',[],'+1 Redes. Revele as 2 primeiras cartas do baralho, fique com 1 e descarte a outra.'),
    C(9,'Produção Cultural em Rede','Desenvolvimento',['Relação'],'Com parceiro comercial utilizável: você +2 Cultura e o parceiro +1 Cultura. Sem parceiro válido: você +1 Cultura.'),
    C(10,'Sanções Econômicas','Interferência',['Acordo','Bloco'],'Escolha país fora do seu Bloco: -1 Economia. Se houver Acordo utilizável com o alvo, você pode intensificar: alvo -2 Economia no total e você -1 Diplomacia. O Acordo permanece.'),
    C(11,'Barreiras Tarifárias','Interferência',['Acordo'],'Escolha parceiro de Acordo. O alvo escolhe: absorver o impacto (-1 Economia) OU retaliar (atacante -1 Economia, alvo -1 Diplomacia e o Acordo fica sob Tensão até o fim da rodada).'),
    C(12,'Fuga de Capitais','Interferência',['Transferência'],'Transfira 1 Economia de um país com Economia maior que a sua.',{art:'assets/cards/12-fuga-de-capitais.webp',headline:'Investidores retiram recursos diante do aumento da incerteza',brief:'Mercados procuram destinos considerados mais seguros e redirecionam rapidamente seus investimentos.',quote:'O capital atravessa fronteiras mais rápido que muitas decisões de governo.',source:'Boletim Econômico Internacional'}),
    C(13,'Guerra de Narrativas','Interferência',['Transferência'],'Transfira 1 Cultura de um país com Cultura igual ou maior que a sua. Não pode atingir seu parceiro de Bloco.',{art:'assets/cards/13-guerra-de-narrativas.webp',headline:'Governos disputam a opinião pública internacional',brief:'Campanhas de comunicação concorrentes procuram influenciar como a crise será interpretada no exterior.',quote:'Poder também significa convencer outros sobre qual versão do mundo merece ser ouvida.',source:'Instituto de Comunicação Global'}),
    C(14,'Pressão Geopolítica','Interferência',['Acordo'],'O alvo escolhe: -1 Diplomacia; descartar 1 carta aleatória; ou, se possuir Acordo utilizável com você, colocar esse Acordo sob Tensão até o fim da rodada.'),
    C(15,'Ataque às Redes','Interferência',['Anti-líder','Bloco'],'Alvo com Redes ≥ às suas perde 1 Redes. Se estiver em Bloco, o parceiro pode gastar 1 Vantagem para impedir essa perda. Se o alvo era líder em Redes, você renova 1 carta.'),
    C(16,'Tensão no Bloco','Interferência',['Bloco'],'Escolha um Bloco do qual você não participa. Os membros escolhem: um deles perde 1 Diplomacia OU o Bloco entra em Crise até o fim da rodada.'),
    C(17,'Embargo Secundário','Interferência',['Acordo'],'Alvo com 2 Acordos utilizáveis escolhe: -1 Economia OU suspender 1 Acordo até o início da próxima Cúpula.'),
    C(18,'Mediação Internacional','Reação',['Defesa'],'Quando uma Interferência causar perda de atributo a você, reduza uma perda em 1.'),
    C(19,'Retaliação Comercial','Reação',['Acordo','Economia'],'Quando uma Interferência fizer você perder Economia: reduza a perda em 1; o atacante perde 1 Economia; se houver Acordo entre vocês, ele fica sob Tensão até o fim da rodada.'),
    C(20,'Defesa Cibernética','Reação',['Redes'],'Quando perder Redes por carta ou Evento, cancele 1 ponto.'),
    C(21,'Contracampanha Cultural','Reação',['Cultura','Transferência'],'Quando perder Cultura por carta de outro jogador, cancele 1. Se suas Redes ≥ às do atacante, ele perde 1 Cultura.'),
    C(22,'Solidariedade do Bloco','Reação',['Bloco'],'Quando você ou parceiro de Bloco sofrer perda por Interferência, reduza 1. Se protegeu o parceiro, renove 1 carta. Não funciona se o Bloco estiver em Crise.'),
    C(23,'Cláusula de Salvaguarda','Reação',['Acordo','Bloco'],'Quando carta ou Evento colocaria seu Acordo sob Tensão, suspenderia seu Acordo ou colocaria seu Bloco em Crise, cancele essa mudança de estado.'),
    C(24,'Capital Especulativo','Risco',['1d6'],'Role 1d6: 1–2, -1 Economia; 3–4, +1 Economia; 5–6, +2 Economia.'),
    C(25,'Investimento Estrangeiro Direto','Risco',['Relação','1d6'],'Outro país aceita ou recusa. Aceitar não cria Acordo. Role 1d6 (+1 se já houver Relação Comercial utilizável): 1–2 ambos -1 Economia; 3–4 ambos +1; 5–6 você +2 Economia e o parceiro +1.'),
    C(26,'Plataforma Global','Risco',['Redes','Cultura'],'Expansão: +1 Redes OU +1 Cultura; depois outro país com Cultura abaixo de 8 recebe +1 Cultura. Regulação: +1 Diplomacia e renove 1 carta.'),
    C(27,'Abertura Comercial','Risco',['Cúpula','Acordo'],'+1 Economia. Na Cúpula desta rodada, se sua iniciativa formar um novo Acordo, você e o parceiro renovam 1 carta.',{art:'assets/cards/27-abertura-comercial.webp',headline:'Governo reduz barreiras e busca novos parceiros comerciais',brief:'A estratégia pretende ampliar mercados agora e criar condições para novas negociações internacionais.',quote:'Abrir mercados pode produzir ganhos imediatos, mas seus efeitos mais duradouros dependem de parceiros.',source:'Conselho de Comércio Exterior'}),
    C(28,'Disputa de Influência','Risco',['1d6'],'Escolha país fora do seu Bloco. Ambos rolam 1d6; vencedor +1 Diplomacia e perdedor -1. Empate: nada. Quem tiver Vantagem decide em segredo se rerrola antes das decisões serem reveladas.')
  ];

  const CARD = Object.fromEntries(CARDS.map(c=>[c.id,c]));
  const REACTION_IDS_UI = new Set([18,19,20,21,22,23]);

  let sb = null;
  let state = {session:null,teacherProfile:null,room:null,me:null,players:[],match:null,privateStates:[],channel:null,busy:false,dashboard:null,historyDetail:null,resumeSnapshot:null,interrupting:false,deferTeacherRender:false,roomPreview:null,seenDiceIds:new Set(),onboardingActive:false,onboardingStep:0,previewCardId:null,dismissedSpotlightId:null};
  const UI_SCALE_KEY='gp_ui_scale';
  const UI_SCALE_VALUES=new Set(['compact','comfortable','large']);
  function currentUiScale(){const v=localStorage.getItem(UI_SCALE_KEY)||'comfortable';return UI_SCALE_VALUES.has(v)?v:'comfortable'}
  function applyUiScale(v=currentUiScale()){const value=UI_SCALE_VALUES.has(v)?v:'comfortable';document.documentElement.dataset.uiScale=value;localStorage.setItem(UI_SCALE_KEY,value);return value}
  let heartbeatTimer = null, refreshTimer = null, tickTimer = null, uiTimer = null;
  let tickInFlight = false;

  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmtDate=v=>{if(!v)return'—';try{return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(v))}catch{return v}};
  const fmtDuration=s=>{if(s==null||Number.isNaN(Number(s)))return'—';s=Math.max(0,Math.round(Number(s)));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=s%60;return h?`${h}h ${m}min`:m?`${m}min ${x}s`:`${x}s`};
  const statusLabel=s=>({lobby:'Lobby',active:'Em andamento',finished:'Finalizada',interrupted:'Interrompida'})[s]||s||'—';
  const statusBadge=s=>`<span class="badge ${s==='finished'?'good':s==='active'?'violet':s==='interrupted'?'bad':'warn'}">${esc(statusLabel(s))}</span>`;
  const sessionIsAnonymous=(session=state.session)=>Boolean(session?.user?.is_anonymous===true||session?.user?.app_metadata?.provider==='anonymous');
  const setConn=(text,cls='')=>{connection.textContent=text;connection.className=`pill ${cls}`.trim()};
  const rememberRoom=id=>id?localStorage.setItem('gp_room_id',id):localStorage.removeItem('gp_room_id');
  const noteDraftKey=()=>state.room?.id?`gp_teacher_note_${state.room.id}`:'gp_teacher_note';
  const getNoteDraft=()=>localStorage.getItem(noteDraftKey())||'';
  const setNoteDraft=text=>localStorage.setItem(noteDraftKey(),text||'');
  const clearNoteDraft=()=>localStorage.removeItem(noteDraftKey());
  const captureTeacherNoteDraft=()=>{const note=document.getElementById('teacherNote');if(note)setNoteDraft(note.value)};
  const teacherIsWritingNote=()=>state.me?.role==='teacher'&&document.activeElement?.id==='teacherNote';

  const COUNTRY_UI={
    Aurora:{symbol:'✦',motto:'Soberania · desenvolvimento · cooperação'},
    'Montária':{symbol:'▲',motto:'Indústria · território · autonomia'},
    'Pacífica':{symbol:'≈',motto:'Comércio · diálogo · conectividade'},
    'Solária':{symbol:'☀',motto:'Cultura · inovação · projeção'}
  };
  const ATTR_UI={eco:{icon:'●',label:'Economia',cls:'eco'},net:{icon:'⌘',label:'Redes',cls:'net'},dip:{icon:'◆',label:'Diplomacia',cls:'dip'},cult:{icon:'◈',label:'Cultura',cls:'cult'}};
  const tutorialSeenKey='gp_onboarding_20g_seen';
  const tipKey=k=>`gp_tip_20g_${k}`;
  const hasSeenTip=k=>localStorage.getItem(tipKey(k))==='1';
  const markTipSeen=k=>localStorage.setItem(tipKey(k),'1');
  function countrySeal(country){const u=COUNTRY_UI[country]||{symbol:'✦'};return `<span class="country-seal country-${esc(country||'')}" aria-hidden="true">${u.symbol}</span>`}
  function attrMeter(value,attr){const v=Math.max(0,Math.min(8,Number(value||0)));return `<div class="gov-attr attr-${attr}"><div class="gov-attr-head"><span>${ATTR_UI[attr]?.icon||'●'} ${ATTR_UI[attr]?.label||attr}</span><b>${v}</b></div><div class="gov-meter" aria-label="${esc(ATTR_UI[attr]?.label||attr)} ${v} de 8">${Array.from({length:8},(_,i)=>`<i class="${i<v?'on':''}"></i>`).join('')}</div></div>`}
  function cardTypeGlyph(type){return type==='Interferência'?'◎':type==='Reação'?'⛨':type==='Risco'?'◆':'▣'}
  function cardTypeClass(type){return type==='Interferência'?'type-interference':type==='Reação'?'type-reaction':type==='Risco'?'type-risk':'type-development'}
  function cardTypeLabel(type){return type==='Reação'?'REAÇÃO · use quando o gatilho ocorrer':type==='Interferência'?'INTERFERÊNCIA · ação contra outro país':type==='Risco'?'RISCO / ESCOLHA':'DESENVOLVIMENTO'}
  function editorialCardHtml(c,{expanded=false}={}){
    if(!c)return'';
    const art=c.art?`<img class="dossier-art" src="${esc(c.art)}" alt="Ilustração temática de ${esc(c.name)}">`:`<div class="dossier-art dossier-art-placeholder"><span>${cardTypeGlyph(c.type)}</span><small>DOCUMENTO DE GOVERNO</small></div>`;
    const density=c.effect.length>210?'text-heavy':c.effect.length>135?'text-medium':'text-light';
    return `<article class="dossier-full ${cardTypeClass(c.type)} ${density} ${expanded?'expanded':''}"><div class="dossier-classification"><span>${esc(c.type)}${c.tags?.length?' · '+esc(c.tags.join(' · ')):''}</span><span>DOSSIÊ #${String(c.id).padStart(2,'0')}</span></div><h3>${esc(c.name)}</h3>${art}${c.headline?`<div class="dossier-headline">${esc(c.headline)}</div>`:''}${c.brief?`<p class="dossier-brief">${esc(c.brief)}</p>`:''}<div class="dossier-effect"><b>EFEITO NO JOGO</b><p>${esc(c.effect)}</p></div>${c.quote?`<blockquote>“${esc(c.quote)}”<cite>— ${esc(c.source||'Análise internacional')}</cite></blockquote>`:''}<div class="tag-row">${(c.tags||[]).map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div></article>`;
  }
  function currentCountry(pub,isTeacher){return isTeacher?null:state.me?.country||pub.active_country||null}
  function contextTip(pub,isTeacher,own){
    if(isTeacher||state.onboardingActive)return'';
    const me=state.me.country,c=pub.countries?.[me]||{},p=pub.pending_public;
    let key='',title='',text='';
    if(['reaction_loss','reaction_dissolve','reaction_relation_state'].includes(p?.kind)&&!hasSeenTip('reaction')){key='reaction';title='Resposta disponível';text='Reações são usadas quando um gatilho acontece e não gastam sua Ação Principal. Leia o efeito antes de decidir.'}
    else if(pub.phase==='diplomacy'&&!hasSeenTip('diplomacy')){key='diplomacy';title='Cúpula Internacional';text='Os turnos nacionais terminaram. Cada país possui 1 iniciativa diplomática gratuita. Aceitar ou recusar proposta não gasta a iniciativa do receptor.'}
    else if(pub.phase==='challenge'&&!hasSeenTip('challenge')){key='challenge';title='Briefing de Inteligência';text='Nas rodadas pares, todos respondem ao Desafio ao mesmo tempo. Acertos podem gerar Vantagem; líderes que acertam recebem renovação de carta.'}
    else if(Number(c.advantages||0)>0&&!hasSeenTip('advantage')){key='advantage';title='Vantagem Geográfica disponível';text='Guarde até 2. Gaste 1 para: refazer uma rolagem sua de d6; reduzir em 1 uma perda de atributo; ou, durante a compra, revelar 2 cartas, escolher 1 e descartar a outra.'}
    else if((pub.phase==='turn_ready'||pub.phase==='turns')&&pub.active_country===me&&!hasSeenTip('turn')){key='turn';title='Seu primeiro turno';text='Você possui 1 Ação Principal: abra um Dossiê e jogue uma carta, use Recuperação Nacional se um atributo estiver em 0 ou passe.'}
    else if(pub.phase==='event'&&!hasSeenTip('event')){key='event';title='Evento Global';text='O Evento representa uma mudança no cenário internacional. Ele permanece visível durante a rodada para lembrar quais regras e pressões estão ativas.'}
    if(!key)return'';
    return `<aside class="council-tip"><div><span>ORIENTAÇÃO DO CONSELHO</span><b>${esc(title)}</b><p>${esc(text)}</p></div><button class="tip-close" data-dismiss-tip="${key}" aria-label="Dispensar orientação">Entendi</button></aside>`;
  }
  function mountOnboarding(isTeacher){
    if(isTeacher)return;
    if(localStorage.getItem(tutorialSeenKey)==='1'&&!state.onboardingActive)return;
    if(!state.onboardingActive){state.onboardingActive=true;state.onboardingStep=0;}
    const steps=[
      {target:'.command-situation',kicker:'BEM-VINDO AO GEOPODER',title:'Seu objetivo é ampliar a Influência do país',text:'A partida dura 8 rodadas. Sua Influência é a soma de Economia, Redes, Diplomacia e Cultura. Ao final, quem tiver maior Influência vence; manter todos os quatro atributos em pelo menos 2 concede +2 de Potência Equilibrada.',button:'Entendi o objetivo'},
      {target:'.command-national',kicker:'1 · GOVERNE SEU PAÍS',title:'Fortaleça quatro dimensões de poder',text:'Economia, Redes, Diplomacia e Cultura podem crescer ou sofrer perdas. Observe também suas Vantagens e Relações. Não existe uma única estratégia: você decide como construir sua Influência.',button:'Continuar'},
      {target:'.command-event',kicker:'2 · LEIA O MUNDO',title:'O Evento muda as condições da rodada',text:'Antes de agir, confira o Cenário Global. Crises e oportunidades podem alterar regras, afetar atributos ou mudar o valor de Acordos e Blocos.',button:'Continuar'},
      {target:'.command-bottom',kicker:'3 · TOME UMA DECISÃO',title:'Use seus Dossiês',text:'No seu turno, examine os Dossiês e escolha uma Ação Principal. Você também pode usar Recuperação Nacional quando um atributo estiver em 0 ou passar. Cartas de Reação são diferentes: elas aparecem quando seu gatilho acontece.',button:'Continuar'},
      {target:'.command-situation',kicker:'4 · ACOMPANHE OS OUTROS',title:'Toda ação importante aparece na Mesa',text:'Quando outro governo agir, a Mesa de Situação destacará quem tomou a decisão, qual foi o alvo e quais consequências ocorreram. Se seu país for atingido, você receberá um alerta em evidência.',button:'Entrar na Sala de Comando'}
    ];
    const step=steps[Math.min(state.onboardingStep,steps.length-1)];
    document.querySelectorAll('.onboard-focus').forEach(x=>x.classList.remove('onboard-focus'));
    document.querySelector(step.target)?.classList.add('onboard-focus');
    let ov=document.getElementById('onboardingOverlay');if(ov)ov.remove();
    ov=document.createElement('div');ov.id='onboardingOverlay';ov.className='onboarding-overlay';ov.innerHTML=`<div class="onboarding-card"><div class="onboarding-kicker">${step.kicker}</div><h2>${step.title}</h2><p>${step.text}</p><div class="onboarding-progress">${steps.map((_,i)=>`<i class="${i<=state.onboardingStep?'on':''}"></i>`).join('')}</div><div class="onboarding-actions"><button class="btn ghost" id="skipOnboarding">Pular tutorial</button><button class="btn primary" id="nextOnboarding">${step.button}</button></div></div>`;document.body.appendChild(ov);
    document.getElementById('skipOnboarding').onclick=()=>finishOnboarding();
    document.getElementById('nextOnboarding').onclick=()=>{if(state.onboardingStep>=steps.length-1)finishOnboarding();else{state.onboardingStep++;mountOnboarding(false)}};
  }
  function finishOnboarding(){localStorage.setItem(tutorialSeenKey,'1');state.onboardingActive=false;state.onboardingStep=0;document.getElementById('onboardingOverlay')?.remove();document.querySelectorAll('.onboard-focus').forEach(x=>x.classList.remove('onboard-focus'))}

  function showError(title,detail=''){
    screen.innerHTML=`<div class="card"><h2>${esc(title)}</h2><div class="error-box">${esc(detail)}</div><div class="actions" style="margin-top:14px"><button class="btn ghost" id="errorHome">Voltar</button></div></div>`;
    document.getElementById('errorHome')?.addEventListener('click',renderHome);
  }

  async function api(action,payload={}){
    const {data,error}=await sb.functions.invoke('game-api',{body:{action,clientVersion:GAME_VERSION,...payload}});
    if(error){let message=error.message||'Falha ao chamar game-api.';try{const ctx=error.context;if(ctx&&typeof ctx.json==='function'){const b=await ctx.json();message=b?.detail||b?.error||message}}catch{}throw new Error(message)}
    if(!data?.ok)throw new Error(data?.detail||data?.error||'Resposta inválida do servidor.');return data;
  }
  async function withBusy(fn,{alertOnError=true}={}){if(state.busy)return;state.busy=true;try{return await fn()}catch(e){console.error(e);if(alertOnError)alert(e?.message||String(e));else throw e}finally{state.busy=false}}
  async function refreshSession(){const{data:{session},error}=await sb.auth.getSession();if(error)throw error;state.session=session;return session}
  async function ensureAnonymousSession(){let session=await refreshSession();if(session&&!sessionIsAnonymous(session)){await sb.auth.signOut({scope:'local'});session=null;state.teacherProfile=null}if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session;state.session=session}return session}
  async function checkTeacherStatus(){if(!state.session||sessionIsAnonymous())return{authorized:false,profile:null};const d=await api('teacher_status');state.teacherProfile=d.authorized?d.profile:null;return d}

  async function init(){
    applyUiScale();
    try{
      if(!CONFIG.SUPABASE_URL||!CONFIG.SUPABASE_PUBLISHABLE_KEY||/SEU-PROJETO|COLE_AQUI/.test(CONFIG.SUPABASE_URL+CONFIG.SUPABASE_PUBLISHABLE_KEY)){setConn('Configuração pendente','bad');showError('config.js ainda não está configurado','Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY.');return}
      if(!window.supabase?.createClient){setConn('Biblioteca indisponível','bad');showError('Supabase JS não carregou','Verifique sua conexão.');return}
      sb=window.supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
      setConn('Conectando…');const session=await refreshSession();setConn('Conectado','ok');
      const saved=localStorage.getItem('gp_room_id');
      if(saved&&session){try{const snap=await api('snapshot',{roomId:saved});state.resumeSnapshot=snap;renderResumePrompt();return}catch(e){console.warn(e);rememberRoom(null)}}
      if(session&&!sessionIsAnonymous(session)){try{const t=await checkTeacherStatus();if(t.authorized){await loadTeacherDashboard();return}}catch(e){console.warn(e)}}
      renderHome();
    }catch(e){setConn('Falha de conexão','bad');showError('Não foi possível conectar ao Supabase',e?.message||String(e))}
  }

  function renderResumePrompt(){
    const s=state.resumeSnapshot;if(!s)return renderHome();const isTeacher=s.me?.role==='teacher';const closed=['finished','interrupted'].includes(s.room?.status);
    screen.innerHTML=`<section class="card hero"><div class="eyebrow">Partida anterior encontrada</div><h2>${esc(s.room?.class_name||s.room?.code||'GeoPoder')}</h2><p class="muted">${isTeacher?'Você estava administrando':'Sua equipe estava conectada à'} sala <b>${esc(s.room?.code)}</b>${s.me?.country?` como <b>${esc(s.me.country)}</b>`:''}.</p>${closed?'<div class="banner warn">Esta sessão já foi encerrada. Você pode sair dela e entrar em outra.</div>':''}<div class="actions"><button class="btn primary" id="resumeGame" ${closed?'disabled':''}>Continuar partida</button><button class="btn ghost" id="switchRoom">Entrar em outra sala</button></div></section>`;
    document.getElementById('resumeGame').onclick=async()=>{const snap=state.resumeSnapshot;state.room=snap.room;state.me=snap.me;state.players=snap.players||[];state.match=snap.match;state.privateStates=snap.privateStates||[];rememberRoom(snap.room.id);startRoomWatch(snap.room.id);renderRoom()};
    document.getElementById('switchRoom').onclick=()=>withBusy(async()=>{try{await api('leave_room',{roomId:s.room.id})}catch{}rememberRoom(null);state.resumeSnapshot=null;if(isTeacher&&state.session&&!sessionIsAnonymous()){await loadTeacherDashboard()}else renderHome()});
  }

  function renderHome(){
    document.body.classList.remove('in-match');
    stopRoomWatch();state.room=null;state.me=null;state.players=[];state.match=null;state.privateStates=[];state.historyDetail=null;state.resumeSnapshot=null;state.roomPreview=null;state.dismissedSpotlightId=null;setConn(navigator.onLine?'Conectado':'Sem internet',navigator.onLine?'ok':'bad');
    const teacherLogged=Boolean(state.session&&!sessionIsAnonymous()&&state.teacherProfile);
    screen.innerHTML=`<div class="card hero"><div class="eyebrow">GeoPoder · ${GAME_VERSION}</div><h2>Entre na partida</h2><p class="muted">O GeoPoder funciona com <b>3 ou 4 equipes</b>, cada uma em seu próprio aparelho. O acesso do professor é autenticado.</p></div><div class="grid two" style="margin-top:16px"><section class="card role-card"><h3>🌍 Equipe</h3><div class="field"><label>Código da sala</label><input id="roomCode" maxlength="8" placeholder="GEO-AB12" style="text-transform:uppercase"></div><div class="field"><label>Nome da equipe</label><input id="teamName" maxlength="60" placeholder="Ex.: Equipe Global"></div><div class="field"><label>País</label><select id="country">${COUNTRIES.map(c=>`<option value="${c}">${c}</option>`).join('')}</select><div id="countryAvailability" class="muted tiny" style="margin-top:6px">Digite o código da sala para consultar os países disponíveis.</div></div><div class="actions"><button class="btn good" id="joinRoom">Entrar na sala</button></div></section><section class="card role-card teacher-entry"><div class="eyebrow">Acesso restrito</div><h3>🎓 Área do Professor</h3><p class="muted">Criação de salas, histórico, telemetria e controles do playtest.</p><div class="actions"><button class="btn violet" id="teacherEntry">${teacherLogged?'Abrir painel':'Entrar como professor'}</button></div></section></div>`;

    let previewTimer=null;
    const roomInput=document.getElementById('roomCode');
    const updatePreview=async()=>{
      const code=roomInput.value.trim().toUpperCase(); roomInput.value=code;
      if(code.length<8){state.roomPreview=null;renderCountryOptions([]);return;}
      try{
        let session=await refreshSession();if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error;state.session=r.data.session;}
        const d=await api('room_preview',{code});state.roomPreview=d;renderCountryOptions(d.occupied||[]);
      }catch(e){state.roomPreview=null;renderCountryOptions([],(e?.message||'Sala não encontrada.'));}
    };
    const renderCountryOptions=(occupied=[],message='')=>{
      const select=document.getElementById('country');if(!select)return;const taken=new Map((occupied||[]).map(x=>[x.country,x.team_name]));
      const current=select.value;select.innerHTML=COUNTRIES.map(c=>`<option value="${c}" ${taken.has(c)?'disabled':''}>${c}${taken.has(c)?` — ocupado por ${esc(taken.get(c)||'equipe')}`:''}</option>`).join('');
      if(!taken.has(current))select.value=current;else{const free=COUNTRIES.find(c=>!taken.has(c));if(free)select.value=free;}
      const info=document.getElementById('countryAvailability');if(info)info.innerHTML=message?`<span class="bad-text">${esc(message)}</span>`:(occupied.length?`${occupied.length} país(es) já ocupado(s). Os indisponíveis aparecem desativados.`:'Todos os países estão disponíveis.');
    };
    roomInput.addEventListener('input',()=>{clearTimeout(previewTimer);previewTimer=setTimeout(updatePreview,450)});roomInput.addEventListener('blur',updatePreview);
    document.getElementById('joinRoom').onclick=()=>withBusy(async()=>{const code=roomInput.value.trim().toUpperCase(),teamName=document.getElementById('teamName').value.trim(),country=document.getElementById('country').value;if(!code||!teamName)throw new Error('Informe o código e o nome da equipe.');if(!country)throw new Error('Não há país disponível selecionado.');await ensureAnonymousSession();const d=await api('join_room',{code,teamName,country});rememberRoom(d.room.id);await loadRoom(d.room.id)});
    document.getElementById('teacherEntry').onclick=async()=>teacherLogged?loadTeacherDashboard():renderTeacherLogin();
  }

  function renderTeacherLogin(message=''){
    stopRoomWatch();screen.innerHTML=`<section class="card login-box teacher-entry"><div class="eyebrow">Área restrita</div><h2>🎓 Professor</h2>${message?`<div class="banner bad">${esc(message)}</div>`:''}<div class="field"><label>E-mail</label><input id="teacherEmail" type="email" autocomplete="username"></div><div class="field"><label>Senha</label><input id="teacherPassword" type="password" autocomplete="current-password"></div><div class="actions"><button class="btn violet" id="teacherLoginBtn">Entrar</button><button class="btn ghost" id="teacherBackBtn">Voltar</button></div></section>`;
    document.getElementById('teacherBackBtn').onclick=renderHome;document.getElementById('teacherLoginBtn').onclick=()=>withBusy(async()=>{const email=document.getElementById('teacherEmail').value.trim(),password=document.getElementById('teacherPassword').value;if(!email||!password)throw new Error('Informe e-mail e senha.');const cur=await refreshSession();if(cur&&sessionIsAnonymous(cur))await sb.auth.signOut({scope:'local'});const r=await sb.auth.signInWithPassword({email,password});if(r.error)throw r.error;state.session=r.data.session;const st=await checkTeacherStatus();if(!st.authorized){await sb.auth.signOut({scope:'local'});state.session=null;throw new Error('Conta não autorizada como professor.')}rememberRoom(null);await loadTeacherDashboard()});
  }

  async function loadTeacherDashboard(){stopRoomWatch();const d=await api('teacher_dashboard');state.teacherProfile=d.profile;state.dashboard=d.sessions||[];renderTeacherDashboard()}
  function renderTeacherDashboard(){
    document.body.classList.remove('in-match');
    const sessions=state.dashboard||[],active=sessions.filter(s=>['lobby','active'].includes(s.room.status)),history=sessions.filter(s=>['finished','interrupted'].includes(s.room.status));
    screen.innerHTML=`<section class="card"><div class="dashboard-head"><div><div class="eyebrow">Painel do professor</div><h2 style="margin:.2rem 0">Olá, ${esc(state.teacherProfile?.display_name||'Professor')}</h2><div class="version-line">${GAME_VERSION} · regras ${RULES_VERSION}</div></div><div class="actions"><button class="btn ghost" id="teacherRefresh">Atualizar</button><button class="btn ghost" id="teacherLogout">Sair</button></div></div></section><div class="grid two" style="margin-top:16px"><section class="card"><div class="eyebrow">Nova sessão</div><h3>Criar partida</h3><div class="field"><label>Turma / identificação</label><input id="className" maxlength="100" placeholder="Ex.: M4 Vespertino"></div><button class="btn primary" id="createRoom">Criar sala</button></section><section class="card soft"><div class="grid three"><div class="metric"><div class="value">${sessions.length}</div><div class="label">sessões</div></div><div class="metric"><div class="value">${active.length}</div><div class="label">abertas</div></div><div class="metric"><div class="value">${history.length}</div><div class="label">arquivadas</div></div></div></section></div><section class="card" style="margin-top:16px"><div class="eyebrow">Agora</div><h3>Salas abertas</h3>${active.length?sessionsTable(active,true):'<div class="history-empty">Nenhuma sala aberta.</div>'}</section><section class="card" style="margin-top:16px"><div class="eyebrow">Arquivo</div><h3>Partidas anteriores</h3>${history.length?sessionsTable(history,false):'<div class="history-empty">Nenhuma sessão arquivada.</div>'}</section>`;
    document.getElementById('teacherRefresh').onclick=()=>withBusy(loadTeacherDashboard);document.getElementById('teacherLogout').onclick=()=>withBusy(async()=>{rememberRoom(null);await sb.auth.signOut({scope:'local'});state.session=null;state.teacherProfile=null;renderHome()});document.getElementById('createRoom').onclick=()=>withBusy(async()=>{const className=document.getElementById('className').value.trim();const d=await api('create_room',{className});rememberRoom(d.room.id);await loadRoom(d.room.id)});document.querySelectorAll('[data-open-room]').forEach(b=>b.onclick=()=>withBusy(()=>openTeacherSession(b.dataset.openRoom)));
  }
  function sessionsTable(items,activeMode){return `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Turma</th><th>Sala</th><th>Status</th><th>Equipes</th><th>Rodada</th><th>Versão</th><th></th></tr></thead><tbody>${items.map(s=>`<tr><td>${esc(fmtDate(s.room.created_at))}</td><td>${esc(s.room.class_name||'—')}</td><td class="mono">${esc(s.room.code)}</td><td>${statusBadge(s.room.status)}</td><td>${s.teams?.length||0}</td><td>${s.match?.round??'—'}</td><td>${esc(s.match?.game_version||'—')}</td><td><button class="btn compact ghost" data-open-room="${esc(s.room.id)}">${activeMode?'Abrir':'Relatório'}</button></td></tr>`).join('')}</tbody></table></div>`}
  async function openTeacherSession(roomId){const s=(state.dashboard||[]).find(x=>x.room.id===roomId);if(s&&['lobby','active'].includes(s.room.status)){rememberRoom(roomId);await loadRoom(roomId)}else{state.historyDetail=await api('teacher_match_detail',{roomId});renderHistoryDetail()}}

  function countEvents(events){const o={};for(const e of events)o[e.event_type]=(o[e.event_type]||0)+1;return o}
  function questionStats(events){const a=events.filter(e=>e.event_type==='QUESTION_ANSWERED'),byQuestion={};let correct=0;for(const e of a){const q=String(e.payload?.question_id??e.payload?.challenge_id??'sem_id');if(!byQuestion[q])byQuestion[q]={total:0,correct:0,wrong:0,choices:{},times:[]};const s=byQuestion[q];s.total++;const ok=Boolean(e.payload?.correct);ok?(s.correct++,correct++):s.wrong++;const ch=String(e.payload?.answer??'—');s.choices[ch]=(s.choices[ch]||0)+1;if(Number.isFinite(Number(e.payload?.response_time_ms)))s.times.push(Number(e.payload.response_time_ms))}return{total:a.length,correct,wrong:a.length-correct,byQuestion}}
  function cardStats(events){const played={},discarded={},drawn={},noTarget={};for(const e of events){const id=String(e.payload?.card_id??'');if(!id)continue;const b=e.event_type==='CARD_PLAYED'?played:e.event_type==='CARD_DISCARDED'?discarded:e.event_type==='CARD_DRAWN'?drawn:e.event_type==='CARD_NO_VALID_TARGET'?noTarget:null;if(b)b[id]=(b[id]||0)+1}return{played,discarded,drawn,noTarget,totalActions:Object.keys(played).length+Object.keys(discarded).length+Object.keys(noTarget).length}}
  function diplomacyStats(events){
    const initiatives=events.filter(e=>e.event_type==='DIPLOMACY_INITIATIVE');
    const agreementResponses=events.filter(e=>e.event_type==='AGREEMENT_RESPONSE');
    const blockResponses=events.filter(e=>e.event_type==='BLOCK_RESPONSE');
    return{
      initiatives:initiatives.length,
      passes:initiatives.filter(e=>e.payload?.kind==='pass').length,
      agreements:events.filter(e=>e.event_type==='AGREEMENT_ACCEPTED').length,
      agreementAccepted:agreementResponses.filter(e=>e.payload?.accepted===true).length,
      agreementRefused:agreementResponses.filter(e=>e.payload?.accepted===false).length,
      blocks:events.filter(e=>e.event_type==='BLOCK_FORMED').length,
      blockAccepted:blockResponses.filter(e=>e.payload?.accepted===true).length,
      blockRefused:blockResponses.filter(e=>e.payload?.accepted===false).length,
      trades:events.filter(e=>e.event_type==='CARDS_TRADED').length,
      relationsEnded:events.filter(e=>e.event_type==='AGREEMENT_ENDED'||e.event_type==='BLOCK_ENDED').length,
    }
  }
  function turnTimingStats(events){
    const turns=events.filter(e=>e.event_type==='TURN_FINISHED');
    const nums=(field)=>turns.map(e=>Number(e.payload?.[field])).filter(Number.isFinite);
    const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;
    const choice=nums('action_choice_time_ms'),resolution=nums('resolution_time_ms'),total=turns.map(e=>Number(e.payload?.turn_total_time_ms??e.payload?.decision_time_ms)).filter(Number.isFinite);
    return{turns:turns.length,avgChoice:avg(choice),avgResolution:avg(resolution),avgTotal:avg(total),timeouts:turns.filter(e=>e.payload?.reason==='timeout').length};
  }
  const topEntry=o=>Object.entries(o||{}).sort((a,b)=>b[1]-a[1])[0]||null;
  function renderHistoryDetail(){
    const d=state.historyDetail;if(!d)return loadTeacherDashboard();
    const teams=(d.players||[]).filter(p=>p.role==='player'),events=d.events||[],counts=countEvents(events),q=questionStats(events),c=cardStats(events),timing=turnTimingStats(events),dip=diplomacyStats(events),notes=events.filter(e=>e.event_type==='TEACHER_NOTE'),start=d.match?.started_at||d.room.started_at,end=d.match?.ended_at||d.room.ended_at,dur=d.match?.duration_seconds??(start&&end?Math.round((new Date(end)-new Date(start))/1000):null);
    const most=topEntry(c.played),discard=topEntry(c.discarded),noTarget=topEntry(c.noTarget);const cardLabel=x=>x?`${CARD[x[0]]?.name||'Carta '+x[0]} (${x[1]})`:'—';
    screen.innerHTML=`<section class="card"><div class="dashboard-head"><div><div class="eyebrow">Relatório de partida</div><h2>${esc(d.room.class_name||d.room.code)}</h2><div class="statusline">${statusBadge(d.room.status)}<span class="badge">${esc(d.room.code)}</span><span class="badge">${esc(d.match?.game_version||'—')}</span></div></div><div class="actions"><button class="btn ghost" id="historyBack">Voltar</button><button class="btn ghost" id="historyMd">Relatório (.md)</button><button class="btn ghost" id="historyCsv">Planilha (.csv)</button><button class="btn ghost" id="historyJson">Dados completos (.json)</button></div></div></section>
      <section class="grid four" style="margin-top:16px"><div class="metric"><div class="value">${teams.length}</div><div class="label">equipes</div></div><div class="metric"><div class="value">${d.match?.round??'—'}</div><div class="label">última rodada</div></div><div class="metric"><div class="value">${fmtDuration(dur)}</div><div class="label">duração</div></div><div class="metric"><div class="value">${events.length}</div><div class="label">eventos</div></div></section>
      <section class="grid two" style="margin-top:16px"><div class="card"><div class="eyebrow">Aprendizagem</div><h3>Desafios</h3>${q.total?`<div class="metric"><div class="value">${q.correct}/${q.total}</div><div class="label">acertos (${Math.round(q.correct/q.total*100)}%)</div></div>`:'<p class="muted">Sem respostas registradas.</p>'}</div><div class="card"><div class="eyebrow">Playtest</div><h3>Cartas</h3><p><b>Mais jogada:</b> ${esc(cardLabel(most))}</p><p><b>Mais descartada:</b> ${esc(cardLabel(discard))}</p><p><b>Mais vezes sem alvo:</b> ${esc(cardLabel(noTarget))}</p></div></section>
      <section class="card" style="margin-top:16px"><div class="eyebrow">Ritmo da partida</div><h3>Tempo de decisão e resolução</h3><div class="grid four"><div class="metric"><div class="value">${timing.avgChoice==null?'—':fmtDuration(timing.avgChoice/1000)}</div><div class="label">média para escolher</div></div><div class="metric"><div class="value">${timing.avgResolution==null?'—':fmtDuration(timing.avgResolution/1000)}</div><div class="label">média para resolver</div></div><div class="metric"><div class="value">${timing.avgTotal==null?'—':fmtDuration(timing.avgTotal/1000)}</div><div class="label">média total do turno</div></div><div class="metric"><div class="value">${timing.timeouts}</div><div class="label">turnos por timeout</div></div></div><p class="muted tiny">A partir da Alpha 2.0c.1, o tempo até confirmar a Ação Principal é separado do tempo gasto resolvendo consequências, reações e escolhas posteriores.</p></section>
      <section class="card" style="margin-top:16px"><div class="eyebrow">Diplomacia</div><h3>Cúpula e relações</h3><div class="grid four"><div class="metric"><div class="value">${dip.initiatives}</div><div class="label">iniciativas</div></div><div class="metric"><div class="value">${dip.agreements}</div><div class="label">Acordos formados</div></div><div class="metric"><div class="value">${dip.blocks}</div><div class="label">Blocos formados</div></div><div class="metric"><div class="value">${dip.trades}</div><div class="label">trocas concluídas</div></div></div><p class="muted tiny">Recusas: ${dip.agreementRefused} Acordo(s), ${dip.blockRefused} Bloco(s). Relações encerradas: ${dip.relationsEnded}. Países que passaram a iniciativa: ${dip.passes}.</p></section>
      <section class="card" style="margin-top:16px"><div class="eyebrow">Notas do professor</div><h3>Observações salvas</h3>${notes.length?notes.map(n=>`<div class="banner" style="margin-bottom:8px"><b>Rodada ${n.round??'—'} · ${esc(fmtDate(n.created_at))}</b><div>${esc(n.payload?.text||'')}</div></div>`).join(''):'<p class="muted">Nenhuma nota salva nesta sessão.</p>'}</section>
      <section class="card" style="margin-top:16px"><div class="eyebrow">Telemetria</div><h3>Eventos registrados</h3><div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Quantidade</th></tr></thead><tbody>${Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</tbody></table></div></section>`;
    document.getElementById('historyBack').onclick=loadTeacherDashboard;document.getElementById('historyMd').onclick=()=>exportDetail('md');document.getElementById('historyCsv').onclick=()=>exportDetail('csv');document.getElementById('historyJson').onclick=()=>exportDetail('json');
  }

  async function loadRoom(roomId,restoring=false){const snap=await api('snapshot',{roomId});state.room=snap.room;state.me=snap.me;state.players=snap.players||[];state.match=snap.match;state.privateStates=snap.privateStates||[];rememberRoom(roomId);startRoomWatch(roomId);renderRoom();if(!restoring)window.scrollTo({top:0,behavior:'smooth'})}
  async function refreshSnapshot(){if(!state.room?.id)return;captureTeacherNoteDraft();try{const s=await api('snapshot',{roomId:state.room.id});state.room=s.room;state.me=s.me;state.players=s.players||[];state.match=s.match;state.privateStates=s.privateStates||[];if(teacherIsWritingNote()){state.deferTeacherRender=true;return}renderRoom()}catch(e){console.warn(e)}}
  function startRoomWatch(roomId){stopRoomWatch();state.channel=sb.channel(`gp-room-${roomId}`).on('postgres_changes',{event:'*',schema:'public',table:'gp_room_players',filter:`room_id=eq.${roomId}`},debouncedRefresh).on('postgres_changes',{event:'*',schema:'public',table:'gp_matches',filter:`room_id=eq.${roomId}`},debouncedRefresh).on('postgres_changes',{event:'*',schema:'public',table:'gp_rooms',filter:`id=eq.${roomId}`},debouncedRefresh).subscribe(st=>{if(st==='SUBSCRIBED')setConn('Sincronizado','ok');else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT')setConn('Realtime instável','bad')});heartbeatTimer=setInterval(()=>api('heartbeat',{roomId}).catch(()=>{}),25000)}
  function stopRoomWatch(){if(state.channel&&sb){sb.removeChannel(state.channel);state.channel=null}for(const [k,t] of [['heartbeat',heartbeatTimer],['tick',tickTimer],['ui',uiTimer]])if(t){clearInterval(t);if(k==='heartbeat')heartbeatTimer=null;if(k==='tick')tickTimer=null;if(k==='ui')uiTimer=null}tickInFlight=false;if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=null}}
  function debouncedRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshSnapshot,120)}
  function updateCountdowns(){document.querySelectorAll('[data-deadline]').forEach(el=>{const d=el.dataset.deadline;if(!d)return;const ms=Math.max(0,new Date(d).getTime()-Date.now()),sec=Math.ceil(ms/1000);el.textContent=`${sec}s`;el.classList.toggle('urgent',sec<=8)})}

  function renderRoom(){if(!state.room||!state.me)return renderHome();if(state.match)renderMatch(state.me.role==='teacher');else{document.body.classList.remove('in-match');renderLobby(state.me.role==='teacher')}}
  function rosterByCountry(){const m={};for(const c of COUNTRIES)m[c]=state.players.find(p=>p.role==='player'&&p.country===c)||null;return m}
  function renderLobby(isTeacher){const roster=rosterByCountry(),count=COUNTRIES.filter(c=>roster[c]).length;screen.innerHTML=`<section class="card"><div class="statusline"><span class="badge">Sala</span><span class="badge warn">Lobby</span>${state.room.class_name?`<span class="badge">${esc(state.room.class_name)}</span>`:''}</div><div class="room-code">${esc(state.room.code)}</div><div class="copyline"><span class="muted">Compartilhe este código.</span><button class="btn ghost" id="copyCode">Copiar</button><button class="btn ghost right" id="leaveRoom">${isTeacher?'Voltar ao painel':'Sair / entrar em outra sala'}</button></div></section><section class="card" style="margin-top:16px"><div class="actions"><div><h3>Equipes</h3><div class="muted small">${count}/4 países ocupados · mínimo de 3 para iniciar</div></div>${isTeacher?`<button class="btn primary right" id="startMatch" ${count>=3?'':'disabled'}>Iniciar partida</button>`:''}</div><div class="grid four" style="margin-top:16px">${COUNTRIES.map(c=>seatHtml(c,roster[c])).join('')}</div>${count===3?'<div class="banner good" style="margin-top:14px">Partida com 3 equipes pronta para iniciar. O país vazio ficará fora desta sessão.</div>':''}</section>`;document.getElementById('copyCode').onclick=()=>navigator.clipboard?.writeText(state.room.code);document.getElementById('leaveRoom').onclick=()=>leaveCurrentRoom(isTeacher);if(isTeacher&&count>=3)document.getElementById('startMatch').onclick=()=>withBusy(async()=>{await api('start_match',{roomId:state.room.id});await refreshSnapshot()})}
  function seatHtml(c,p){return `<div class="seat country-${c} ${p?'occupied':''}"><strong>${c}</strong>${p?`<div>${esc(p.team_name)}</div><small>Conectada</small>`:'<div class="muted">Aguardando…</div>'}</div>`}
  async function leaveCurrentRoom(isTeacher){await withBusy(async()=>{try{await api('leave_room',{roomId:state.room.id})}catch{}rememberRoom(null);stopRoomWatch();if(isTeacher)await loadTeacherDashboard();else renderHome()})}

  function ownPrivate(){return state.privateStates.find(x=>x.player_id===state.me?.id)||state.privateStates[0]||null}
  function relationChips(country,relations){const arr=[];for(const [k,r] of Object.entries(relations||{})){const parts=k.split('|');if(parts.includes(country)){const p=parts.find(x=>x!==country);arr.push(`<span class="relation-chip ${r.type}">${r.type==='block'?'🤝 Bloco':'⇄ Acordo'} · ${esc(p)}${r.suspended?' · suspenso':r.tension?' · sob tensão':r.crisis?' · em crise':''}</span>`)}}return arr.join('')||'<span class="muted tiny">Sem relações</span>'}
  const activeList=pub=>pub.active_countries||Object.keys(pub.countries||{});
  function publicBlockPartner(pub,country){for(const[k,r]of Object.entries(pub.relations||{})){if(r.type==='block'&&!r.suspended&&k.split('|').includes(country))return k.split('|').find(x=>x!==country)||null}return null}
  function publicAnyBlockPartner(pub,country){for(const[k,r]of Object.entries(pub.relations||{})){if(r.type==='block'&&k.split('|').includes(country))return k.split('|').find(x=>x!==country)||null}return null}
  function publicAgreementPartners(pub,country,{usable=false}={}){const out=[];for(const[k,r]of Object.entries(pub.relations||{})){if(r.type==='agreement'&&!r.suspended&&(!usable||(!r.tension&&!pub.flags?.relationBonusOff))&&k.split('|').includes(country))out.push(k.split('|').find(x=>x!==country))}return out.filter(Boolean)}
  function publicCommercialRelationCount(pub,country){let n=0;for(const[k,r]of Object.entries(pub.relations||{})){if(!r.suspended&&k.split('|').includes(country))n++}return n}
  function publicRelation(pub,a,b){return pub.relations?.[[a,b].sort().join('|')]||null}
  function cardHasValidTarget(id,pub,country){const act=activeList(pub),me=pub.countries?.[country]||{};if([18,19,20,21,22,23].includes(id))return false;if(id===11)return publicAgreementPartners(pub,country,{usable:true}).length>0;if(id===12)return act.some(c=>c!==country&&Number(pub.countries[c]?.eco)>Number(me.eco));if(id===13){const block=publicBlockPartner(pub,country);return act.some(c=>c!==country&&c!==block&&Number(pub.countries[c]?.cult)>=Number(me.cult));}if(id===15)return act.some(c=>c!==country&&Number(pub.countries[c]?.net)>=Number(me.net));if(id===16)return Object.entries(pub.relations||{}).some(([k,r])=>r.type==='block'&&!r.suspended&&!k.split('|').includes(country));if(id===17)return act.some(c=>c!==country&&publicAgreementPartners(pub,c,{usable:true}).length>=2);return true}

  function countryHtml(c,d,isMine,pub){const total=(d.eco||0)+(d.net||0)+(d.dip||0)+(d.cult||0);return `<section class="card country-${c} ${pub.active_country===c?'active-country':''}"><div class="actions"><h3 style="margin:0">${esc(c)}</h3>${isMine?'<span class="badge good">Seu país</span>':''}${pub.active_country===c?'<span class="badge violet">Turno</span>':''}</div><div class="muted small">${esc(d.team_name||'')}</div><div class="kpis"><div class="kpi"><b>${d.eco??0}</b><span>💰 Economia</span></div><div class="kpi"><b>${d.net??0}</b><span>🌐 Redes</span></div><div class="kpi"><b>${d.dip??0}</b><span>🤝 Diplomacia</span></div><div class="kpi"><b>${d.cult??0}</b><span>🎭 Cultura</span></div></div><div class="separator"></div><div class="actions"><span class="badge">Influência ${total}</span><span class="badge">🃏 ${d.hand_count??0}</span><span class="badge">🎓 ${d.advantages??0}</span></div><div class="relation-row">${relationChips(c,pub.relations)}</div></section>`}
  function cardHtml(id,{button='',data='',disabled=false}={}){const c=CARD[id]||{name:`Carta ${id}`,type:'',tags:[],effect:''};return `<article class="game-card"><div class="num">CARTA ${id} · ${esc(c.type)}</div><h4>${esc(c.name)}</h4><p>${esc(c.effect)}</p><div class="tag-row">${(c.tags||[]).map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div>${button?`<button class="btn compact ${disabled?'':'primary'}" ${data} ${disabled?'disabled':''}>${esc(button)}</button>`:''}</article>`}
  function handHtml(hand,opts={}){return `<div class="hand">${(hand||[]).map(id=>cardHtml(id,opts.buttonFor?opts.buttonFor(id):{})).join('')||'<p class="muted">Nenhuma carta.</p>'}</div>`}


  function bulletinIcon(b){
    if(b?.kind==='impact')return '!';
    if(b?.kind==='reaction')return '⛨';
    if(b?.kind==='diplomacy')return '◆';
    if(b?.kind==='dice')return '🎲';
    if(b?.kind==='benefit')return '+';
    return '›';
  }
  function renderActionSpotlight(pub,isTeacher){
    const a=pub.action_spotlight;
    const p=pub.pending_public;
    if(!a && !p)return '';
    const actor=a?.actor||p?.actor||p?.proposer||null;
    const target=a?.target||p?.target||null;
    const card=a?.card_name||(a?.card_id?CARD[a.card_id]?.name:null)||p?.source||null;
    const consequences=(a?.consequences||[]).slice(-3);
    const decision=p?`Aguardando ${p.country||'decisão'}: ${pendingDescription(p)}`:(consequences.length?'Resolvida':'Em resolução');
    return `<section class="action-spotlight ${target===state.me?.country?'targets-me':''}">
      <div class="spotlight-kicker">${target===state.me?.country?'AÇÃO CONTRA SEU PAÍS':'AÇÃO EM EVIDÊNCIA'}</div>
      ${renderResolutionChain({actor:actor||'Sistema',card:card||'Decisão',target:target||'Sistema internacional',decision,consequences,compact:true})}
    </section>`;
  }

  function renderResolutionChain({actor='Sistema',card='Decisão',target='Sistema internacional',decision='Em resolução',consequences=[],compact=false}={}){
    const result=(consequences||[]).length?(consequences||[]).slice(-3).join(' · '):'Resultado aguardado';
    const steps=[['ATOR',actor],['AÇÃO / CARTA',card],['ALVO',target],['DECISÃO',decision],['CONSEQUÊNCIA',result]];
    return `<div class="resolution-chain ${compact?'compact':''}" aria-label="Cadeia de resolução">${steps.map((x,i)=>`<div class="resolution-step step-${i+1}"><small>${esc(x[0])}</small><b>${esc(x[1])}</b></div>${i<steps.length-1?'<span class="resolution-arrow" aria-hidden="true">→</span>':''}`).join('')}</div>`;
  }
  function renderImpactToasts(pub,isTeacher){
    if(isTeacher||!state.me?.country)return '';
    const me=state.me.country;
    const feed=(pub.bulletins||[]).slice(-5).filter(b=>b.target===me && ['impact','reaction'].includes(b.kind)).slice(-2).reverse();
    if(!feed.length)return '';
    return `<aside class="impact-toasts" aria-live="assertive">${feed.map(b=>`<article class="impact-toast ${b.kind||''}">
      <div class="impact-toast-top"><span>${bulletinIcon(b)}</span><b>${b.kind==='reaction'?'RESPOSTA DIPLOMÁTICA':'ISTO AFETOU SEU PAÍS'}</b></div>
      <h4>${esc(b.title||b.source||'Novo acontecimento')}</h4>
      ${b.actor?`<p><strong>${esc(b.actor)}</strong>${b.source?` · ${esc(b.source)}`:''}</p>`:''}
      ${b.body?`<div class="impact-body">${esc(b.body)}</div>`:''}
    </article>`).join('')}</aside>`;
  }
  function renderPublicWire(pub){
    const feed=(pub.bulletins||[]).slice(-2).reverse();
    if(!feed.length)return '';
    return `<div class="public-wire"><span>AGÊNCIA INTERNACIONAL</span><div>${feed.map(b=>`<i>${bulletinIcon(b)} <b>${esc(b.title||'Atualização')}</b>${b.body?` <em>— ${esc(b.body)}</em>`:''}</i>`).join('')}</div></div>`;
  }

  function renderMatch(isTeacher){
    if(isTeacher)captureTeacherNoteDraft();
    document.body.classList.add('in-match','government-ui');
    const pub=state.match.public_state||{},own=ownPrivate(),country=currentCountry(pub,isTeacher),cu=COUNTRY_UI[country]||{};
    if(state.match.status==='interrupted'||state.room.status==='interrupted')return renderClosedSession(isTeacher,'Sessão interrompida','O professor encerrou este playtest. Os dados foram preservados no histórico.');
    if(pub.phase==='finished'||state.match.status==='finished')return renderFinal(pub,isTeacher,own);
    const team=isTeacher?'Professor':(pub.countries?.[country]?.team_name||state.me?.team_name||'Equipe');
    screen.innerHTML=`<div class="command-room government-room">
      <header class="command-top government-top">
        <div class="gov-brand"><span class="gov-logo">✦</span><div><div class="gov-title">GEOPODER <small>— SALA DE COMANDO</small></div><div class="gov-motto">Estratégia. Diplomacia. Um mundo em suas decisões.</div></div></div>
        <div class="gov-country-ident">${isTeacher?'<span class="country-seal teacher-seal">▣</span>':countrySeal(country)}<div><small>${isTeacher?'COORDENAÇÃO DA PARTIDA':'REPÚBLICA DE'}</small><b>${esc(isTeacher?'PAINEL DO PROFESSOR':country)}</b><span>${esc(isTeacher?state.room.class_name||state.room.code:cu.motto||'')}</span></div></div>
        <div class="gov-team"><small>EQUIPE</small><b>♟ ${esc(team)}</b></div>
        <div class="gov-round"><small>RODADA ${pub.round} / 8</small><b>${esc(phaseTitle(pub))}</b><div class="round-track">${Array.from({length:8},(_,i)=>`<i class="${i<pub.round?'done':i===pub.round-1?'active':''}"></i>`).join('')}</div></div>
        <div class="gov-online"><span>● CONEXÃO ESTÁVEL</span><small>${activeList(pub).length} PAÍSES ATIVOS · SALA ${esc(state.room.code)}</small></div>
      </header>
      <aside class="command-national gov-panel">${renderNationalCommand(pub,isTeacher)}</aside>
      <main class="command-situation gov-panel">${renderSituationCommand(pub,isTeacher,own)}</main>
      <aside class="command-event gov-panel ${eventTone(pub.current_event)}">${renderCommandEvent(pub.current_event,pub)}</aside>
      <section class="command-bottom gov-panel">${isTeacher?renderTeacherDock(pub):renderCommandHand(own,pub)}</section>
      <footer class="government-nav">
        <button class="gov-nav-btn active" data-command-modal="world"><span>◎</span><b>SITUAÇÃO MUNDIAL</b><small>Panorama do sistema</small></button>
        <button class="gov-nav-btn" data-command-modal="diplomacy"><span>◆</span><b>DIPLOMACIA</b><small>Acordos e relações</small></button>
        <button class="gov-nav-btn" data-command-modal="intelligence"><span>▥</span><b>INTELIGÊNCIA</b><small>Informações e análises</small></button>
        <button class="gov-nav-btn" data-command-modal="history"><span>▤</span><b>HISTÓRICO</b><small>Registro das rodadas</small></button>
        <button class="gov-nav-btn" data-command-modal="rules"><span>?</span><b>COMO JOGAR</b><small>Tutorial e regras</small></button>
        <button class="gov-nav-btn exit" id="leaveActive"><span>↪</span><b>${isTeacher?'PAINEL':'SAIR'}</b><small>${isTeacher?'Gestão docente':'Deixar a sala'}</small></button>
      </footer>
      <div class="command-modal" id="commandModal" aria-hidden="true"><div class="command-modal-card"><div class="command-modal-head"><div><small>ARQUIVO DE GOVERNO</small><h3 id="commandModalTitle">Detalhes</h3></div><button class="btn ghost compact" id="commandModalClose">Fechar</button></div><div id="commandModalBody" class="command-modal-body"></div></div></div>
      ${renderImpactToasts(pub,isTeacher)}
      ${renderPublicWire(pub)}
    </div>`;
    document.getElementById('leaveActive').onclick=()=>leaveCurrentRoom(isTeacher);
    document.querySelectorAll('[data-command-modal]').forEach(b=>b.onclick=()=>openCommandModal(b.dataset.commandModal,pub));
    document.getElementById('commandModalClose')?.addEventListener('click',closeCommandModal);
    document.getElementById('commandModal')?.addEventListener('click',e=>{if(e.target?.id==='commandModal')closeCommandModal()});
    bindMatchActions(pub,isTeacher,own);
    document.querySelectorAll('[data-open-card]').forEach(b=>b.onclick=()=>showCardInSituation(Number(b.dataset.openCard),pub));
    document.querySelectorAll('[data-preview-close]').forEach(b=>b.onclick=()=>{state.previewCardId=null;renderRoom()});
    document.querySelectorAll('[data-preview-play]').forEach(b=>b.onclick=()=>withBusy(async()=>{const id=Number(b.dataset.previewPlay);state.previewCardId=null;await api('play_card',{roomId:state.room.id,cardId:id});await refreshSnapshot()}));
    document.querySelectorAll('[data-dismiss-tip]').forEach(b=>b.onclick=()=>{markTipSeen(b.dataset.dismissTip);renderRoom()});
    animateDiceDisplay(pub.dice_display);
    mountOnboarding(isTeacher);
  }

  function phaseTitle(pub){
    const k=pub.pending_public?.kind;
    if(['reaction_loss','reaction_dissolve','reaction_relation_state'].includes(k))return'Janela de Reação';
    if(k==='card_setup')return'Preparando jogada';
    if(['renew_discard','optional_renew'].includes(k))return'Renovação de carta';
    if(['hand_limit_discard','discard_card','trade_return','safeguard_cost','safeguard_block_cost'].includes(k))return'Escolha de carta';
    if(pub.phase==='event')return'Evento Mundial';
    if(pub.phase==='challenge')return'Desafio Geográfico';
    if(pub.phase==='challenge_result')return'Resultado do Desafio';
    if(pub.phase==='draw')return pub.draw_context?.after_challenge?'Compra normal da rodada':'Compra da rodada';
    if(pub.phase==='turn_ready')return`${pub.active_country} se prepara`;
    if(pub.phase==='turns')return`Turno de ${pub.active_country}`;
    if(pub.phase==='diplomacy')return'Cúpula Diplomática';
    return'Partida em andamento';
  }

  function eventTone(e){if(!e)return'event-neutral';const k=(e.kind||'').toLowerCase();return k.includes('crise')?'event-crisis':k.includes('oportun')?'event-opportunity':'event-adverse'}

  function renderCommandEvent(e,pub){
    if(!e)return `<div class="panel-title"><span>◎</span><div><b>CENÁRIO GLOBAL</b><small>Eventos que moldam o amanhã</small></div></div><div class="event-empty">Aguardando o próximo boletim internacional.</div>`;
    const kind=(e.kind||'Evento').toUpperCase(),quote=e.kind==='Oportunidade'?'“Toda abertura no sistema internacional cria espaço para novas estratégias.”':e.kind==='Crise'?'“Crises testam governos antes de testarem fronteiras.”':'“O cenário internacional muda; governos precisam escolher como responder.”',summary=e.kind==='Oportunidade'?'Governos identificam novas possibilidades de cooperação, crescimento e projeção internacional.':e.kind==='Crise'?'Tensões internacionais pressionam mercados, redes e decisões de governo em várias regiões.':'Uma mudança no cenário internacional exige respostas rápidas e escolhas estratégicas dos governos.';
    const density=String(e.effect||'').length>190?'event-text-heavy':String(e.effect||'').length>120?'event-text-medium':'event-text-light';
    return `<div class="panel-title"><span>◎</span><div><b>CENÁRIO GLOBAL</b><small>Eventos que moldam o amanhã</small></div></div><article class="event-paper ${density}"><div class="event-paper-top"><span>EVENTO DA RODADA</span><b>${esc(kind)}</b></div><h2>${esc(e.name)}</h2><div class="event-visual"><span>🌐</span><small>BOLETIM INTERNACIONAL · RODADA ${pub.round}</small></div><p class="event-summary">${esc(summary)}</p><div class="event-effect-box"><b>EFEITO NO JOGO</b><p>${esc(e.effect)}</p></div><blockquote>${quote}<cite>— Observatório Político Internacional</cite></blockquote></article>`;
  }

  function renderNationalCommand(pub,isTeacher){
    if(isTeacher)return renderTeacherControlCompact(pub);
    const c=pub.countries?.[state.me.country]||{},country=state.me.country,total=(c.eco||0)+(c.net||0)+(c.dip||0)+(c.cult||0),cu=COUNTRY_UI[country]||{};
    return `<div class="panel-title"><span>▥</span><div><b>GABINETE NACIONAL</b><small>Gestão interna para um país mais forte</small></div></div><div class="national-identity">${countrySeal(country)}<div><small>REPÚBLICA DE</small><h2>${esc(country)}</h2><span>${esc(cu.motto||'')}</span></div></div><div class="national-meters">${attrMeter(c.eco,'eco')}${attrMeter(c.net,'net')}${attrMeter(c.dip,'dip')}${attrMeter(c.cult,'cult')}</div><div class="national-score-strip"><div class="national-score-v2"><div><span>★</span><b>INFLUÊNCIA</b></div><strong>${total}</strong></div><div class="national-score-v2 advantage"><div><span>✥</span><b>VANTAGEM</b></div><strong>${c.advantages??0}</strong></div></div><div class="relation-title">RELAÇÕES ATUAIS</div><div class="relation-list-v2">${renderRelationList(country,pub.relations)}</div>`;
  }
  function renderRelationList(country,relations){const arr=[];for(const[k,r]of Object.entries(relations||{})){const ps=k.split('|');if(!ps.includes(country))continue;const partner=ps.find(x=>x!==country),label=r.type==='block'?'Bloco Econômico':'Acordo Comercial';arr.push(`<div class="relation-v2 ${r.type} ${r.suspended?'suspended':r.tension?'tension':r.crisis?'crisis':''}"><span>${r.type==='block'?'▲':'▬'}</span><b>${esc(partner)}</b><small>${esc(label)}${r.suspended?' · suspenso':r.tension?' · sob tensão':r.crisis?' · em crise':''}</small></div>`)}return arr.join('')||'<div class="relation-empty">Nenhuma relação formal ativa.</div>'}

  function renderTeacherControlCompact(pub){
    const answered=(pub.challenge_answered||[]).length,total=activeList(pub).length,done=(pub.diplomacy_done||[]).length;
    let controls='';
    if(pub.phase==='turn_ready')controls+=`<button class="btn primary" id="teacherStartTurnPanel">Iniciar turno de ${esc(pub.active_country)}</button>`;
    if(pub.phase==='turns'&&!pub.pending_public)controls+=`<button class="btn danger" id="teacherForcePass">Encerrar turno de ${esc(pub.active_country)}</button>`;
    if(pub.pending_public)controls+=`<button class="btn warn-control" id="teacherResolvePending">Resolver decisão pendente</button>`;
    if(pub.phase==='challenge')controls+=`<button class="btn primary" id="teacherResolveChallenge">Resolver desafio (${answered}/${total})</button>`;
    if(pub.phase==='challenge_result')controls+=`<button class="btn primary" id="teacherContinue">Prosseguir para a próxima fase</button>`;
    if(pub.phase==='diplomacy'&&!pub.pending_public)controls+=`<button class="btn primary" id="teacherEndDiplomacy">Encerrar Cúpula (${done}/${total})</button>`;
    return `<div class="command-section-label">Controle docente</div><h2>Sala ${esc(state.room.code)}</h2><div class="teacher-phase"><b>${esc(phaseTitle(pub))}</b><span>Rodada ${pub.round}/8</span></div><div class="teacher-controls">${controls||'<span class="muted small">Aguardando ação dos estudantes.</span>'}<button class="btn danger" id="interruptSession">Interromper sessão</button></div><div class="teacher-hint">Sem cronômetro automático. O professor controla o ritmo e pode encerrar turnos ou fases.</div>`;
  }

  function renderCommandRecent(pub){
    const last=(pub.recent_log||[]).slice(-1)[0];
    return `<div class="command-recent"><span>▤ ÚLTIMO INFORME</span><b title="${last?esc(last.text||last):'Nenhuma ação recente.'}">${last?esc(last.text||last):'Nenhuma ação recente.'}</b><button class="recent-link" data-command-modal="history">VER TODOS</button></div>`;
  }

  function renderSituationCommand(pub,isTeacher,own){
    const canPreview=!isTeacher&&state.previewCardId&&pub.phase==='turns'&&!pub.pending_public;
    const me=!isTeacher?state.me?.country:null;
    const pendingForMe=!isTeacher&&pub.pending_public?.country===me;
    const observingTurn=!isTeacher&&pub.phase==='turns'&&me&&me!==pub.active_country;
    const observingPending=observingTurn&&pub.pending_public?.country&&pub.pending_public.country!==me;
    const eventDice=!isTeacher&&pub.phase==='event'&&Boolean(pub.dice_display)&&!pendingForMe;
    const spotlightId=String(pub.action_spotlight?.id||'');
    const spotlightDismissed=Boolean(spotlightId&&state.dismissedSpotlightId===spotlightId);
    const diplomacyObserver=!isTeacher&&pub.phase==='diplomacy'&&Boolean(pub.action_spotlight)&&!pendingForMe&&!spotlightDismissed;
    const live=(observingTurn&&(pub.action_spotlight||pub.dice_display||(pub.bulletins||[]).length))||eventDice||diplomacyObserver;
    const useLive=!canPreview&&live&&(eventDice||diplomacyObserver||observingPending||!pub.pending_public);
    const center=canPreview?renderSituationDossier(Number(state.previewCardId),pub,own):useLive?renderLiveSituation(pub):renderPhasePanel(pub,isTeacher,own);
    const floating=!canPreview&&!useLive&&!spotlightDismissed;
    return `<div class="situation-topline"><div class="panel-title compact"><span>✦</span><div><b>MESA DE SITUAÇÃO</b><small>${useLive?'Central de operações · acompanhe o mundo em movimento':'Analisar · planejar · decidir · governar'}</small></div></div>${pub.active_country?`<span class="situation-active">EM FOCO · ${esc(pub.active_country)}</span>`:''}</div>${floating?renderActionSpotlight(pub,isTeacher):''}${floating?renderDiceDisplay(pub.dice_display):''}${floating?contextTip(pub,isTeacher,own):''}<div class="situation-phase ${canPreview?'dossier-preview-phase':''} ${useLive?'live-ops-phase':''}">${center}</div>${renderCommandRecent(pub)}`;
  }

  function renderLiveSituation(pub){
    const a=pub.action_spotlight;
    const d=pub.dice_display;
    const p=pub.pending_public;
    const latest=(pub.bulletins||[]).slice(-1)[0];
    if(d?.rolls?.length){
      const consequences=(a?.consequences||[]).slice(-4);
      const dice=renderDiceDisplay(d);
      const outcomes=renderDiceOutcomeSummary(d);
      const diceTargets=(d.rolls||[]).map(r=>r.country||r.label).filter(Boolean).join(', ')||a?.target||'Sistema internacional';
      const decision=p?`Aguardando ${p.country||'outro governo'}: ${pendingDescription(p)}`:'Resultados revelados';
      return `<section class="command-action live-ops-board dice-live-board"><div class="state-kicker">RESOLUÇÃO COMPARTILHADA</div>${renderResolutionChain({actor:a?.actor||'Sistema',card:d.source||a?.card_name||'Rolagem pública',target:diceTargets,decision,consequences})}${dice}${outcomes}</section>`;
    }
    if(a){
      const consequences=(a.consequences||[]).slice(-5);
      const decision=p?`Aguardando ${p.country||'o governo responsável'}: ${pendingDescription(p)}`:(a.decision||'Resolvida');
      const resultConsequences=consequences.length?consequences:(latest?.body?[latest.body]:[]);
      const resume=pub.phase==='diplomacy'?'<button class="btn primary resume-summit" data-resume-summit>VOLTAR À CÚPULA · CONTINUAR NEGOCIAÇÕES</button>':'';
      return `<section class="command-action live-ops-board ${a.target===state.me?.country?'targets-me':''}"><div class="state-kicker">${a.target===state.me?.country?'AÇÃO CONTRA SEU PAÍS':'MOVIMENTO INTERNACIONAL'}</div>${renderResolutionChain({actor:a.actor||'Sistema',card:a.card_name||a.title||'Decisão em andamento',target:a.target||'Sistema internacional',decision,consequences:resultConsequences})}${resume}</section>`;
    }
    if(latest)return `<section class="command-action live-ops-board"><div class="state-kicker">ÚLTIMO ACONTECIMENTO</div><h1>${esc(latest.title||'Atualização internacional')}</h1>${latest.body?`<div class="live-last-result"><span>${esc(latest.body)}</span></div>`:''}<p class="live-pending-copy">Aguardando a próxima decisão de ${esc(pub.active_country||'outro governo')}.</p></section>`;
    return `<section class="command-action state-briefing waiting-state"><div class="state-kicker">CENTRAL DE OPERAÇÕES</div><h2>Aguardando ${esc(pub.active_country||'outro governo')}</h2><p>A próxima ação aparecerá aqui com alvo, consequências e resultados.</p></section>`;
  }

  function renderSituationDossier(id,pub,own){
    const c=CARD[id];if(!c)return renderPhasePanel(pub,false,own);
    const active=pub.phase==='turns'&&!pub.pending_public&&state.me.country===pub.active_country,reaction=REACTION_IDS_UI.has(id),valid=cardHasValidTarget(id,pub,state.me.country);
    const art=c.art?`<img src="${esc(c.art)}" alt="Ilustração temática de ${esc(c.name)}">`:`<div class="situation-dossier-art placeholder"><span>${cardTypeGlyph(c.type)}</span><small>DOSSIÊ DE GOVERNO</small></div>`;
    const action=reaction?'<div class="situation-dossier-note violet">Carta de Reação: será oferecida automaticamente quando o gatilho acontecer.</div>':active&&valid?`<button class="btn primary" data-preview-play="${id}">JOGAR ESTE DOSSIÊ</button>`:active&&!valid?'<div class="situation-dossier-note warn">Neste momento não existe alvo válido para esta carta.</div>':'<div class="situation-dossier-note">Planejamento: você poderá jogar este Dossiê quando chegar seu turno.</div>';
    const density=c.effect.length>210?'text-heavy':c.effect.length>135?'text-medium':'text-light';
    return `<section class="command-action situation-dossier-preview ${cardTypeClass(c.type)} ${density}"><div class="situation-dossier-head"><div><span>${esc(cardTypeLabel(c.type))}${c.tags?.length?' · '+esc(c.tags.join(' · ')):''}</span><b>DOSSIÊ #${String(id).padStart(2,'0')}</b></div><button class="situation-dossier-close" data-preview-close aria-label="Fechar dossiê">×</button></div><div class="situation-dossier-grid"><div class="situation-dossier-media">${art}</div><div class="situation-dossier-copy"><h2>${esc(c.name)}</h2>${c.headline?`<h3>${esc(c.headline)}</h3>`:''}${c.brief?`<p class="situation-dossier-brief">${esc(c.brief)}</p>`:''}<div class="situation-dossier-effect"><b>EFEITO NO JOGO</b><p>${esc(c.effect)}</p></div><div class="tag-row">${(c.tags||[]).map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div></div></div><div class="situation-dossier-actions">${action}<button class="btn ghost" data-preview-close>Voltar à situação atual</button></div></section>`;
  }

  function renderDiceOutcomeSummary(d){
    if(!d?.rolls?.length)return'';
    if(String(d.source||'').includes('Grande Crise Financeira Global')){
      return `<div class="dice-outcome-grid">${d.rolls.map(r=>{const n=Number(r.total??r.result);const result=n<=2?'−2 Economia':n<=4?'−1 Economia':'Sem perda';return `<div class="dice-outcome ${n<=2?'bad':n<=4?'warn':'good'}"><b>${esc(r.country||r.label||'País')}</b><span>${result}</span></div>`}).join('')}</div>`;
    }
    return'';
  }

  function dieGlyph(n){return ({1:'⚀',2:'⚁',3:'⚂',4:'⚃',5:'⚄',6:'⚅'})[Number(n)]||'🎲'}
  function renderDiceDisplay(d){
    if(!d?.rolls?.length)return'';
    const alreadySeen=state.seenDiceIds?.has(String(d.id||''));
    const rolls=d.rolls.map((r,i)=>{const total=Number(r.total??r.result),hasMod=Number(r.modifier||0)!==0;return `<div class="dice-result-unit"><span class="dice-face-animated ${alreadySeen?'settled':'rolling'}" data-die-final="${Number(r.result)}" data-die-index="${i}">${alreadySeen?dieGlyph(r.result):'🎲'}</span><div><b>${r.country?esc(r.country):esc(r.label||'Rolagem')}</b><strong class="dice-number ${alreadySeen?'':'pending'}" data-die-number="${i}">${alreadySeen?r.result:'…'}${alreadySeen&&hasMod?` ${r.modifier>0?'+':'−'} ${Math.abs(r.modifier)} = ${total}`:''}</strong>${r.reroll?'<small>rerrolagem</small>':''}</div></div>`}).join('');
    return `<div class="dice-result-banner ${alreadySeen?'settled':'rolling'}" data-dice-display="${esc(d.id||'')}"><div class="dice-result-copy"><span>🎲 Resultado da rolagem</span><b>${esc(d.source||'Rolagem')}</b>${d.note?`<small>${esc(d.note)}</small>`:''}</div><div class="dice-result-rolls">${rolls}</div></div>`;
  }
  function animateDiceDisplay(d){
    if(!d?.id||!d?.rolls?.length)return;
    const id=String(d.id);if(state.seenDiceIds?.has(id))return;
    state.seenDiceIds.add(id);
    const banner=document.querySelector(`[data-dice-display="${CSS.escape(id)}"]`);if(!banner)return;
    const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const faces=[1,2,3,4,5,6];
    d.rolls.forEach((r,i)=>{
      const face=banner.querySelector(`[data-die-index="${i}"]`),num=banner.querySelector(`[data-die-number="${i}"]`);if(!face||!num)return;
      const settle=()=>{face.textContent=dieGlyph(r.result);face.classList.remove('rolling');face.classList.add('settled');const mod=Number(r.modifier||0),total=Number(r.total??r.result);num.textContent=`${r.result}${mod?` ${mod>0?'+':'−'} ${Math.abs(mod)} = ${total}`:''}`;num.classList.remove('pending');};
      if(reduce){settle();return;}
      let step=0;const max=8+i*2;const timer=setInterval(()=>{face.textContent=dieGlyph(faces[Math.floor(Math.random()*6)]);step++;if(step>=max){clearInterval(timer);setTimeout(settle,80+i*80)}},65+i*8);
    });
    setTimeout(()=>banner.classList.remove('rolling'),900);
  }

  function renderPhasePanel(pub,isTeacher,own){
    if(pub.pending_public)return renderPending(pub.pending_public,isTeacher,own);
    if(pub.phase==='challenge')return renderChallenge(pub,isTeacher);
    if(pub.phase==='challenge_result')return renderChallengeResult(pub,isTeacher);
    if(pub.phase==='turn_ready')return renderTurnReady(pub,isTeacher);
    if(pub.phase==='turns')return renderTurn(pub,isTeacher);
    if(pub.phase==='diplomacy')return renderDiplomacyPhase(pub,isTeacher,own);
    if(pub.phase==='draw')return `<section class="command-action state-briefing"><div class="state-kicker">${pub.draw_context?.after_challenge?'ETAPA 2 DE 2 · ABASTECIMENTO DE DOSSIÊS':'ABASTECIMENTO DE DOSSIÊS'}</div><h2>${pub.draw_context?.after_challenge?'A recompensa foi concluída. Agora começa a compra normal.':'Compra da rodada em andamento'}</h2><p>${pub.draw_context?.after_challenge?'A renovação concedida pelo Desafio é separada da compra normal da rodada. Aguarde sua decisão de compra.':'Novos documentos estratégicos estão sendo distribuídos aos governos.'}</p></section>`;
    if(pub.phase==='event')return `<section class="command-action state-briefing event-state"><div class="state-kicker">BOLETIM INTERNACIONAL</div><h2>${esc(pub.current_event?.name||'Evento Mundial')}</h2><p>O Cenário Global ao lado mostra o Evento vigente. Leia seus efeitos e aguarde ou tome a decisão solicitada pelo gabinete.</p></section>`;
    return `<section class="command-action state-briefing"><h2>Partida em andamento</h2></section>`;
  }

  function renderChallenge(pub,isTeacher){
    const q=pub.current_challenge,answered=pub.challenge_answered||[],mine=state.me.country,has=answered.includes(mine),total=activeList(pub).length;
    return `<section class="command-action intelligence-brief"><div class="state-kicker">BRIEFING DE INTELIGÊNCIA · DESAFIO GEOGRÁFICO</div><h2>${esc(q.question)}</h2>${isTeacher?`<div class="answer-status">${activeList(pub).map(c=>`<span class="badge ${answered.includes(c)?'good':''}">${c}: ${answered.includes(c)?'✓':'…'}</span>`).join('')}</div><p class="muted tiny">Respostas: ${answered.length}/${total}. O professor decide quando encerrar.</p>`:has?'<div class="analysis-sent">✓ Análise enviada ao gabinete. Aguarde os demais países.</div>':`<div class="intel-options">${q.options.map((o,i)=>`<button class="intel-option" data-challenge-answer="${i}"><b>${String.fromCharCode(65+i)}</b><span>${esc(o)}</span></button>`).join('')}</div><div class="intel-hint">Selecione uma alternativa para enviá-la aos analistas do governo.</div>`}</section>`;
  }

  function renderChallengeResult(pub,isTeacher){
    const r=pub.challenge_result,q=pub.current_challenge;if(!r)return'';
    return `<section class="command-action challenge-report"><div class="state-kicker">RELATÓRIO DE ANÁLISE</div><h2>Resposta correta: ${String.fromCharCode(65+r.correct)} — ${esc(q.options[r.correct])}</h2><div class="result-grid compact-results">${r.results.map(x=>`<div class="result-tile ${x.correct?'correct':'wrong'}"><b>${esc(x.country)}</b><span>${x.answer==null?'Sem resposta':`${String.fromCharCode(65+x.answer)} · ${x.correct?'Análise correta':'Análise incorreta'}`}</span></div>`).join('')}</div><div class="challenge-rule-note"><b>RECOMPENSAS</b><span>Quem acerta fora da liderança recebe 1 Vantagem. O líder que acerta recebe renovação de 1 carta.</span></div><div class="result-wait">${isTeacher?'Use “Prosseguir” quando quiser liberar a recompensa e a compra.':'O professor liberará a próxima fase.'}</div></section>`;
  }

  function openCommandModal(kind,pub){
    const modal=document.getElementById('commandModal'),title=document.getElementById('commandModalTitle'),body=document.getElementById('commandModalBody');if(!modal||!title||!body)return;
    if(kind==='world'){
      title.textContent='Situação Mundial';body.innerHTML=`<div class="world-grid">${activeList(pub).map(c=>countryHtml(c,pub.countries?.[c]||{},c===state.me.country,pub)).join('')}</div>`;
    }else if(kind==='diplomacy'){
      title.textContent='Ministério das Relações Exteriores';const rels=Object.entries(pub.relations||{});body.innerHTML=rels.length?`<div class="diplomacy-map">${rels.map(([k,r])=>{const[a,b]=k.split('|');return `<div class="diplomacy-row"><b>${esc(a)} ↔ ${esc(b)}</b><span class="badge ${r.type==='block'?'good':'violet'}">${r.type==='block'?'Bloco Econômico':'Acordo Comercial'}</span>${r.suspended?'<span class="badge warn">Suspenso</span>':r.tension?'<span class="badge warn">Sob tensão</span>':r.crisis?'<span class="badge warn">Em crise</span>':''}</div>`}).join('')}</div>`:'<div class="history-empty">Ainda não existem Acordos ou Blocos.</div>';
    }else if(kind==='intelligence'){
      title.textContent='Central de Inteligência';const log=pub.recent_log||[];body.innerHTML=`<div class="intel-summary"><div><small>FASE ATUAL</small><b>${esc(phaseTitle(pub))}</b></div><div><small>EVENTO</small><b>${esc(pub.current_event?.name||'—')}</b></div><div><small>LÍDER(ES) DE INFLUÊNCIA</small><b>${esc(influenceLeadersUI(pub).join(', ')||'—')}</b></div></div><h4>Últimos informes</h4><div class="history-list">${log.slice().reverse().map(x=>`<div>${esc(x.text||x)}</div>`).join('')||'<div>Nenhum informe.</div>'}</div>`;
    }else if(kind==='history'){
      title.textContent='Histórico recente';const log=pub.recent_log||[];body.innerHTML=log.length?`<div class="history-list">${log.slice().reverse().map(x=>`<div>${esc(x.text||x)}</div>`).join('')}</div>`:'<div class="history-empty">Nenhum registro recente.</div>';
    }else{
      title.textContent='Como Jogar';body.innerHTML=`<div class="rules-tabs"><section><h4>Objetivo</h4><p><b>Termine a 8ª rodada com a maior Influência.</b> Influência é a soma de Economia, Redes, Diplomacia e Cultura. Se todos os quatro atributos estiverem em pelo menos 2 no final, você recebe +2 de Potência Equilibrada.</p></section><section><h4>O que fazer</h4><p>Leia o Evento, examine seus Dossiês e use 1 Ação Principal no seu turno. Depois acompanhe as ações dos outros governos e participe da Cúpula Diplomática ao fim da rodada.</p></section><section><h4>Rodada</h4><p>Evento Global → Desafio nas rodadas pares → Compra → Turnos nacionais → Cúpula Diplomática.</p></section><section><h4>Dossiês</h4><p><b>Desenvolvimento</b> fortalece o país; <b>Interferência</b> afeta outros governos; <b>Risco/Escolha</b> envolve decisão ou incerteza; <b>Reação</b> não é Ação Principal e só é usada quando seu gatilho ocorre.</p></section><section><h4>Vantagem Geográfica</h4><p>Guarde até 2. Gaste 1 para <b>refazer uma rolagem sua de d6</b>, <b>reduzir em 1 uma perda de atributo</b> ou, durante a compra, <b>revelar 2 cartas, escolher 1 e descartar a outra</b>.</p></section><section><h4>Diplomacia</h4><p>Na Cúpula, cada país recebe 1 iniciativa para propor Acordo, formar Bloco, trocar carta, encerrar relação ou não agir. Aceitar ou recusar uma proposta não gasta sua iniciativa. Na regra 0.4-C, vários Dossiês de Desenvolvimento recebem bônus maiores quando o país mantém Acordos, Blocos ou Relações Comerciais ativas.</p></section><section><h4>Glossário</h4><p><b>Relação Comercial:</b> Acordo ou Bloco ativo. <b>Sob Tensão:</b> o Acordo continua existindo, mas não concede bônus nem cumpre requisitos de Relação/Acordo até o fim da rodada. <b>Suspenso:</b> o Acordo ocupa limite, porém fica inativo até a próxima Cúpula. <b>Bloco em Crise:</b> bônus e proteções de Bloco ficam desligados até o fim da rodada. <b>Renovar:</b> compre 1 e descarte 1. <b>Recuperação Nacional:</b> eleve um atributo em 0 para 1 usando sua Ação Principal.</p></section><section><h4>Legibilidade da interface</h4><p>Escolha a escala que melhor se adapta ao tamanho físico da tela. A opção <b>Confortável</b> é a recomendada para notebooks; <b>Grande</b> prioriza leitura em monitores maiores e projeção.</p><div class="ui-scale-picker"><button class="btn ghost" data-ui-scale="compact">Compacta</button><button class="btn ghost" data-ui-scale="comfortable">Confortável</button><button class="btn ghost" data-ui-scale="large">Grande</button></div></section></div><div class="actions"><button class="btn primary" id="replayTutorial">Rever tutorial neste dispositivo</button></div>`;
      setTimeout(()=>{document.getElementById('replayTutorial')?.addEventListener('click',()=>{localStorage.removeItem(tutorialSeenKey);state.onboardingActive=true;state.onboardingStep=0;closeCommandModal();mountOnboarding(false)});document.querySelectorAll('[data-ui-scale]').forEach(b=>{b.classList.toggle('primary',b.dataset.uiScale===currentUiScale());b.addEventListener('click',()=>{applyUiScale(b.dataset.uiScale);document.querySelectorAll('[data-ui-scale]').forEach(x=>x.classList.toggle('primary',x.dataset.uiScale===currentUiScale()));});});},0);
    }
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }
  function influenceLeadersUI(pub){let best=-1,out=[];for(const c of activeList(pub)){const d=pub.countries?.[c]||{},v=Number(d.eco||0)+Number(d.net||0)+Number(d.dip||0)+Number(d.cult||0);if(v>best){best=v;out=[c]}else if(v===best)out.push(c)}return out}

  function closeCommandModal(){const m=document.getElementById('commandModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}}

  function openCardConsultation(id){
    const c=CARD[Number(id)],modal=document.getElementById('commandModal'),title=document.getElementById('commandModalTitle'),body=document.getElementById('commandModalBody');
    if(!c||!modal||!title||!body)return;
    title.textContent=`Dossiê oferecido · ${c.name}`;
    body.innerHTML=editorialCardHtml(c,{expanded:true});
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }

  function renderCommandHand(own,pub){
    const active=pub.phase==='turns'&&!pub.pending_public&&state.me.country===pub.active_country,cards=own?.hand||[];
    return `<div class="dossier-dock-head"><div><span>▤ DOSSIÊS DO GOVERNO</span><b>${cards.length} carta${cards.length===1?'':'s'} em análise</b></div><small>${active?'Abra um Dossiê para avaliar e confirmar sua ação.':'Os Dossiês permanecem disponíveis para planejamento.'}</small></div><div class="command-hand">${cards.map(id=>commandCardHtml(id,pub,active)).join('')||'<div class="muted">Nenhum Dossiê disponível.</div>'}</div>`;
  }

  function commandCardHtml(id,pub,active){
    const c=CARD[id]||{id,name:`Carta ${id}`,type:'',tags:[],effect:''},reaction=REACTION_IDS_UI.has(id),valid=cardHasValidTarget(id,pub,state.me.country),status=reaction?'REAÇÃO':active?(valid?'PRONTO':'SEM ALVO'):'PLANEJAMENTO';
    return `<article class="command-card dossier-card ${cardTypeClass(c.type)} ${c.art?'has-art':''}">${c.art?`<img src="${esc(c.art)}" alt="">`:`<div class="dossier-thumb-placeholder">${cardTypeGlyph(c.type)}</div>`}<div class="command-card-top"><span>${esc(cardTypeLabel(c.type))}</span><span>#${String(id).padStart(2,'0')}</span></div><h4>${esc(c.name)}</h4><p>${esc(c.headline||c.effect)}</p><div class="command-card-footer"><div class="tag-row">${(c.tags||[]).slice(0,2).map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div><button class="btn compact ${active&&valid&&!reaction?'primary':'ghost'}" data-open-card="${id}">${status==='PRONTO'?'Abrir Dossiê':reaction?'Consultar Reação':status==='SEM ALVO'?'Consultar · sem alvo':'Consultar'}</button></div></article>`;
  }
  function showCardInSituation(id,pub){
    if(!CARD[id])return;
    state.previewCardId=Number(id);
    renderRoom();
  }
  function openCardDossier(id,pub){showCardInSituation(id,pub)}

  function renderTeacherDock(pub){
    const draft=esc(getNoteDraft());
    return `<div class="teacher-dock"><div class="teacher-note-wrap"><div class="command-section-label">Nota de playtest</div><textarea id="teacherNote" placeholder="Registre um comportamento, dúvida ou problema observado.">${draft}</textarea></div><div class="teacher-dock-actions"><button class="btn" id="saveNote">Salvar nota</button><button class="btn ghost" id="exportMd">Relatório .md</button><button class="btn ghost" id="exportCsv">Planilha .csv</button><button class="btn ghost" id="exportJson">JSON</button><div id="noteFeedback"></div></div></div>`;
  }

  function renderPending(p,isTeacher,own){
    const mine=state.me.country,forMe=!isTeacher&&p.country===mine,priv=own?.pending||{};
    if(!forMe)return `<section class="card action-panel" style="margin-top:16px"><div class="waiting-orb"></div><div class="eyebrow">Aguardando decisão</div><h3>${esc(p.country||'Sistema')} está resolvendo uma escolha</h3><p class="muted">${esc(pendingDescription(p))}</p></section>`;
    if(p.kind==='event_choice')return eventChoicePanel(p);
    if(p.kind==='card_setup'){
      const id=Number(p.card_id),card=cardHtml(id),stage=p.stage;let buttons='';
      if(['target','relation_target'].includes(stage))buttons=(p.targets||[]).map(t=>`<button class="btn primary" data-pending="${esc(t)}">${esc(t)}</button>`).join('');
      if(stage==='sanction_mode')buttons=`<button class="btn primary" data-pending="normal">Sanção normal: −1 Economia</button><button class="btn danger" data-pending="intensify">Intensificar: alvo −2 Economia; você −1 Diplomacia</button>`;
      if(stage==='block')buttons=(p.blocks||[]).map(k=>`<button class="btn primary" data-pending="${esc(k)}">Bloco ${esc(k.replace('|',' ↔ '))}</button>`).join('');
      if(stage==='platform'){buttons=`<button class="btn primary" data-pending="regulation">Regulação: +1 Diplomacia e renovar</button>`+(p.expansion_targets||[]).map(t=>`<button class="btn good" data-pending="expansion:net:${esc(t)}">Expansão: +1 Redes; ${esc(t)} +1 Cultura</button><button class="btn good" data-pending="expansion:cult:${esc(t)}">Expansão: +1 Cultura; ${esc(t)} +1 Cultura</button>`).join('');}
      return `<section class="command-action dossier-decision"><div class="state-kicker">DOSSIÊ EM ANÁLISE</div>${editorialCardHtml(CARD[id]||{id,name:'Carta '+id,type:'',tags:[],effect:''})}<h3>Escolha como o governo executará esta decisão</h3><div class="actions">${buttons||'<span class="muted">Nenhuma opção válida.</span>'}</div></section>`;
    }
    if(['reaction_loss','reaction_dissolve','reaction_relation_state'].includes(p.kind)){const id=Number(priv.cardId||0);return `<section class="card action-panel reaction-panel" style="margin-top:16px"><div class="eyebrow">Reação disponível</div><h3>Você pode responder agora</h3>${id?editorialCardHtml(CARD[id]||{id,name:'Carta '+id,type:'Reação',tags:[],effect:''}):''}<div class="actions"><button class="btn violet" data-pending="use">Usar Reação</button><button class="btn ghost" data-pending="decline">Não reagir</button></div></section>`}
    if(p.kind==='agreement_replace_proposer')return `<section class="card action-panel"><div class="eyebrow">Limite de Acordos</div><h3>Escolha qual Acordo será substituído</h3><p class="muted">O novo Acordo com ${esc(p.target)} será proposto depois.</p><div class="actions">${(p.options||[]).map(t=>`<button class="btn danger" data-pending="${esc(t)}">Substituir Acordo com ${esc(t)}</button>`).join('')}</div></section>`;
    if(p.kind==='agreement_response'){const reps=p.target_replacement_options||[];return `<section class="command-action diplomatic-proposal"><div class="state-kicker">PROPOSTA DIPLOMÁTICA RECEBIDA</div><h2>${esc(p.proposer)} propõe um Acordo Comercial</h2>${reps.length?'<p class="muted">Você já possui 2 Acordos. Para aceitar, escolha qual será substituído.</p>':''}<div class="actions">${reps.length?reps.map(t=>`<button class="btn good" data-pending="accept_replace:${esc(t)}">Aceitar e substituir ${esc(t)}</button>`).join(''):'<button class="btn good" data-pending="accept">Aceitar</button>'}<button class="btn danger" data-pending="decline">Recusar</button></div></section>`}
    if(p.kind==='block_response')return `<section class="command-action diplomatic-proposal"><div class="state-kicker">PROPOSTA DE BLOCO RECEBIDA</div><h2>${esc(p.proposer)} quer aprofundar a integração e formar um Bloco com você</h2><div class="actions"><button class="btn good" data-pending="accept">Aceitar</button><button class="btn danger" data-pending="decline">Recusar</button></div></section>`;
    if(p.kind==='trade_response'){const offered=Number(priv.offerCard||0);return `<section class="card action-panel"><div class="eyebrow">Troca Comercial</div><h3>${esc(priv.proposer||p.actor)} oferece uma carta</h3>${offered?editorialCardHtml(CARD[offered]||{id:offered,name:'Carta '+offered,type:'',tags:[],effect:''}):''}<p class="muted">Se aceitar, você escolherá uma carta da sua mão para entregar em troca. Depois, ambos renovam 1 carta.</p><div class="actions"><button class="btn good" data-pending="accept">Aceitar</button><button class="btn danger" data-pending="decline">Recusar</button></div></section>`}
    if(p.kind==='trade_return')return `<section class="card action-panel"><div class="eyebrow">Troca Comercial</div><h3>Escolha a carta que você entregará</h3>${handHtml(own?.hand||[],{buttonFor:id=>({button:'Entregar esta carta',data:`data-pending="${id}"`})})}</section>`;
    if(['safeguard_cost','safeguard_block_cost'].includes(p.kind))return `<section class="card action-panel"><div class="eyebrow">Cláusula de Salvaguarda</div><h3>Escolha 1 carta para descartar como custo</h3>${handHtml(own?.hand||[],{buttonFor:id=>({button:'Descartar como custo',data:`data-pending="${id}"`})})}</section>`;
    if(p.kind==='optional_renew')return `<section class="card action-panel"><div class="eyebrow">Renovação opcional</div><h3>${esc(p.reason||'Você pode renovar 1 carta')}</h3><div class="actions"><button class="btn violet" data-pending="yes">Renovar 1 carta</button><button class="btn ghost" data-pending="no">Manter minha mão</button></div></section>`;
    if(p.kind==='top_card_choice'){const id=Number(priv.cardId||0);return `<section class="card action-panel"><div class="eyebrow">Topo do baralho</div><h3>Você viu esta carta</h3>${id?cardHtml(id):''}<div class="actions"><button class="btn primary" data-pending="keep">Deixar no topo</button><button class="btn danger" data-pending="discard">Descartar do topo</button></div></section>`}
    if(p.kind==='top_two_keep'){const ids=priv.candidates||[];return `<section class="card action-panel"><div class="eyebrow">Conectividade Global</div><h3>Escolha a carta que ficará com você</h3><div class="hand">${ids.map(id=>cardHtml(id,{button:'Ficar com esta',data:`data-pending="${id}"`})).join('')}</div></section>`}
    if(p.kind==='tariff_choice')return `<section class="card action-panel"><div class="eyebrow">Barreiras Tarifárias</div><h3>Como o governo responderá?</h3><p class="muted">Absorver preserva a relação e custa 1 Economia. Retaliar evita essa perda, mas você perde 1 Diplomacia, o atacante perde 1 Economia e o Acordo fica sob Tensão.</p><div class="actions"><button class="btn danger" data-pending="absorb">Absorver impacto · −1 Economia</button><button class="btn warn" data-pending="retaliate">Retaliar comercialmente</button></div></section>`;
    if(p.kind==='pressure_choice')return `<section class="card action-panel"><div class="eyebrow">Pressão Geopolítica</div><h3>Como responder?</h3><div class="actions"><button class="btn danger" data-pending="lose_dip">Perder 1 Diplomacia</button><button class="btn danger" data-pending="discard_random">Descartar 1 carta aleatória</button>${publicRelation(state.match.public_state,p.actor,p.target)?.type==='agreement'&&!publicRelation(state.match.public_state,p.actor,p.target)?.tension&&!publicRelation(state.match.public_state,p.actor,p.target)?.suspended?'<button class="btn warn" data-pending="tension_agreement">Colocar o Acordo sob Tensão</button>':''}</div></section>`;
    if(p.kind==='block_tension_choice')return `<section class="card action-panel"><div class="eyebrow">Tensão no Bloco</div><h3>Após conversar com o parceiro, escolha o resultado</h3><div class="actions">${(p.members||[]).map(c=>`<button class="btn danger" data-pending="lose:${esc(c)}">${esc(c)} perde 1 Diplomacia</button>`).join('')}<button class="btn warn" data-pending="crisis">Bloco entra em Crise até o fim da rodada</button></div></section>`;
    if(p.kind==='embargo_choice')return `<section class="card action-panel"><div class="eyebrow">Embargo Secundário</div><h3>Escolha uma consequência</h3><div class="actions"><button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.agreements||[]).map(t=>`<button class="btn warn" data-pending="suspend:${esc(t)}">Suspender Acordo com ${esc(t)} até a Cúpula</button>`).join('')}</div></section>`;
    if(p.kind==='ied_response')return `<section class="card action-panel"><div class="eyebrow">Investimento Estrangeiro Direto</div><h3>${esc(p.actor)} propõe o investimento</h3><p class="muted">Se aceitar, uma rolagem definirá o resultado para os dois países.</p><div class="actions"><button class="btn good" data-pending="accept">Aceitar</button><button class="btn danger" data-pending="decline">Recusar</button></div></section>`;
    if(p.kind==='card_roll_decision'){const total=Math.min(6,Number(p.raw||0)+Number(p.modifier||0));return `<section class="card action-panel dice-panel"><div class="eyebrow">Rolagem</div><div class="big-die">🎲 ${p.raw}${p.modifier?` + ${p.modifier} = ${total}`:''}</div><h3>${esc(CARD[p.card_id]?.name||'Carta')}</h3><div class="actions"><button class="btn primary" data-pending="keep">Aceitar resultado</button><button class="btn violet" data-pending="reroll">🎓 Gastar Vantagem e rerrolar</button></div></section>`}
    if(p.kind==='dispute_reroll_commit'){const mine=state.me?.country===p.actor?p.actor_roll:p.target_roll,shared=renderDiceDisplay(state.match?.public_state?.dice_display);return `<section class="card action-panel dice-panel"><div class="eyebrow">Disputa de Influência</div>${shared}<p>Seu resultado é <b>${mine}</b>. Sua escolha fica reservada até que os países aptos decidam.</p><div class="actions"><button class="btn primary" data-pending="keep">Manter resultado</button><button class="btn violet" data-pending="reroll">🎓 Gastar Vantagem e rerrolar</button></div></section>`}
    if(p.kind==='block_advantage_support')return `<section class="card action-panel"><div class="eyebrow">Solidariedade estratégica do Bloco</div><h3>${esc(p.target)} sofreu Ataque às Redes</h3><p>Você pode gastar 1 Vantagem para impedir a perda de 1 Redes do seu parceiro.</p><div class="actions"><button class="btn violet" data-pending="use">Gastar 1 Vantagem e proteger</button><button class="btn ghost" data-pending="decline">Não usar Vantagem</button></div></section>`;
    if(p.kind==='loss_choice')return `<section class="card action-panel"><div class="eyebrow">Perda de atributo</div><h3>${esc(p.source)}</h3><p>Você perderá <b>${p.amount}</b> em ${ATTRS[p.attr]||p.attr}.</p><div class="actions"><button class="btn danger" data-pending="accept">Sofrer perda</button>${p.can_use_advantage?'<button class="btn violet" data-pending="use_advantage">🎓 Gastar Vantagem e reduzir 1</button>':''}</div></section>`;
    if(p.kind==='redirect_loss')return `<section class="card action-panel"><div class="eyebrow">Atributo zerado</div><h3>Redirecione ${p.remaining} ponto(s) de perda</h3><p class="muted">Escolha outro atributo.</p><div class="actions">${(p.available_attrs||[]).map(a=>`<button class="btn" data-pending="${a}">${ATTRS[a]}</button>`).join('')}</div></section>`;
    if(p.kind==='event_roll_decision'){const display=state.match?.public_state?.dice_display;return `<section class="card action-panel dice-panel shared-event-decision"><div class="eyebrow">Rolagem pública · resultados de todos os países</div>${renderDiceDisplay(display)}${renderDiceOutcomeSummary(display)}<h3>Seu resultado: 🎲 ${p.roll}</h3><div class="actions"><button class="btn primary" data-pending="accept">Aceitar resultado</button>${p.can_reroll?'<button class="btn violet" data-pending="reroll">🎓 Gastar Vantagem e rerrolar</button>':''}</div></section>`}
    if(p.kind==='renew_discard'){const challengeReward=String(p.reason||'').includes('Acerto do líder no Desafio');return `<section class="card action-panel flow-panel ${challengeReward?'challenge-reward-flow':''}"><div class="eyebrow">${challengeReward?'Etapa 1 de 2 · Recompensa do Desafio':'Renovação de carta'}</div><h3>${challengeReward?'Você acertou como líder: renove 1 carta':esc(p.reason||'Renovação')}</h3>${challengeReward?'<p class="flow-explain">Esta renovação é a recompensa do Desafio e <b>não gasta Vantagem Geográfica</b>. Uma carta já foi comprada para a renovação; escolha agora qual carta da sua mão será descartada. Depois haverá a compra normal da rodada.</p>':''}${handHtml(own?.hand||[],{buttonFor:id=>({button:'Descartar esta carta',data:`data-pending="${id}"`})})}</section>`}
    if(['discard_card','hand_limit_discard'].includes(p.kind))return `<section class="card action-panel"><div class="eyebrow">Escolha uma carta</div><h3>${esc(p.reason||'Descarte')}</h3>${handHtml(own?.hand||[],{buttonFor:id=>({button:'Descartar',data:`data-pending="${id}"`})})}</section>`;
    if(p.kind==='draw_choice'){const adv=Number(state.match.public_state?.countries?.[mine]?.advantages||0),canAdv=Boolean(p.can_use_advantage)&&adv>0,post=Boolean(state.match.public_state?.draw_context?.after_challenge);return `<section class="card action-panel flow-panel round-draw-flow"><div class="eyebrow">${post?'Etapa 2 de 2 · Compra normal da rodada':'Compra da rodada'}</div><h3>${post?'Agora faça a compra normal da rodada':'Como deseja comprar?'}</h3><p class="flow-explain">${post?'A renovação do Desafio já foi resolvida. Esta é uma compra diferente. ':''}Sua compra normal é <b>1 carta</b>. ${canAdv?`Você possui <b>${adv} Vantagem${adv===1?'':'s'}</b>. Nesta fase pode gastar 1 para revelar 2 cartas e escolher 1. Se preferir guardar, a Vantagem também poderá refazer uma rolagem sua de d6 ou reduzir em 1 uma perda de atributo.`:'Você não precisa gastar Vantagem para esta compra.'}</p><div class="actions"><button class="btn primary" data-pending="normal">Comprar 1 carta${canAdv?' e manter a Vantagem':''}</button>${canAdv?'<button class="btn violet" data-pending="advantage">🎓 Gastar 1 Vantagem: ver 2 e ficar com 1</button>':''}</div></section>`};
    if(p.kind==='draw_keep'){const ids=own?.pending?.candidates||[];return `<section class="card action-panel"><div class="eyebrow">Vantagem Geográfica</div><h3>Escolha qual carta ficará na sua mão</h3><div class="hand">${ids.map(id=>cardHtml(id,{button:'Ficar com esta',data:`data-pending="${id}"`})).join('')}</div></section>`}
    return `<section class="card action-panel"><h3>Decisão necessária</h3><p>${esc(pendingDescription(p))}</p></section>`;
  }
  function pendingDescription(p){return({card_setup:'Escolha de alvo ou modo da carta.',reaction_loss:'Uma Reação pode reduzir a perda.',reaction_dissolve:'Uma Reação pode impedir a mudança na relação.',reaction_relation_state:'Cláusula de Salvaguarda pode impedir Tensão, Suspensão ou Crise.',agreement_replace_proposer:'Escolha qual Acordo substituir.',agreement_response:'Resposta a proposta de Acordo.',block_response:'Resposta a proposta de Bloco.',trade_response:'Resposta a proposta de troca.',trade_return:'Escolha da carta devolvida na troca.',optional_renew:'Renovação opcional.',top_card_choice:'Decisão sobre o topo do baralho.',top_two_keep:'Escolha entre duas cartas.',tariff_choice:'Resposta às Barreiras Tarifárias.',pressure_choice:'Resposta à Pressão Geopolítica.',block_tension_choice:'Decisão do Bloco.',embargo_choice:'Resposta ao Embargo Secundário.',ied_response:'Resposta ao Investimento Estrangeiro Direto.',card_roll_decision:'Decisão sobre rolagem.',dispute_reroll:'Possível rerrolagem.',dispute_reroll_commit:'Decisão reservada de rerrolagem.',block_advantage_support:'Parceiro de Bloco pode gastar Vantagem para proteger.',event_choice:'Escolha do Evento Mundial.',loss_choice:'Decisão sobre uma perda.',redirect_loss:'Redirecionamento de perda.',event_roll_decision:'Decisão sobre uma rolagem.',renew_discard:'Renovação de carta.',hand_limit_discard:'Descarte por limite da mão.',draw_choice:'Escolha explícita da compra normal da rodada.',draw_keep:'Escolha entre duas cartas.'})[p.kind]||p.kind}
  function eventChoicePanel(p){
    const eid=p.event_id,pub=state.match?.public_state||{};let html='';
    if(eid===1)html=`<button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.relations||[]).filter(r=>r.type==='agreement'&&!publicRelation(pub,state.me.country,r.partner)?.suspended).map(r=>`<button class="btn warn" data-pending="suspend:${r.partner}">Suspender Acordo com ${esc(r.partner)} até a Cúpula</button>`).join('')}${(p.relations||[]).filter(r=>r.type==='block'&&!publicRelation(pub,state.me.country,r.partner)?.crisis).map(r=>`<button class="btn warn" data-pending="crisis:${r.partner}">Colocar Bloco com ${esc(r.partner)} em Crise</button>`).join('')}`;
    if(eid===4)html='<button class="btn danger" data-pending="lose">Perder 1 Diplomacia</button><button class="btn" data-pending="block_diplomacy">Abrir mão da iniciativa diplomática desta rodada</button>';
    if(eid===5)html='<button class="btn danger" data-pending="cult">Perder 1 Cultura</button><button class="btn danger" data-pending="net">Perder 1 Redes</button>';
    if(eid===6)html='<button class="btn danger" data-pending="lose">Perder 1 Economia</button><button class="btn" data-pending="discard">Descartar 1 carta</button>';
    if(eid===7)html=`<button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.relations||[]).filter(r=>{const x=publicRelation(pub,state.me.country,r.partner);return x&&!x.tension&&!x.suspended}).map(r=>`<button class="btn warn" data-pending="tension:${r.partner}">Colocar Acordo com ${esc(r.partner)} sob Tensão</button>`).join('')}`;
    if(eid===8)html=`<button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.relations||[]).filter(r=>{const x=publicRelation(pub,state.me.country,r.partner);return x&&!x.suspended}).map(r=>`<button class="btn warn" data-pending="suspend:${r.partner}">Suspender Acordo com ${esc(r.partner)} até a Cúpula</button>`).join('')}`;
    if(eid===14)html=`<div class="banner good" style="width:100%">Esta é uma proposta extra do Evento e não consome sua iniciativa na Cúpula Diplomática.</div><button class="btn ghost" data-pending="skip">Não usar a proposta extra</button>${(p.valid_targets||[]).map(t=>`<button class="btn good" data-pending="propose:${t}">Propor Acordo extra a ${esc(t)}</button>`).join('')}`;
    if(eid===16)html='<button class="btn good" data-pending="cult">+1 Cultura</button><button class="btn violet" data-pending="renew">Renovar 1 carta</button>';
    return `<section class="card action-panel" style="margin-top:16px"><div class="eyebrow">Sua decisão no Evento</div><h3>Escolha uma opção</h3><div class="actions">${html}</div></section>`;
  }

  function renderTurnReady(pub,isTeacher){
    const active=pub.active_country;
    if(isTeacher)return `<section class="command-action state-briefing"><div class="state-kicker">TURNO AGUARDANDO INÍCIO</div><h2>${esc(active)} organiza seu conselho</h2><p>Use este momento para explicar uma regra ou atender uma dúvida. Não há cronômetro automático.</p></section>`;
    if(state.me.country===active)return `<section class="command-action presidential-turn"><div class="state-kicker">SEU TURNO</div><h1>O Conselho aguarda sua decisão.</h1><p>Confira o Evento Global, seus indicadores e seus Dossiês. Quando a equipe estiver pronta, abra oficialmente o turno.</p><button class="btn primary ready-btn" id="playerReadyTurn">REUNIR O CONSELHO · INICIAR TURNO</button></section>`;
    return `<section class="command-action state-briefing waiting-state"><div class="waiting-orb"></div><div class="state-kicker">PREPARAÇÃO DO TURNO</div><h2>Aguardando ${esc(active)}</h2><p>Acompanhe o Cenário Global e use este tempo para planejar sua próxima decisão.</p></section>`;
  }

  function renderTurn(pub,isTeacher){
    if(isTeacher)return `<section class="command-action state-briefing"><div class="state-kicker">TURNO NACIONAL EM ANDAMENTO</div><h2>${esc(pub.active_country)} está decidindo</h2><p>Sem limite automático. O professor pode encerrar manualmente um turno que fique parado.</p></section>`;
    if(state.me.country!==pub.active_country)return `<section class="command-action state-briefing waiting-state"><div class="state-kicker">AÇÃO DE OUTRO GOVERNO</div><h2>${esc(pub.active_country)} está na Mesa de Situação</h2><p>Acompanhe cartas, ataques, reações, negociações e alterações de atributos conforme forem resolvidos.</p></section>`;
    const c=pub.countries[state.me.country],zeros=Object.keys(ATTRS).filter(a=>Number(c[a])===0);
    return `<section class="command-action presidential-turn active"><div class="state-kicker">SUA AÇÃO PRINCIPAL</div><h1>O que o governo fará?</h1><p>Abra um Dossiê na faixa inferior para analisar a ação antes de confirmá-la. A Diplomacia formal acontece na Cúpula ao fim da rodada.</p><div class="presidential-actions">${zeros.map(a=>`<button class="cabinet-action recover" data-recovery="${a}"><span>⚙</span><b>RECUPERAÇÃO NACIONAL</b><small>${ATTRS[a]} · 0 → 1</small></button>`).join('')}<button class="cabinet-action pass" data-turn-action="pass"><span>»</span><b>PASSAR TURNO</b><small>Encerrar sem usar um Dossiê</small></button></div></section>`;
  }

  function renderDiplomacyPhase(pub,isTeacher,own){
    const active=activeList(pub),done=pub.diplomacy_done||[];
    if(isTeacher)return `<section class="command-action summit-state"><div class="state-kicker">CÚPULA INTERNACIONAL</div><h1>Negociações multilaterais em andamento</h1><div class="diplomacy-status-grid">${active.map(c=>`<div class="dip-status ${done.includes(c)?'done':''}"><b>${esc(c)}</b><span>${done.includes(c)?'✓ iniciativa concluída':'delegação negociando'}</span></div>`).join('')}</div></section>`;
    const me=state.me.country,c=pub.countries?.[me]||{},openingBonus=Boolean(c.openingCommercialBonus);
    const agreements=publicAgreementPartners(pub,me),block=publicAnyBlockPartner(pub,me);
    const agreementLocked=Boolean(pub.flags?.noAgreements||pub.flags?.noRelations||c.noNewAgreementRound);
    const unrelated=agreementLocked?[]:active.filter(x=>x!==me&&!publicRelation(pub,me,x)&&!pub.countries[x]?.noNewAgreementRound);
    const blockLocked=Boolean(pub.flags?.noRelations||block),blockTargets=blockLocked?[]:active.filter(x=>x!==me&&!publicAnyBlockPartner(pub,x));
    const tradeTargets=active.filter(x=>x!==me&&Number(pub.countries[x]?.hand_count||0)>0);
    const extraAvailable=Boolean(pub.flags?.extraAgreementRound&&c.extraAgreementAvailable&&!agreementLocked);
    const extraBox=extraAvailable?`<div class="summit-bonus extra-proposal"><b>PROPOSTA EXTRA</b><span>Expansão do Comércio Mundial · não consome a iniciativa normal.</span><div class="summit-target-pills">${unrelated.map(t=>`<button class="btn good compact" data-diplomacy="extra_agreement" data-target="${esc(t)}">Acordo com ${esc(t)}</button>`).join('')||'<em>Sem alvo válido.</em>'}</div></div>`:'';
    if(done.includes(me))return `<section class="command-action summit-state"><div class="state-kicker">CÚPULA INTERNACIONAL</div><h1>Sua iniciativa normal foi concluída</h1><p>Você ainda pode receber e responder propostas de outros governos.${extraAvailable?' O Evento Global ainda lhe concede uma proposta extra de Acordo.':''}</p>${extraBox}<div class="diplomacy-status-grid">${active.map(x=>`<div class="dip-status ${done.includes(x)?'done':''}"><b>${esc(x)}</b><span>${done.includes(x)?'✓ concluída':'… negociando'}</span></div>`).join('')}</div></section>`;
    if(c.dipBlocked)return `<section class="command-action summit-state blocked"><div class="state-kicker">CÚPULA INTERNACIONAL</div><h1>Delegação sem mandato para novas iniciativas</h1><p>Uma restrição do Evento Global impede seu país de usar iniciativa nesta rodada. Ainda é possível responder propostas recebidas.</p>${extraBox}</section>`;
    const secondary=(agreements.length||block)?`<div class="summit-secondary">${agreements.length?`<div class="summit-secondary-action danger"><b>ENCERRAR ACORDO</b><span>${agreements.map(t=>`<button data-diplomacy="end_agreement" data-target="${esc(t)}">Com ${esc(t)}</button>`).join('')}</span></div>`:''}${block?`<div class="summit-secondary-action danger"><b>SAIR DO BLOCO · −1 Diplomacia</b><span><button data-diplomacy="exit_block">Com ${esc(block)}</button></span></div>`:''}</div>`:'';
    return `<section class="command-action summit-state"><div class="summit-heading"><div><div class="state-kicker">CÚPULA INTERNACIONAL</div><h1>Escolha a iniciativa de ${esc(me)}</h1></div><strong>1 iniciativa disponível</strong></div><div class="summit-flags">${openingBonus?'<div class="summit-bonus"><b>Abertura Comercial</b><span>Novo Acordo → ambos renovam 1 carta.</span></div>':''}${extraBox}</div><div class="summit-actions summit-primary"><div class="summit-box"><b>PROPOR ACORDO</b><small>Crie uma Relação Comercial.</small><div class="summit-target-pills">${unrelated.map(t=>`<button data-diplomacy="agreement" data-target="${esc(t)}">${esc(t)}</button>`).join('')||'<em>Sem alvo válido</em>'}</div></div><div class="summit-box"><b>PROPOR BLOCO</b><small>Limite: 1 Bloco por país.</small><div class="summit-target-pills">${blockTargets.map(t=>`<button data-diplomacy="block" data-target="${esc(t)}">${esc(t)}</button>`).join('')||'<em>Sem alvo válido</em>'}</div></div><div class="summit-box trade"><b>TROCAR CARTA</b><small>Escolha o país e o Dossiê oferecido.</small><select id="tradeTarget" aria-label="País para troca">${tradeTargets.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select><select id="tradeCard" aria-label="Carta oferecida">${(own?.hand||[]).map(id=>`<option value="${id}">${esc(CARD[id]?.name||'Carta '+id)}</option>`).join('')}</select><div class="summit-trade-actions"><button id="tradePreviewBtn" type="button" ${!(own?.hand||[]).length?'disabled':''}>Ver efeito</button><button id="tradeSubmit" ${(!tradeTargets.length||!(own?.hand||[]).length)?'disabled':''}>Propor troca</button></div></div><div class="summit-box pass"><b>NÃO REALIZAR AÇÃO</b><small>Conclua a iniciativa sem alterar relações.</small><button data-diplomacy="pass">Encerrar iniciativa</button></div></div>${secondary}</section>`;
  }

  function renderOwnHand(own,pub){return renderCommandHand(own,pub)}
  function renderTeacherPanel(pub){return renderTeacherControlCompact(pub)}
  function teacherTelemetryHtml(){return renderTeacherDock(state.match?.public_state||{})}

  function bindMatchActions(pub,isTeacher,own){
    document.querySelectorAll('[data-pending]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('respond_pending',{roomId:state.room.id,choice:b.dataset.pending});await refreshSnapshot()}));
    document.querySelectorAll('[data-challenge-answer]').forEach(b=>b.onclick=()=>withBusy(async()=>{
      const buttons=[...document.querySelectorAll('[data-challenge-answer]')];
      buttons.forEach(x=>x.disabled=true);
      b.classList.add('selected');
      b.setAttribute('aria-pressed','true');
      await api('answer_challenge',{roomId:state.room.id,answer:Number(b.dataset.challengeAnswer)});
      await refreshSnapshot();
    }));
    document.querySelector('[data-turn-action="pass"]')?.addEventListener('click',()=>withBusy(async()=>{await api('turn_action',{roomId:state.room.id,kind:'pass'});await refreshSnapshot()}));
    document.querySelectorAll('[data-recovery]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('turn_action',{roomId:state.room.id,kind:'recovery',attr:b.dataset.recovery});await refreshSnapshot()}));
    document.querySelectorAll('[data-play-card]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('play_card',{roomId:state.room.id,cardId:Number(b.dataset.playCard)});await refreshSnapshot()}));
    document.querySelectorAll('[data-diplomacy]').forEach(b=>b.onclick=()=>withBusy(async()=>{const kind=b.dataset.diplomacy,target=b.dataset.target||null;if(kind==='end_agreement'&&target&&!confirm(`Encerrar o Acordo com ${target}?`))return;if(kind==='exit_block'&&!confirm('Sair do Bloco custa 1 Diplomacia. Confirmar?'))return;await api('diplomacy_action',{roomId:state.room.id,kind,target});await refreshSnapshot()}));
    document.getElementById('tradeSubmit')?.addEventListener('click',()=>withBusy(async()=>{const target=document.getElementById('tradeTarget')?.value,offerCard=Number(document.getElementById('tradeCard')?.value);if(!target||!offerCard)throw new Error('Escolha o país e a carta para oferecer.');await api('diplomacy_action',{roomId:state.room.id,kind:'trade',target,offerCard});await refreshSnapshot()}));
    const tradeCardSelect=document.getElementById('tradeCard'),tradePreviewBtn=document.getElementById('tradePreviewBtn');
    const updateTradePreviewButton=()=>{const c=CARD[Number(tradeCardSelect?.value)];if(tradePreviewBtn){tradePreviewBtn.disabled=!c;tradePreviewBtn.title=c?`Consultar efeito de ${c.name}`:'Nenhum Dossiê selecionado';}};
    tradeCardSelect?.addEventListener('change',updateTradePreviewButton);tradePreviewBtn?.addEventListener('click',()=>openCardConsultation(Number(tradeCardSelect?.value)));updateTradePreviewButton();
    document.querySelectorAll('[data-resume-summit]').forEach(b=>b.onclick=()=>{state.dismissedSpotlightId=String(pub.action_spotlight?.id||'');renderRoom()});
    document.getElementById('playerReadyTurn')?.addEventListener('click',()=>withBusy(async()=>{await api('confirm_turn_ready',{roomId:state.room.id});await refreshSnapshot()}));
    if(isTeacher){
      const startNow=()=>withBusy(async()=>{await api('teacher_start_turn',{roomId:state.room.id});await refreshSnapshot()});
      document.getElementById('teacherStartTurn')?.addEventListener('click',startNow);
      document.getElementById('teacherStartTurnPanel')?.addEventListener('click',startNow);
      document.getElementById('teacherForcePass')?.addEventListener('click',()=>withBusy(async()=>{if(!confirm(`Encerrar agora o turno de ${pub.active_country}?`))return;await api('teacher_force_pass',{roomId:state.room.id});await refreshSnapshot()}));
      document.getElementById('teacherResolvePending')?.addEventListener('click',()=>withBusy(async()=>{if(!confirm('Resolver automaticamente a decisão pendente usando a opção padrão de segurança?'))return;await api('teacher_resolve_pending',{roomId:state.room.id});await refreshSnapshot()}));
      document.getElementById('teacherResolveChallenge')?.addEventListener('click',()=>withBusy(async()=>{const answered=(pub.challenge_answered||[]).length,total=activeList(pub).length;if(answered<total&&!confirm(`Apenas ${answered}/${total} equipes responderam. As equipes sem resposta contarão como erro. Resolver mesmo assim?`))return;await api('teacher_resolve_challenge',{roomId:state.room.id});await refreshSnapshot()}));
      document.getElementById('teacherContinue')?.addEventListener('click',()=>withBusy(async()=>{await api('teacher_continue',{roomId:state.room.id});await refreshSnapshot()}));
      document.getElementById('teacherEndDiplomacy')?.addEventListener('click',()=>withBusy(async()=>{const done=(pub.diplomacy_done||[]).length,total=activeList(pub).length;if(done<total&&!confirm(`${done}/${total} países concluíram a iniciativa diplomática. Encerrar a Cúpula mesmo assim?`))return;await api('teacher_end_diplomacy',{roomId:state.room.id});await refreshSnapshot()}));
      document.getElementById('interruptSession')?.addEventListener('click',interruptSessionRobust);
      const note=document.getElementById('teacherNote');
      note?.addEventListener('input',()=>setNoteDraft(note.value));
      note?.addEventListener('blur',(ev)=>{setNoteDraft(note.value);if(ev.relatedTarget?.id==='saveNote')return;if(state.deferTeacherRender){setTimeout(()=>{if(document.activeElement?.id!=='teacherNote'&&state.deferTeacherRender){state.deferTeacherRender=false;renderRoom()}},120)}});
      document.getElementById('saveNote')?.addEventListener('click',()=>withBusy(async()=>{const text=(document.getElementById('teacherNote')?.value||getNoteDraft()).trim();if(!text)throw new Error('Digite uma nota.');setNoteDraft(text);await api('telemetry_note',{roomId:state.room.id,matchId:state.match.id,round:pub.round,text});clearNoteDraft();state.deferTeacherRender=false;const box=document.getElementById('teacherNote');if(box)box.value='';const feedback=document.getElementById('noteFeedback');if(feedback)feedback.innerHTML='<div class="success-box">Nota salva.</div>'}));
      document.getElementById('exportMd')?.addEventListener('click',()=>exportCurrentRoom('md'));
      document.getElementById('exportCsv')?.addEventListener('click',()=>exportCurrentRoom('csv'));
      document.getElementById('exportJson')?.addEventListener('click',()=>exportCurrentRoom('json'));
    }
  }

  async function interruptSessionRobust(){
    if(state.interrupting||!state.room?.id)return;
    if(!confirm('Interromper esta sessão? A telemetria e o rascunho da nota serão preservados.'))return;
    const btn=document.getElementById('interruptSession');
    state.interrupting=true;
    if(btn){btn.disabled=true;btn.textContent='Interrompendo…';}
    const roomId=state.room.id;
    const note=document.getElementById('teacherNote'); if(note)setNoteDraft(note.value);
    stopRoomWatch();
    try{await api('mark_interrupted',{roomId});rememberRoom(null);await loadTeacherDashboard();}
    catch(e){console.error(e);state.interrupting=false;startRoomWatch(roomId);alert(e?.message||String(e));}
    finally{state.interrupting=false;}
  }


  function renderClosedSession(isTeacher,title,message){document.body.classList.remove('in-match');screen.innerHTML=`<section class="card hero final-screen"><div class="eyebrow">GeoPoder</div><h2>${esc(title)}</h2><p class="muted">${esc(message)}</p><div class="actions"><button class="btn ghost" id="closedLeave">${isTeacher?'Voltar ao painel':'Sair / entrar em outra sala'}</button></div></section>`;document.getElementById('closedLeave').onclick=()=>leaveCurrentRoom(isTeacher)}

  function renderFinal(pub,isTeacher,own){
    document.body.classList.add('in-match','government-ui');const r=pub.final_result||{},ranking=r.ranking||[],country=isTeacher?null:state.me.country,team=isTeacher?'Professor':(pub.countries?.[country]?.team_name||'Equipe');
    screen.innerHTML=`<div class="command-room government-room final-government"><header class="command-top government-top"><div class="gov-brand"><span class="gov-logo">✦</span><div><div class="gov-title">GEOPODER <small>— RESULTADO FINAL</small></div><div class="gov-motto">Estratégia. Diplomacia. Um mundo em suas decisões.</div></div></div><div class="gov-country-ident">${isTeacher?'<span class="country-seal teacher-seal">▣</span>':countrySeal(country)}<div><small>${isTeacher?'COORDENAÇÃO DA PARTIDA':'REPÚBLICA DE'}</small><b>${esc(isTeacher?'RELATÓRIO DOCENTE':country)}</b><span>${esc(team)}</span></div></div><div class="gov-team"><small>STATUS</small><b>PARTIDA ENCERRADA</b></div><div class="gov-round"><small>RODADA FINAL</small><b>CLASSIFICAÇÃO DE INFLUÊNCIA</b><div class="round-track">${Array.from({length:8},()=>'<i class="done"></i>').join('')}</div></div><div class="gov-online"><span>● DADOS PRESERVADOS</span><small>SALA ${esc(state.room.code)}</small></div></header><aside class="command-national gov-panel">${renderNationalCommand(pub,isTeacher)}</aside><main class="command-situation gov-panel"><div class="situation-topline"><div class="panel-title compact"><span>✦</span><div><b>MESA DE SITUAÇÃO</b><small>Resultado consolidado</small></div></div></div><section class="command-action final-command"><div class="state-kicker">RESULTADO FINAL</div><h1>${esc(r.winner_country||ranking[0]?.country||'Partida concluída')} assume a liderança internacional</h1><div class="final-ranking-v2">${ranking.map((x,i)=>`<div class="final-rank ${i===0?'winner':''}"><span>${i+1}º</span>${countrySeal(x.country)}<div><b>${esc(x.country)}</b><small>${esc(x.team_name||'')}</small></div><strong>${x.final}</strong><em>Influência</em></div>`).join('')}</div><p class="final-quote">“Liderança se mede pela capacidade de transformar recursos, relações e decisões em influência.”</p></section></main><aside class="command-event gov-panel event-opportunity"><div class="panel-title"><span>◎</span><div><b>CENÁRIO GLOBAL</b><small>Relatório final</small></div></div><article class="event-paper"><div class="event-paper-top"><span>RELATÓRIO FINAL</span><b>GEOPODER</b></div><h2>NOVOS EQUILÍBRIOS NO MUNDO</h2><div class="event-visual"><span>🌐</span><small>FIM DA SIMULAÇÃO</small></div><p class="event-summary">A partida termina com uma nova distribuição de influência entre os países participantes.</p><div class="event-effect-box"><b>VENCEDOR</b><p>${esc(r.winner_country||'—')} terminou à frente após os critérios de Influência e equilíbrio.</p></div><blockquote>“Toda decisão deixa marcas no sistema internacional.”<cite>— Observatório Político Internacional</cite></blockquote></article></aside><section class="command-bottom gov-panel">${isTeacher?renderTeacherDock(pub):renderCommandHand(own,pub)}</section><footer class="government-nav final-nav"><button class="gov-nav-btn active" id="finalLeave"><span>↪</span><b>${isTeacher?'VOLTAR AO PAINEL':'ENCERRAR'}</b><small>${isTeacher?'Abrir histórico e relatórios':'Sair da partida'}</small></button></footer></div>`;
    document.getElementById('finalLeave').onclick=()=>leaveCurrentRoom(isTeacher);if(isTeacher){document.getElementById('exportMd')?.addEventListener('click',()=>exportCurrentRoom('md'));document.getElementById('exportCsv')?.addEventListener('click',()=>exportCurrentRoom('csv'));document.getElementById('exportJson')?.addEventListener('click',()=>exportCurrentRoom('json'));}
  }

  async function exportCurrentRoom(kind){await withBusy(async()=>{const d=await api('teacher_match_detail',{roomId:state.room.id});downloadDetail(d,kind)})}
  function exportDetail(kind){downloadDetail(state.historyDetail,kind)}
  function buildMarkdown(d){
    const teams=(d.players||[]).filter(p=>p.role==='player'),events=d.events||[],counts=countEvents(events),q=questionStats(events),c=cardStats(events),timing=turnTimingStats(events),dip=diplomacyStats(events),notes=events.filter(e=>e.event_type==='TEACHER_NOTE');
    let md=`# GeoPoder — Relatório de Playtest\n\n- **Sala:** ${d.room.code}\n- **Turma:** ${d.room.class_name||'—'}\n- **Status:** ${statusLabel(d.room.status)}\n- **Versão:** ${d.match?.game_version||'—'}\n- **Regras:** ${d.match?.rules_version||'—'}\n\n## Equipes\n`;
    for(const p of teams)md+=`- **${p.country}:** ${p.team_name||'—'}\n`;
    md+=`\n## Aprendizagem\n- Respostas: ${q.total}\n- Acertos: ${q.correct}\n- Erros: ${q.wrong}\n${q.total?`- Percentual: ${Math.round(q.correct/q.total*100)}%\n`:''}`;
    if(Object.keys(q.byQuestion).length){md+='\n### Por questão\n';for(const [id,x] of Object.entries(q.byQuestion))md+=`- Q${id}: ${x.correct}/${x.total} acertos\n`;}
    const entries=o=>Object.entries(o||{}).sort((a,b)=>b[1]-a[1]).map(([id,n])=>`${CARD[id]?.name||'Carta '+id} (${n})`).join('; ')||'nenhum dado';
    md+=`\n## Cartas\n- Jogadas: ${entries(c.played)}\n- Descartadas: ${entries(c.discarded)}\n- Sem alvo válido: ${entries(c.noTarget)}\n`;
    md+=`\n## Ritmo da partida\n- Turnos registrados: ${timing.turns}\n- Média para escolher a Ação Principal: ${timing.avgChoice==null?'—':(timing.avgChoice/1000).toFixed(1)+' s'}\n- Média de resolução após a escolha: ${timing.avgResolution==null?'—':(timing.avgResolution/1000).toFixed(1)+' s'}\n- Média total do turno: ${timing.avgTotal==null?'—':(timing.avgTotal/1000).toFixed(1)+' s'}\n- Turnos encerrados por timeout: ${timing.timeouts}\n`;
    md+=`\n## Diplomacia\n- Iniciativas diplomáticas: ${dip.initiatives}\n- Acordos formados: ${dip.agreements}\n- Propostas de Acordo recusadas: ${dip.agreementRefused}\n- Blocos formados: ${dip.blocks}\n- Propostas de Bloco recusadas: ${dip.blockRefused}\n- Trocas concluídas: ${dip.trades}\n- Relações encerradas: ${dip.relationsEnded}\n- Iniciativas passadas sem proposta: ${dip.passes}\n`;
    md+='\n## Notas do professor\n';if(notes.length)for(const n of notes)md+=`- Rodada ${n.round??'—'} · ${fmtDate(n.created_at)} — ${n.payload?.text||''}\n`;else md+='- Nenhuma nota salva.\n';
    md+='\n## Telemetria\n';for(const[k,v]of Object.entries(counts).sort((a,b)=>b[1]-a[1]))md+=`- ${k}: ${v}\n`;
    md+='\n## Eventos brutos\n\n```json\n'+JSON.stringify(events,null,2)+'\n```\n';return md;
  }
  function downloadDetail(d,kind){if(!d)return;const stamp=new Date().toISOString().slice(0,10),prefix=`GeoPoder_${d.room.code}_${stamp}`,events=d.events||[];if(kind==='json')download(`${prefix}.json`,JSON.stringify(d,null,2),'application/json');if(kind==='md')download(`${prefix}.md`,buildMarkdown(d),'text/markdown;charset=utf-8');if(kind==='csv'){const head=['id','created_at','event_type','actor_country','round','payload'];const csv=[head.join(','),...events.map(r=>[r.id,r.created_at,r.event_type,r.actor_country||'',r.round??'',JSON.stringify(r.payload||{})].map(csvCell).join(','))].join('\n');download(`${prefix}.csv`,csv,'text/csv;charset=utf-8')}}
  function csvCell(v){const s=String(v??'');return/[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
  function download(name,text,type){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}

  window.addEventListener('online',()=>setConn('Conectado','ok'));window.addEventListener('offline',()=>setConn('Sem internet','bad'));init();
})();
