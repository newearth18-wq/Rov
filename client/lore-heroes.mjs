import * as THREE from 'three';
import {humanFace} from './human-face.mjs';
import {tailorMotion} from './hero-tailoring.mjs';
const config={ilumia:['oracle',0xe8d8b1,0xd4a64d,0xf5e7d2,0xffdf86],lauriel:['oracle',0xe8d8d7,0xd5ae70,0xebd8eb,0xffd6f5],liliana:['oracle',0xd5e6ed,0x6ca9d7,0xe7f2ff,0x8fcbff],nakroth:['shade',0x963448,0xbcb8c3,0x281c30,0xff4968],telannas:['ranger',0x8a5e9b,0xb9b697,0x483663,0xb8eff4],volkath:['sentinel',0x332c44,0xb77ba5,0x2f142d,0xe468e3]};
const group=(p,name,x=0,y=0,z=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);p.add(g);return g;};
const put=(p,g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const n=new THREE.Mesh(g,m);n.position.set(x,y,z);n.scale.set(sx,sy,sz);p.add(n);return n;};
const ball=(p,m,x,y,z,sx,sy,sz)=>put(p,new THREE.SphereGeometry(1,12,10),m,x,y,z,sx,sy,sz);
const path=(p,m,points,r=.025)=>put(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),18,r,6,false),m);
const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.62});
function face(head,id,m){head.clear();if(id==='nakroth'||id==='volkath'){ball(head,m.metal,0,.02,0,.105,.14,.1);for(const s of [-1,1]){ball(head,m.glow,s*.04,.01,.1,.028,.009,.015);path(head,m.trim,[[s*.07,.10,0],[s*.12,.18,-.02],[s*.14,.31,-.1]],.02);}ball(head,m.dark,0,-.06,.085,.077,.045,.025);return;}
  const hair=mat(id==='telannas'?0xc6b4d4:id==='liliana'?0xe5ecf4:0xe1c592);
  humanFace(head,id,m);for(const side of [-1,1])if(id==='telannas'||id==='liliana'){const ear=put(head,new THREE.ConeGeometry(.035,id==='liliana'?.16:.12,5),hair,side*.09,id==='liliana'?.12:.01,0);ear.rotation.z=side*(id==='liliana'?-.2:-1.1);}
  if(id==='ilumia'||id==='telannas'){const crown=group(head,'Crown');for(let i=-2;i<=2;i++)put(crown,new THREE.ConeGeometry(.016,.08+(2-Math.abs(i))*.025,4),m.trim,i*.035,.14,.03);ball(crown,m.glow,0,.13,.085,.02,.033,.015);}
}
function wings(torso,m){for(const s of [-1,1])for(let j=0;j<3;j++){const wing=group(torso,`AngelWing${s}_${j}`,s*.12,.3-j*.1,-.1);wing.rotation.z=s*(.17+j*.3);path(wing,m.trim,[[0,0,0],[s*.3,.26,0],[s*.6,.38,-.04]],.017);for(let n=0;n<6;n++){const feather=ball(wing,m.cloth,s*(.18+n*.072),.17+n*.035,-.01,.055,.22-n*.01,.019);feather.rotation.z=-s*.55;}}}
function fox(scene,m){const f=group(scene,'FoxForm');f.visible=false;const body=group(f,'FoxBody',0,.45,0);ball(body,m.cloth,0,0,0,.19,.19,.43);const head=group(body,'FoxHead',0,.07,.43);ball(head,m.cloth,0,0,0,.13,.12,.15);ball(head,m.cloth,0,-.035,.14,.08,.07,.13);ball(head,m.dark,0,-.01,.25,.035,.022,.022);for(const s of [-1,1]){put(head,new THREE.ConeGeometry(.067,.19,6),m.cloth,s*.09,.13,-.02).rotation.z=-s*.2;ball(head,m.glow,s*.09,.025,.09,.021,.017,.013);for(const rear of [0,1]){const leg=group(body,`FoxLeg${s}_${rear}`,s*.13,-.11,rear?-.3:.26);ball(leg,m.cloth,0,-.12,0,.052,.15,.055);ball(leg,m.dark,0,-.27,.035,.048,.035,.075);}}
  const tails=group(body,'NineTails',0,0,-.3);for(let i=0;i<9;i++){const a=(i-4)*.29;path(tails,m.cloth,[[0,0,0],[Math.sin(a)*.3,.13,-.24],[Math.sin(a)*.7,.38+(i%3)*.06,-.64],[Math.sin(a)*.86,.51,-.83]],.065);ball(tails,m.glow,Math.sin(a)*.86,.51,-.83,.047,.07,.057);}return f;
}
function horse(scene,m){const h=group(scene,'MountedForm');h.visible=false;const body=group(h,'HorseBody',0,.74,-.07);ball(body,m.dark,0,.04,0,.23,.28,.47);ball(body,m.metal,0,.16,.24,.25,.18,.18);const neck=group(body,'HorseNeck',0,.23,.37);ball(neck,m.dark,0,.13,.04,.14,.29,.14);ball(neck,m.metal,0,.13,.15,.15,.24,.045);const head=group(neck,'HorseHead',0,.4,.08);ball(head,m.dark,0,0,.07,.13,.14,.24);for(const s of [-1,1]){ball(head,m.glow,s*.11,.03,.06,.02,.025,.035);put(head,new THREE.ConeGeometry(.04,.12,5),m.metal,s*.08,.17,-.06);for(const rear of [0,1]){const leg=group(body,`HorseLeg${s}_${rear}`,s*.16,-.13,rear?-.31:.31);ball(leg,m.dark,0,-.21,0,.055,.24,.06);ball(leg,m.dark,0,-.52,.025,.066,.065,.095);}}
  path(body,m.dark,[[0,.1,-.42],[0,-.02,-.65],[0,-.35,-.78]],.05);return h;
}
export function loreTemplates(factory){return Object.entries(config).map(([id,[base,metal,trim,cloth,light]])=>{
  const model=factory(base,{metal,trim,cloth,light},({scene,root,torso,head,m})=>{
    face(head,id,m);scene.userData.hero=id;scene.userData.lore=true;
    for(const name of ['LElbow','RElbow']){const elbow=scene.getObjectByName(name);for(const child of [...elbow.children])if(child.isGroup)elbow.remove(child);}
    const left=scene.getObjectByName('LElbow'),right=scene.getObjectByName('RElbow');
    if(['ilumia','lauriel','liliana','telannas'].includes(id)){
      // Cloth, waist and exposed hands distinguish the female silhouettes from plate fighters.
      const skin=mat(0xe1b6a4),hips=scene.getObjectByName('Hips');
      for(const parent of [hips,torso])for(const child of [...parent.children])if(child.isMesh)parent.remove(child);
      const profile=[[.12,0],[.13,.10],[.16,.24],[.17,.34],[.14,.42],[.08,.48]].map(v=>new THREE.Vector2(...v));put(torso,new THREE.LatheGeometry(profile,20),m.cloth,0,0,0,1,1,.67);ball(hips,m.cloth,0,.06,0,.135,.15,.087);ball(torso,skin,0,.42,.005,.13,.065,.075);ball(torso,skin,0,.5,0,.045,.07,.045);ball(torso,m.trim,0,.07,.075,.13,.019,.026);ball(torso,m.glow,0,.29,.12,.027,.041,.013);
      const length=id==='ilumia'?.9:id==='telannas'?.38:.60;put(hips,new THREE.CylinderGeometry(.135,.26,length,18,1,true),m.cloth,0,-length*.47,0,1,1,.63);put(hips,new THREE.TorusGeometry(.155,.013,6,24),m.trim,0,.01,0).rotation.x=Math.PI/2;
      for(const [s,elbow]of [[-1,left],[1,right]]){const arm=scene.getObjectByName(s<0?'LArm':'RArm');arm.position.x=s*.20;for(const parent of [arm,elbow])for(const child of [...parent.children])if(child.isMesh)parent.remove(child);ball(arm,id==='liliana'?m.cloth:skin,0,-.13,0,.045,.15,.047);ball(arm,m.trim,0,.005,0,.065,.038,.066);ball(elbow,id==='ilumia'?m.cloth:skin,0,-.13,.02,.039,.14,.041);ball(elbow,m.trim,0,-.23,.022,.044,.018,.043);ball(elbow,skin,0,-.29,.02,.035,.04,.031);}
    }
    if(id==='lauriel')wings(torso,m);
    if(id==='ilumia'){const orbs=group(torso,'DivineOrbs');for(let i=0;i<3;i++){const a=i/3*Math.PI*2;ball(orbs,m.glow,Math.cos(a)*.48,.22+Math.sin(a)*.24,.15,.075,.075,.075);}put(head,new THREE.TorusGeometry(.16,.013,6,24),m.trim,0,.24,0).rotation.x=Math.PI/2;}
    if(id==='telannas'){const bow=group(left,'MorningStar',0,-.28,.03);path(bow,m.trim,[[0,.66,0],[-.23,.48,0],[-.28,0,0],[-.23,-.48,0],[0,-.66,0]],.029);path(bow,m.glow,[[0,.66,0],[.03,0,0],[0,-.66,0]],.006);for(const y of [-.53,.53])ball(bow,m.glow,-.12,y,0,.07,.12,.018);}
    if(id==='liliana'){fox(scene,m);const fan=group(torso,'HumanTails',0,-.25,-.14);for(let i=0;i<9;i++){const a=(i-4)*.21;path(fan,m.cloth,[[0,0,0],[Math.sin(a)*.27,-.22,-.18],[Math.sin(a)*.52,-.20,-.40],[Math.sin(a)*.6,.04,-.55]],.035);}ball(right,m.glow,0,-.37,.10,.07,.07,.07);}
    if(id==='nakroth')for(const [s,elbow]of [[-1,left],[1,right]]){const blade=group(elbow,'JudgementBlade'+s,0,-.28,.04);path(blade,m.metal,[[0,0,0],[s*.18,.08,0],[s*.30,.43,0],[s*.17,.66,0]],.044);path(blade,m.glow,[[s*.10,.03,.045],[s*.25,.42,.045],[s*.17,.64,.045]],.013);}
    if(id==='volkath'){horse(scene,m);const blade=group(right,'DoomBlade',0,-.27,.04);put(blade,new THREE.BoxGeometry(.07,.22,.07),m.dark,0,-.1,0);put(blade,new THREE.BoxGeometry(.35,.065,.08),m.trim,0,.06,0);put(blade,new THREE.BoxGeometry(.17,.9,.045),m.metal,0,.55,0);put(blade,new THREE.ConeGeometry(.09,.27,4),m.glow,0,1.13,0);path(blade,m.glow,[[0,.12,.025],[0,.6,.025],[0,1,.025]],.009);}
  });
  model.scene.userData.forms=id==='liliana'?['human','fox']:id==='volkath'?['foot','mounted']:[];
  // Reuse the body rig; ranged characters hold their arms forward when casting.
  if(['ilumia','lauriel','liliana','telannas'].includes(id)){const attack=model.animations.find(c=>c.name==='Bow_Shoot');if(attack)attack.name='Staff_Attack';}
  return [id,tailorMotion(id,model)];
});}
export function poseLoreForm(object,id,{foxForm=false,mounted=0}={},time=0,moving=false){
  if(id==='liliana'){const fox=object.getObjectByName('FoxForm'),hips=object.getObjectByName('Hips');if(fox){fox.visible=!!foxForm;hips.visible=!foxForm;fox.getObjectByName('NineTails').rotation.y=Math.sin(time*2)*.08;if(moving)for(const s of [-1,1])for(const rear of [0,1])fox.getObjectByName(`FoxLeg${s}_${rear}`).rotation.x=Math.sin(time*12+s+rear*2)*.5;}}
  if(id==='volkath'){const horse=object.getObjectByName('MountedForm');if(horse){horse.visible=mounted>0;object.getObjectByName('Body').position.y=mounted>0?.48:0;for(const name of ['LLeg','RLeg']){const leg=object.getObjectByName(name);leg.visible=true;if(mounted>0){leg.rotation.x=-.8;leg.rotation.z=name==='LLeg'?-.32:.32;object.getObjectByName(name==='LLeg'?'LKnee':'RKnee').rotation.x=1.25;}else{leg.rotation.z=0;object.getObjectByName(name==='LLeg'?'LKnee':'RKnee').rotation.x=0;}}if(moving)for(const s of [-1,1])for(const rear of [0,1])horse.getObjectByName(`HorseLeg${s}_${rear}`).rotation.x=Math.sin(time*11+s+rear*2)*.45;}}
}
