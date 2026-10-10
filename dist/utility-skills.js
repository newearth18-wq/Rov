'use strict';
// Utility spells share the authoritative match clock and ordinary room commands.
function utilityCooldown(p,key){return Math.max(0,(p[key+'ReadyAt']||0)-(game?.time||0));}
const utilityBaseSkill=useSkill,utilityBaseInfo=skillInfo;
skillInfo=function(p,key){return key==='flicker'?{mode:'direction',range:160,radius:18}:key==='recovery'?{mode:'self',range:0,radius:65}:utilityBaseInfo(p,key);};
useSkill=function(key,actor=null,aim=pointer){
  if(!['recovery','flicker'].includes(key))return utilityBaseSkill(key,actor,aim);
  if(!game||game.paused||game.finished)return false;
  const p=actor||game.player;if(p.dead||p.stun>0||utilityCooldown(p,key)>0)return false;
  if(key==='recovery'){
    if(p.hp>=p.maxHp&&(p.mana??400)>=(p.maxMana||400))return false;
    heal(p,p.maxHp*.18);p.mana=Math.min(p.maxMana||400,(p.mana??400)+(p.maxMana||400)*.15);
    effects.push({type:'ring',x:p.x,y:p.y,radius:65,color:'#a5f6c1',life:.65,max:.65});
    p.recoveryReadyAt=game.time+60;setAction(p,'spell',p);
  }else{
    const from={x:p.x,y:p.y},target=aim||from,dx=target.x-p.x,dy=target.y-p.y;
    let len=Math.hypot(dx,dy);if(!Number.isFinite(len))return false;
    const direction=len>.01?{x:dx/len,y:dy/len}:p.facing||{x:p.team===0?1:-1,y:0};
    p.x+=direction.x*160;p.y+=direction.y*160;safeLanding(p);p.destination=null;
    effects.push({type:'shot',x:from.x,y:from.y,tx:p.x,ty:p.y,color:'#c5b3ff',life:.25,max:.25});
    effects.push({type:'ring',x:from.x,y:from.y,radius:32,color:'#c5b3ff',life:.35,max:.35});
    p.flickerReadyAt=game.time+120;setAction(p,'dash',p);
  }
  p.recall=0;return true;
};
const utilityBaseHud=syncHud;
syncHud=function(){utilityBaseHud();if(!game)return;for(const key of ['recovery','flicker']){
  const button=document.querySelector('[data-action="'+key+'"]');if(!button)continue;
  const remaining=utilityCooldown(game.player,key);button.classList.toggle('cooldown',remaining>0);
  button.querySelector('i').textContent=remaining>0?Math.ceil(remaining):'';
  button.setAttribute('aria-label',(key==='recovery'?'ฟื้นฟูเลือดและมานา':'วาร์ประยะสั้น')+(remaining>0?' · พร้อมใน '+Math.ceil(remaining)+' วินาที':''));
}};
