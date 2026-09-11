import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const COUNTRIES = ['Aurora', 'Montária', 'Pacífica', 'Solária'] as const
const INITIALS: Record<string, { eco:number; net:number; dip:number; cult:number }> = {
  'Aurora':   { eco:2, net:3, dip:0, cult:2 },
  'Montária': { eco:3, net:2, dip:2, cult:0 },
  'Pacífica': { eco:2, net:0, dip:3, cult:2 },
  'Solária':  { eco:0, net:2, dip:2, cult:3 },
}
const ACTION_IDS = Array.from({ length: 28 }, (_, i) => i + 1)
const EVENT_KIND: Record<number,'Adverso'|'Crise'|'Oportunidade'> = {
  1:'Adverso',2:'Adverso',3:'Adverso',4:'Adverso',5:'Adverso',6:'Adverso',7:'Adverso',8:'Adverso',9:'Adverso',10:'Adverso',
  11:'Crise',12:'Crise',13:'Oportunidade',14:'Oportunidade',15:'Oportunidade',16:'Oportunidade'
}
const CHALLENGE_IDS = Array.from({ length: 12 }, (_, i) => i + 1)

function json(body: unknown, status=200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type':'application/json; charset=utf-8' } })
}
function shuffle<T>(input:T[]):T[] {
  const a=[...input]
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] }
  return a
}
function parseKeyMap(name:string, fallbackName:string):string {
  const raw=Deno.env.get(name)
  if(raw){
    try { const m=JSON.parse(raw); if(m?.default) return m.default } catch { /* fallback below */ }
  }
  const fallback=Deno.env.get(fallbackName)
  if(!fallback) throw new Error(`Missing ${name}/${fallbackName}`)
  return fallback
}
function randomCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s='GEO-'
  for(let i=0;i<4;i++) s+=chars[Math.floor(Math.random()*chars.length)]
  return s
}

