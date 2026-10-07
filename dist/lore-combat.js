'use strict';
const loreIds=new Set(LORE_HEROES.map(h=>h.id));
Object.assign(championTint,{ilumia:'#ffe79c',lauriel:'#f6d9ff',liliana:'#9bcfff',nakroth:'#ff5b79',telannas:'#be8bff',volkath:'#e664ef'});
const beforeLoreInfo=skillInfo;
skillInfo=function(p,k){if(!loreIds.has(p.def.id))return beforeLoreInfo(p,k);const direction=(range,radius=30)=>({mode:'direction',range,radius}),self=radius=>({mode:'self',range:0,radius}),area=(range,radius)=>({mode:'area',range,radius});switch(p.def.id){
  case 'ilumia':return k==='q'?direction(520,40):self(k==='w'?160:0);
  case 'lauriel':return k==='q'?direction(430,45):k==='w'?direction(190):self(230);
  case 'liliana':return k==='e'?direction(200):k==='q'?(p.foxForm?self(150):area(440,105)):direction(p.foxForm?220:500);
  case 'nakroth':return k==='q'?area(220,100):k==='w'?direction(180):direction(180,110);
  case 'telannas':return k==='q'?self(0):direction(k==='w'?580:700,35);
  case 'volkath':return k==='w'?direction(480):self(k==='q'?170:180);
}};
function loreQueue(p,delay,event){game.loreEvents ||= [];game.loreEvents.push({source:p.id,at:game.time+delay,...event});if(event.line)effects.push({type:'breathWarning',x:event.x,y:event.y,tx:event.tx,ty:event.ty,radius:event.radius,color:championTint[p.def.id],life:delay,max:delay});if(event.kind==='homing'){const t=game.entities.find(e=>e.id===event.target);if(t)effects.push({type:'bolt',x:p.x,y:p.y,tx:t.x,ty:t.y,color:championTint[p.def.id],life:delay,max:delay});}}
function loreTargets(p,at,radius){return game.entities.filter(t=>!t.dead&&t.team!==p.team&&!['tower','base'].includes(t.type)&&distance(t,at)<radius+t.radius);}
function loreHit(p,t,amount,status={}){if(t.dead)return;damage(t,amount*p.spell,p);if(status.stun&&t.type==='hero')stun(t,status.stun);if(status.slow)t.slow=Math.max(t.slow||0,status.slow);if(status.push){const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1;t.x+=dx/d*status.push;t.y+=dy/d*status.push;safeLanding(t);}if(p.def.id==='nakroth'){p.attackBoost=2;}if(p.def.id==='lauriel'&&!t.dead){t.laurielMarks ||= {};const mark=t.laurielMarks[p.id];const stacks=mark&&mark.until>game.time?mark.stacks+1:1;t.laurielMarks[p.id]={stacks,until:game.time+5};if(stacks===4){delete t.laurielMarks[p.id];heal(p,110);for(const other of loreTargets(p,t,95)){damage(other,(90+p.level*10)/(other.enchant==='guard'?.92:1),p);other.slow=Math.max(other.slow||0,1);}championRing(p,t,95);}}}
function loreResolve(p,event){let targets;if(event.line){targets=loreTargets(p,p,1700).filter(t=>segmentDistance(t,event,{x:event.tx,y:event.ty})<=event.radius+t.radius).sort((a,b)=>distance(a,event)-distance(b,event));if(event.firstOnly)targets=targets.slice(0,1);}else targets=loreTargets(p,event.follow?p:event,event.radius);
  for(const t of targets){loreHit(p,t,event.amount,event);if(event.volkathMark&&!t.dead){p.clawTarget=t.id;p.clawUntil=game.time+5;p.clawReadyAt=game.time+9*(1-Math.min(.6,p.cdr));p.cd.w=.15;}if(event.reiko&&t.type==='hero'&&!t.dead){p.reikoTarget=t.id;p.reikoUntil=game.time+3;p.reikoReadyAt=game.time+9;p.cd.w=.2;}}
  if(event.line)effects.push({type:'breath',x:event.x,y:event.y,tx:event.tx,ty:event.ty,radius:event.radius,color:championTint[p.def.id],life:.35,max:.35});else championRing(p,event.follow?p:event,event.radius,.4);if(event.burst&&targets[0])championRing(p,targets[0],event.burst,.4);return targets;
}
function loreArea(p,at,radius,amount,extra={}){return loreResolve(p,{x:at.x,y:at.y,radius,amount,...extra});}
function loreLine(p,aim,range,amount,extra={}){const dx=aim.x-p.x,dy=aim.y-p.y,d=Math.hypot(dx,dy)||1;return {x:p.x,y:p.y,tx:p.x+dx/d*range,ty:p.y+dy/d*range,line:true,radius:30,amount,...extra};}
function loreDismount(p){p.mounted=0;p.immortal=3.5;p.haste=1.3;p.hasteTime=3.5;p.rage=3.5;p.immortalHeal=true;p.cd.e=Math.max(0,p.mountReadyAt-game.time);loreArea(p,p,180,210,{push:65});setAction(p,'ultimate',p.facing?{x:p.x+p.facing.x,y:p.y+p.facing.y}:home(1-p.team));}
const beforeLoreSkill=useSkill;
useSkill=function(key,actor=null,aim=null){const p=actor||game?.player;if(!p||!loreIds.has(p.def.id))return beforeLoreSkill(key,actor,aim);if(!game||game.paused||game.finished||p.dead||!['q','w','e'].includes(key)||p.cd[key]>0||p.silence>0||p.channel>0||p.stun>0&&!(p.def.id==='volkath'&&key==='e'))return false;
  const recast=p.def.id==='nakroth'&&key==='q'&&p.jurySecond||p.def.id==='volkath'&&(key==='w'&&p.clawTarget||key==='e'&&p.mounted>0)||p.def.id==='liliana'&&key==='w'&&p.foxForm&&p.reikoTarget;
  const cost=recast?0:key==='e'?(p.def.id==='liliana'?35:90):key==='w'?35:45;if((p.mana??400)<cost)return false;
  aim=aim&&Number.isFinite(aim.x)&&Number.isFinite(aim.y)?aim:aimFor(p,skillInfo(p,key).range||400);const at=limitAim(p,aim,skillInfo(p,key).range||400);let cd=key==='e'?24:key==='w'?9:6;setAction(p,key==='e'?'ultimate':'spell',aim);
  switch(p.def.id){
    case 'ilumia':
      if(key==='q'){const powered=p.divineUntil>game.time;p.divineUntil=0;loreQueue(p,.3,loreLine(p,aim,520,powered?300:150,{radius:40,firstOnly:true,stun:powered?.8:0,burst:70}));}
      if(key==='w')loreArea(p,p,160,120,{push:85,slow:1});
      if(key==='e'){for(const t of game.entities.filter(t=>t.type==='hero'&&!t.dead&&t.team!==p.team)){loreQueue(p,.9,{x:t.x,y:t.y,radius:80,amount:270,stun:1});effects.push({type:'telegraph',x:t.x,y:t.y,radius:80,color:championTint.ilumia,life:.9,max:.9});}cd=30;}
      p.divineCasts=(p.divineCasts||0)+1;if(p.divineCasts>=2){p.divineCasts=0;p.divineUntil=game.time+3;p.cd.q=0;if(key==='q')cd=0;}break;
    case 'lauriel':
      if(key==='q'){const beam=loreLine(p,aim,430,105,{radius:45});loreQueue(p,.12,beam);loreQueue(p,.55,beam);}
      if(key==='w'){championDash(p,aim,190);setAction(p,'dash',aim);const target=enemies(p,270,true).find(t=>!['tower','base'].includes(t.type));if(target){for(let i=0;i<3;i++)loreQueue(p,.08+i*.12,{kind:'homing',target:target.id,amount:60,radius:0,blinkRefund:i===0});}cd=9;}
      if(key==='e'){p.smite={x:p.x,y:p.y,until:game.time+8};loreArea(p,p,230,160);championRing(p,p,230,8);}break;
    case 'liliana':
      if(key==='q'){if(p.foxForm){loreArea(p,p,150,145);p.foxHitUntil=game.time+3;}else {const hit=loreArea(p,at,105,175);if(hit.filter(t=>t.type==='hero').length>=2)p.lilianaBuffUntil=game.time+3;}}
      if(key==='w'){if(!p.foxForm){championProjectile(p,aim,{range:500,damage:155,stun:1,splash:65});}else if(p.reikoTarget){const t=game.entities.find(t=>t.id===p.reikoTarget&&!t.dead);if(!t)return false;loreQueue(p,Math.min(1,distance(p,t)/400),{kind:'homing',target:t.id,amount:260,radius:100});p.reikoTarget=null;cd=Math.max(0,p.reikoReadyAt-game.time);}else {const path=loreLine(p,aim,Math.min(220,distance(p,aim)),140,{radius:40,reiko:true});championDash(p,aim,220);loreResolve(p,path);setAction(p,'dash',aim);if(p.reikoTarget)cd=.2;}}
      if(key==='e'){championDash(p,aim,200);loreArea(p,p,100,120,{slow:2});p.foxForm=!p.foxForm;p.range+=p.foxForm?-135:135;p.speed+=p.foxForm?30:-30;p.reikoTarget=null;p.cd.q=p.cd.w=0;cd=5;setAction(p,'dash',aim);}break;
    case 'nakroth':
      if(key==='q'){const second=p.jurySecond;championJump(p,at,220);loreArea(p,p,100,150,{stun:second?0:.65});if(second){p.jurySecond=false;cd=Math.max(0,p.juryReadyAt-game.time);}else {p.jurySecond=true;p.juryUntil=game.time+5;p.juryReadyAt=game.time+9;cd=.2;}}
      if(key==='w'){championDash(p,aim,180,true);p.sweepUntil=game.time+3;setAction(p,'dash',aim);}
      if(key==='e'){p.unstoppable=1.2;p.channel=1.1;const beam=loreLine(p,aim,180,95,{radius:90});for(let i=0;i<4;i++)loreQueue(p,.1+i*.25,{...beam,stun:i===3?.8:0});}break;
    case 'telannas':
      if(key==='q'){p.eagleUntil=game.time+3;if(!p.eagleActive){p.range+=80;p.eagleActive=true;}}
      if(key==='w'){loreQueue(p,.18,loreLine(p,aim,580,140,{slow:2}));p.haste=1.25;p.hasteTime=2;}
      if(key==='e'){const beam=loreLine(p,aim,700,240,{stun:1.2,push:75});loreQueue(p,.6,beam);effects.push({type:'breathWarning',...beam,color:championTint.telannas,life:.6,max:.6});p.haste=1.3;p.hasteTime=2;}break;
    case 'volkath':
      if(key==='q'){for(const t of loreTargets(p,p,170)){const powered=t.doom?.source===p.id&&t.doom.until>game.time&&t.doom.stacks>=3;loreHit(p,t,powered?280:200,{stun:powered?1:0});}championRing(p,p,170);}
      if(key==='w'){if(p.clawTarget){const t=game.entities.find(t=>t.id===p.clawTarget&&!t.dead);if(!t||game.time>p.clawUntil||distance(p,t)>700){p.clawTarget=null;p.cd.w=Math.max(0,p.clawReadyAt-game.time);return false;}championDash(p,t,700);loreHit(p,t,200+(t.maxHp-t.hp)*.16);cd=t.dead?0:Math.max(0,p.clawReadyAt-game.time);p.clawTarget=null;setAction(p,'dash',aim);}else loreQueue(p,.25,loreLine(p,aim,480,140,{firstOnly:true,volkathMark:true,slow:2}));}
      if(key==='e'){if(p.mounted>0){loreDismount(p);cd=p.cd.e;}else {p.stun=p.slow=p.silence=0;p.mounted=8;p.mountReadyAt=game.time+28*(1-Math.min(.6,p.cdr));p.haste=1.35;p.hasteTime=8;cd=.3;}}break;
  }
  p.mana=(p.mana??400)-cost;p.cd[key]=recast?cd:cd*(1-Math.min(.6,p.cdr));p.recall=0;if(p.player){tone(key==='e'?240:620,.1);syncHud();}return true;
};
const beforeLoreDamage=damage;
damage=function(t,amount,p){if(t.foxForm)amount*=.88;if(t.mounted>0)amount*=.95;if(t.immortal>0)amount=Math.min(amount,Math.max(0,(t.hp+(t.shield||0)-1)/1.08));const hp=t.hp,shield=t.shield||0;beforeLoreDamage(t,amount,p);if(t.dead||!(hp>t.hp||shield>(t.shield||0))||p.def?.id!=='volkath'||['tower','base'].includes(t.type))return;
  const old=t.doom;t.doom={source:p.id,stacks:old?.source===p.id&&old.until>game.time?old.stacks+1:1,until:game.time+5};if(t.doom.stacks>=4){t.doom=null;beforeLoreDamage(t,t.immortal>0?Math.min(120+p.level*8,Math.max(0,(t.hp+(t.shield||0)-1)/1.08)):120+p.level*8,p);if(!(p.doomShieldUntil>game.time)){p.shield=(p.shield||0)+180;p.shieldTime=3;p.doomShieldUntil=game.time+8;}championRing(p,t,70);}
};
const beforeLoreStrike=strike;
strike=function(p,t){const count=game?.strikes?.length||0;beforeLoreStrike(p,t);const hit=game?.strikes?.[count];if(!hit||hit.source!==p.id)return;
  if(p.def.id==='nakroth'){p.judgeHits=((p.judgeHits||0)+1)%4;hit.loreStun=p.judgeHits===0?.5:0;if(p.attackBoost>0)p.attack*=.66;if(p.sweepUntil>game.time){hit.amount+=90;hit.splash=100;p.sweepUntil=0;}}
  if(p.def.id==='telannas'){if(game.entities.some(a=>a.id!==p.id&&a.type==='hero'&&a.team===p.team&&!a.dead&&distance(p,a)<250))hit.amount*=1.1;if(p.eagleActive){p.attack*=.6;hit.amount+=35;}hit.loreSlow=1;}
  if(p.def.id==='liliana'){if(p.foxHitUntil>game.time){hit.amount+=120;hit.splash=70;p.foxHitUntil=0;}if(p.lilianaBuffUntil>game.time)hit.amount+=t.maxHp*.02;}
  if(p.mounted>0)hit.splash=110;
};
const beforeLoreVisible=visibleToTeam;
visibleToTeam=function(e,team){return beforeLoreVisible(e,team)||e.type==='hero'&&game.entities.some(p=>p.team===team&&p.clawTarget===e.id&&p.clawUntil>game.time);};
const beforeLoreUpdate=update;
update=function(dt){if(!game||game.paused||game.finished)return beforeLoreUpdate(dt);
  for(const p of game.entities.filter(e=>e.type==='hero')){
    if(p.dead){if(p.jurySecond)p.cd.q=Math.max(0,p.juryReadyAt-game.time);if(p.clawTarget)p.cd.w=Math.max(0,p.clawReadyAt-game.time);if(p.reikoTarget)p.cd.w=Math.max(0,p.reikoReadyAt-game.time);if(p.mounted>0)p.cd.e=Math.max(0,p.mountReadyAt-game.time);if(p.foxForm){p.foxForm=false;p.range+=135;p.speed-=30;}if(p.eagleActive){p.eagleActive=false;p.range-=80;}p.jurySecond=false;p.clawTarget=p.reikoTarget=null;p.mounted=p.immortal=0;p.immortalHeal=false;p.smite=null;p.divineUntil=0;continue;}
    p.attackBoost=Math.max(0,(p.attackBoost||0)-dt);
    if(p.jurySecond&&game.time>=p.juryUntil){p.jurySecond=false;p.cd.q=Math.max(0,p.juryReadyAt-game.time);}
    if(p.clawTarget&&game.time>=p.clawUntil){p.clawTarget=null;p.cd.w=Math.max(0,p.clawReadyAt-game.time);}
    if(p.reikoTarget&&game.time>=p.reikoUntil){p.reikoTarget=null;p.cd.w=Math.max(0,p.reikoReadyAt-game.time);}
    if(p.eagleActive&&game.time>=p.eagleUntil){p.eagleActive=false;p.range-=80;}
    if(p.smite){if(game.time>=p.smite.until){loreArea(p,p.smite,230,160);p.smite=null;}else if(distance(p,p.smite)<230){p.cd.q=Math.max(0,p.cd.q-dt*1.5);p.cd.w=Math.max(0,p.cd.w-dt*1.5);}}
    if(p.mounted>0){p.mounted=Math.max(0,p.mounted-dt);if(p.mounted===0)loreDismount(p);}
    if(p.immortal>0){p.immortal=Math.max(0,p.immortal-dt);if(p.immortal===0&&p.immortalHeal){heal(p,p.maxHp*.25);p.immortalHeal=false;}}
  }
  // Apply basic-attack control at the same time as its actual melee impact.
  for(const hit of game.strikes||[]){if(!hit.ranged&&hit.at<=game.time+dt&&(hit.loreSlow||hit.loreStun)){const p=game.entities.find(e=>e.id===hit.source&&!e.dead),t=game.entities.find(e=>e.id===hit.target&&!e.dead);if(p&&t&&distance(p,t)<=hit.range+t.radius+35){if(hit.loreStun&&t.type==='hero')stun(t,hit.loreStun);if(hit.loreSlow)t.slow=Math.max(t.slow||0,hit.loreSlow);}hit.loreSlow=hit.loreStun=0;}}
  beforeLoreUpdate(dt);
  const events=game.loreEvents||[];game.loreEvents=[];for(const event of events){if(event.at>game.time){game.loreEvents.push(event);continue;}const p=game.entities.find(e=>e.id===event.source&&!e.dead);if(!p)continue;
    if(event.kind==='homing'){const t=game.entities.find(e=>e.id===event.target&&!e.dead);if(t){loreHit(p,t,event.amount);if(event.radius)for(const other of loreTargets(p,t,event.radius).filter(e=>e.id!==t.id))loreHit(p,other,event.amount*.5);if(event.blinkRefund)p.cd.w=Math.max(0,p.cd.w-4);championRing(p,t,event.radius||45);}continue;}
    if(event.burst){const hits=loreResolve(p,event);if(hits[0])for(const t of loreTargets(p,hits[0],event.burst).filter(t=>t.id!==hits[0].id))loreHit(p,t,event.amount*.5,event);}else loreResolve(p,event);
  }
};
const beforeLoreHud=syncHud;
syncHud=function(){beforeLoreHud();if(!game)return;const p=game.player,id=p.def.id;let state='';if(id==='ilumia')state=p.divineUntil>game.time?'Q เสริมพลัง':'แสง '+(p.divineCasts||0)+'/2';if(id==='lauriel')state=p.smite&&distance(p,p.smite)<230?'อยู่ในวงเวท':'';if(id==='nakroth')state=p.jurySecond?'พุ่งได้อีกครั้ง':'';if(id==='volkath')state=p.mounted>0?'ขี่ม้า · E ลงม้า':p.immortal>0?'ป้องกันตาย':p.clawTarget?'W พุ่งตาม':'';if(id==='liliana'){state=p.foxForm?'จิ้งจอก':'มนุษย์';$('qName').textContent=p.foxForm?'ฟาดหาง':'ระเบิดแสง';$('wName').textContent=p.foxForm?(p.reikoTarget?'Reiko':'พุ่งจิ้งจอก'):'กระสุนสตัน';}if(loreIds.has(id))$('qCharges').textContent=state;};
