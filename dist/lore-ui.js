'use strict';
let lorePreviewForm=false;
const beforeLoreChoose=chooseHero;
chooseHero=function(id){beforeLoreChoose(id);lorePreviewForm=false;const info=LORE_HEROES.find(h=>h.id===selected.id);$('loreBtn').hidden=!info;$('formPreviewBtn').hidden=!['liliana','volkath'].includes(id);$('formPreviewBtn').textContent=id==='liliana'?'ดูร่างจิ้งจอก':'ดูร่างขี่ม้า';};
$('formPreviewBtn').onclick=()=>{lorePreviewForm=!lorePreviewForm;$('formPreviewBtn').textContent=lorePreviewForm?(selected.id==='liliana'?'ดูร่างมนุษย์':'ดูร่างเดินเท้า'):(selected.id==='liliana'?'ดูร่างจิ้งจอก':'ดูร่างขี่ม้า');};
$('loreBtn').onclick=()=>{const h=LORE_HEROES.find(h=>h.id===selected.id);if(!h)return;$('loreTitle').textContent=h.name;$('loreFaction').textContent=h.faction+' · '+h.role;$('loreStory').textContent=h.story;$('lorePassive').textContent=h.passive;$('loreCombo').textContent=h.combo;const list=$('loreSkills');list.replaceChildren(...h.skills.map((text,i)=>{const li=document.createElement('li'),b=document.createElement('b'),span=document.createElement('span');b.textContent=['Q · '+h.q,'W / SHIFT · '+h.w,'E · '+h.e][i];span.textContent=text;li.append(b,span);return li;}));$('loreOfficial').href='https://www.rov.in.th/hero/'+h.source;$('loreClip').hidden=h.clip===null;$('loreClip').href='https://www.youtube.com/watch?v=1UU8oRTeZy0'+(h.clip?'&t='+h.clip+'s':'');$('loreDialog').showModal();};
$('loreClose').onclick=()=>$('loreDialog').close();
$('loreDialog').addEventListener('click',event=>{if(event.target===$('loreDialog')){const rect=$('loreDialog').getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)$('loreDialog').close();}});
chooseHero(selected.id);
