(() => {
  'use strict';

  const CONFIG = window.GEOPOWER_CONFIG || {};
  const screen = document.getElementById('screen');
  const connection = document.getElementById('connection');

  const COUNTRIES = ['Aurora','Montária','Pacífica','Solária'];
  const GAME_VERSION = 'Alpha 2.0a.1';
  const CARD_NAMES = {
    1:'Infraestrutura Digital',2:'Diplomacia Multilateral',3:'Marca Cultural Global',4:'Investimento Produtivo',5:'Logística Integrada',6:'Fórum Econômico Regional',7:'Diversificação de Mercados',8:'Conectividade Global',9:'Produção Cultural em Rede',
    10:'Sanções Econômicas',11:'Barreiras Tarifárias',12:'Fuga de Capitais',13:'Guerra de Narrativas',14:'Pressão Geopolítica',15:'Ataque às Redes',16:'Tensão no Bloco',17:'Embargo Secundário',
    18:'Mediação Internacional',19:'Retaliação Comercial',20:'Defesa Cibernética',21:'Contracampanha Cultural',22:'Solidariedade do Bloco',23:'Cláusula de Salvaguarda',
    24:'Capital Especulativo',25:'Investimento Estrangeiro Direto',26:'Plataforma Global',27:'Abertura Comercial',28:'Disputa de Influência'
  };

  let sb = null;
  let state = {
    session:null,
    teacherProfile:null,
    room:null,
    me:null,
    players:[],
    match:null,
    privateStates:[],
    channel:null,
    busy:false,
    dashboard:null,
    historyDetail:null,
  };
  let heartbeatTimer = null;
  let refreshTimer = null;

  function esc(v='') {
    return String(v).replace(/[&<>'"]/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[c]));
  }

  function setConn(text, cls='') {
    connection.textContent = text;
    connection.className = `pill ${cls}`.trim();
  }

  function sessionIsAnonymous(session=state.session) {
    const u = session?.user;
    return Boolean(u?.is_anonymous === true || u?.app_metadata?.provider === 'anonymous');
  }

  function showError(title, detail='') {
    screen.innerHTML = `
      <div class="card">
        <h2>${esc(title)}</h2>
        <div class="error-box">${esc(detail)}</div>
        <p class="muted small">Copie a mensagem acima se precisar diagnosticar a configuração.</p>
        <div class="actions" style="margin-top:14px">
          <button class="btn ghost" id="errorHome">Voltar</button>
        </div>
      </div>`;
    document.getElementById('errorHome')?.addEventListener('click', () => renderHome());
  }

  function rememberRoom(roomId) {
    if (roomId) localStorage.setItem('gp_room_id', roomId);
    else localStorage.removeItem('gp_room_id');
  }

  function formatDate(value) {
    if (!value) return '—';
    try { return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)); }
    catch { return value; }
  }

  function formatDuration(seconds) {
    if (seconds == null || Number.isNaN(Number(seconds))) return '—';
    const s = Math.max(0, Math.round(Number(seconds)));
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    if (h) return `${h}h ${m}min`;
    if (m) return `${m}min ${sec}s`;
    return `${sec}s`;
  }

  function statusLabel(status) {
    return ({lobby:'Lobby',active:'Em andamento',finished:'Finalizada',interrupted:'Interrompida'})[status] || status || '—';
  }

  function statusBadge(status) {
    const cls = status === 'finished' ? 'good' : status === 'active' ? 'violet' : status === 'interrupted' ? 'bad' : 'warn';
    return `<span class="badge ${cls}">${esc(statusLabel(status))}</span>`;
  }

  async function api(action, payload={}) {
    const { data, error } = await sb.functions.invoke('game-api', { body:{ action, ...payload } });
    if (error) {
      let message = error.message || 'Falha ao chamar game-api.';
      try {
        const ctx = error.context;
        if (ctx && typeof ctx.json === 'function') {
          const body = await ctx.json();
          message = body?.detail || body?.error || message;
        }
      } catch (_) {}
      throw new Error(message);
    }
    if (!data?.ok) throw new Error(data?.detail || data?.error || 'Resposta inválida do servidor.');
    return data;
  }

  async function withBusy(fn, {alertOnError=true}={}) {
    if (state.busy) return;
    state.busy = true;
    try { return await fn(); }
    catch (e) {
      console.error(e);
      if (alertOnError) alert(e?.message || String(e));
      else throw e;
    } finally { state.busy = false; }
  }

  async function refreshSession() {
    const { data:{session}, error } = await sb.auth.getSession();
    if (error) throw error;
    state.session = session;
    return session;
  }

  async function ensureAnonymousSession() {
    let session = await refreshSession();
    if (session && !sessionIsAnonymous(session)) {
      await sb.auth.signOut({ scope:'local' });
      session = null;
      state.teacherProfile = null;
    }
    if (!session) {
      const res = await sb.auth.signInAnonymously();
      if (res.error) throw res.error;
      session = res.data.session;
      state.session = session;
    }
    return session;
  }

  async function checkTeacherStatus() {
    if (!state.session || sessionIsAnonymous()) return {authorized:false, profile:null};
    const data = await api('teacher_status');
    state.teacherProfile = data.authorized ? data.profile : null;
    return data;
  }

  async function init() {
    try {
      if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_PUBLISHABLE_KEY || /SEU-PROJETO|COLE_AQUI/.test(CONFIG.SUPABASE_URL + CONFIG.SUPABASE_PUBLISHABLE_KEY)) {
        setConn('Configuração pendente','bad');
        showError('config.js ainda não está configurado','Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no arquivo config.js publicado no mesmo diretório do index.html.');
        return;
      }
      if (!window.supabase?.createClient) {
        setConn('Biblioteca indisponível','bad');
        showError('Supabase JS não carregou','Verifique a conexão com a internet e o carregamento de cdn.jsdelivr.net.');
        return;
      }

      sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_PUBLISHABLE_KEY, {
        auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:false }
      });

      setConn('Conectando…');
      const session = await refreshSession();
      setConn('Conectado','ok');

      const savedRoom = localStorage.getItem('gp_room_id');
      if (savedRoom && session) {
        try {
          await loadRoom(savedRoom, true);
          return;
        } catch (e) {
          console.warn('Não foi possível restaurar sala:', e);
          rememberRoom(null);
        }
      }

      if (session && !sessionIsAnonymous(session)) {
        try {
          const teacher = await checkTeacherStatus();
          if (teacher.authorized) {
            await loadTeacherDashboard();
            return;
          }
        } catch (e) {
          console.warn('Falha ao validar professor:',e);
        }
      }

      renderHome();
    } catch (e) {
      console.error(e);
      setConn('Falha de conexão','bad');
      showError('Não foi possível conectar ao Supabase',e?.message || String(e));
    }
  }

  function renderHome() {
    stopRoomWatch();
    state.room=null; state.me=null; state.players=[]; state.match=null; state.privateStates=[]; state.historyDetail=null;
    setConn(navigator.onLine ? 'Conectado' : 'Sem internet', navigator.onLine ? 'ok' : 'bad');

    const teacherLogged = Boolean(state.session && !sessionIsAnonymous() && state.teacherProfile);
    screen.innerHTML = `
      <div class="card hero">
        <div class="eyebrow">GeoPoder · ${GAME_VERSION}</div>
        <h2>Entre na partida</h2>
        <p class="muted">As equipes entram com o código fornecido pelo professor. O acesso de professor é protegido por conta autorizada.</p>
      </div>

      <div class="grid two" style="margin-top:16px">
        <section class="card role-card">
          <h3>🌍 Equipe</h3>
          <p class="muted">Use o código da sala, o nome da equipe e escolha o país designado.</p>
          <div class="field"><label for="roomCode">Código da sala</label><input id="roomCode" maxlength="8" placeholder="GEO-AB12" style="text-transform:uppercase"></div>
          <div class="field"><label for="teamName">Nome da equipe</label><input id="teamName" maxlength="60" placeholder="Ex.: Equipe Global"></div>
          <div class="field"><label for="country">País</label><select id="country">${COUNTRIES.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div class="actions"><button class="btn good" id="joinRoom">Entrar na sala</button></div>
        </section>

        <section class="card role-card teacher-entry">
          <div class="eyebrow">Acesso restrito</div>
          <h3>🎓 Área do Professor</h3>
          <p class="muted">Criação e controle das salas, histórico dos playtests, telemetria e exportações ficam aqui.</p>
          <div class="actions">
            <button class="btn violet" id="teacherEntry">${teacherLogged ? 'Abrir painel' : 'Entrar como professor'}</button>
          </div>
        </section>
      </div>`;

    document.getElementById('joinRoom').onclick = () => withBusy(async()=>{
      const code = document.getElementById('roomCode').value.trim().toUpperCase();
      const teamName = document.getElementById('teamName').value.trim();
      const country = document.getElementById('country').value;
      if (!code || !teamName) throw new Error('Informe o código da sala e o nome da equipe.');
      await ensureAnonymousSession();
      const data = await api('join_room',{code,teamName,country});
      rememberRoom(data.room.id);
      await loadRoom(data.room.id);
    });

    document.getElementById('teacherEntry').onclick = async()=>{
      if (teacherLogged) await loadTeacherDashboard();
      else renderTeacherLogin();
    };
  }

  function renderTeacherLogin(message='') {
    stopRoomWatch();
    screen.innerHTML = `
      <section class="card login-box teacher-entry">
        <div class="eyebrow">Área restrita</div>
        <h2>🎓 Professor</h2>
        <p class="muted">Use a conta de professor cadastrada e autorizada no Supabase.</p>
        ${message ? `<div class="banner bad">${esc(message)}</div>` : ''}
        <div class="field"><label for="teacherEmail">E-mail</label><input id="teacherEmail" type="email" autocomplete="username" placeholder="seu@email.com"></div>
        <div class="field"><label for="teacherPassword">Senha</label><input id="teacherPassword" type="password" autocomplete="current-password" placeholder="••••••••"></div>
        <div class="actions">
          <button class="btn violet" id="teacherLoginBtn">Entrar</button>
          <button class="btn ghost" id="teacherBackBtn">Voltar</button>
        </div>
      </section>`;

    document.getElementById('teacherBackBtn').onclick = ()=>renderHome();
    document.getElementById('teacherLoginBtn').onclick = ()=>withBusy(async()=>{
      const email = document.getElementById('teacherEmail').value.trim();
      const password = document.getElementById('teacherPassword').value;
      if (!email || !password) throw new Error('Informe e-mail e senha.');

      const current = await refreshSession();
      if (current && sessionIsAnonymous(current)) await sb.auth.signOut({scope:'local'});
      const res = await sb.auth.signInWithPassword({email,password});
      if (res.error) throw res.error;
      state.session = res.data.session;

      const status = await checkTeacherStatus();
      if (!status.authorized) {
        await sb.auth.signOut({scope:'local'});
        state.session=null; state.teacherProfile=null;
        throw new Error('Esta conta existe, mas não está autorizada como professor do GeoPoder.');
      }
      rememberRoom(null);
      await loadTeacherDashboard();
    });
  }

  async function loadTeacherDashboard() {
    stopRoomWatch();
    const data = await api('teacher_dashboard');
    state.teacherProfile = data.profile;
    state.dashboard = data.sessions || [];
    renderTeacherDashboard();
  }

  function renderTeacherDashboard() {
    const sessions = state.dashboard || [];
    const active = sessions.filter(s => ['lobby','active'].includes(s.room.status));
    const history = sessions.filter(s => ['finished','interrupted'].includes(s.room.status));

    screen.innerHTML = `
      <section class="card">
        <div class="dashboard-head">
          <div>
            <div class="eyebrow">Painel do professor</div>
            <h2 style="margin:.2rem 0">Olá, ${esc(state.teacherProfile?.display_name || 'Professor')}</h2>
            <div class="version-line">${GAME_VERSION} · regras 0.3-D</div>
          </div>
          <div class="actions">
            <button class="btn ghost" id="teacherRefresh">Atualizar</button>
            <button class="btn ghost" id="teacherLogout">Sair</button>
          </div>
        </div>
      </section>

      <div class="grid two" style="margin-top:16px">
        <section class="card">
          <div class="eyebrow">Nova sessão</div>
          <h3>Criar partida</h3>
          <div class="field"><label for="className">Turma / identificação</label><input id="className" maxlength="100" placeholder="Ex.: M4 Vespertino — Playtest 3"></div>
          <div class="actions"><button class="btn primary" id="createRoom">Criar sala</button></div>
        </section>
        <section class="card soft">
          <div class="eyebrow">Resumo</div>
          <div class="grid three" style="margin-top:12px">
            <div class="metric"><div class="value">${sessions.length}</div><div class="label">sessões registradas</div></div>
            <div class="metric"><div class="value">${active.length}</div><div class="label">abertas / em andamento</div></div>
            <div class="metric"><div class="value">${history.length}</div><div class="label">encerradas / interrompidas</div></div>
          </div>
        </section>
      </div>

      <section class="card" style="margin-top:16px">
        <div class="section-title"><div><div class="eyebrow">Agora</div><h3 style="margin:.15rem 0">Salas abertas</h3></div></div>
        ${active.length ? sessionsTable(active,true) : '<div class="history-empty">Nenhuma sala aberta no momento.</div>'}
      </section>

      <section class="card" style="margin-top:16px">
        <div class="section-title"><div><div class="eyebrow">Arquivo</div><h3 style="margin:.15rem 0">Partidas anteriores</h3></div></div>
        ${history.length ? sessionsTable(history,false) : '<div class="history-empty">As partidas encerradas aparecerão aqui com telemetria e exportação.</div>'}
      </section>`;

    document.getElementById('teacherRefresh').onclick = ()=>withBusy(()=>loadTeacherDashboard());
    document.getElementById('teacherLogout').onclick = ()=>withBusy(async()=>{
      rememberRoom(null);
      await sb.auth.signOut({scope:'local'});
      state.session=null; state.teacherProfile=null; state.dashboard=null;
      renderHome();
    });
    document.getElementById('createRoom').onclick = ()=>withBusy(async()=>{
      const className = document.getElementById('className').value.trim();
      const data = await api('create_room',{className});
      rememberRoom(data.room.id);
      await loadRoom(data.room.id);
    });

    document.querySelectorAll('[data-open-room]').forEach(btn=>{
      btn.addEventListener('click',()=>withBusy(()=>openTeacherSession(btn.dataset.openRoom)));
    });
  }

  function sessionsTable(items, activeMode) {
    return `<div class="table-wrap"><table><thead><tr>
      <th>Data</th><th>Turma</th><th>Sala</th><th>Status</th><th>Equipes</th><th>Rodada</th><th>Versão</th><th></th>
    </tr></thead><tbody>${items.map(s=>{
      const m=s.match; const count=s.teams?.length || 0;
      return `<tr>
        <td>${esc(formatDate(s.room.created_at))}</td>
        <td>${esc(s.room.class_name || '—')}</td>
        <td class="mono">${esc(s.room.code)}</td>
        <td>${statusBadge(s.room.status)}</td>
        <td>${count}/4</td>
        <td>${m?.round ?? '—'}</td>
        <td>${esc(m?.game_version || (activeMode ? GAME_VERSION : '—'))}</td>
        <td><button class="btn compact ghost" data-open-room="${esc(s.room.id)}">${activeMode ? 'Abrir' : 'Relatório'}</button></td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
  }

  async function openTeacherSession(roomId) {
    const session = (state.dashboard || []).find(s=>s.room.id===roomId);
    if (session && ['lobby','active'].includes(session.room.status)) {
      rememberRoom(roomId);
      await loadRoom(roomId);
      return;
    }
    const detail = await api('teacher_match_detail',{roomId});
    state.historyDetail = detail;
    renderHistoryDetail();
  }

  function renderHistoryDetail() {
    const d = state.historyDetail;
    if (!d) return renderTeacherDashboard();
    const teams = (d.players||[]).filter(p=>p.role==='player');
    const events = d.events || [];
    const counts = countEvents(events);
    const questions = questionStats(events);
    const cards = cardStats(events);
    const start = d.match?.started_at || d.room.started_at;
    const end = d.match?.ended_at || d.room.ended_at;
    const duration = d.match?.duration_seconds ?? (start&&end ? Math.round((new Date(end)-new Date(start))/1000) : null);

    screen.innerHTML = `
      <section class="card">
        <div class="dashboard-head">
          <div>
            <div class="eyebrow">Relatório de partida</div>
            <h2 style="margin:.15rem 0">${esc(d.room.class_name || d.room.code)}</h2>
            <div class="statusline">${statusBadge(d.room.status)} <span class="badge">${esc(d.room.code)}</span> <span class="badge">${esc(d.match?.game_version || 'versão não registrada')}</span></div>
          </div>
          <div class="actions">
            <button class="btn ghost" id="historyBack">Voltar ao painel</button>
            <button class="btn ghost" id="historyMd">Markdown</button>
            <button class="btn ghost" id="historyCsv">CSV</button>
            <button class="btn ghost" id="historyJson">JSON</button>
          </div>
        </div>
      </section>

      <section class="grid four" style="margin-top:16px">
        <div class="metric"><div class="value">${teams.length}</div><div class="label">equipes</div></div>
        <div class="metric"><div class="value">${d.match?.round ?? '—'}</div><div class="label">última rodada</div></div>
        <div class="metric"><div class="value">${formatDuration(duration)}</div><div class="label">duração</div></div>
        <div class="metric"><div class="value">${events.length}</div><div class="label">eventos de telemetria</div></div>
      </section>

      <section class="card" style="margin-top:16px">
        <div class="eyebrow">Equipes</div><h3>Participantes</h3>
        <div class="grid four">${COUNTRIES.map(c=>{const p=teams.find(x=>x.country===c);return `<div class="seat country-${c} ${p?'occupied':''}"><strong>${c}</strong><div>${esc(p?.team_name || 'Sem equipe registrada')}</div></div>`}).join('')}</div>
      </section>

      <section class="grid two" style="margin-top:16px">
        <div class="card">
          <div class="eyebrow">Aprendizagem</div><h3>Desafios geográficos</h3>
          ${questions.total ? renderQuestionSummary(questions) : '<p class="muted">Esta sessão ainda não contém respostas de Desafios. A coleta passa a ser preenchida quando o motor 2.0b registrar QUESTION_ANSWERED.</p>'}
        </div>
        <div class="card">
          <div class="eyebrow">Playtest</div><h3>Uso de cartas</h3>
          ${cards.totalActions ? renderCardSummary(cards) : '<p class="muted">Ainda não há jogadas de cartas registradas nesta versão. Os dados CARD_PLAYED, CARD_DISCARDED e CARD_NO_VALID_TARGET serão consolidados aqui automaticamente.</p>'}
        </div>
      </section>

      <section class="card" style="margin-top:16px">
        <div class="eyebrow">Telemetria</div><h3>Eventos registrados</h3>
        ${Object.keys(counts).length ? `<div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Quantidade</th></tr></thead><tbody>${Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nenhum evento registrado.</p>'}
      </section>

      <section class="card" style="margin-top:16px">
        <div class="eyebrow">Observação docente</div><h3>Notas salvas</h3>
        ${renderTeacherNotes(events)}
      </section>`;

    document.getElementById('historyBack').onclick=()=>loadTeacherDashboard();
    document.getElementById('historyMd').onclick=()=>exportDetail('md');
    document.getElementById('historyCsv').onclick=()=>exportDetail('csv');
    document.getElementById('historyJson').onclick=()=>exportDetail('json');
  }

  function countEvents(events) {
    const out={};
    for (const e of events) out[e.event_type]=(out[e.event_type]||0)+1;
    return out;
  }

  function questionStats(events) {
    const answers = events.filter(e=>e.event_type==='QUESTION_ANSWERED');
    const byQuestion={}; let correct=0;
    for (const e of answers) {
      const q=String(e.payload?.question_id ?? e.payload?.challenge_id ?? 'sem_id');
      if (!byQuestion[q]) byQuestion[q]={total:0,correct:0,wrong:0,choices:{},times:[]};
      const s=byQuestion[q]; s.total++;
      const isCorrect=Boolean(e.payload?.correct); if(isCorrect){s.correct++;correct++;} else s.wrong++;
      const choice=String(e.payload?.answer ?? e.payload?.choice ?? '—'); s.choices[choice]=(s.choices[choice]||0)+1;
      if (Number.isFinite(Number(e.payload?.response_time_ms))) s.times.push(Number(e.payload.response_time_ms));
    }
    return {total:answers.length,correct,wrong:answers.length-correct,byQuestion};
  }

  function cardStats(events) {
    const played={},discarded={},drawn={},noTarget={};
    for (const e of events) {
      const id=String(e.payload?.card_id ?? ''); if(!id) continue;
      const bucket = e.event_type==='CARD_PLAYED'?played:e.event_type==='CARD_DISCARDED'?discarded:e.event_type==='CARD_DRAWN'?drawn:e.event_type==='CARD_NO_VALID_TARGET'?noTarget:null;
      if(bucket) bucket[id]=(bucket[id]||0)+1;
    }
    return {played,discarded,drawn,noTarget,totalActions:Object.keys(played).length+Object.keys(discarded).length+Object.keys(noTarget).length};
  }

  function renderQuestionSummary(q) {
    const pct=q.total?Math.round(q.correct/q.total*100):0;
    return `<div class="grid three"><div class="metric"><div class="value">${q.correct}/${q.total}</div><div class="label">acertos</div></div><div class="metric"><div class="value">${pct}%</div><div class="label">percentual</div></div><div class="metric"><div class="value">${Object.keys(q.byQuestion).length}</div><div class="label">questões</div></div></div>`;
  }

  function topEntry(obj, asc=false) {
    const arr=Object.entries(obj||{}); if(!arr.length) return null;
    arr.sort((a,b)=>asc?a[1]-b[1]:b[1]-a[1]); return arr[0];
  }

  function renderCardSummary(c) {
    const most=topEntry(c.played); const disc=topEntry(c.discarded); const dead=topEntry(c.noTarget);
    const label=(entry)=>entry?`${CARD_NAMES[entry[0]] || 'Carta '+entry[0]} (${entry[1]})`:'—';
    return `<div class="stack"><div><strong>Mais jogada:</strong><br><span class="muted">${esc(label(most))}</span></div><div><strong>Mais descartada:</strong><br><span class="muted">${esc(label(disc))}</span></div><div><strong>Mais vezes sem alvo:</strong><br><span class="muted">${esc(label(dead))}</span></div></div>`;
  }

  function renderTeacherNotes(events) {
    const notes=events.filter(e=>e.event_type==='TEACHER_NOTE');
    if(!notes.length) return '<p class="muted">Nenhuma nota manual registrada.</p>';
    return `<div class="stack">${notes.map(n=>`<div class="banner"><strong>${esc(formatDate(n.created_at))}</strong><div>${esc(n.payload?.text || '')}</div></div>`).join('')}</div>`;
  }

  async function loadRoom(roomId, restoring=false) {
    const snap=await api('snapshot',{roomId});
    state.room=snap.room; state.me=snap.me; state.players=snap.players||[]; state.match=snap.match||null; state.privateStates=snap.privateStates||[];
    rememberRoom(roomId); startRoomWatch(roomId); renderRoom();
    if(!restoring) window.scrollTo({top:0,behavior:'smooth'});
  }

  async function refreshSnapshot() {
    if(!state.room?.id) return;
    try {
      const snap=await api('snapshot',{roomId:state.room.id});
      state.room=snap.room; state.me=snap.me; state.players=snap.players||[]; state.match=snap.match||null; state.privateStates=snap.privateStates||[];
      renderRoom();
    } catch(e) { console.warn('snapshot',e); }
  }

  function startRoomWatch(roomId) {
    stopRoomWatch();
    state.channel=sb.channel(`gp-room-${roomId}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'gp_room_players',filter:`room_id=eq.${roomId}`},debouncedRefresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'gp_matches',filter:`room_id=eq.${roomId}`},debouncedRefresh)
      .on('postgres_changes',{event:'*',schema:'public',table:'gp_rooms',filter:`id=eq.${roomId}`},debouncedRefresh)
      .subscribe(status=>{
        if(status==='SUBSCRIBED') setConn('Sincronizado','ok');
        else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT') setConn('Realtime instável','bad');
      });
    heartbeatTimer=setInterval(()=>api('heartbeat',{roomId}).catch(()=>{}),25000);
  }

  function stopRoomWatch() {
    if(state.channel&&sb){sb.removeChannel(state.channel);state.channel=null;}
    if(heartbeatTimer){clearInterval(heartbeatTimer);heartbeatTimer=null;}
    if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=null;}
  }

  function debouncedRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshSnapshot,180);}

  function renderRoom() {
    if(!state.room||!state.me){renderHome();return;}
    const isTeacher=state.me.role==='teacher';
    if(state.match) renderMatch(isTeacher); else renderLobby(isTeacher);
  }

  function rosterByCountry(){const map={};for(const c of COUNTRIES)map[c]=state.players.find(p=>p.role==='player'&&p.country===c)||null;return map;}

  function renderLobby(isTeacher) {
    const roster=rosterByCountry(); const count=COUNTRIES.filter(c=>roster[c]).length;
    screen.innerHTML=`
      <section class="card">
        <div class="statusline"><span class="badge">Sala</span><span class="badge warn">Lobby</span>${state.room.class_name?`<span class="badge">${esc(state.room.class_name)}</span>`:''}</div>
        <div class="room-code">${esc(state.room.code)}</div>
        <div class="copyline"><span class="muted">Compartilhe este código com as quatro equipes.</span><button class="btn ghost" id="copyCode">Copiar código</button><button class="btn ghost right" id="leaveRoom">${isTeacher?'Voltar ao painel':'Sair desta tela'}</button></div>
      </section>
      <section class="card" style="margin-top:16px">
        <div class="actions"><div><h3 style="margin-bottom:4px">Equipes na sala</h3><div class="muted small">${count}/4 países ocupados</div></div>${isTeacher?`<button class="btn primary right" id="startMatch" ${count===4?'':'disabled'}>Iniciar partida</button>`:''}</div>
        <div class="grid four" style="margin-top:16px">${COUNTRIES.map(c=>seatHtml(c,roster[c])).join('')}</div>
        ${!isTeacher?`<div class="banner ${count===4?'good':'warn'}" style="margin-top:16px">${count===4?'As quatro equipes estão presentes. Aguarde o professor iniciar.':'Aguardando as demais equipes e o professor.'}</div>`:''}
      </section>`;

    document.getElementById('copyCode').onclick=()=>navigator.clipboard?.writeText(state.room.code).then(()=>{const b=document.getElementById('copyCode');b.textContent='Copiado!';setTimeout(()=>{if(b)b.textContent='Copiar código';},1200)});
    document.getElementById('leaveRoom').onclick=()=>{rememberRoom(null);stopRoomWatch();if(isTeacher)loadTeacherDashboard();else renderHome();};
    if(isTeacher&&count===4) document.getElementById('startMatch').onclick=()=>withBusy(async()=>{await api('start_match',{roomId:state.room.id});await refreshSnapshot();});
  }

  function seatHtml(country,p){return `<div class="seat country-${country} ${p?'occupied':''}"><strong>${esc(country)}</strong>${p?`<div>${esc(p.team_name||'Equipe')}</div><small>Conectada à sala</small>`:`<div class="muted">Aguardando equipe…</div>`}</div>`;}

  function renderMatch(isTeacher) {
    const pub=state.match.public_state||{}; const countries=pub.countries||{}; const meCountry=state.me.country;
    const ownPriv=state.privateStates.find(x=>x.player_id===state.me.id)||state.privateStates[0]||null;
    screen.innerHTML=`
      <section class="card">
        <div class="actions"><div><div class="eyebrow">Sala ${esc(state.room.code)}</div><h2 style="margin:.15rem 0">Partida iniciada</h2><div class="version-line">${esc(state.match.game_version||GAME_VERSION)} · regras ${esc(state.match.rules_version||'0.3-D')}</div></div>
          <div class="right statusline"><span class="badge">Rodada ${esc(state.match.round)}</span><span class="badge violet">${esc(state.match.phase)}</span>${pub.active_country?`<span class="badge">Ativo: ${esc(pub.active_country)}</span>`:''}</div></div>
        <div class="banner warn" style="margin-top:14px">A infraestrutura multiplayer está ativa. Eventos, turnos e cartas serão acionados na Alpha 2.0b.</div>
        ${isTeacher?`<div class="actions"><button class="btn ghost" id="matchDashboard">Voltar ao painel</button><button class="btn danger" id="interruptSession">Marcar sessão como interrompida</button></div>`:''}
      </section>
      <section class="grid four" style="margin-top:16px">${COUNTRIES.map(c=>countryHtml(c,countries[c]||{},c===meCountry)).join('')}</section>
      ${isTeacher?teacherHandsHtml():playerHandHtml(ownPriv)}
      ${isTeacher?teacherTelemetryHtml():''}`;

    if(isTeacher){bindTeacherTools();document.getElementById('matchDashboard').onclick=()=>{rememberRoom(null);loadTeacherDashboard();};document.getElementById('interruptSession').onclick=()=>withBusy(async()=>{if(!confirm('Marcar esta sessão como interrompida? A telemetria será preservada.'))return;await api('mark_interrupted',{roomId:state.room.id});rememberRoom(null);await loadTeacherDashboard();});}
  }

  function countryHtml(c,d,isMine){const total=(d.eco||0)+(d.net||0)+(d.dip||0)+(d.cult||0);return `<section class="card country-${c}"><div class="actions"><h3 style="margin:0">${esc(c)}</h3>${isMine?'<span class="badge">Seu país</span>':''}</div><div class="muted small">${esc(d.team_name||'')}</div><div class="kpis"><div class="kpi"><b>${d.eco??0}</b><span>💰 Economia</span></div><div class="kpi"><b>${d.net??0}</b><span>🌐 Redes</span></div><div class="kpi"><b>${d.dip??0}</b><span>🤝 Diplomacia</span></div><div class="kpi"><b>${d.cult??0}</b><span>🎭 Cultura</span></div></div><div class="separator"></div><div class="actions"><span class="badge">Influência ${total}</span><span class="badge">🃏 ${d.hand_count??0}</span><span class="badge">🎓 ${d.advantages??0}</span></div></section>`;}

  function cardsHtml(hand){if(!Array.isArray(hand)||!hand.length)return'<p class="muted">Nenhuma carta.</p>';return `<div class="hand">${hand.map(id=>`<article class="game-card"><div class="num">CARTA ${esc(id)}</div><h4>${esc(CARD_NAMES[id]||`Carta ${id}`)}</h4><p>O efeito completo será executado pelo motor multiplayer da Alpha 2.0b.</p></article>`).join('')}</div>`;}

  function playerHandHtml(priv){return `<section class="card" style="margin-top:16px"><div class="actions"><div><div class="eyebrow">Informação privada</div><h3 style="margin:.15rem 0">Sua mão</h3></div><span class="badge right">Somente sua equipe recebe estes dados</span></div>${cardsHtml(priv?.hand||[])}</section>`;}

  function teacherHandsHtml(){const roster=rosterByCountry();return `<section class="card" style="margin-top:16px"><div class="eyebrow">Visão do professor</div><h3>Mãos privadas das equipes</h3><div class="stack">${COUNTRIES.map(c=>{const p=roster[c];const ps=state.privateStates.find(x=>x.player_id===p?.id);return `<div><div class="actions"><strong>${esc(c)}</strong><span class="muted small">${esc(p?.team_name||'')}</span></div>${cardsHtml(ps?.hand||[])}</div>`}).join('<div class="separator"></div>')}</div></section>`;}

  function teacherTelemetryHtml(){return `<section class="card" style="margin-top:16px"><div class="actions"><div><div class="eyebrow">Playtest</div><h3 style="margin:.15rem 0">Telemetria e notas</h3></div></div><div class="grid two"><div><div class="field"><label for="teacherNote">Nota de observação</label><textarea id="teacherNote" placeholder="Ex.: Equipe Aurora demorou para compreender a tela inicial."></textarea></div><button class="btn" id="saveNote">Salvar nota</button></div><div><p class="muted small">As exportações completas também ficam salvas no histórico da Área do Professor.</p><div class="actions"><button class="btn ghost" id="exportMd">Markdown</button><button class="btn ghost" id="exportCsv">CSV</button><button class="btn ghost" id="exportJson">JSON</button></div></div></div><div id="noteFeedback" style="margin-top:10px"></div></section>`;}

  function bindTeacherTools(){
    document.getElementById('saveNote')?.addEventListener('click',()=>withBusy(async()=>{const text=document.getElementById('teacherNote').value.trim();if(!text)throw new Error('Digite uma nota.');await api('telemetry_note',{roomId:state.room.id,matchId:state.match?.id||null,round:state.match?.round||null,text});document.getElementById('teacherNote').value='';document.getElementById('noteFeedback').innerHTML='<div class="success-box">Nota salva na telemetria.</div>';}));
    document.getElementById('exportMd')?.addEventListener('click',()=>exportCurrentRoom('md'));
    document.getElementById('exportCsv')?.addEventListener('click',()=>exportCurrentRoom('csv'));
    document.getElementById('exportJson')?.addEventListener('click',()=>exportCurrentRoom('json'));
  }

  async function exportCurrentRoom(kind){await withBusy(async()=>{const detail=await api('teacher_match_detail',{roomId:state.room.id});downloadDetail(detail,kind);});}

  function exportDetail(kind){downloadDetail(state.historyDetail,kind);}

  function buildMarkdown(detail){
    const teams=(detail.players||[]).filter(p=>p.role==='player'); const events=detail.events||[]; const counts=countEvents(events); const q=questionStats(events); const c=cardStats(events);
    let md=`# GeoPoder — Relatório de Playtest\n\n- **Sala:** ${detail.room.code}\n- **Turma:** ${detail.room.class_name||'—'}\n- **Status:** ${statusLabel(detail.room.status)}\n- **Versão do jogo:** ${detail.match?.game_version||'—'}\n- **Versão das regras:** ${detail.match?.rules_version||'—'}\n- **Criada em:** ${formatDate(detail.room.created_at)}\n\n## Equipes\n`;
    for(const ctry of COUNTRIES){const p=teams.find(x=>x.country===ctry);md+=`- **${ctry}:** ${p?.team_name||'—'}\n`;}
    md+='\n## Aprendizagem\n';
    if(q.total){md+=`- Respostas: ${q.total}\n- Acertos: ${q.correct}\n- Erros: ${q.wrong}\n- Percentual: ${Math.round(q.correct/q.total*100)}%\n`;for(const [id,s] of Object.entries(q.byQuestion)){const avg=s.times.length?Math.round(s.times.reduce((a,b)=>a+b,0)/s.times.length):null;md+=`- Questão ${id}: ${s.correct}/${s.total} acertos${avg!==null?`, tempo médio ${avg} ms`:''}\n`;}}else md+='- Nenhuma resposta de Desafio registrada nesta versão.\n';
    md+='\n## Cartas\n';
    const formatMap=(label,obj)=>{const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]);if(!entries.length){md+=`- ${label}: nenhum dado\n`;return;}md+=`- ${label}: ${entries.map(([id,n])=>`${CARD_NAMES[id]||'Carta '+id} (${n})`).join('; ')}\n`;};
    formatMap('Jogadas',c.played);formatMap('Descartadas',c.discarded);formatMap('Sem alvo válido',c.noTarget);
    md+='\n## Contagem de eventos de telemetria\n';for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1]))md+=`- ${k}: ${v}\n`;
    const notes=events.filter(e=>e.event_type==='TEACHER_NOTE');if(notes.length){md+='\n## Notas do professor\n';for(const n of notes)md+=`- ${formatDate(n.created_at)} — ${n.payload?.text||''}\n`;}
    md+='\n## Telemetria bruta\n\n```json\n'+JSON.stringify(events,null,2)+'\n```\n';return md;
  }

  function downloadDetail(detail,kind){
    if(!detail)return; const stamp=new Date().toISOString().slice(0,10); const prefix=`GeoPoder_${detail.room.code}_${stamp}`; const events=detail.events||[];
    if(kind==='json')download(`${prefix}.json`,JSON.stringify(detail,null,2),'application/json');
    if(kind==='md')download(`${prefix}.md`,buildMarkdown(detail),'text/markdown;charset=utf-8');
    if(kind==='csv'){const head=['id','created_at','event_type','actor_country','round','payload'];const csv=[head.join(','),...events.map(r=>[r.id,r.created_at,r.event_type,r.actor_country||'',r.round??'',JSON.stringify(r.payload||{})].map(csvCell).join(','))].join('\n');download(`${prefix}.csv`,csv,'text/csv;charset=utf-8');}
  }

  function csvCell(v){const s=String(v??'');return/[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}

  function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}

  window.addEventListener('online',()=>setConn('Conectado','ok'));
  window.addEventListener('offline',()=>setConn('Sem internet','bad'));
  init();
})();
