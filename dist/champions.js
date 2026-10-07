'use strict';
const championIds=new Set(ADDITIONAL_HEROES.map(h=>h.id));
const championTint={stuart:'#f4a178',capheny:'#ffa963',maloch:'#e76554',ignis:'#ffb54e',mortos:'#eee0a4',taara:'#a5e7ff',elsu:'#b9d6ec',hayate:'#f58f9d',flowborn:'#7decf4',zata:'#8ef1d8'};
const oldChampionInfo=skillInfo;
skillInfo=function(p,key){if(!championIds.has(p.def.id))return oldChampionInfo(p,key);const dir=(range,radius=30)=>({mode:'direction',range,radius}),area=(range,radius)=>({mode:'area',range,radius}),self=radius=>({mode:'self',range:0,radius});switch(p.def.id){
  case 'stuart':return key==='w'?self(0):dir(key==='q'?650:420);
  case 'capheny':return key==='e'?dir(480,150):self(0);
  case 'maloch':return key==='q'?dir(230,200):key==='w'?self(220):area(380,170);
  case 'ignis':return key==='q'?dir(450,55):area(key==='w'?420:460,key==='w'?130:175);
  case 'mortos':return key==='e'?area(330,125):self(key==='w'?200:0);
  case 'taara':return key==='q'?area(360,130):self(key==='w'?180:0);
  case 'elsu':return key==='q'?area(380,210):dir(key==='w'?900:480,key==='w'?18:30);
  case 'hayate':return key==='e'?area(290,180):dir(key==='q'?480:220,25);
  case 'flowborn':return key==='q'?self(145):key==='w'?dir(520):area(330,125);
  case 'zata':return key==='q'?dir(450):key==='w'?area(360,100):dir(240,50);
}};
function championRing(p,at,radius,life=.5){effects.push({type:'ring',x:at.x,y:at.y,radius,color:championTint[p.def.id],life,max:life});}
function championProjectile(p,aim,{range=500,damage:amount=130,spread=0,stun:stunTime=0,slow=0,splash=0}={}){const a=Math.atan2(aim.y-p.y,aim.x-p.x)+spread;game.projectiles ||= [];game.projectiles.push({id:game.nextId++,source:p.id,team:p.team,x:p.x,y:p.y,dx:Math.cos(a),dy:Math.sin(a),remaining:range,speed:900,damage:(amount+p.level*10)*p.spell,stun:stunTime,slow,splash,color:championTint[p.def.id]});}
function championCast(p,at,{delay=.35,radius=120,amount=150,line=false,range=450,stun:stunTime=0,slow=0,silence=0,mark=false,markedStun=false,percent=0,follow=false,interruptible=false}={}){let c={id:game.nextId++,source:p.id,at:game.time+delay,x:at.x,y:at.y,radius,amount:(amount+p.level*12)*p.spell,stun:stunTime,slow,silence,mark,markedStun,percent,follow,interruptible,color:championTint[p.def.id]};if(line){const dx=at.x-p.x,dy=at.y-p.y,d=Math.hypot(dx,dy)||1;c={...c,x:p.x,y:p.y,tx:p.x+dx/d*range,ty:p.y+dy/d*range,line:true};}game.casts ||= [];game.casts.push(c);if(!follow)effects.push({type:line?'breathWarning':'telegraph',x:c.x,y:c.y,tx:c.tx,ty:c.ty,radius,color:c.color,life:delay,max:delay});}
function championDash(p,aim,range,backwards=false){const dx=aim.x-p.x,dy=aim.y-p.y,d=Math.hypot(dx,dy)||1,from={x:p.x,y:p.y};p.x+=dx/d*(backwards?-range:Math.min(d,range));p.y+=dy/d*(backwards?-range:Math.min(d,range));safeLanding(p);p.destination=null;effects.push({type:'shot',x:from.x,y:from.y,tx:p.x,ty:p.y,color:championTint[p.def.id],life:.3,max:.3});}
function championJump(p,aim,range){championDash(p,aim,range);p.jumpUntil=game.time+.45;p.jumpDuration=.45;setAction(p,'ultimate',aim);}
function championEvent(p,delay,kind,data){game.championEvents ||= [];game.championEvents.push({source:p.id,at:game.time+delay,kind,...data});}
const oldChampionSkill=useSkill;
useSkill=function(key,actor=null,aim=null){const p=actor||game?.player;if(!p||p.silence>0)return false;if(!championIds.has(p.def.id))return oldChampionSkill(key,actor,aim);if(!game||game.paused||game.finished||p.dead||p.stun>0||p.channel>0||p.cd[key]>0||!['q','w','e'].includes(key))return false;const recast=key==='e'&&(p.def.id==='zata'&&p.zataStep>0||p.def.id==='flowborn'&&p.flowUlt===1),cost=recast?0:key==='e'?90:key==='w'?35:45;if((p.mana??400)<cost)return false;aim=aim&&Number.isFinite(aim.x)&&Number.isFinite(aim.y)?aim:aimFor(p,skillInfo(p,key).range||400);const at=limitAim(p,aim,skillInfo(p,key).range||400);let cd=key==='e'?22:key==='w'?8:6;setAction(p,key==='e'?'ultimate':'spell',aim);
  switch(p.def.id){
    case 'stuart':
      if(key==='q')championCast(p,aim,{line:true,range:650,radius:25,amount:230,delay:.28});
      if(key==='w'){p.physicalDodge=1.3;p.haste=1.6;p.hasteTime=2;cd=12;championRing(p,p,65);}
      if(key==='e'){championProjectile(p,aim,{range:420,damage:240,stun:.8,splash:65});championDash(p,aim,135,true);setAction(p,'dash',aim);}
      break;
    case 'capheny':
      if(key==='q'){p.cannonMode=!p.cannonMode;p.range+=p.cannonMode?55:-55;cd=2;if(p.player)notify(p.cannonMode?'โหมดเลเซอร์ · ยิงแรงและไกลขึ้น':'โหมดปืนกล · ยิงเร็ว');}
      if(key==='w'){p.slow=0;p.haste=1.65;p.hasteTime=2;championRing(p,p,55);}
      if(key==='e'){p.channel=1.6;p.channelMove=true;for(let n=0;n<12;n++)championEvent(p,n*.12,'fan',{aim:{...aim}});cd=20;}
      break;
    case 'maloch':
      if(key==='q'){const hit=enemies(p,230,true).some(t=>t.type==='hero');hitCone(p,aim,230,(210+p.level*18)*p.spell,.05);if(hit){heal(p,100+p.level*15);p.cleaveEmpowered=4;}effects.push({type:'slash',x:p.x,y:p.y,tx:aim.x,ty:aim.y,radius:230,color:championTint.maloch,life:.5,max:.5});}
      if(key==='w'){const victims=enemies(p,220,true).filter(t=>!['tower','base'].includes(t.type));p.shield=120+Math.min(3,victims.length)*p.maxHp*.06;p.shieldTime=5;for(const t of victims)t.slow=2;championRing(p,p,220);}
      if(key==='e'){championJump(p,at,380);championCast(p,p,{delay:.45,radius:170,amount:290,stun:1});cd=24;}
      break;
    case 'ignis':
      if(key==='q')championCast(p,aim,{line:true,range:450,radius:55,amount:150,delay:.2,mark:true});
      if(key==='w'){for(let n=0;n<3;n++)championCast(p,at,{delay:.35+n*.5,radius:130,amount:50,markedStun:true});}
      if(key==='e')championCast(p,at,{delay:.65,radius:175,amount:290,percent:.075});
      break;
    case 'mortos':
      if(key==='q'){p.haste=1.6;p.hasteTime=3;p.silencingHit=3;championRing(p,p,55);}
      if(key==='w'){p.spin=4;p.spinTick=0;p.shield=170+p.level*25;p.shieldTime=4;}
      if(key==='e'){championJump(p,at,330);championCast(p,p,{delay:.45,radius:125,amount:290,stun:.85});}
      break;
    case 'taara':
      if(key==='q'){championJump(p,at,360);championCast(p,p,{delay:.4,radius:130,amount:180,slow:2});heal(p,p.maxHp*.03);}
      if(key==='w'){championCast(p,p,{delay:.05,radius:180,amount:100,follow:true});championCast(p,p,{delay:.28,radius:180,amount:100,follow:true});heal(p,p.maxHp*.03);championRing(p,p,180);}
      if(key==='e'){p.regeneration=6;p.haste=1.25;p.hasteTime=6;championRing(p,p,75,1);cd=25;}
      break;
    case 'elsu':
      if(key==='q'){game.wards ||= [];const own=game.wards.filter(w=>w.source===p.id);if(own.length>=3)game.wards=game.wards.filter(w=>w!==own[0]);game.wards.push({source:p.id,team:p.team,x:at.x,y:at.y,until:game.time+45,radius:210});championRing(p,at,210);cd=12;}
      if(key==='w'){championCast(p,aim,{line:true,range:900,radius:18,amount:370,delay:.7,slow:1});cd=8;}
      if(key==='e'){championProjectile(p,aim,{range:480,damage:220,slow:1});championDash(p,aim,180,true);setAction(p,'dash',aim);}
      break;
    case 'hayate':
      if(key==='q'){for(let n=0;n<6;n++)championEvent(p,n*.11,'projectile',{aim:{...aim},options:{range:480,damage:60}});}
      if(key==='w'){championDash(p,aim,220);setAction(p,'dash',aim);}
      if(key==='e'){championDash(p,at,290);p.channel=1.8;for(let n=0;n<8;n++)championCast(p,p,{delay:n*.22+.05,radius:180,amount:55,follow:true,interruptible:true});cd=22;}
      break;
    case 'flowborn':
      if(key==='q'){for(const t of enemies(p,145,true).filter(t=>!['tower','base'].includes(t.type))){spellDamage(t,(95+p.level*8)*p.spell,p);const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1;t.x+=dx/d*65;t.y+=dy/d*65;safeLanding(t);}heal(p,150+p.level*12);p.flowStacks=5;p.cd.w*=.5;p.cd.e*=.5;championRing(p,p,145);}
      if(key==='w')championProjectile(p,aim,{range:520,damage:170,splash:70,slow:1});
      if(key==='e'){championJump(p,at,330);championCast(p,p,{delay:.45,radius:125,amount:210});if(p.flowUlt===1){p.flowUlt=0;cd=Math.max(0,p.flowReadyAt-game.time);}else{p.flowUlt=1;p.flowWindow=game.time+3;p.flowReadyAt=game.time+20;cd=.18;}}
      break;
    case 'zata':
      if(key==='q')championProjectile(p,aim,{range:450,damage:170,splash:75});
      if(key==='w'){const from={x:p.x,y:p.y};for(let n=0;n<5;n++)championCast(p,{x:at.x+(from.x-at.x)*n/4,y:at.y+(from.y-at.y)*n/4},{delay:.2+n*.2,radius:85,amount:45,slow:1.5});}
      if(key==='e'){championDash(p,aim,240);hitCone(p,aim,135,(130+p.level*12)*p.spell,-1);p.zataStep=(p.zataStep||0)+1;if(p.zataStep===1)p.zataReadyAt=game.time+24;p.zataWindow=game.time+3;if(p.zataStep>=3){p.zataStep=0;p.flight=1.6;p.invulnerable=1.6;p.channel=1.6;for(let n=0;n<6;n++)championCast(p,p,{delay:.15+n*.24,radius:230,amount:65,follow:true});cd=Math.max(0,p.zataReadyAt-game.time);}else cd=.18;}
      break;
  }
  p.mana=(p.mana??400)-cost;p.cd[key]=cd*(1-Math.min(.6,p.cdr));p.recall=0;if(p.player){tone(key==='e'?200:560,.1);syncHud();}return true;
};
const championMove=move;
move=function(e,x,y,dt){return championMove(e,x,y,dt*(e.slow>0?.6:1)*(e.hasteTime>0?e.haste:1)*(e.channel>0&&e.channelMove?.35:1));};
const championDamage=damage;
damage=function(t,amount,source){const physical=!['arcanist','oracle','ignis','zata'].includes(source.def?.id);if(t.invulnerable>0||physical&&t.physicalDodge>0)return;return championDamage(t,amount,source);};
const championStrike=strike;
strike=function(p,t){const count=game?.strikes?.length||0;championStrike(p,t);const hit=game?.strikes?.[count];if(!hit||hit.source!==p.id)return;if(p.def.id==='capheny'){p.attack=p.cannonMode?.9:.38;hit.amount*=p.cannonMode?1.45:.85;if(p.cannonMode)hit.splash=80;}if(p.def.id==='taara')hit.amount*=1+(1-p.hp/p.maxHp)*.65;if(p.cleaveEmpowered>0)hit.amount*=1.25;if(p.silencingHit>0){hit.silence=1.2;hit.amount+=70+p.level*8;p.silencingHit=0;}if(p.def.id==='flowborn'&&p.flowStacks>0){p.flowStacks--;hit.amount+=65+p.level*8;hit.splash=65;}if(p.def.id==='zata'){p.featherHit=((p.featherHit||0)+1)%3;if(p.featherHit===0)hit.amount+=120+p.level*10;}if(p.def.id==='hayate'){p.hayateHit=((p.hayateHit||0)+1)%4;if(p.hayateHit===0)hit.amount+=t.maxHp*.035;}};
const oldChampionVisible=visibleToTeam;
visibleToTeam=function(e,team){return oldChampionVisible(e,team)||e.type==='hero'&&(game?.wards||[]).some(w=>w.team===team&&w.until>game.time&&distance(w,e)<w.radius);};
const championUpdate=update;
update=function(dt){if(!game||game.paused||game.finished)return championUpdate(dt);for(const p of game.entities.filter(e=>e.type==='hero')){for(const key of ['silence','slow','hasteTime','invulnerable','physicalDodge','cleaveEmpowered','silencingHit','flight'])p[key]=Math.max(0,(p[key]||0)-dt);if(!p.dead&&p.regeneration>0){heal(p,p.maxHp*.06*dt);p.regeneration=Math.max(0,p.regeneration-dt);}if(p.dead){p.regeneration=p.flight=p.invulnerable=p.physicalDodge=p.flowUlt=p.zataStep=0;p.channelMove=false;}if(p.flowUlt===1&&game.time>=p.flowWindow){p.flowUlt=0;p.cd.e=Math.max(0,p.flowReadyAt-game.time);}if(p.zataStep>0&&game.time>=p.zataWindow){p.zataStep=0;p.cd.e=Math.max(0,p.zataReadyAt-game.time);}if(p.stun>0&&p.channel>0){p.channel=0;game.casts=(game.casts||[]).filter(c=>c.source!==p.id||!c.interruptible);game.championEvents=(game.championEvents||[]).filter(e=>e.source!==p.id);}}
  const events=game.championEvents||[];game.championEvents=[];for(const e of events){if(e.at>game.time){game.championEvents.push(e);continue;}const p=game.entities.find(p=>p.id===e.source&&!p.dead);if(!p||p.stun>0)continue;if(e.kind==='projectile')championProjectile(p,e.aim,e.options);if(e.kind==='fan')for(const spread of [-.22,0,.22])championProjectile(p,e.aim,{range:480,damage:25,spread});}
  championUpdate(dt);game.wards=(game.wards||[]).filter(w=>w.until>game.time);for(const p of game.entities.filter(e=>e.def?.id==='mortos'&&!e.dead&&game.time-(e.lastDamaged??0)>8))heal(p,p.maxHp*.012*dt);
};
const championHud=syncHud;
syncHud=function(){championHud();if(!game)return;const p=game.player;if(p.def.id==='flowborn')$('qCharges').textContent='Flow '+(p.flowStacks||0);if(p.def.id==='zata'){$('qCharges').textContent='';const state=p.flight>0?'บิน':p.zataStep>0?'พุ่ง '+p.zataStep+'/3':'';if(state)$('buffStatus').textContent+=' · '+state;}if(p.def.id==='capheny')$('qCharges').textContent=p.cannonMode?'เลเซอร์':'ปืนกล';};
