'use strict';
// These short events travel in the existing match snapshot, so guests hear hits too.
function battleEvent(type,at,extra={}){if(!game)return;const life=type==='sound'?1.1:.32;effects.push({type,fxId:'feedback:'+game.nextId++,x:at.x,y:at.y,life,max:life,...extra});}
const feedbackStart=startGame;
startGame=function(){const result=feedbackStart();game.matchId=String(Date.now())+':'+Math.random().toString(36).slice(2);return result;};
function weaponSound(p){const id=p.def?.id;return p.type==='tower'||p.type==='base'?'turret':['stuart','capheny','elsu'].includes(id)?(id==='elsu'||p.cannon?'cannon':'gun'):['ranger','flowborn','hayate'].includes(id)?'bow':['arcanist','ignis'].includes(id)?'fire':['oracle','zata'].includes(id)?'magic':'sword';}
function skillSound(p,key){const id=p.def?.id;if(id==='oracle')return 'heal';if(['bulwark','mortos'].includes(id)&&key!=='q'||id==='stuart'&&key==='w')return 'shield';if(['zata','flowborn','shade','taara'].includes(id)&&key==='e'||key==='w'&&['sentinel','ranger','shade','capheny'].includes(id))return 'dash';return key==='e'?'ultimate':weaponSound(p);}
const feedbackDamage=damage;
damage=function(target,amount,source){const hp=target.hp,shield=target.shield||0,dead=target.dead;const result=feedbackDamage(target,amount,source);if(!dead&&(target.hp<hp||(target.shield||0)<shield)){
  battleEvent('impact',target,{color:source.team===0?'#f4e2a2':'#ff9c73',target:target.id,source:source.id,sound:'impact'});
  if(target.dead)battleEvent('sound',target,{sound:target.type==='hero'?'death':'cannon',source:source.id});
}return result;};
const feedbackStrike=strike;
strike=function(p,t){const before=p.attack;const result=feedbackStrike(p,t);if(p.attack>before&&t)battleEvent('sound',p,{sound:weaponSound(p),source:p.id});return result;};
const feedbackSkill=useSkill;
useSkill=function(key,actor=null,aim=pointer){const p=actor||game?.player;const ok=feedbackSkill(key,actor,aim);if(ok&&p){const sound=skillSound(p,key);battleEvent('sound',p,{sound,source:p.id});battleEvent('castFlash',p,{life:.55,max:.55,color:sound==='heal'?'#a4ffbf':sound==='fire'?'#ffb66d':sound==='shield'?'#9bddff':sound==='ultimate'?'#ffd587':'#c4e6ff',power:key==='e'?1.5:1});}return ok;};