Deno.serve(async (req:Request) => {
  if(req.method==='OPTIONS') return new Response('ok',{headers:CORS})
  if(req.method!=='POST') return json({error:'method_not_allowed'},405)

  try{
    const url=Deno.env.get('SUPABASE_URL')!
    const secret=parseKeyMap('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY')
    const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}})

    const authHeader=req.headers.get('Authorization')||''
    const token=authHeader.replace(/^Bearer\s+/i,'').trim()
    if(!token) return json({error:'missing_authorization'},401)
    const {data:userData,error:userErr}=await admin.auth.getUser(token)
    if(userErr||!userData.user) return json({error:'invalid_session',detail:userErr?.message},401)
    const uid=userData.user.id

    const body=await req.json().catch(()=>({}))
    const action=String(body.action||'')

    async function membership(roomId:string){
      const {data,error}=await admin.from('gp_room_players').select('*').eq('room_id',roomId).eq('user_id',uid).maybeSingle()
      if(error) throw error
      return data
    }
    async function requireTeacher(roomId:string){
      const me=await membership(roomId)
      if(!me||me.role!=='teacher') throw new Error('teacher_required')
      return me
    }
    async function telemetry(roomId:string,matchId:string|null,eventType:string,payload:any={},actor:any=null,round:number|null=null){
      await admin.from('gp_telemetry_events').insert({
        room_id:roomId, match_id:matchId, actor_player_id:actor?.id||null,
        actor_country:actor?.country||null, event_type:eventType, round, payload
      })
    }

    if(action==='create_room'){
      const className=String(body.className||'').trim().slice(0,100) || null
      let room:any=null
      for(let attempt=0;attempt<12;attempt++){
        const code=randomCode()
        const {data,error}=await admin.from('gp_rooms').insert({code,teacher_user_id:uid,class_name:className}).select('*').single()
        if(!error){ room=data; break }
        if(error.code!=='23505') throw error
      }
      if(!room) throw new Error('room_code_generation_failed')
      const {data:teacher,error:pErr}=await admin.from('gp_room_players').insert({room_id:room.id,user_id:uid,role:'teacher',team_name:'Professor'}).select('*').single()
      if(pErr) throw pErr
      await telemetry(room.id,null,'ROOM_CREATED',{code:room.code,class_name:className},teacher)
      return json({ok:true,room,participant:teacher})
    }

    if(action==='join_room'){
      const code=String(body.code||'').trim().toUpperCase()
      const teamName=String(body.teamName||'').trim().slice(0,60)
      const country=String(body.country||'')
      if(!code||!teamName||!COUNTRIES.includes(country as any)) return json({error:'invalid_join_data'},400)
      const {data:room,error:rErr}=await admin.from('gp_rooms').select('*').eq('code',code).maybeSingle()
      if(rErr) throw rErr
      if(!room) return json({error:'room_not_found'},404)
      if(room.status!=='lobby') return json({error:'room_not_in_lobby'},409)

      const {data:existing}=await admin.from('gp_room_players').select('*').eq('room_id',room.id).eq('user_id',uid).maybeSingle()
      if(existing){
        return json({ok:true,room,participant:existing,reconnected:true})
      }
      const {data:seat}=await admin.from('gp_room_players').select('id,team_name,country').eq('room_id',room.id).eq('country',country).maybeSingle()
      if(seat) return json({error:'country_taken',country,team_name:seat.team_name},409)
      const {data:player,error:pErr}=await admin.from('gp_room_players').insert({room_id:room.id,user_id:uid,role:'player',team_name:teamName,country}).select('*').single()
      if(pErr) throw pErr
      await telemetry(room.id,null,'PLAYER_JOINED',{team_name:teamName,country},player)
      return json({ok:true,room,participant:player})
    }

    if(action==='heartbeat'){
      const roomId=String(body.roomId||'')
      const me=await membership(roomId)
      if(!me) return json({error:'not_in_room'},403)
      await admin.from('gp_room_players').update({last_seen_at:new Date().toISOString()}).eq('id',me.id)
      return json({ok:true})
    }

    if(action==='snapshot'){
      const roomId=String(body.roomId||'')
      const me=await membership(roomId)
      if(!me) return json({error:'not_in_room'},403)
      const [{data:room,error:rErr},{data:players,error:pErr},{data:match,error:mErr}]=await Promise.all([
        admin.from('gp_rooms').select('*').eq('id',roomId).single(),
        admin.from('gp_room_players').select('*').eq('room_id',roomId).order('joined_at'),
        admin.from('gp_matches').select('*').eq('room_id',roomId).maybeSingle()
      ])
      if(rErr) throw rErr; if(pErr) throw pErr; if(mErr) throw mErr
      let privateStates:any[]=[]
      if(match){
        if(me.role==='teacher'){
          const {data,error}=await admin.from('gp_player_private_state').select('*').eq('match_id',match.id)
          if(error) throw error; privateStates=data||[]
        } else {
          const {data,error}=await admin.from('gp_player_private_state').select('*').eq('match_id',match.id).eq('player_id',me.id)
          if(error) throw error; privateStates=data||[]
        }
      }
      return json({ok:true,me,room,players:players||[],match,privateStates})
    }

    if(action==='start_match'){
      const roomId=String(body.roomId||'')
      const teacher=await requireTeacher(roomId)
      const {data:room,error:rErr}=await admin.from('gp_rooms').select('*').eq('id',roomId).single()
      if(rErr) throw rErr
      const {data:existing}=await admin.from('gp_matches').select('*').eq('room_id',roomId).maybeSingle()
      if(existing) return json({ok:true,match:existing,already_started:true})
      const {data:players,error:pErr}=await admin.from('gp_room_players').select('*').eq('room_id',roomId).eq('role','player')
      if(pErr) throw pErr
      if(!players||players.length!==4) return json({error:'four_players_required',count:players?.length||0},409)
      const occupied=new Set(players.map(p=>p.country))
      if(COUNTRIES.some(c=>!occupied.has(c))) return json({error:'all_four_countries_required'},409)

      let actionDeck=shuffle(ACTION_IDS)
      const hands:Record<string,number[]>={}
      for(const c of COUNTRIES){ hands[c]=[actionDeck.shift()!,actionDeck.shift()!] }
      const adverse=shuffle(Object.keys(EVENT_KIND).map(Number).filter(id=>EVENT_KIND[id]==='Adverso')).slice(0,5)
      const crisis=shuffle(Object.keys(EVENT_KIND).map(Number).filter(id=>EVENT_KIND[id]==='Crise')).slice(0,1)
      const opportunity=shuffle(Object.keys(EVENT_KIND).map(Number).filter(id=>EVENT_KIND[id]==='Oportunidade')).slice(0,2)
      const eventDeck=shuffle([...adverse,...crisis,...opportunity])
      const challengeDeck=shuffle(CHALLENGE_IDS).slice(0,4)
      const firstIndex=Math.floor(Math.random()*4)
      const turnOrder=[0,1,2,3].map(i=>COUNTRIES[(firstIndex+i)%4])
      const countries:any={}
      for(const c of COUNTRIES){
        const p=players.find(x=>x.country===c)!
        countries[c]={...INITIALS[c],team_name:p.team_name,hand_count:hands[c].length,advantages:0}
      }
      const serverState={
        version:1,round:1,phase:'event_ready',active_country:turnOrder[0],first_index:firstIndex,turn_order:turnOrder,turn_pos:0,
        countries,relations:{},action_deck:actionDeck,discard:[],event_deck:eventDeck,challenge_deck:challengeDeck,
        current_event:null,current_challenge:null,pending:null,turn_deadline:null,log:[]
      }
      const publicState={
        round:1,phase:'event_ready',active_country:turnOrder[0],turn_order:turnOrder,countries,relations:{},current_event:null,
        current_challenge:null,pending_public:null,turn_deadline:null,started:true
      }
      const {data:match,error:mErr}=await admin.from('gp_matches').insert({room_id:roomId,status:'active',round:1,phase:'event_ready',active_country:turnOrder[0],public_state:publicState}).select('*').single()
      if(mErr) throw mErr
      const {error:sErr}=await admin.from('gp_server_match_state').insert({match_id:match.id,state:serverState})
      if(sErr) throw sErr
      const privRows=players.map(p=>({match_id:match.id,player_id:p.id,country:p.country,hand:hands[p.country],advantages:0}))
      const {error:psErr}=await admin.from('gp_player_private_state').insert(privRows)
      if(psErr) throw psErr
      await admin.from('gp_rooms').update({status:'active',started_at:new Date().toISOString()}).eq('id',roomId)
      await telemetry(roomId,match.id,'MATCH_STARTED',{first_country:turnOrder[0],turn_order:turnOrder,event_deck:eventDeck,challenge_deck:challengeDeck},teacher,1)
      for(const p of players){
        for(const cardId of hands[p.country]) await telemetry(roomId,match.id,'CARD_DRAWN',{card_id:cardId,source:'initial_hand'},p,1)
      }
      return json({ok:true,match})
    }

    if(action==='telemetry_note'){
      const roomId=String(body.roomId||'')
      const me=await membership(roomId)
      if(!me) return json({error:'not_in_room'},403)
      if(me.role!=='teacher') return json({error:'teacher_required'},403)
      const matchId=body.matchId?String(body.matchId):null
      await telemetry(roomId,matchId,'TEACHER_NOTE',{text:String(body.text||'').slice(0,1000)},me,body.round??null)
      return json({ok:true})
    }

    return json({error:'unknown_action',action},400)
  }catch(err){
    console.error(err)
    const message=err instanceof Error?err.message:String(err)
    const status=message==='teacher_required'?403:500
    return json({error:'server_error',detail:message},status)
  }
})
