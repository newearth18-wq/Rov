'use strict';
const battleRoster=document.createElement('div');battleRoster.className='battle-roster';battleRoster.setAttribute('aria-label','ฮีโร่ในแมตช์');document.getElementById('app').append(battleRoster);
let rosterSignature='';
const rosterHud=syncHud;
syncHud=function(){rosterHud();if(!game)return;
  const heroes=game.entities.filter(e=>e.type==='hero').slice(0,50),signature=heroes.map(e=>e.id+':'+e.def.id).join('|');
  if(signature!==rosterSignature){rosterSignature=signature;battleRoster.replaceChildren();for(const team of [game.player.team,1-game.player.team]){
    const group=document.createElement('div');group.className='roster-team '+(team===game.player.team?'allied':'enemy');battleRoster.append(group);
    for(const hero of heroes.filter(e=>e.team===team).slice(0,5)){const icon=document.createElement('div');icon.className='roster-hero';icon.dataset.entity=hero.id;icon.title=hero.clientName||hero.def.name;
      const canvas=document.createElement('canvas');canvas.width=canvas.height=48;canvas.dataset.model=hero.def.id;icon.append(canvas);const timer=document.createElement('span');icon.append(timer);group.append(icon);
    }
  }}
  for(const icon of battleRoster.querySelectorAll('.roster-hero')){const hero=heroes.find(e=>String(e.id)===icon.dataset.entity);if(!hero)continue;const portrait=icon.querySelector('canvas'),source=document.querySelector('.model-portrait[data-model="'+hero.def.id+'"]');if(portrait.dataset.ready!=='true'&&source?.dataset.ready==='true'){portrait.getContext('2d').drawImage(source,0,0,48,48);portrait.dataset.ready='true';}icon.classList.toggle('dead',!!hero.dead);icon.querySelector('span').textContent=hero.dead?Math.ceil(hero.respawn):'';icon.setAttribute('aria-label',(hero.clientName||hero.def.name)+(hero.dead?' · เกิดใน '+Math.ceil(hero.respawn)+' วินาที':''));}
};
