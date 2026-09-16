(() => {
  'use strict';

  const CONFIG = window.GEOPOWER_CONFIG || {};
  const screen = document.getElementById('screen');
  const connection = document.getElementById('connection');
  const COUNTRIES = ['Aurora','Montária','Pacífica','Solária'];
  const GAME_VERSION = 'Alpha 2.0d';
  const RULES_VERSION = '0.4-A';
  const ATTRS = {eco:'💰 Economia',net:'🌐 Redes',dip:'🤝 Diplomacia',cult:'🎭 Cultura'};

  const C = (id,name,type,tags,effect)=>({id,name,type,tags,effect});
  const CARDS = [
    C(1,'Infraestrutura Digital','Desenvolvimento',['Relação'],'+1 Redes. Se houver Relação Comercial com país de Redes maiores, renove 1 carta da mão.'),
    C(2,'Diplomacia Multilateral','Desenvolvimento',[],'+1 Diplomacia. Com ao menos 1 Acordo, olhe o topo e decida manter ou descartar.'),
    C(3,'Marca Cultural Global','Desenvolvimento',['Relação'],'+1 Cultura. Um parceiro comercial pode renovar 1 carta da mão.'),
    C(4,'Investimento Produtivo','Desenvolvimento',['Relação'],'Com parceiro comercial: ambos +1 Economia. Sem alvo: você +1 Economia.'),
    C(5,'Logística Integrada','Desenvolvimento',['Bloco'],'+1 Redes. Em Bloco, protege 1 perda de Economia por Interferência nesta rodada.'),
    C(6,'Fórum Econômico Regional','Desenvolvimento',['Bloco'],'+1 Diplomacia. Em Bloco, os dois parceiros podem renovar 1 carta da mão.'),
    C(7,'Diversificação de Mercados','Desenvolvimento',['Acordo'],'+1 Economia. Com exatamente 2 Acordos ativos, renove 1 carta da mão.'),
    C(8,'Conectividade Global','Desenvolvimento',[],'+1 Redes. Olhe 2 cartas, fique com 1 e descarte a outra.'),
    C(9,'Produção Cultural em Rede','Desenvolvimento',['Relação'],'+1 Cultura. Um parceiro pode renovar 1 carta da mão; se fizer, você também pode.'),
    C(10,'Sanções Econômicas','Interferência',['Acordo','Bloco'],'Alvo fora do seu Bloco perde 1 Economia. Com Acordo, pode romper: você -1 Diplomacia e o alvo sofre 2 perdas no total.'),
    C(11,'Barreiras Tarifárias','Interferência',['Acordo'],'Alvo com Acordo decide: encerrar o Acordo ou ambos -1 Economia.'),
    C(12,'Fuga de Capitais','Interferência',['Transferência'],'Transfira 1 Economia de um país com Economia maior que a sua.'),
    C(13,'Guerra de Narrativas','Interferência',['Transferência'],'Transfira 1 Cultura de um país com Cultura igual ou maior que a sua.'),
    C(14,'Pressão Geopolítica','Interferência',['Acordo'],'Alvo escolhe: -1 Diplomacia; descartar 1 aleatória; ou encerrar Acordo com você.'),
    C(15,'Ataque às Redes','Interferência',['Anti-líder'],'Alvo com Redes ≥ às suas perde 1 Redes. Se era líder em Redes, renove 1 carta da mão.'),
    C(16,'Tensão no Bloco','Interferência',['Bloco'],'Escolha um Bloco. Os membros decidem: um perde 1 Diplomacia ou o Bloco dissolve.'),
    C(17,'Embargo Secundário','Interferência',['Acordo'],'Alvo com 2 Acordos encerra 1 deles ou perde 1 Economia.'),
    C(18,'Mediação Internacional','Reação',['Defesa'],'Quando Interferência causar perda de atributo a você, reduza uma perda em 1.'),
    C(19,'Retaliação Comercial','Reação',['Acordo','Transferência'],'Quando perder Economia: reduza em 1; atacante -1 Economia; Acordo entre vocês termina.'),
    C(20,'Defesa Cibernética','Reação',['Redes'],'Quando perder Redes por carta ou Evento, cancele 1 ponto.'),
    C(21,'Contracampanha Cultural','Reação',['Cultura','Transferência'],'Quando perder Cultura por carta, cancele 1. Se suas Redes ≥ atacante, ele perde 1 Cultura.'),
    C(22,'Solidariedade do Bloco','Reação',['Bloco'],'Quando você ou parceiro sofrer perda por Interferência, reduza 1. Se protegeu parceiro, renove 1 carta da mão.'),
    C(23,'Cláusula de Salvaguarda','Reação',['Acordo','Bloco'],'Quando carta/Evento dissolveria Acordo ou Bloco, cancele mediante descarte.'),
    C(24,'Capital Especulativo','Risco',['1d6'],'1–2: -1 Economia; 3–4: +1; 5–6: +2.'),
    C(25,'Investimento Estrangeiro Direto','Risco',['Relação','1d6'],'Outro país aceita ou recusa. Se aceitar, role 1d6 (+1 com Relação): 1–2 ambos -1 Eco; 3–4 ambos +1; 5–6 ambos +1 e você renova 1 carta da mão.'),
    C(26,'Plataforma Global','Risco',['Redes','Cultura'],'Expansão: +1 Redes OU +1 Cultura; depois escolha outro país com Cultura abaixo de 8 para receber +1 Cultura. Regulação: +1 Diplomacia e renove 1 carta da mão.'),
    C(27,'Abertura Comercial','Risco',['Acordo'],'Escolha +1 Economia OU usar a ação para propor Acordo; se aceito, ambos renovam 1 carta da mão.'),
    C(28,'Disputa de Influência','Risco',['1d6'],'Escolha país fora do seu Bloco. Ambos rolam 1d6; vencedor +1 Diplomacia, perdedor -1. Empate: nada.')
  ];
  const CARD = Object.fromEntries(CARDS.map(c=>[c.id,c]));
  const REACTION_IDS_UI = new Set([18,19,20,21,22,23]);

  let sb = null;
  let state = {session:null,teacherProfile:null,room:null,me:null,players:[],match:null,privateStates:[],channel:null,busy:false,dashboard:null,historyDetail:null,resumeSnapshot:null,interrupting:false,deferTeacherRender:false,roomPreview:null};
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

  function showError(title,detail=''){
    screen.innerHTML=`<div class="card"><h2>${esc(title)}</h2><div class="error-box">${esc(detail)}</div><div class="actions" style="margin-top:14px"><button class="btn ghost" id="errorHome">Voltar</button></div></div>`;
    document.getElementById('errorHome')?.addEventListener('click',renderHome);
  }

  async function api(action,payload={}){
    const {data,error}=await sb.functions.invoke('game-api',{body:{action,...payload}});
    if(error){let message=error.message||'Falha ao chamar game-api.';try{const ctx=error.context;if(ctx&&typeof ctx.json==='function'){const b=await ctx.json();message=b?.detail||b?.error||message}}catch{}throw new Error(message)}
    if(!data?.ok)throw new Error(data?.detail||data?.error||'Resposta inválida do servidor.');return data;
  }
  async function withBusy(fn,{alertOnError=true}={}){if(state.busy)return;state.busy=true;try{return await fn()}catch(e){console.error(e);if(alertOnError)alert(e?.message||String(e));else throw e}finally{state.busy=false}}
  async function refreshSession(){const{data:{session},error}=await sb.auth.getSession();if(error)throw error;state.session=session;return session}
  async function ensureAnonymousSession(){let session=await refreshSession();if(session&&!sessionIsAnonymous(session)){await sb.auth.signOut({scope:'local'});session=null;state.teacherProfile=null}if(!session){const r=await sb.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session;state.session=session}return session}
  async function checkTeacherStatus(){if(!state.session||sessionIsAnonymous())return{authorized:false,profile:null};const d=await api('teacher_status');state.teacherProfile=d.authorized?d.profile:null;return d}

  async function init(){
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
    stopRoomWatch();state.room=null;state.me=null;state.players=[];state.match=null;state.privateStates=[];state.historyDetail=null;state.resumeSnapshot=null;state.roomPreview=null;setConn(navigator.onLine?'Conectado':'Sem internet',navigator.onLine?'ok':'bad');
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
  function relationChips(country,relations){const arr=[];for(const [k,r] of Object.entries(relations||{})){const parts=k.split('|');if(parts.includes(country)){const p=parts.find(x=>x!==country);arr.push(`<span class="relation-chip ${r.type}">${r.type==='block'?'🤝 Bloco':'⇄ Acordo'} · ${esc(p)}${r.suspended?' · suspenso':''}</span>`)}}return arr.join('')||'<span class="muted tiny">Sem relações</span>'}
  const activeList=pub=>pub.active_countries||Object.keys(pub.countries||{});
  function publicBlockPartner(pub,country){for(const[k,r]of Object.entries(pub.relations||{})){if(r.type==='block'&&!r.suspended&&k.split('|').includes(country))return k.split('|').find(x=>x!==country)||null}return null}
  function publicAgreementPartners(pub,country){const out=[];for(const[k,r]of Object.entries(pub.relations||{})){if(r.type==='agreement'&&!r.suspended&&k.split('|').includes(country))out.push(k.split('|').find(x=>x!==country))}return out.filter(Boolean)}
  function publicRelation(pub,a,b){return pub.relations?.[[a,b].sort().join('|')]||null}
  function cardHasValidTarget(id,pub,country){const act=activeList(pub),me=pub.countries?.[country]||{};if([18,19,20,21,22,23].includes(id))return false;if(id===11)return publicAgreementPartners(pub,country).length>0;if(id===12)return act.some(c=>c!==country&&Number(pub.countries[c]?.eco)>Number(me.eco));if(id===13)return act.some(c=>c!==country&&Number(pub.countries[c]?.cult)>=Number(me.cult));if(id===15)return act.some(c=>c!==country&&Number(pub.countries[c]?.net)>=Number(me.net));if(id===16)return Object.values(pub.relations||{}).some(r=>r.type==='block'&&!r.suspended);if(id===17)return act.some(c=>c!==country&&publicAgreementPartners(pub,c).length>=2);return true}

  function countryHtml(c,d,isMine,pub){const total=(d.eco||0)+(d.net||0)+(d.dip||0)+(d.cult||0);return `<section class="card country-${c} ${pub.active_country===c?'active-country':''}"><div class="actions"><h3 style="margin:0">${esc(c)}</h3>${isMine?'<span class="badge good">Seu país</span>':''}${pub.active_country===c?'<span class="badge violet">Turno</span>':''}</div><div class="muted small">${esc(d.team_name||'')}</div><div class="kpis"><div class="kpi"><b>${d.eco??0}</b><span>💰 Economia</span></div><div class="kpi"><b>${d.net??0}</b><span>🌐 Redes</span></div><div class="kpi"><b>${d.dip??0}</b><span>🤝 Diplomacia</span></div><div class="kpi"><b>${d.cult??0}</b><span>🎭 Cultura</span></div></div><div class="separator"></div><div class="actions"><span class="badge">Influência ${total}</span><span class="badge">🃏 ${d.hand_count??0}</span><span class="badge">🎓 ${d.advantages??0}</span></div><div class="relation-row">${relationChips(c,pub.relations)}</div></section>`}
  function cardHtml(id,{button='',data='',disabled=false}={}){const c=CARD[id]||{name:`Carta ${id}`,type:'',tags:[],effect:''};return `<article class="game-card"><div class="num">CARTA ${id} · ${esc(c.type)}</div><h4>${esc(c.name)}</h4><p>${esc(c.effect)}</p><div class="tag-row">${(c.tags||[]).map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div>${button?`<button class="btn compact ${disabled?'':'primary'}" ${data} ${disabled?'disabled':''}>${esc(button)}</button>`:''}</article>`}
  function handHtml(hand,opts={}){return `<div class="hand">${(hand||[]).map(id=>cardHtml(id,opts.buttonFor?opts.buttonFor(id):{})).join('')||'<p class="muted">Nenhuma carta.</p>'}</div>`}

  function renderMatch(isTeacher){
    if(isTeacher)captureTeacherNoteDraft();
    document.body.classList.add('in-match');
    const pub=state.match.public_state||{},own=ownPrivate(),myCountry=state.me.country;
    if(state.match.status==='interrupted'||state.room.status==='interrupted')return renderClosedSession(isTeacher,'Sessão interrompida','O professor encerrou este playtest. Os dados foram preservados no histórico.');
    if(pub.phase==='finished'||state.match.status==='finished')return renderFinal(pub,isTeacher,own);
    screen.innerHTML=`<div class="command-room">
      <header class="command-top">
        <div class="command-brand"><div class="eyebrow">GeoPoder · Sala ${esc(state.room.code)}</div><div class="command-title">${esc(phaseTitle(pub))}</div><div class="command-sub">Rodada ${pub.round}/8 · ${esc(pub.game_version||GAME_VERSION)} · regras ${esc(pub.rules_version||RULES_VERSION)}</div></div>
        <div class="command-tools">
          <button class="command-tool" data-command-modal="world">🌍 Situação mundial</button>
          <button class="command-tool" data-command-modal="diplomacy">🤝 Diplomacia</button>
          <button class="command-tool" data-command-modal="history">📜 Histórico</button>
          <button class="command-tool" data-command-modal="rules">? Regras</button>
          <button class="command-tool danger-lite" id="leaveActive">${isTeacher?'Painel':'Sair'}</button>
        </div>
      </header>
      <aside class="command-national">${renderNationalCommand(pub,isTeacher)}</aside>
      <main class="command-situation">${renderSituationCommand(pub,isTeacher,own)}</main>
      <aside class="command-event ${eventTone(pub.current_event)}">${renderCommandEvent(pub.current_event,pub)}</aside>
      <section class="command-bottom">${isTeacher?renderTeacherDock(pub):renderCommandHand(own,pub)}</section>
      <div class="command-modal" id="commandModal" aria-hidden="true"><div class="command-modal-card"><div class="command-modal-head"><h3 id="commandModalTitle">Detalhes</h3><button class="btn ghost compact" id="commandModalClose">Fechar</button></div><div id="commandModalBody" class="command-modal-body"></div></div></div>
    </div>`;
    document.getElementById('leaveActive').onclick=()=>leaveCurrentRoom(isTeacher);
    document.querySelectorAll('[data-command-modal]').forEach(b=>b.onclick=()=>openCommandModal(b.dataset.commandModal,pub));
    document.getElementById('commandModalClose')?.addEventListener('click',closeCommandModal);
    document.getElementById('commandModal')?.addEventListener('click',e=>{if(e.target?.id==='commandModal')closeCommandModal()});
    bindMatchActions(pub,isTeacher,own);
  }

  function phaseTitle(pub){
    const k=pub.pending_public?.kind;
    if(['reaction_loss','reaction_dissolve'].includes(k))return'Janela de Reação';
    if(k==='card_setup')return'Preparando jogada';
    if(['renew_discard','optional_renew'].includes(k))return'Renovação de carta';
    if(['hand_limit_discard','discard_card','trade_return','safeguard_cost','safeguard_block_cost'].includes(k))return'Escolha de carta';
    if(pub.phase==='event')return'Evento Mundial';
    if(pub.phase==='challenge')return'Desafio Geográfico';
    if(pub.phase==='challenge_result')return'Resultado do Desafio';
    if(pub.phase==='draw')return'Compra e renovação';
    if(pub.phase==='turn_ready')return`${pub.active_country} se prepara`;
    if(pub.phase==='turns')return`Turno de ${pub.active_country}`;
    if(pub.phase==='diplomacy')return'Cúpula Diplomática';
    return'Partida em andamento';
  }

  function eventTone(e){if(!e)return'event-neutral';const k=(e.kind||'').toLowerCase();return k.includes('crise')?'event-crisis':k.includes('oportun')?'event-opportunity':'event-adverse'}

  function renderCommandEvent(e,pub){
    if(!e)return `<div class="command-section-label">Evento global</div><div class="event-empty">Aguardando o próximo evento.</div>`;
    return `<div class="command-section-label">Evento global · permanece ativo na rodada</div><div class="event-kind">${esc(e.kind)}</div><h2 class="event-name">${esc(e.name)}</h2><p class="event-effect">${esc(e.effect)}</p><div class="event-round">Rodada ${pub.round}/8</div>`;
  }

  function renderNationalCommand(pub,isTeacher){
    if(isTeacher)return renderTeacherControlCompact(pub);
    const c=pub.countries?.[state.me.country]||{},country=state.me.country,total=(c.eco||0)+(c.net||0)+(c.dip||0)+(c.cult||0);
    return `<div class="command-section-label">Gabinete nacional</div><div class="national-country country-${country}"><h2>${esc(country)}</h2><div class="muted small">${esc(c.team_name||'')}</div></div>
      <div class="national-stats"><div><span>💰</span><b>${c.eco??0}</b><small>Economia</small></div><div><span>🌐</span><b>${c.net??0}</b><small>Redes</small></div><div><span>🤝</span><b>${c.dip??0}</b><small>Diplomacia</small></div><div><span>🎭</span><b>${c.cult??0}</b><small>Cultura</small></div></div>
      <div class="national-score"><span>Influência</span><strong>${total}</strong></div>
      <div class="national-badges"><span>🎓 Vantagens: <b>${c.advantages??0}</b></span><span>🃏 Mão: <b>${c.hand_count??0}</b></span></div>
      <div class="command-section-label relation-label">Suas relações</div><div class="relation-row">${relationChips(country,pub.relations)}</div>`;
  }

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

  function renderSituationCommand(pub,isTeacher,own){
    const log=pub.recent_log||[];
    return `<div class="situation-head"><div><div class="command-section-label">Mesa de situação</div><h2>${esc(phaseTitle(pub))}</h2></div>${pub.active_country?`<span class="situation-active">Em foco: ${esc(pub.active_country)}</span>`:''}</div>
      <div class="situation-phase">${renderPhasePanel(pub,isTeacher,own)}</div>
      <div class="situation-feed"><div class="command-section-label">O que acabou de acontecer</div>${log.length?log.slice(-4).reverse().map(x=>`<div class="feed-line">${esc(x.text||x)}</div>`).join(''):'<div class="muted tiny">Nenhuma ação recente.</div>'}</div>`;
  }

  function renderPhasePanel(pub,isTeacher,own){
    if(pub.pending_public)return renderPending(pub.pending_public,isTeacher,own);
    if(pub.phase==='challenge')return renderChallenge(pub,isTeacher);
    if(pub.phase==='challenge_result')return renderChallengeResult(pub,isTeacher);
    if(pub.phase==='turn_ready')return renderTurnReady(pub,isTeacher);
    if(pub.phase==='turns')return renderTurn(pub,isTeacher);
    if(pub.phase==='diplomacy')return renderDiplomacyPhase(pub,isTeacher,own);
    if(pub.phase==='draw'||pub.phase==='event')return `<section class="action-panel command-action"><div class="waiting-orb"></div><h3>Resolução em andamento</h3><p class="muted">A carta de Evento permanece visível ao lado. Aguarde a próxima decisão necessária.</p></section>`;
    return'';
  }

  function renderChallenge(pub,isTeacher){
    const q=pub.current_challenge,answered=pub.challenge_answered||[],mine=state.me.country,has=answered.includes(mine),total=activeList(pub).length;
    return `<section class="action-panel command-action"><div class="eyebrow">Todos respondem ao mesmo tempo</div><h3 class="challenge-question">${esc(q.question)}</h3>${isTeacher?`<div class="answer-status">${activeList(pub).map(c=>`<span class="badge ${answered.includes(c)?'good':''}">${c}: ${answered.includes(c)?'✓':'…'}</span>`).join('')}</div><p class="muted tiny">Respostas: ${answered.length}/${total}. Você decide quando encerrar o desafio.</p>`:has?'<div class="banner good">Resposta registrada. Acompanhe a situação enquanto as outras equipes respondem.</div>':`<div class="option-grid">${q.options.map((o,i)=>`<button class="option-btn" data-challenge-answer="${i}"><b>${String.fromCharCode(65+i)}</b><span>${esc(o)}</span></button>`).join('')}</div>`}</section>`;
  }

  function renderChallengeResult(pub,isTeacher){
    const r=pub.challenge_result,q=pub.current_challenge;if(!r)return'';
    return `<section class="action-panel command-action"><div class="eyebrow">Resposta correta</div><h3>${String.fromCharCode(65+r.correct)} — ${esc(q.options[r.correct])}</h3><div class="result-grid compact-results">${r.results.map(x=>`<div class="result-tile ${x.correct?'correct':'wrong'}"><b>${esc(x.country)}</b><span>${x.answer==null?'Sem resposta':`${String.fromCharCode(65+x.answer)} · ${x.correct?'Acertou':'Errou'}`}</span></div>`).join('')}</div><div class="banner good result-wait">${isTeacher?'Use “Prosseguir” no controle docente quando quiser avançar.':'O professor liberará a próxima fase.'}</div></section>`;
  }

  function openCommandModal(kind,pub){
    const modal=document.getElementById('commandModal'),title=document.getElementById('commandModalTitle'),body=document.getElementById('commandModalBody');if(!modal||!title||!body)return;
    if(kind==='world'){
      title.textContent='Situação mundial';
      body.innerHTML=`<div class="world-grid">${activeList(pub).map(c=>countryHtml(c,pub.countries?.[c]||{},c===state.me.country,pub)).join('')}</div>`;
    } else if(kind==='diplomacy'){
      title.textContent='Relações diplomáticas';
      const rels=Object.entries(pub.relations||{});
      body.innerHTML=rels.length?`<div class="diplomacy-map">${rels.map(([k,r])=>{const [a,b]=k.split('|');return `<div class="diplomacy-row"><b>${esc(a)} ↔ ${esc(b)}</b><span class="badge ${r.type==='block'?'good':'violet'}">${r.type==='block'?'Bloco':'Acordo'}</span>${r.suspended?'<span class="badge warn">Suspenso</span>':''}</div>`}).join('')}</div>`:'<div class="history-empty">Ainda não existem Acordos ou Blocos.</div>';
    } else if(kind==='history'){
      title.textContent='Histórico recente';
      const log=pub.recent_log||[];body.innerHTML=log.length?`<div class="history-list">${log.slice().reverse().map(x=>`<div>${esc(x.text||x)}</div>`).join('')}</div>`:'<div class="history-empty">Nenhum registro recente.</div>';
    } else {
      title.textContent='Regras rápidas';
      body.innerHTML=`<div class="rules-quick"><p><b>Ação Principal:</b> no seu turno, jogue 1 carta, use Recuperação Nacional quando um atributo estiver em 0 ou passe.</p><p><b>Sem cronômetro:</b> o professor controla o ritmo e pode encerrar um turno que esteja parado.</p><p><b>Cúpula Diplomática:</b> ao final de cada rodada, cada país recebe 1 iniciativa para propor Acordo, formar Bloco, trocar carta, encerrar relação, sair de Bloco ou não agir.</p><p><b>Evento Global:</b> o Evento mostrado à direita vale durante toda a rodada.</p><p><b>Influência:</b> soma dos quatro atributos. No fim, países com todos os atributos em pelo menos 2 recebem +2 por equilíbrio.</p></div>`;
    }
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }
  function closeCommandModal(){const m=document.getElementById('commandModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}}

  function renderCommandHand(own,pub){
    const active=pub.phase==='turns'&&!pub.pending_public&&state.me.country===pub.active_country;
    const cards=own?.hand||[];
    return `<div class="hand-dock-head"><div><div class="command-section-label">Conselho de ministros</div><b>Sua mão</b></div><span class="muted tiny">${active?'Escolha uma carta ou use as ações da Mesa de Situação.':'Suas cartas permanecem visíveis enquanto você acompanha a rodada.'}</span></div><div class="command-hand">${cards.map(id=>commandCardHtml(id,pub,active)).join('')||'<div class="muted">Nenhuma carta na mão.</div>'}</div>`;
  }

  function commandCardHtml(id,pub,active){
    const c=CARD[id]||{name:`Carta ${id}`,type:'',tags:[],effect:''};let label='Aguarde seu turno',disabled=true,data='';
    if(REACTION_IDS_UI.has(id)){label='Reação · gatilho automático';}
    else if(active&&!cardHasValidTarget(id,pub,state.me.country)){label='Sem alvo válido';}
    else if(active){label='Jogar carta';disabled=false;data=`data-play-card="${id}"`;}
    return `<article class="command-card"><div class="command-card-top"><span>#${id}</span><span>${esc(c.type)}</span></div><h4>${esc(c.name)}</h4><p>${esc(c.effect)}</p><div class="command-card-footer"><div class="tag-row">${(c.tags||[]).slice(0,2).map(t=>`<span class="mini-tag">${esc(t)}</span>`).join('')}</div><button class="btn compact ${disabled?'':'primary'}" ${data} ${disabled?'disabled':''}>${esc(label)}</button></div></article>`;
  }

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
      if(stage==='sanction_mode')buttons=`<button class="btn primary" data-pending="normal">Sanção normal: −1 Economia</button><button class="btn danger" data-pending="intensify">Romper Acordo e intensificar</button>`;
      if(stage==='block')buttons=(p.blocks||[]).map(k=>`<button class="btn primary" data-pending="${esc(k)}">Bloco ${esc(k.replace('|',' ↔ '))}</button>`).join('');
      if(stage==='platform'){buttons=`<button class="btn primary" data-pending="regulation">Regulação: +1 Diplomacia e renovar</button>`+(p.expansion_targets||[]).map(t=>`<button class="btn good" data-pending="expansion:net:${esc(t)}">Expansão: +1 Redes; ${esc(t)} +1 Cultura</button><button class="btn good" data-pending="expansion:cult:${esc(t)}">Expansão: +1 Cultura; ${esc(t)} +1 Cultura</button>`).join('');}
      if(stage==='opening'){buttons=`<button class="btn good" data-pending="eco">+1 Economia</button>`+(p.agreement_targets||[]).map(t=>`<button class="btn primary" data-pending="agreement:${esc(t)}">Propor Acordo a ${esc(t)}</button>`).join('');}
      return `<section class="card action-panel" style="margin-top:16px"><div class="eyebrow">Jogar carta</div>${card}<h3>Escolha como resolver</h3><div class="actions">${buttons||'<span class="muted">Nenhuma opção válida.</span>'}</div></section>`;
    }
    if(['reaction_loss','reaction_dissolve'].includes(p.kind)){const id=Number(priv.cardId||0);return `<section class="card action-panel reaction-panel" style="margin-top:16px"><div class="eyebrow">Reação disponível</div><h3>Você pode responder agora</h3>${id?cardHtml(id):''}<div class="actions"><button class="btn violet" data-pending="use">Usar Reação</button><button class="btn ghost" data-pending="decline">Não reagir</button></div></section>`}
    if(p.kind==='agreement_replace_proposer')return `<section class="card action-panel"><div class="eyebrow">Limite de Acordos</div><h3>Escolha qual Acordo será substituído</h3><p class="muted">O novo Acordo com ${esc(p.target)} será proposto depois.</p><div class="actions">${(p.options||[]).map(t=>`<button class="btn danger" data-pending="${esc(t)}">Substituir Acordo com ${esc(t)}</button>`).join('')}</div></section>`;
    if(p.kind==='agreement_response'){const reps=p.target_replacement_options||[];return `<section class="card action-panel"><div class="eyebrow">Proposta diplomática</div><h3>${esc(p.proposer)} propõe um Acordo Comercial</h3>${reps.length?'<p class="muted">Você já possui 2 Acordos. Para aceitar, escolha qual será substituído.</p>':''}<div class="actions">${reps.length?reps.map(t=>`<button class="btn good" data-pending="accept_replace:${esc(t)}">Aceitar e substituir ${esc(t)}</button>`).join(''):'<button class="btn good" data-pending="accept">Aceitar</button>'}<button class="btn danger" data-pending="decline">Recusar</button></div></section>`}
    if(p.kind==='block_response')return `<section class="card action-panel"><div class="eyebrow">Proposta de Bloco</div><h3>${esc(p.proposer)} quer formar um Bloco com você</h3><div class="actions"><button class="btn good" data-pending="accept">Aceitar</button><button class="btn danger" data-pending="decline">Recusar</button></div></section>`;
    if(p.kind==='trade_response'){const offered=Number(priv.offerCard||0);return `<section class="card action-panel"><div class="eyebrow">Troca Comercial</div><h3>${esc(priv.proposer||p.actor)} oferece uma carta</h3>${offered?cardHtml(offered):''}<p class="muted">Se aceitar, você escolherá uma carta da sua mão para entregar em troca. Depois, ambos renovam 1 carta.</p><div class="actions"><button class="btn good" data-pending="accept">Aceitar</button><button class="btn danger" data-pending="decline">Recusar</button></div></section>`}
    if(p.kind==='trade_return')return `<section class="card action-panel"><div class="eyebrow">Troca Comercial</div><h3>Escolha a carta que você entregará</h3>${handHtml(own?.hand||[],{buttonFor:id=>({button:'Entregar esta carta',data:`data-pending="${id}"`})})}</section>`;
    if(['safeguard_cost','safeguard_block_cost'].includes(p.kind))return `<section class="card action-panel"><div class="eyebrow">Cláusula de Salvaguarda</div><h3>Escolha 1 carta para descartar como custo</h3>${handHtml(own?.hand||[],{buttonFor:id=>({button:'Descartar como custo',data:`data-pending="${id}"`})})}</section>`;
    if(p.kind==='optional_renew')return `<section class="card action-panel"><div class="eyebrow">Renovação opcional</div><h3>${esc(p.reason||'Você pode renovar 1 carta')}</h3><div class="actions"><button class="btn violet" data-pending="yes">Renovar 1 carta</button><button class="btn ghost" data-pending="no">Manter minha mão</button></div></section>`;
    if(p.kind==='top_card_choice'){const id=Number(priv.cardId||0);return `<section class="card action-panel"><div class="eyebrow">Topo do baralho</div><h3>Você viu esta carta</h3>${id?cardHtml(id):''}<div class="actions"><button class="btn primary" data-pending="keep">Deixar no topo</button><button class="btn danger" data-pending="discard">Descartar do topo</button></div></section>`}
    if(p.kind==='top_two_keep'){const ids=priv.candidates||[];return `<section class="card action-panel"><div class="eyebrow">Conectividade Global</div><h3>Escolha a carta que ficará com você</h3><div class="hand">${ids.map(id=>cardHtml(id,{button:'Ficar com esta',data:`data-pending="${id}"`})).join('')}</div></section>`}
    if(p.kind==='tariff_choice')return `<section class="card action-panel"><div class="eyebrow">Barreiras Tarifárias</div><h3>Escolha a consequência</h3><div class="actions"><button class="btn danger" data-pending="end">Encerrar o Acordo</button><button class="btn danger" data-pending="loss">Ambos perdem 1 Economia</button></div></section>`;
    if(p.kind==='pressure_choice')return `<section class="card action-panel"><div class="eyebrow">Pressão Geopolítica</div><h3>Como responder?</h3><div class="actions"><button class="btn danger" data-pending="lose_dip">Perder 1 Diplomacia</button><button class="btn danger" data-pending="discard_random">Descartar 1 carta aleatória</button>${publicRelation(state.match.public_state,p.actor,p.target)?.type==='agreement'?'<button class="btn danger" data-pending="end_agreement">Encerrar Acordo com o atacante</button>':''}</div></section>`;
    if(p.kind==='block_tension_choice')return `<section class="card action-panel"><div class="eyebrow">Tensão no Bloco</div><h3>Após conversar com o parceiro, escolha o resultado</h3><div class="actions">${(p.members||[]).map(c=>`<button class="btn danger" data-pending="lose:${esc(c)}">${esc(c)} perde 1 Diplomacia</button>`).join('')}<button class="btn danger" data-pending="dissolve">Dissolver o Bloco</button></div></section>`;
    if(p.kind==='embargo_choice')return `<section class="card action-panel"><div class="eyebrow">Embargo Secundário</div><h3>Escolha uma consequência</h3><div class="actions"><button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.agreements||[]).map(t=>`<button class="btn danger" data-pending="end:${esc(t)}">Encerrar Acordo com ${esc(t)}</button>`).join('')}</div></section>`;
    if(p.kind==='ied_response')return `<section class="card action-panel"><div class="eyebrow">Investimento Estrangeiro Direto</div><h3>${esc(p.actor)} propõe o investimento</h3><p class="muted">Se aceitar, uma rolagem definirá o resultado para os dois países.</p><div class="actions"><button class="btn good" data-pending="accept">Aceitar</button><button class="btn danger" data-pending="decline">Recusar</button></div></section>`;
    if(p.kind==='card_roll_decision'){const total=Math.min(6,Number(p.raw||0)+Number(p.modifier||0));return `<section class="card action-panel dice-panel"><div class="eyebrow">Rolagem</div><div class="big-die">🎲 ${p.raw}${p.modifier?` + ${p.modifier} = ${total}`:''}</div><h3>${esc(CARD[p.card_id]?.name||'Carta')}</h3><div class="actions"><button class="btn primary" data-pending="keep">Aceitar resultado</button><button class="btn violet" data-pending="reroll">🎓 Gastar Vantagem e rerrolar</button></div></section>`}
    if(p.kind==='dispute_reroll'){const myRoll=p.stage==='actor'?p.actor_roll:p.target_roll;return `<section class="card action-panel dice-panel"><div class="eyebrow">Disputa de Influência</div><h3>${esc(p.actor)}: 🎲 ${p.actor_roll} · ${esc(p.target)}: 🎲 ${p.target_roll}</h3><p>Seu resultado é <b>${myRoll}</b>.</p><div class="actions"><button class="btn primary" data-pending="keep">Manter resultado</button><button class="btn violet" data-pending="reroll">🎓 Gastar Vantagem e rerrolar</button></div></section>`}
    if(p.kind==='loss_choice')return `<section class="card action-panel"><div class="eyebrow">Perda de atributo</div><h3>${esc(p.source)}</h3><p>Você perderá <b>${p.amount}</b> em ${ATTRS[p.attr]||p.attr}.</p><div class="actions"><button class="btn danger" data-pending="accept">Sofrer perda</button>${p.can_use_advantage?'<button class="btn violet" data-pending="use_advantage">🎓 Gastar Vantagem e reduzir 1</button>':''}</div></section>`;
    if(p.kind==='redirect_loss')return `<section class="card action-panel"><div class="eyebrow">Atributo zerado</div><h3>Redirecione ${p.remaining} ponto(s) de perda</h3><p class="muted">Escolha outro atributo.</p><div class="actions">${(p.available_attrs||[]).map(a=>`<button class="btn" data-pending="${a}">${ATTRS[a]}</button>`).join('')}</div></section>`;
    if(p.kind==='event_roll_decision')return `<section class="card action-panel dice-panel"><div class="eyebrow">Rolagem pública</div><div class="big-die">🎲 ${p.roll}</div><h3>${esc(p.source)}</h3><div class="actions"><button class="btn primary" data-pending="accept">Aceitar resultado</button>${p.can_reroll?'<button class="btn violet" data-pending="reroll">🎓 Gastar Vantagem e rerrolar</button>':''}</div></section>`;
    if(['discard_card','renew_discard','hand_limit_discard'].includes(p.kind))return `<section class="card action-panel"><div class="eyebrow">Escolha uma carta</div><h3>${esc(p.reason||'Descarte')}</h3>${handHtml(own?.hand||[],{buttonFor:id=>({button:'Descartar',data:`data-pending="${id}"`})})}</section>`;
    if(p.kind==='draw_choice')return `<section class="card action-panel"><div class="eyebrow">Compra da rodada</div><h3>Como deseja comprar?</h3><div class="actions"><button class="btn primary" data-pending="normal">Comprar 1 carta</button><button class="btn violet" data-pending="advantage">🎓 Gastar Vantagem: ver 2 e ficar com 1</button></div></section>`;
    if(p.kind==='draw_keep'){const ids=own?.pending?.candidates||[];return `<section class="card action-panel"><div class="eyebrow">Vantagem Geográfica</div><h3>Escolha qual carta ficará na sua mão</h3><div class="hand">${ids.map(id=>cardHtml(id,{button:'Ficar com esta',data:`data-pending="${id}"`})).join('')}</div></section>`}
    return `<section class="card action-panel"><h3>Decisão necessária</h3><p>${esc(pendingDescription(p))}</p></section>`;
  }
  function pendingDescription(p){return({card_setup:'Escolha de alvo ou modo da carta.',reaction_loss:'Uma Reação pode reduzir a perda.',reaction_dissolve:'Uma Reação pode impedir o rompimento da relação.',agreement_replace_proposer:'Escolha qual Acordo substituir.',agreement_response:'Resposta a proposta de Acordo.',block_response:'Resposta a proposta de Bloco.',trade_response:'Resposta a proposta de troca.',trade_return:'Escolha da carta devolvida na troca.',optional_renew:'Renovação opcional.',top_card_choice:'Decisão sobre o topo do baralho.',top_two_keep:'Escolha entre duas cartas.',tariff_choice:'Resposta às Barreiras Tarifárias.',pressure_choice:'Resposta à Pressão Geopolítica.',block_tension_choice:'Decisão do Bloco.',embargo_choice:'Resposta ao Embargo Secundário.',ied_response:'Resposta ao Investimento Estrangeiro Direto.',card_roll_decision:'Decisão sobre rolagem.',dispute_reroll:'Possível rerrolagem.',event_choice:'Escolha do Evento Mundial.',loss_choice:'Decisão sobre uma perda.',redirect_loss:'Redirecionamento de perda.',event_roll_decision:'Decisão sobre uma rolagem.',renew_discard:'Renovação de carta.',hand_limit_discard:'Descarte por limite da mão.',draw_choice:'Compra da rodada.',draw_keep:'Escolha entre duas cartas.'})[p.kind]||p.kind}
  function eventChoicePanel(p){
    const eid=p.event_id;let html='';
    if(eid===1)html=`<button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.relations||[]).map(r=>`<button class="btn" data-pending="suspend:${r.partner}">Suspender ${r.type==='block'?'Bloco':'Acordo'} com ${esc(r.partner)}</button>`).join('')}`;
    if(eid===4)html='<button class="btn danger" data-pending="lose">Perder 1 Diplomacia</button><button class="btn" data-pending="block_diplomacy">Abrir mão da iniciativa diplomática desta rodada</button>';
    if(eid===5)html='<button class="btn danger" data-pending="cult">Perder 1 Cultura</button><button class="btn danger" data-pending="net">Perder 1 Redes</button>';
    if(eid===6)html='<button class="btn danger" data-pending="lose">Perder 1 Economia</button><button class="btn" data-pending="discard">Descartar 1 carta</button>';
    if(eid===7||eid===8)html=`<button class="btn danger" data-pending="lose">Perder 1 Economia</button>${(p.relations||[]).map(r=>`<button class="btn" data-pending="end:${r.partner}">Encerrar Acordo com ${esc(r.partner)}</button>`).join('')}`;
    if(eid===14)html=`<button class="btn ghost" data-pending="skip">Não propor</button>${(p.valid_targets||[]).map(t=>`<button class="btn good" data-pending="propose:${t}">Propor Acordo a ${esc(t)}</button>`).join('')}`;
    if(eid===16)html='<button class="btn good" data-pending="cult">+1 Cultura</button><button class="btn violet" data-pending="renew">Renovar 1 carta</button>';
    return `<section class="card action-panel" style="margin-top:16px"><div class="eyebrow">Sua decisão no Evento</div><h3>Escolha uma opção</h3><div class="actions">${html}</div></section>`;
  }

  function renderTurnReady(pub,isTeacher){
    const active=pub.active_country;
    if(isTeacher)return `<section class="action-panel command-action turn-ready"><div class="eyebrow">Turno aguardando início</div><h3>${esc(active)} está se organizando</h3><p class="muted">Use este momento para explicar uma regra ou atender uma dúvida. Não há cronômetro.</p></section>`;
    if(state.me.country===active)return `<section class="action-panel command-action active-turn turn-ready"><div class="eyebrow">Sua vez</div><h3>Conselho reunido?</h3><p>Confira o Evento Global, seus atributos e suas cartas. Quando a equipe estiver pronta, inicie o turno.</p><div class="actions"><button class="btn primary ready-btn" id="playerReadyTurn">Estamos prontos — iniciar turno</button></div></section>`;
    return `<section class="action-panel command-action"><div class="waiting-orb"></div><div class="eyebrow">Preparação do turno</div><h3>Aguardando ${esc(active)}</h3><p class="muted">Acompanhe o Evento Global e planeje sua próxima decisão.</p></section>`;
  }

  function renderTurn(pub,isTeacher){
    if(isTeacher)return `<section class="action-panel command-action"><div class="eyebrow">Turno ativo</div><h3>${esc(pub.active_country)} está decidindo</h3><p class="muted">Sem limite automático. Encerre o turno pelo painel docente se a equipe ficar parada.</p></section>`;
    if(state.me.country!==pub.active_country)return `<section class="action-panel command-action"><div class="waiting-orb"></div><div class="eyebrow">Ação de outro país</div><h3>${esc(pub.active_country)} está jogando</h3><p class="muted">Observe a Mesa de Situação: qualquer carta, ataque, reação ou mudança importante aparecerá aqui.</p></section>`;
    const c=pub.countries[state.me.country],zeros=Object.keys(ATTRS).filter(a=>Number(c[a])===0);
    return `<section class="action-panel command-action active-turn"><div class="eyebrow">Sua Ação Principal</div><h3>O que o governo fará?</h3><p class="muted">Jogue uma carta na sua mão, recupere um atributo zerado ou passe. A Diplomacia acontece na Cúpula ao fim da rodada.</p><div class="actions turn-core-actions"><button class="btn ghost" data-turn-action="pass">Passar vez</button>${zeros.map(a=>`<button class="btn good" data-recovery="${a}">Recuperação: ${ATTRS[a]} 0 → 1</button>`).join('')}</div></section>`;
  }

  function renderDiplomacyPhase(pub,isTeacher,own){
    const active=activeList(pub),done=pub.diplomacy_done||[];
    if(isTeacher)return `<section class="action-panel command-action diplomacy-phase"><div class="eyebrow">Cúpula Internacional</div><h3>Uma iniciativa diplomática por país</h3><div class="diplomacy-status-grid">${active.map(c=>`<div class="dip-status ${done.includes(c)?'done':''}"><b>${esc(c)}</b><span>${done.includes(c)?'✓ concluída':'aguardando'}</span></div>`).join('')}</div><p class="muted tiny">Aceitar ou recusar a proposta de outro país não consome a iniciativa do receptor. Encerre a Cúpula pelo controle docente quando desejar.</p></section>`;
    const me=state.me.country,c=pub.countries?.[me]||{};
    if(done.includes(me))return `<section class="action-panel command-action diplomacy-phase"><div class="eyebrow">Cúpula Internacional</div><h3>Sua iniciativa já foi concluída</h3><p class="muted">Você ainda pode receber e responder propostas de outros países. Use o botão Diplomacia no topo para acompanhar as relações.</p><div class="diplomacy-status-grid">${active.map(x=>`<div class="dip-status ${done.includes(x)?'done':''}"><b>${esc(x)}</b><span>${done.includes(x)?'✓':'…'}</span></div>`).join('')}</div></section>`;
    if(c.dipBlocked)return `<section class="action-panel command-action diplomacy-phase"><div class="eyebrow">Cúpula Internacional</div><h3>Seu país está impedido de agir diplomaticamente nesta rodada</h3><p class="muted">Esta restrição veio do Evento Global. Você ainda pode responder propostas recebidas.</p></section>`;
    const agreements=publicAgreementPartners(pub,me),block=publicBlockPartner(pub,me),agreementLocked=Boolean(pub.flags?.noAgreements||pub.flags?.noRelations||c.noNewAgreementRound),unrelated=agreementLocked?[]:active.filter(x=>x!==me&&!publicRelation(pub,me,x)&&!pub.countries[x]?.noNewAgreementRound),blockLocked=Boolean(pub.flags?.noRelations||block),blockTargets=blockLocked?[]:active.filter(x=>x!==me&&!publicBlockPartner(pub,x)),tradeTargets=active.filter(x=>x!==me&&Number(pub.countries[x]?.hand_count||0)>0);
    return `<section class="action-panel command-action diplomacy-phase"><div class="eyebrow">Sua iniciativa diplomática</div><h3>Escolha uma ação para a Cúpula</h3><div class="dip-action-groups">
      <div><b>Propor Acordo</b><div class="actions">${unrelated.length?unrelated.map(t=>`<button class="btn compact" data-diplomacy="agreement" data-target="${esc(t)}">${esc(t)}</button>`).join(''):'<span class="muted tiny">Sem alvo disponível.</span>'}</div></div>
      <div><b>Formar Bloco</b><div class="actions">${blockTargets.length?blockTargets.map(t=>`<button class="btn compact" data-diplomacy="block" data-target="${esc(t)}">${esc(t)}</button>`).join(''):'<span class="muted tiny">Sem alvo disponível.</span>'}</div></div>
      <div><b>Trocar 1 carta por 1</b><div class="trade-line"><select id="tradeTarget">${tradeTargets.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select><select id="tradeCard">${(own?.hand||[]).map(id=>`<option value="${id}">${esc(CARD[id]?.name||'Carta '+id)}</option>`).join('')}</select><button class="btn compact" id="tradeSubmit" ${(!tradeTargets.length||!(own?.hand||[]).length)?'disabled':''}>Propor troca</button></div></div>
      ${agreements.length?`<div><b>Encerrar Acordo</b><div class="actions">${agreements.map(t=>`<button class="btn ghost compact" data-diplomacy="end_agreement" data-target="${esc(t)}">Com ${esc(t)}</button>`).join('')}</div></div>`:''}
      ${block?`<div><b>Sair do Bloco</b><div class="actions"><button class="btn danger compact" data-diplomacy="exit_block">Sair do Bloco com ${esc(block)}</button></div><span class="muted tiny">Custo: −1 Diplomacia.</span></div>`:''}
      <div><button class="btn ghost" data-diplomacy="pass">Não fazer proposta nesta rodada</button></div>
    </div></section>`;
  }

  // Mantidos como aliases para compatibilidade com trechos antigos, mas o jogo em
  // andamento usa a Sala de Comando e o dock inferior.
  function renderOwnHand(own,pub){return renderCommandHand(own,pub)}
  function renderTeacherPanel(pub){return renderTeacherControlCompact(pub)}
  function teacherTelemetryHtml(){return renderTeacherDock(state.match?.public_state||{})}

  function bindMatchActions(pub,isTeacher,own){
    document.querySelectorAll('[data-pending]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('respond_pending',{roomId:state.room.id,choice:b.dataset.pending});await refreshSnapshot()}));
    document.querySelectorAll('[data-challenge-answer]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('answer_challenge',{roomId:state.room.id,answer:Number(b.dataset.challengeAnswer)});await refreshSnapshot()}));
    document.querySelector('[data-turn-action="pass"]')?.addEventListener('click',()=>withBusy(async()=>{await api('turn_action',{roomId:state.room.id,kind:'pass'});await refreshSnapshot()}));
    document.querySelectorAll('[data-recovery]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('turn_action',{roomId:state.room.id,kind:'recovery',attr:b.dataset.recovery});await refreshSnapshot()}));
    document.querySelectorAll('[data-play-card]').forEach(b=>b.onclick=()=>withBusy(async()=>{await api('play_card',{roomId:state.room.id,cardId:Number(b.dataset.playCard)});await refreshSnapshot()}));
    document.querySelectorAll('[data-diplomacy]').forEach(b=>b.onclick=()=>withBusy(async()=>{const kind=b.dataset.diplomacy,target=b.dataset.target||null;if(kind==='end_agreement'&&target&&!confirm(`Encerrar o Acordo com ${target}?`))return;if(kind==='exit_block'&&!confirm('Sair do Bloco custa 1 Diplomacia. Confirmar?'))return;await api('diplomacy_action',{roomId:state.room.id,kind,target});await refreshSnapshot()}));
    document.getElementById('tradeSubmit')?.addEventListener('click',()=>withBusy(async()=>{const target=document.getElementById('tradeTarget')?.value,offerCard=Number(document.getElementById('tradeCard')?.value);if(!target||!offerCard)throw new Error('Escolha o país e a carta para oferecer.');await api('diplomacy_action',{roomId:state.room.id,kind:'trade',target,offerCard});await refreshSnapshot()}));
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

  function renderFinal(pub,isTeacher,own){document.body.classList.remove('in-match');const r=pub.final_result||{},ranking=r.ranking||[];screen.innerHTML=`<section class="card hero final-screen"><div class="eyebrow">Partida encerrada</div><h2>🏆 ${esc(r.winner_country||'Resultado final')}</h2><div class="ranking">${ranking.map((x,i)=>`<div class="rank-row"><b>${i+1}º · ${esc(x.country)}</b><span>${esc(x.team_name||'')}</span><strong>${x.final} pts</strong><small>${x.base} influência${x.equilibrium?` + ${x.equilibrium} equilíbrio`:''}</small></div>`).join('')}</div><div class="actions"><button class="btn ghost" id="finalLeave">${isTeacher?'Voltar ao painel':'Sair da partida'}</button></div></section>`;document.getElementById('finalLeave').onclick=()=>leaveCurrentRoom(isTeacher)}

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
