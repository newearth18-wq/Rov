import * as THREE from 'three';

const mat=(color,metalness=0)=>new THREE.MeshStandardMaterial({color,metalness,roughness:metalness?.43:.84});
function mesh(parent,g,m,x,y,z,sx=1,sy=1,sz=1){const n=new THREE.Mesh(g,m);n.position.set(x,y,z);n.scale.set(sx,sy,sz);n.castShadow=n.receiveShadow=true;parent.add(n);return n;}
const oval=(p,m,x,y,z,sx,sy,sz)=>mesh(p,new THREE.SphereGeometry(1,16,10),m,x,y,z,sx,sy,sz);
function cone(p,m,top,bottom,height,y,z=0){return mesh(p,new THREE.CylinderGeometry(top,bottom,height,16),m,0,y,z,1,1,.7);}
function clearMesh(p){for(const c of [...p.children])if(c.isMesh)p.remove(c);}
function panel(p,m,points,z){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return mesh(p,new THREE.ExtrudeGeometry(s,{depth:.015,bevelEnabled:false}),m,0,0,z);}

// Keep the shared joint topology, but replace the knight's surface geometry.
export function tailorBody(id,{scene,root,torso,m}){
  if(id==='mortos'){root.scale.set(1.16,1.10,1.05);return;}
  const female=['capheny','taara'].includes(id),demon=id==='maloch',mage=id==='ignis',avian=id==='zata',ninja=id==='hayate';
  const skin=mat(demon?0x843d42:avian?0xae9581:0xd0ad92),cloth=mat(id==='stuart'?0x9d263d:id==='ignis'?0xe3d0a2:id==='capheny'?0xad303e:id==='hayate'?0x322a38:id==='elsu'?0x202e44:id==='flowborn'?0x155567:0x345d79),leather=mat(0x362a30),white=mat(0xe6e3d6),pants=mat(id==='stuart'?0xc7b697:id==='flowborn'?0x334957:0x26323d);
  const hips=scene.getObjectByName('Hips');clearMesh(hips);clearMesh(torso);
  root.scale.set(demon?1.45:female?.86:mage?.98:.94,demon?1.10:mage?1.04:1,demon?1.16:.9);
  oval(hips,pants,0,-.015,0,.155,.13,.10);cone(hips,m.trim,.16,.16,.035,.065);
  const profile=(female?[[.115,0],[.12,.09],[.17,.25],[.16,.35],[.09,.47]]:[[.135,0],[.15,.12],[.19,.26],[.205,.36],[.105,.48]]).map(p=>new THREE.Vector2(...p));
  mesh(torso,new THREE.LatheGeometry(profile,20),demon||avian?skin:cloth,0,0,0,1,1,.62);
  cone(torso,skin,.057,.073,.08,.5);
  if(demon){for(const s of [-1,1]){oval(torso,skin,s*.095,.30,.065,.12,.09,.075);for(let i=0;i<3;i++)oval(torso,skin,s*.052,.19-i*.061,.089,.05,.033,.027);}panel(hips,m.metal,[[-.15,.025],[-.18,-.25],[0,-.3],[.18,-.25],[.15,.025]],.08);}
  else if(mage){cone(hips,cloth,.16,.30,.78,-.33);panel(torso,m.cloth,[[-.17,.44],[-.13,-.62],[.13,-.62],[.17,.44]],.127);for(const s of [-1,1])panel(torso,m.trim,[[s*.16,.42],[s*.13,-.58],[s*.105,-.58],[s*.135,.42]],.15);}
  else if(id==='stuart'){panel(torso,white,[[-.09,.40],[-.10,.10],[.10,.10],[.09,.40]],.135);for(const s of [-1,1]){panel(torso,cloth,[[s*.1,.43],[s*.21,.34],[s*.14,-.40],[s*.025,-.37],[s*.065,.19]],.14);panel(hips,cloth,[[s*.02,.06],[s*.15,.06],[s*.20,-.4],[s*.07,-.42]],-.13);}for(const y of [.15,.22,.29])oval(torso,m.trim,0,y,.155,.012,.012,.009);}
  else if(female){panel(torso,id==='capheny'?white:m.metal,[[-.12,.33],[-.095,.06],[.095,.06],[.12,.33],[0,.28]],.103);cone(hips,cloth,.155,.23,.23,-.12);}
  else if(ninja){panel(torso,m.cloth,[[-.15,.37],[.10,.04],[.17,.07],[-.10,.4]],.13);}
  else if(avian){panel(torso,cloth,[[-.18,.2],[-.12,-.2],[.14,-.2],[.18,.2]],.13);for(const s of [-1,1])panel(hips,white,[[s*.01,.03],[s*.17,.04],[s*.20,-.30],[s*.09,-.24]],-.1);}
  else{panel(torso,m.trim,[[-.14,.33],[.10,.05],[.14,.075],[-.105,.37]],.13);for(const s of [-1,1])panel(hips,cloth,[[s*.02,.05],[s*.14,.04],[s*.18,-.32],[s*.07,-.28]],-.1);}
  for(const [s,label]of [[-1,'L'],[1,'R']]){
    const arm=scene.getObjectByName(label+'Arm'),elbow=scene.getObjectByName(label+'Elbow'),leg=scene.getObjectByName(label+'Leg'),knee=scene.getObjectByName(label+'Knee'),foot=scene.getObjectByName(label+'Foot');
    for(const joint of [arm,elbow,leg,knee,foot])clearMesh(joint);
    arm.position.x=s*(female?.205:demon?.28:.225);
    oval(arm,demon||female||avian?skin:cloth,0,-.125,0,demon?.092:female?.055:.064,.165,demon?.092:.066);
    if(mage)cone(arm,cloth,.10,.075,.31,-.14);
    if(id==='taara'&&s===-1||id==='flowborn'&&s===1||demon){oval(arm,m.metal,s*.02,.005,0,demon?.17:.115,.072,.112);}
    oval(elbow,skin,0,-.13,0,demon?.08:.046,.16,demon?.08:.052);
    if(!female&&!avian)cone(elbow,demon?m.metal:leather,.058,.055,.20,-.16);
    oval(elbow,skin,0,-.29,.014,.044,.061,.041);
    oval(leg,female?skin:pants,0,-.21,0,female?.063:demon?.105:.074,.23,female?.068:.082);
    oval(knee,female?skin:pants,0,-.195,0,female?.045:.058,.19,.06);
    cone(knee,id==='taara'?m.metal:leather,.058,.065,.22,-.28,.015);
    oval(foot,leather,0,.003,.03,.069,.046,.116);
    if(demon)for(let i=0;i<3;i++)mesh(foot,new THREE.ConeGeometry(.021,.12,6),m.trim,(i-1)*.046,-.015,.14).rotation.x=Math.PI/2;
  }
  scene.userData.silhouette= mage?'robe':demon?'demon':female?'light armor':ninja?'ninja':avian?'avian':'coat';
}

