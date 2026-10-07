'use strict';
const education={session:null,details:null,busy:false,connecting:false,lastPhase:null};
const ordinaryRoster=configureRoster;
configureRoster=function(members){if(!net.session?.classroom)return ordinaryRoster(members);
  const capacity=net.session.capacity||10;game.entities=game.entities.filter(e=>e.type!=='hero');
  for(let slot=0;slot<capacity;slot++){const team=slot%2,position=Object.keys(POSITIONS)[Math.floor(slot/2)%5],m=members.find(m=>m.roomSlot===slot),def=m?HEROES.find(h=>h.id===m.hero):botHero(position,slot),e=hero(team,laneFor(position),def,m?.id===net.session.playerId);applyLoadout(e,'power','guard',position);e.roomSlot=slot;if(capacity===50){const row=Math.floor(slot/10),sign=team===0?1:-1;e.x+=row*28*sign;e.y+=(row-2)*23;safeLanding(e);}if(m){e.clientId=m.id;e.clientName=m.name;e.remoteHuman=!e.player;e.lastCommand=0;e.control={move:{x:0,y:0},attack:false};}if(e.player)game.player=e;game.entities.push(e);}
  if(capacity===50)for(const e of game.entities.filter(e=>['tower','base','monster'].includes(e.type))){e.maxHp*=3;e.hp*=3;e.damage*=1.3;}
  game.education=true;game.capacity=capacity;$('modeLabel').textContent='ห้องเรียน · '+(capacity===50?'25 ต่อ 25':'5 ต่อ 5');chooseHero(game.player.def.id);$('position').value=game.player.position;setTeamLabels();
};
const ordinaryApi=requestApi;
requestApi=async function(path,method='GET',value,session=net.session){if(!session?.classroom)return ordinaryApi(path,method,value,session);let action=path.split('/').at(-1);action=action===session.code?'match':action==='start'?'match-start':action==='state'?'match-state':action;return lessonRequest(`classes/${session.code}/${action}`,method,value,session.token);};
async function lessonRequest(path,method='GET',value,token=education.session?.token){const headers={};if(token)headers.authorization='Bearer '+token;if(value!==undefined)headers['content-type']='application/json';const r=await fetch('/api/'+path,{method,headers,body:value===undefined?undefined:JSON.stringify(value),signal:AbortSignal.timeout(10000)});const d=await r.json();if(!r.ok)throw Object.assign(Error(d.error||'เชื่อมต่อห้องเรียนไม่สำเร็จ'),{status:r.status});return d;}
const ordinaryRemember=rememberRoom;
rememberRoom=function(){if(!net.session?.classroom)return ordinaryRemember();};
const ordinarySnapshot=acceptSnapshot;
acceptSnapshot=function(state){ordinarySnapshot(state);if(net.session?.classroom&&game){if(selected.id!==game.player.def.id)chooseHero(game.player.def.id);$('position').value=game.player.position;$('modeLabel').textContent='ห้องเรียน · '+(net.session.capacity===50?'25 ต่อ 25':'5 ต่อ 5');}};
const ordinaryRoomPoll=pollRoom;
pollRoom=async function(){if(!net.session?.classroom)return ordinaryRoomPoll();if(net.busy||education.connecting)return;const session=net.session;net.busy=true;try{
  const input={...localInput(),active:!document.hidden};const state=session.host&&game&&!document.hidden?serializeMatch():undefined;
  const data=await lessonRequest(`classes/${session.code}/frame`,'POST',{input,state},session.token);if(net.session!==session)return;const wasHost=session.host;session.host=data.host;session.capacity=data.capacity;education.details={...education.details,...data.classroom};
  if(data.state&&(!session.host||!wasHost)){acceptSnapshot(data.state);if(session.host)for(const e of game.entities.filter(e=>e.remoteHuman))e.control={move:{x:0,y:0},attack:false};}
  if(session.host&&game)applyRemoteInputs(data.members);net.lastSuccess=Date.now();net.lastRevision=data.revision;
  if(game){game.paused=data.classroom.phase!=='play'||data.classroom.paused;game.education=true;game.capacity=data.capacity;}
  $('connectionBadge').textContent='ห้องเรียน '+session.code+' · สนาม '+(session.arena+1);window.riftLessonChanged?.(data.classroom);
}catch(e){$('connectionBadge').textContent='กำลังเชื่อมต่อห้องเรียนใหม่';if(e.status!==409)window.riftLessonError?.(e.message);}finally{net.busy=false;}};
const ordinaryPause=pause;
pause=function(value){if(!net.session?.classroom)return ordinaryPause(value);net.localPause=value;keys.clear();joystick={x:0,y:0};$('joystick').firstElementChild.style.transform='';$('pauseOverlay').hidden=!value;$('pauseMessage').textContent='คุณพักอยู่ · ครูเป็นผู้ควบคุมช่วงกิจกรรมของทั้งห้อง';};
const ordinaryUpdate=update;
update=function(dt){if(game&&net.session?.classroom&&education.details){game.paused=education.details.phase!=='play'||education.details.paused;if(document.body.classList.contains('education-open')){keys.clear();joystick={x:0,y:0};}}return ordinaryUpdate(dt);};
const ordinaryInput=localInput;
localInput=function(){const input=ordinaryInput();if(net.session?.classroom&&document.body.classList.contains('education-open')){input.move={x:0,y:0};input.attack=false;}return input;};
const ordinaryControlsBlocked=controlsBlocked;
controlsBlocked=function(){return ordinaryControlsBlocked()||net.session?.classroom&&document.body.classList.contains('education-open');};
async function connectClassMatch(){if(!education.session||education.connecting||net.session?.classroom)return;education.connecting=true;try{
  const s=education.session,data=await lessonRequest(`classes/${s.code}/match`);net.mode='online';net.session={...s,host:data.host,classroom:true,capacity:data.capacity};net.seq=Math.max(net.seq,data.playerSeq||0);net.pending=[];net.localPause=false;net.commandId=0;
  try{sessionStorage.removeItem(ROOM_STORAGE);}catch{}
  if(data.state){acceptSnapshot(data.state);net.commandId=Math.max(0,data.state.ack?.[s.playerId]||0);}else if(data.host){originals.start();configureRoster(data.members);await lessonRequest(`classes/${s.code}/match-start`,'POST',{state:serializeMatch()});}
  education.details={...education.details,...data.classroom};if(game){game.education=true;game.capacity=data.capacity;}net.lastPoll=0;$('connectionBadge').hidden=false;
}catch(e){window.riftLessonError?.(e.message);net.session=null;}finally{education.connecting=false;}}
function detachClassMatch(){if(net.session?.classroom){net.session=null;net.pending=[];net.localPause=false;originals.lobby();}}

const ordinaryResult=showResult;showResult=function(){if(!net.session?.classroom)return ordinaryResult();keys.clear();$('result').hidden=true;window.riftOpenLesson?.();};
for(const id of ['exitBtn','againBtn']){const previous=$(id).onclick;$(id).onclick=()=>{if(net.session?.classroom){pause(false);window.riftOpenLesson?.();}else previous?.();};}
