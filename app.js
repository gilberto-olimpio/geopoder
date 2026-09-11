(() => {
  'use strict';

  const CONFIG = window.GEOPOWER_CONFIG || {};
  const screen = document.getElementById('screen');
  const connection = document.getElementById('connection');
  const COUNTRIES = ['Aurora','Montária','Pacífica','Solária'];
  const CARD_NAMES = {
    1:'Infraestrutura Digital',2:'Diplomacia Multilateral',3:'Marca Cultural Global',4:'Investimento Produtivo',5:'Logística Integrada',6:'Fórum Econômico Regional',7:'Diversificação de Mercados',8:'Conectividade Global',9:'Produção Cultural em Rede',
    10:'Sanções Econômicas',11:'Barreiras Tarifárias',12:'Fuga de Capitais',13:'Guerra de Narrativas',14:'Pressão Geopolítica',15:'Ataque às Redes',16:'Tensão no Bloco',17:'Embargo Secundário',
    18:'Mediação Internacional',19:'Retaliação Comercial',20:'Defesa Cibernética',21:'Contracampanha Cultural',22:'Solidariedade do Bloco',23:'Cláusula de Salvaguarda',
    24:'Capital Especulativo',25:'Investimento Estrangeiro Direto',26:'Plataforma Global',27:'Abertura Comercial',28:'Disputa de Influência'
  };

  let sb = null;
  let state = { session:null, room:null, me:null, players:[], match:null, privateStates:[], channel:null, busy:false };
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

  function showError(title, detail='') {
    screen.innerHTML = `
      <div class="card">
        <h2>${esc(title)}</h2>
        <div class="error-box">${esc(detail)}</div>
        <p class="muted small">Se precisar, copie esta mensagem e envie junto com uma captura da tela.</p>
      </div>`;
  }

  function rememberRoom(roomId){
    if(roomId) localStorage.setItem('gp_room_id',roomId);
    else localStorage.removeItem('gp_room_id');
  }

  async function api(action, payload={}) {
    const { data, error } = await sb.functions.invoke('game-api', {
      body: { action, ...payload }
    });

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

    if (!data?.ok)
      throw new Error(data?.detail || data?.error || 'Resposta inválida do servidor.');

    return data;
  }

  async function init() {
    try {
      if (
        !CONFIG.SUPABASE_URL ||
        !CONFIG.SUPABASE_PUBLISHABLE_KEY ||
        /SEU-PROJETO|COLE_AQUI/.test(CONFIG.SUPABASE_URL + CONFIG.SUPABASE_PUBLISHABLE_KEY)
      ) {
        setConn('Configuração pendente','bad');
        showError(
          'config.js ainda não está configurado',
          'Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no arquivo config.js publicado no mesmo diretório do index.html.'
        );
        return;
      }

      if (!window.supabase?.createClient) {
        setConn('Biblioteca indisponível','bad');
        showError(
          'Supabase JS não carregou',
          'Verifique sua conexão com a internet e se o navegador conseguiu carregar cdn.jsdelivr.net.'
        );
        return;
      }

      sb = window.supabase.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession:true,
            autoRefreshToken:true,
            detectSessionInUrl:false
          }
        }
      );

      setConn('Autenticando…');

      let { data:{ session }, error } = await sb.auth.getSession();
      if (error) throw error;

      if (!session) {
        const res = await sb.auth.signInAnonymously();
        if (res.error) throw res.error;
        session = res.data.session;
      }

      state.session = session;
      setConn('Conectado','ok');

      const savedRoom = localStorage.getItem('gp_room_id');
      if (savedRoom) {
        try {
          await loadRoom(savedRoom, true);
          return;
        } catch (e) {
          rememberRoom(null);
          console.warn('Não foi possível restaurar sala:',e);
        }
      }

      renderHome();

    } catch (e) {
      console.error(e);
      setConn('Falha de conexão','bad');
      showError('Não foi possível conectar ao Supabase', e?.message || String(e));
    }
  }

  function renderHome() {
    stopRoomWatch();
    state.room=null;
    state.me=null;
    state.players=[];
    state.match=null;
    state.privateStates=[];

    screen.innerHTML = `
      <div class="card hero">
        <div class="eyebrow">GeoPoder · Alpha 2.0a</div>
        <h2>Escolha como entrar</h2>
        <p class="muted">
          Esta etapa testa sala, quatro equipes, sincronização, mãos privadas,
          reconexão e telemetria.
        </p>
      </div>

      <div class="grid two" style="margin-top:16px">
        <section class="card role-card">
          <h3>🎓 Professor</h3>
          <p class="muted">
            Crie uma sala, acompanhe as quatro equipes e inicie a partida.
          </p>
          <div class="field">
            <label for="className">Turma (opcional)</label>
            <input id="className" maxlength="100" placeholder="Ex.: M4 Vespertino">
          </div>
          <div class="actions">
            <button class="btn primary" id="createRoom">Criar sala</button>
          </div>
        </section>

        <section class="card role-card">
          <h3>🌍 Equipe</h3>

          <div class="field">
            <label for="roomCode">Código da sala</label>
            <input id="roomCode" maxlength="8" placeholder="GEO-AB12" style="text-transform:uppercase">
          </div>

          <div class="field">
            <label for="teamName">Nome da equipe</label>
            <input id="teamName" maxlength="60" placeholder="Ex.: Os Globalizados">
          </div>

          <div class="field">
            <label for="country">País</label>
            <select id="country">
              ${COUNTRIES.map(c=>`<option>${c}</option>`).join('')}
            </select>
          </div>

          <div class="actions">
            <button class="btn good" id="joinRoom">Entrar na sala</button>
          </div>
        </section>
      </div>`;

    document.getElementById('createRoom').onclick = async () => {
      await withBusy(async()=>{
        const className=document.getElementById('className').value.trim();
        const data=await api('create_room',{className});
        rememberRoom(data.room.id);
        await loadRoom(data.room.id);
      });
    };

    document.getElementById('joinRoom').onclick = async () => {
      await withBusy(async()=>{
        const code=document.getElementById('roomCode').value.trim().toUpperCase();
        const teamName=document.getElementById('teamName').value.trim();
        const country=document.getElementById('country').value;

        if(!code||!teamName)
          throw new Error('Informe o código da sala e o nome da equipe.');

        const data=await api('join_room',{code,teamName,country});
        rememberRoom(data.room.id);
        await loadRoom(data.room.id);
      });
    };
  }

  async function withBusy(fn){
    if(state.busy) return;
    state.busy=true;

    try {
      await fn();
    } catch(e) {
      console.error(e);
      alert(e?.message || String(e));
    } finally {
      state.busy=false;
    }
  }

  async function loadRoom(roomId, restoring=false){
    const snap=await api('snapshot',{roomId});

    state.room=snap.room;
    state.me=snap.me;
    state.players=snap.players||[];
    state.match=snap.match||null;
    state.privateStates=snap.privateStates||[];

    rememberRoom(roomId);
    startRoomWatch(roomId);
    renderRoom();

    if(!restoring)
      window.scrollTo({top:0,behavior:'smooth'});
  }

  async function refreshSnapshot(){
    if(!state.room?.id) return;

    try {
      const snap=await api('snapshot',{roomId:state.room.id});

      state.room=snap.room;
      state.me=snap.me;
      state.players=snap.players||[];
      state.match=snap.match||null;
      state.privateStates=snap.privateStates||[];

      renderRoom();
    } catch(e) {
      console.warn('snapshot',e);
    }
  }

  function startRoomWatch(roomId){
    stopRoomWatch();

    state.channel=sb.channel(`gp-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event:'*',
          schema:'public',
          table:'gp_room_players',
          filter:`room_id=eq.${roomId}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event:'*',
          schema:'public',
          table:'gp_matches',
          filter:`room_id=eq.${roomId}`
        },
        debouncedRefresh
      )
      .subscribe(status=>{
        if(status==='SUBSCRIBED')
          setConn('Sincronizado','ok');
        else if(status==='CHANNEL_ERROR' || status==='TIMED_OUT')
          setConn('Realtime instável','bad');
      });

    heartbeatTimer=setInterval(
      ()=>api('heartbeat',{roomId}).catch(()=>{}),
      25000
    );
  }

  function stopRoomWatch(){
    if(state.channel&&sb){
      sb.removeChannel(state.channel);
      state.channel=null;
    }

    if(heartbeatTimer){
      clearInterval(heartbeatTimer);
      heartbeatTimer=null;
    }

    if(refreshTimer){
      clearTimeout(refreshTimer);
      refreshTimer=null;
    }
  }

  function debouncedRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refreshSnapshot,180);
  }

  function renderRoom(){
    if(!state.room||!state.me){
      renderHome();
      return;
    }

    const isTeacher=state.me.role==='teacher';

    if(state.match)
      renderMatch(isTeacher);
    else
      renderLobby(isTeacher);
  }

  function rosterByCountry(){
    const map={};

    for(const c of COUNTRIES)
      map[c]=state.players.find(
        p=>p.role==='player'&&p.country===c
      )||null;

    return map;
  }

  function renderLobby(isTeacher){
    const roster=rosterByCountry();
    const count=COUNTRIES.filter(c=>roster[c]).length;

    screen.innerHTML=`
      <section class="card">
        <div class="statusline">
          <span class="badge">Sala</span>
          <span class="badge">Lobby</span>
          ${state.room.class_name
            ? `<span class="badge">${esc(state.room.class_name)}</span>`
            : ''}
        </div>

        <div class="room-code">${esc(state.room.code)}</div>

        <div class="copyline">
          <span class="muted">Compartilhe este código com as quatro equipes.</span>
          <button class="btn ghost" id="copyCode">Copiar código</button>
          <button class="btn ghost right" id="leaveLocal">Sair desta tela</button>
        </div>
      </section>

      <section class="card" style="margin-top:16px">
        <div class="actions">
          <div>
            <h3 style="margin-bottom:4px">Equipes na sala</h3>
            <div class="muted small">${count}/4 países ocupados</div>
          </div>

          ${isTeacher
            ? `<button class="btn primary right" id="startMatch"
                ${count===4?'':'disabled'}>
                Iniciar partida
              </button>`
            : ''}
        </div>

        <div class="grid four" style="margin-top:16px">
          ${COUNTRIES.map(c=>seatHtml(c,roster[c])).join('')}
        </div>

        ${!isTeacher
          ? `<div class="banner ${count===4?'good':'warn'}" style="margin-top:16px">
              ${count===4
                ? 'As quatro equipes estão presentes. Aguarde o professor iniciar.'
                : 'Aguardando as demais equipes e o professor.'}
            </div>`
          : ''}
      </section>`;

    document.getElementById('copyCode').onclick=()=>{
      navigator.clipboard?.writeText(state.room.code).then(()=>{
        document.getElementById('copyCode').textContent='Copiado!';
        setTimeout(()=>{
          if(document.getElementById('copyCode'))
            document.getElementById('copyCode').textContent='Copiar código';
        },1200);
      });
    };

    document.getElementById('leaveLocal').onclick=()=>{
      rememberRoom(null);
      renderHome();
    };

    if(isTeacher&&count===4)
      document.getElementById('startMatch').onclick=()=>withBusy(async()=>{
        await api('start_match',{roomId:state.room.id});
        await refreshSnapshot();
      });
  }

  function seatHtml(country,p){
    return `
      <div class="seat country-${country} ${p?'occupied':''}">
        <strong>${esc(country)}</strong>
        ${p
          ? `<div>${esc(p.team_name||'Equipe')}</div>
             <small>Conectada à sala</small>`
          : `<div class="muted">Aguardando equipe…</div>`}
      </div>`;
  }

  function renderMatch(isTeacher){
    const pub=state.match.public_state||{};
    const countries=pub.countries||{};
    const meCountry=state.me.country;

    const ownPriv=
      state.privateStates.find(x=>x.player_id===state.me.id)
      || state.privateStates[0]
      || null;

    screen.innerHTML=`
      <section class="card">
        <div class="actions">
          <div>
            <div class="eyebrow">Sala ${esc(state.room.code)}</div>
            <h2 style="margin:.15rem 0">Partida iniciada</h2>
          </div>

          <div class="right statusline">
            <span class="badge">Rodada ${esc(state.match.round)}</span>
            <span class="badge">${esc(state.match.phase)}</span>
            ${pub.active_country
              ? `<span class="badge">Ativo: ${esc(pub.active_country)}</span>`
              : ''}
          </div>
        </div>

        <p class="muted small">
          Alpha 2.0a: esta tela valida o multiplayer e a privacidade das mãos.
        </p>
      </section>

      <section class="grid four" style="margin-top:16px">
        ${COUNTRIES.map(
          c=>countryHtml(c,countries[c]||{},c===meCountry)
        ).join('')}
      </section>

      ${isTeacher
        ? teacherHandsHtml()
        : playerHandHtml(ownPriv)}

      ${isTeacher
        ? teacherTelemetryHtml()
        : ''}
    `;

    if(isTeacher)
      bindTeacherTools();
  }

  function countryHtml(c,d,isMine){
    const total=
      (d.eco||0)+(d.net||0)+(d.dip||0)+(d.cult||0);

    return `
      <section class="card country-${c}">
        <div class="actions">
          <h3 style="margin:0">${esc(c)}</h3>
          ${isMine?'<span class="badge">Seu país</span>':''}
        </div>

        <div class="muted small">${esc(d.team_name||'')}</div>

        <div class="kpis">
          <div class="kpi"><b>${d.eco??0}</b><span>💰 Economia</span></div>
          <div class="kpi"><b>${d.net??0}</b><span>🌐 Redes</span></div>
          <div class="kpi"><b>${d.dip??0}</b><span>🤝 Diplomacia</span></div>
          <div class="kpi"><b>${d.cult??0}</b><span>🎭 Cultura</span></div>
        </div>

        <div class="separator"></div>

        <div class="actions">
          <span class="badge">Influência ${total}</span>
          <span class="badge">🃏 ${d.hand_count??0}</span>
          <span class="badge">🎓 ${d.advantages??0}</span>
        </div>
      </section>`;
  }

  function cardsHtml(hand){
    if(!Array.isArray(hand)||!hand.length)
      return '<p class="muted">Nenhuma carta.</p>';

    return `
      <div class="hand">
        ${hand.map(id=>`
          <article class="game-card">
            <div class="num">CARTA ${esc(id)}</div>
            <h4>${esc(CARD_NAMES[id]||`Carta ${id}`)}</h4>
            <p>O texto completo da carta será usado no motor da Alpha 2.0b.</p>
          </article>
        `).join('')}
      </div>`;
  }

  function playerHandHtml(priv){
    return `
      <section class="card" style="margin-top:16px">
        <div class="actions">
          <div>
            <div class="eyebrow">Informação privada</div>
            <h3 style="margin:.15rem 0">Sua mão</h3>
          </div>

          <span class="badge right">
            Somente sua equipe recebe estes dados
          </span>
        </div>

        ${cardsHtml(priv?.hand||[])}
      </section>`;
  }

  function teacherHandsHtml(){
    const roster=rosterByCountry();

    return `
      <section class="card" style="margin-top:16px">
        <div class="eyebrow">Visão do professor</div>
        <h3>Mãos privadas das equipes</h3>

        <div class="stack">
          ${COUNTRIES.map(c=>{
            const p=roster[c];
            const ps=state.privateStates.find(
              x=>x.player_id===p?.id
            );

            return `
              <div>
                <div class="actions">
                  <strong>${esc(c)}</strong>
                  <span class="muted small">${esc(p?.team_name||'')}</span>
                </div>
                ${cardsHtml(ps?.hand||[])}
              </div>`;
          }).join('<div class="separator"></div>')}
        </div>
      </section>`;
  }

  function teacherTelemetryHtml(){
    return `
      <section class="card" style="margin-top:16px">
        <div class="actions">
          <div>
            <div class="eyebrow">Playtest</div>
            <h3 style="margin:.15rem 0">Telemetria e notas</h3>
          </div>
        </div>

        <div class="grid two">
          <div>
            <div class="field">
              <label for="teacherNote">Nota de observação</label>
              <textarea
                id="teacherNote"
                placeholder="Ex.: Equipe Aurora demorou para compreender a tela inicial."
              ></textarea>
            </div>

            <button class="btn" id="saveNote">Salvar nota</button>
          </div>

          <div>
            <p class="muted small">
              Exporte os dados da sala para planilha, análise técnica
              ou para enviar ao ChatGPT.
            </p>

            <div class="actions">
              <button class="btn ghost" id="exportMd">Markdown</button>
              <button class="btn ghost" id="exportCsv">CSV</button>
              <button class="btn ghost" id="exportJson">JSON</button>
            </div>
          </div>
        </div>

        <div id="noteFeedback" style="margin-top:10px"></div>
      </section>`;
  }

  function bindTeacherTools(){
    const save=document.getElementById('saveNote');

    if(save)
      save.onclick=()=>withBusy(async()=>{
        const text=document.getElementById('teacherNote').value.trim();

        if(!text)
          throw new Error('Digite uma nota.');

        await api('telemetry_note',{
          roomId:state.room.id,
          matchId:state.match?.id||null,
          round:state.match?.round||null,
          text
        });

        document.getElementById('teacherNote').value='';
        document.getElementById('noteFeedback').innerHTML=
          '<div class="success-box">Nota salva na telemetria.</div>';
      });

    document.getElementById('exportMd')
      ?.addEventListener('click',()=>exportTelemetry('md'));

    document.getElementById('exportCsv')
      ?.addEventListener('click',()=>exportTelemetry('csv'));

    document.getElementById('exportJson')
      ?.addEventListener('click',()=>exportTelemetry('json'));
  }

  async function exportTelemetry(kind){
    await withBusy(async()=>{
      const {data,error}=await sb
        .from('gp_telemetry_events')
        .select('*')
        .eq('room_id',state.room.id)
        .order('created_at',{ascending:true});

      if(error) throw error;

      const rows=data||[];
      const stamp=new Date().toISOString().slice(0,10);

      if(kind==='json') {
        download(
          `GeoPoder_${state.room.code}_${stamp}.json`,
          JSON.stringify({
            room:state.room,
            players:state.players,
            match:state.match,
            events:rows
          },null,2),
          'application/json'
        );
      }

      if(kind==='csv') {
        const head=[
          'id',
          'created_at',
          'event_type',
          'actor_country',
          'round',
          'payload'
        ];

        const csv=[
          head.join(','),
          ...rows.map(r=>[
            r.id,
            r.created_at,
            r.event_type,
            r.actor_country||'',
            r.round??'',
            JSON.stringify(r.payload||{})
          ].map(csvCell).join(','))
        ].join('\n');

        download(
          `GeoPoder_${state.room.code}_${stamp}.csv`,
          csv,
          'text/csv;charset=utf-8'
        );
      }

      if(kind==='md') {
        const players=state.players.filter(p=>p.role==='player');

        const counts={};
        rows.forEach(r=>{
          counts[r.event_type]=(counts[r.event_type]||0)+1;
        });

        let md=
`# GeoPoder — Relatório de Playtest

- **Sala:** ${state.room.code}
- **Turma:** ${state.room.class_name||'—'}
- **Data:** ${stamp}
- **Status:** ${state.room.status}

## Equipes
`;

        for(const p of players)
          md+=`- **${p.country}:** ${p.team_name}\n`;

        md+='\n## Eventos registrados\n';

        for(const [k,v] of Object.entries(counts))
          md+=`- ${k}: ${v}\n`;

        const notes=rows.filter(
          r=>r.event_type==='TEACHER_NOTE'
        );

        if(notes.length){
          md+='\n## Notas do professor\n';

          notes.forEach(n=>{
            md+=`- ${n.payload?.text||''}\n`;
          });
        }

        md+=
          '\n## Telemetria bruta\n\n```json\n'
          +JSON.stringify(rows,null,2)
          +'\n```\n';

        download(
          `GeoPoder_${state.room.code}_${stamp}.md`,
          md,
          'text/markdown;charset=utf-8'
        );
      }
    });
  }

  function csvCell(v){
    const s=String(v??'');
    return /[",\n]/.test(s)
      ? `"${s.replace(/"/g,'""')}"`
      : s;
  }

  function download(name,text,type){
    const blob=new Blob([text],{type});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');

    a.href=url;
    a.download=name;

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  window.addEventListener(
    'online',
    ()=>setConn('Conectado','ok')
  );

  window.addEventListener(
    'offline',
    ()=>setConn('Sem internet','bad')
  );

  init();
})();