const t=(joint,axis,times,values)=>new THREE.NumberKeyframeTrack(`${joint}.rotation[${axis}]`,times,values);
export function tailorMotion(id,model){
  const caster=['ignis','zata','oracle','ilumia','lauriel','liliana'].includes(id),bow=['flowborn','telannas'].includes(id),ranged=caster||bow||['stuart','capheny','elsu','hayate'].includes(id);
  const gun=['stuart','capheny','elsu'].includes(id),holdR=gun?-1.23:bow?-.8:caster?-.25:0,holdL=id==='stuart'?-1.23:id==='capheny'||id==='elsu'?-1.05:bow?-1.35:caster?-.2:0;
  const holding=[t('RArm','x',[0,2], [holdR,holdR]),t('LArm','x',[0,2],[holdL,holdL]),t('RElbow','x',[0,2],[-.25,-.25]),t('LElbow','x',[0,2],[-.3,-.3])];
  const idle=model.animations.find(a=>a.name==='Idle');idle.tracks.push(...holding);
  const run=model.animations.find(a=>a.name==='Run');if(gun||bow){run.tracks=run.tracks.filter(a=>!/[LR](Arm|Elbow)/.test(a.name));run.tracks.push(...holding.map(a=>a.clone()));}
  const times=ranged?[0,.12,.20,.32,.48]:[0,.09,.16,.29,.48];
  const tracks=gun?[t('RArm','x',times,[holdR,holdR-.14,holdR,holdR,holdR]),t('LArm','x',times,[holdL,holdL-.08,holdL,holdL,holdL]),t('Torso','x',times,[0,-.06,0,.02,0])]:bow?[t('LArm','x',times,[-1.35,-1.4,-1.4,-1.3,-1.35]),t('RArm','y',times,[0,-.7,-.9,-.2,0]),t('RElbow','x',times,[-.6,-1.3,-1.4,-.3,-.6])]:caster?[t('RArm','x',times,[-.25,-1.4,-1.7,-.5,-.25]),t('LArm','x',times,[-.2,-.7,-1.3,-.4,-.2])]:[t('Torso','y',times,[0,-.65,.7,.2,0]),t('RArm','x',times,[0,-1.7,-.8,.35,0]),t('RArm','z',times,[.16,.7,-1.1,-.1,.16]),t('RElbow','x',times,[-.15,-.8,-.2,-.12,-.15])];
  model.animations=model.animations.filter(a=>!['Sword_Attack','Bow_Shoot','Spell1','Spell2'].includes(a.name));
  const attack=new THREE.AnimationClip(ranged?'Bow_Shoot':'Sword_Attack',.48,tracks);model.animations.push(attack);
  const spell=attack.clone();spell.name='Spell1';model.animations.push(spell);
  const ultimate=attack.clone();ultimate.name='Spell2';ultimate.tracks.forEach(a=>a.times=Float32Array.from(a.times,v=>v*1.6));ultimate.duration=.768;model.animations.push(ultimate);
  const q=attack.clone();q.name='Spell_Q';model.animations.push(q);
  const w=new THREE.AnimationClip('Spell_W',.4,[t('LArm','x',[0,.12,.26,.4],[holdL,-1.4,-1.3,holdL]),t('RArm','x',[0,.12,.26,.4],[holdR,-.7,-.7,holdR]),t('Torso','x',[0,.12,.26,.4],[0,-.07,-.05,0])]);model.animations.push(w);
  const e=caster?new THREE.AnimationClip('Spell_E',.8,[t('LArm','x',[0,.18,.5,.8],[holdL,-2.0,-1.7,holdL]),t('RArm','x',[0,.18,.5,.8],[holdR,-2.0,-1.7,holdR]),t('LArm','z',[0,.18,.5,.8],[0,-.65,-.45,0]),t('RArm','z',[0,.18,.5,.8],[0,.65,.45,0])]):ultimate.clone();e.name='Spell_E';model.animations.push(e);
  model.animations.push(new THREE.AnimationClip('Dash',.3,[t('Torso','x',[0,.08,.22,.3],[0,.24,.24,0]),t('LLeg','x',[0,.08,.22,.3],[0,-.6,-.4,0]),t('RLeg','x',[0,.08,.22,.3],[0,.6,.4,0]),t('RArm','x',[0,.08,.22,.3],[holdR,holdR+.2,holdR+.2,holdR])]));
  model.scene.userData.weaponPose=gun?'gun':bow?'bow':caster?'cast':'swing';return model;
}
