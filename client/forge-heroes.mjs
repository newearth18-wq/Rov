import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {additionalTemplates} from './additional-heroes.mjs';
import {loreTemplates} from './lore-heroes.mjs';
import {humanFace} from './human-face.mjs';
import {tailorBody,tailorMotion} from './hero-tailoring.mjs';
import {finishHero} from './hero-finish.mjs';

// Original articulated character meshes. Coordinates are metres; +Z is the face.
// Geometry is shared by clones, while every character has independent animation state.
const palettes={
  shade:{metal:0x8296aa,trim:0xcaa365,cloth:0x122936,light:0x5ce6ff},
  sentinel:{metal:0xa1aeb1,trim:0xcba355,cloth:0x782b2d,light:0xf6b253},
  ranger:{metal:0x697c6a,trim:0xd4b873,cloth:0x25433c,light:0x8bedb8},
  arcanist:{metal:0x6c6885,trim:0xc7ab6d,cloth:0x312d55,light:0xbc99ff},
  bulwark:{metal:0x7d8685,trim:0xb19765,cloth:0x294555,light:0x5ed5df},
  oracle:{metal:0xc3c7bb,trim:0xd5b778,cloth:0x486477,light:0xffe8a5}
};
function part(parent,name,x,y,z){const group=new THREE.Group();group.name=name;group.position.set(x,y,z);parent.add(group);return group;}
function put(parent,g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
const sphere=(r=.1)=>new THREE.SphereGeometry(r,16,10);
function round(parent,m,x,y,z,sx,sy,sz){return put(parent,sphere(1),m,x,y,z,sx,sy,sz);}
function tube(parent,m,r1,r2,height,x,y,z){return put(parent,new THREE.CylinderGeometry(r1,r2,height,16),m,x,y,z);}
function plate(parent,m,points,depth,x=0,y=0,z=0){const shape=new THREE.Shape();points.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2,steps:1});return put(parent,g,m,x,y,z);}
function cable(parent,m,points,r=.012){return put(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,r,6,false),m);}
function mergePart(group){
  const meshes=group.children.filter(c=>c.isMesh),byMaterial=new Map();
  for(const mesh of meshes){mesh.updateMatrix();const geometry=mesh.geometry.clone().applyMatrix4(mesh.matrix);if(!geometry.index)geometry.setIndex(Array.from({length:geometry.attributes.position.count},(_,i)=>i));const list=byMaterial.get(mesh.material)||[];list.push(geometry);byMaterial.set(mesh.material,list);group.remove(mesh);mesh.geometry.dispose();}
  for(const [material,geometries]of byMaterial){const merged=mergeGeometries(geometries,false);put(group,merged,material);geometries.forEach(g=>g.dispose());}
  for(const child of group.children)if(child.isGroup)mergePart(child);
}
function blade(parent,materials,kind='sword',side=1){
  const {metal,trim,glow,dark}=materials;const weapon=part(parent,'',0,-.34,.01);
  tube(weapon,dark,.028,.026,.16,0,-.06,0);round(weapon,trim,0,.035,0,.05,.026,.045);
  const guard=round(weapon,trim,0,-.145,0,.15,.025,.055);guard.rotation.z=side*.12;weapon.rotation.x=kind==='dagger'?-.38:-.75;
  const long=kind==='great'?.80:kind==='dagger'?.51:.65,width=kind==='great'?.095:kind==='dagger'?.058:.068;
  plate(weapon,metal,[[-width,0],[-width*.9,-long*.73],[0,-long],[width*.9,-long*.73],[width,0]],.022,0,-.18,-.011);
  plate(weapon,glow,[[-.008,-.03],[0,-long*.89],[.008,-.03]],.002,0,-.18,.025);
  if(kind==='dagger'){plate(weapon,trim,[[0,0],[side*.19,-.12],[side*.14,-.23],[side*.04,-.15]],.025,0,-.19,0);}
  return weapon;
}
function staff(parent,m,orbColor){const w=part(parent,'',0,-.27,0);tube(w,m.dark,.023,.028,1.5,0,.16,0);for(const y of [-.56,-.25,.35,.77])tube(w,m.trim,.035,.035,.04,0,y,0);round(w,m.glow,0,1.04,0,.095,.14,.095);for(const s of [-1,1])cable(w,m.trim,[[s*.03,.77,0],[s*.16,.93,0],[s*.13,1.14,0],[s*.04,1.24,0]],.018);return w;}
function shield(parent,m){const w=part(parent,'',0,-.22,.13);plate(w,m.trim,[[-.23,.31],[.23,.31],[.26,.08],[.13,-.3],[0,-.41],[-.13,-.3],[-.26,.08]],.045,0,0,0);plate(w,m.metal,[[-.2,.28],[.2,.28],[.21,.06],[.1,-.26],[0,-.34],[-.1,-.26],[-.21,.06]],.025,0,0,.055);plate(w,m.glow,[[-.018,.22],[0,-.26],[.018,.22]],.005,0,0,.09);round(w,m.trim,0,.02,.10,.064,.064,.022);return w;}
function bow(parent,m){const w=part(parent,'',0,-.26,.04);cable(w,m.trim,[[0,.58,0],[-.15,.43,0],[-.23,.1,0],[-.23,-.18,0],[-.13,-.48,0],[0,-.61,0]],.032);cable(w,m.glow,[[0,.58,0],[.06,-.01,0],[0,-.61,0]],.007);tube(w,m.dark,.037,.037,.16,-.23,-.03,0);return w;}
function cloak(parent,m,kind){const width=kind==='bulwark'?.23:.17,length=kind==='arcanist'||kind==='oracle'?.82:.49;const cloth=plate(parent,m.cloth,[[-width,.1],[-width*.82,-length],[0,-length-.045],[width*.82,-length],[width,.1]],.012,0,0,-.135);cloth.rotation.x=.13;plate(parent,m.trim,[[-.008,.075],[-.008,-length],[.008,-length],[.008,.075]],.005,0,0,-.151);}
function make(id,p=palettes[id],decorate=null){
  const m={};for(const [key,color]of Object.entries({metal:p.metal,trim:p.trim,cloth:p.cloth,dark:0x171e24,leather:0x3c322b})){m[key]=new THREE.MeshStandardMaterial({color,metalness:key==='metal'?.7:key==='trim'?.65:.05,roughness:key==='metal'?.38:key==='trim'?.31:.88});}
  m.glow=new THREE.MeshStandardMaterial({color:p.light,emissive:p.light,emissiveIntensity:.85,roughness:.28,metalness:.15});
  const scene=new THREE.Group(),root=part(scene,'Body',0,0,0),hips=part(root,'Hips',0,.99,0),torso=part(hips,'Torso',0,.09,0);
  round(hips,m.dark,0,0,0,.18,.13,.12);tube(hips,m.trim,.175,.175,.045,0,.06,0).scale.z=.75;
  for(let i=0;i<5;i++)plate(hips,m.metal,[[-.038,.03],[-.043,-.12],[0,-.18],[.043,-.12],[.038,.03]],.02,(i-2)*.07,-.015,.11);
  cloak(hips,m,id);
  // Breastplate follows an athletic torso instead of a large head / short legs.
  const profile=[[.15,0],[.165,.08],[.205,.22],[.24,.31],[.215,.39],[.12,.47]].map(p=>new THREE.Vector2(...p));
  put(torso,new THREE.LatheGeometry(profile,20),m.dark,0,0,0,1,1,.65);
  plate(torso,m.metal,[[-.205,.34],[-.18,.15],[0,.10],[.18,.15],[.205,.34],[.12,.42],[-.12,.42]],.065,0,0,.08);
  plate(torso,m.trim,[[-.17,.35],[0,.27],[.17,.35],[.13,.375],[0,.31],[-.13,.375]],.012,0,0,.15);
  plate(torso,m.glow,[[-.026,.285],[0,.225],[.026,.285],[0,.32]],.01,0,0,.17);
  for(let i=0;i<3;i++)round(torso,m.metal,0,.08-i*.045,.1,.145-i*.012,.021,.025);
  for(const s of [-1,1]){cable(torso,m.trim,[[s*.19,.31,.13],[s*.16,.16,.14],[s*.10,.105,.14]],.008);}
  tube(torso,m.dark,.061,.072,.09,0,.5,0);
  const head=part(torso,'Head',0,.60,0);
  round(head,m.metal,0,.015,0,.118,.145,.116);
  // Sculpted segmented faceplate, recessed visor and luminous eyes.
  plate(head,m.dark,[[-.093,.045],[-.076,-.02],[0,-.048],[.076,-.02],[.093,.045]],.018,0,0,.095);
  for(const s of [-1,1]){const eye=round(head,m.glow,s*.043,.005,.123,.029,.009,.01);eye.rotation.z=s*.13;plate(head,m.trim,[[0,.01],[s*.085,.015],[s*.093,.055],[s*.015,.045]],.012,0,0,.114);}
  plate(head,m.metal,[[-.06,-.027],[0,-.105],[.06,-.027],[0,-.045]],.025,0,0,.104);
  if(id==='shade'){for(const s of [-1,1]){plate(head,m.trim,[[0,0],[s*.10,.18],[s*.09,.05]],.024,s*.07,.09,-.035);}}
  else if(id==='sentinel'||id==='bulwark'){plate(head,m.trim,[[-.027,0],[-.019,.18],[.019,.18],[.027,0]],.14,0,.11,-.075);}
  else{const hood=round(head,m.cloth,0,.05,-.028,.137,.157,.125);plate(head,m.trim,[[-.10,.07],[0,.15],[.1,.07],[0,.11]],.013,0,0,.108);}
  for(const [s,label]of [[-1,'L'],[1,'R']]){
    const leg=part(hips,label+'Leg',s*.12,-.045,0);
    round(leg,m.dark,0,-.22,0,.082,.23,.09);
    round(leg,m.metal,0,-.19,.055,.079,.175,.047);
    cable(leg,m.trim,[[s*.065,-.06,.09],[s*.064,-.2,.095],[s*.04,-.32,.09]],.008);
    const knee=part(leg,label+'Knee',0,-.41,0);round(knee,m.trim,0,-.015,.07,.076,.062,.047);
    round(knee,m.dark,0,-.20,0,.06,.195,.064);round(knee,m.metal,0,-.21,.045,.068,.164,.042);
    plate(knee,m.trim,[[-.009,0],[0,-.29],[.009,0]],.007,0,-.055,.084);
    const foot=part(knee,label+'Foot',0,-.375,.046);round(foot,m.dark,0,0,0,.078,.048,.134);round(foot,m.metal,0,.008,.061,.075,.042,.073);
    const arm=part(torso,label+'Arm',s*.258,.355,0);
    round(arm,m.dark,0,-.15,0,.066,.16,.068);
    const shoulder=round(arm,m.metal,s*.018,.005,0,id==='bulwark'?.17:.113,.095,.128);shoulder.rotation.z=s*.24;
    const rim=round(arm,m.trim,s*.025,-.046,.005,id==='bulwark'?.175:.116,.024,.125);rim.rotation.z=s*.24;
    round(arm,m.metal,0,-.155,.03,.065,.096,.05);
    if(id==='shade'||id==='bulwark')plate(arm,m.trim,[[0,0],[s*.16,.10],[s*.12,-.015]],.10,s*.08,.048,-.05);
    const elbow=part(arm,label+'Elbow',0,-.275,0);round(elbow,m.dark,0,0,0,.068,.062,.068);
    round(elbow,m.metal,0,-.145,.02,.069,.123,.066);
    for(const y of [-.05,-.22])tube(elbow,m.trim,.068,.068,.025,0,y,0);
    plate(elbow,m.glow,[[-.01,0],[0,-.11],[.01,0]],.005,0,-.083,.086);
    round(elbow,m.dark,0,-.29,0,.052,.06,.044);
    arm.rotation.z=s*.16;elbow.rotation.x=-.12;
    if(id==='shade')blade(elbow,m,'dagger',s);
    else if(id==='sentinel'&&s===1)blade(elbow,m,'great');
    else if(id==='bulwark'){if(s===-1)shield(elbow,m);else blade(elbow,m,'sword');}
    else if(id==='ranger'){if(s===-1)bow(elbow,m);else{cable(torso,m.trim,[[.18,.3,-.15],[.22,.1,-.17],[.19,-.16,-.15]],.06);for(let i=0;i<3;i++)tube(torso,m.leather,.012,.012,.50,.17+i*.025,.24,-.17);}}
    else if((id==='arcanist'||id==='oracle')&&s===1)staff(elbow,m,p.light);
  }
  if(id==='oracle'){for(const s of [-1,1])for(let i=0;i<3;i++){plate(torso,m.trim,[[0,0],[s*(.22+i*.055),.16-i*.025],[s*(.19+i*.03),-.11]],.018,s*.14,.36,-.15-i*.035);}}
  if(id==='bulwark')root.scale.set(1.3,1.08,1.15);
  if(!decorate&&['ranger','oracle','shade'].includes(id))tailorBody({ranger:'flowborn',oracle:'ignis',shade:'hayate'}[id],{scene,root,torso,m});
  if(['ranger','oracle','shade'].includes(id)&&!decorate)humanFace(head,id,m);
  if(decorate)decorate({scene,root,torso,head,m});
  finishHero(scene.userData.hero||id,{scene,torso,m});
  mergePart(scene);scene.updateMatrixWorld(true);scene.userData.ground=new THREE.Box3().setFromObject(scene.getObjectByName('LFoot')).min.y;scene.userData.height=new THREE.Box3().setFromObject(head).max.y-scene.userData.ground;
  const track=(node,axis,times,values)=>new THREE.NumberKeyframeTrack(`${node}.rotation[${axis}]`,times,values);
  const clips=[],idle=new THREE.AnimationClip('Idle',2.4,[track('Torso','x',[0,1.2,2.4],[.015,-.018,.015]),track('LArm','z',[0,1.2,2.4],[-.16,-.20,-.16]),track('RArm','z',[0,1.2,2.4],[.16,.20,.16])]);clips.push(idle);
  const runTracks=[];for(const [s,label]of [[-1,'L'],[1,'R']]){runTracks.push(track(label+'Leg','x',[0,.16,.32,.48,.64],[s*.6,0,-s*.6,0,s*.6]));runTracks.push(track(label+'Knee','x',[0,.16,.32,.48,.64],s<0?[.10,.12,.65,.35,.10]:[.65,.35,.10,.12,.65]));runTracks.push(track(label+'Arm','x',[0,.16,.32,.48,.64],[-s*.3,0,s*.3,0,-s*.3]));runTracks.push(track(label+'Elbow','x',[0,.32,.64],[-.48,-.35,-.48]));}runTracks.push(track('Torso','x',[0,.32,.64],[.15,.12,.15]));clips.push(new THREE.AnimationClip('Run',.64,runTracks));
  const attackTimes=[0,.08,.17,.29,.50],ranged=id==='ranger'||id==='arcanist'||id==='oracle';
  const attack=new THREE.AnimationClip(ranged?'Bow_Shoot':'Sword_Attack',.50,[track('Torso','y',attackTimes,[0,-.32,.25,.10,0]),track('RArm','x',attackTimes,[0,-1.5,-.55,.1,0]),track('RArm','z',attackTimes,[.16,.42,-.72,-.16,.16]),track('RElbow','x',attackTimes,[-.12,-.8,-.20,-.12,-.12]),track('LArm','x',attackTimes,[0,ranged?-1.2:-.5,ranged?-1.2:.2,-.2,0])]);clips.push(attack);
  const ult=attack.clone();ult.name='Spell2';ult.duration=1;ult.tracks.forEach(t=>{t.times=Float32Array.from(t.times,v=>v*2);});clips.push(ult);
  const spell=attack.clone();spell.name='Spell1';clips.push(spell);
  clips.push(new THREE.AnimationClip('Roll',.32,[track('Torso','x',[0,.16,.32],[.12,.55,.12]),track('LArm','x',[0,.16,.32],[.1,.55,.1]),track('RArm','x',[0,.16,.32],[.1,.55,.1])]));
  clips.push(new THREE.AnimationClip('Death',.65,[track('Hips','x',[0,.2,.65],[0,-.3,-1.45]),new THREE.NumberKeyframeTrack('Hips.position[y]',[0,.2,.65],[.99,.85,.17])]));
  const result={scene,animations:clips};return !decorate&&['ranger','oracle','shade'].includes(id)?tailorMotion({ranger:'flowborn',oracle:'ignis',shade:'hayate'}[id],result):result;
}
function dragonRider(){
  const material=(color,metalness=0,roughness=.7)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const skin=material(0x2c7770),belly=material(0x779681),horn=material(0xc7bd91),wing=material(0x36505d),gold=material(0xbd9656,.6,.35),robe=material(0x272d4e),face=material(0xc7ad96),hair=material(0xddd5bd),dark=material(0x122329);
  const glow=new THREE.MeshStandardMaterial({color:0xa6f069,emissive:0x70ba3d,emissiveIntensity:.75,roughness:.3});
  const m={metal:gold,trim:gold,dark,glow},scene=new THREE.Group(),body=part(scene,'Body',0,0,0),hips=part(body,'Hips',0,.78,0),torso=part(hips,'Torso',0,0,0);
  round(torso,skin,0,0,0,.31,.24,.60);round(torso,belly,0,-.11,.08,.24,.12,.5);
  for(let i=0;i<5;i++)round(torso,gold,0,.22,-.34+i*.14,.18,.022,.08);
  const neck=part(torso,'DragonNeck',0,.03,.49);round(neck,skin,0,.09,.09,.19,.23,.28);
  const dragonHead=part(neck,'DragonHead',0,.2,.25);
  round(dragonHead,skin,0,0,.09,.19,.14,.32);round(dragonHead,belly,0,-.07,.26,.15,.035,.2);round(dragonHead,dark,0,-.043,.31,.157,.011,.17);
  for(const s of [-1,1]){round(dragonHead,gold,s*.134,.069,.03,.06,.032,.105);round(dragonHead,glow,s*.168,.04,.08,.025,.026,.042);round(dragonHead,dark,s*.083,.04,.36,.024,.017,.023);cable(dragonHead,horn,[[s*.12,.1,-.08],[s*.18,.24,-.22],[s*.13,.3,-.4]],.035);for(let n=0;n<3;n++)put(dragonHead,new THREE.ConeGeometry(.022,.075,6),horn,s*.10,-.024,.15+n*.08).rotation.x=Math.PI;}
  const tail=part(torso,'Tail',0,.03,-.52);cable(tail,skin,[[0,0,0],[.07,-.02,-.32],[.22,-.03,-.72],[.3,.1,-1.2]],.09);cable(tail,horn,[[.3,.1,-1.17],[.27,.14,-1.36],[.17,.20,-1.48]],.025);
  for(let n=0;n<5;n++)put(tail,new THREE.ConeGeometry(.045,.12,5),horn,.08+n*.045,.10,-.12-n*.21).rotation.x=-.3;
  for(const [s,label]of [[-1,'L'],[1,'R']]){
    for(const rear of [false,true]){
      const name=rear?label+'Hind':label+'Leg',leg=part(torso,name,s*.26,-.03,rear?-.4:.35);
      round(leg,skin,s*.04,-.13,-.02,.10,.20,.12);
      const knee=part(leg,rear?label+'HindKnee':label+'Knee',s*.05,-.31,.0);round(knee,skin,0,-.13,.04,.061,.17,.063);
      const foot=part(knee,rear?label+'HindFoot':label+'Foot',0,-.29,.09);round(foot,skin,0,.008,0,.09,.06,.14);for(let n=0;n<3;n++){const claw=put(foot,new THREE.ConeGeometry(.022,.09,6),horn,(n-1)*.05,-.006,.13);claw.rotation.x=Math.PI/2;}
    }
    const wings=part(torso,label+'Wing',s*.2,.17,-.05);cable(wings,gold,[[0,0,0],[s*.44,.15,-.13],[s*.90,.03,-.34],[s*1.13,-.16,-.68]],.026);
    const points=[[0,0,0],[s*.44,.15,-.13],[s*.90,.03,-.34],[s*1.13,-.16,-.68],[s*.71,-.18,-.56],[s*.46,-.15,-.76],[s*.29,-.10,-.46],[0,-.07,-.39]],vertices=[],indices=[];
    for(const p of points)vertices.push(...p);for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();wing.side=THREE.DoubleSide;put(wings,geometry,wing);
    for(const end of [points[4],points[5],points[6]])cable(wings,skin,[points[1],end],.014);
    wings.rotation.z=s*.08;
  }
  // Saddle, seated rider and reins remain part of the same animated mesh template.
  round(torso,dark,0,.21,-.04,.24,.08,.26);tube(torso,gold,.22,.22,.04,0,.25,-.04).scale.z=1.3;
  const rider=part(torso,'Rider',0,.31,-.05);round(rider,robe,0,.14,0,.16,.23,.11);plate(rider,gold,[[-.11,.27],[0,.17],[.11,.27],[.08,.3],[-.08,.3]],.025,0,0,.085);
  const head=part(rider,'Head',0,.45,0);round(head,face,0,.02,0,.08,.105,.084);round(head,hair,0,.052,-.02,.09,.089,.081);plate(head,hair,[[-.049,0],[0,-.10],[.049,0]],.025,0,-.04,.056);for(const s of [-1,1])round(head,dark,s*.027,.018,.079,.012,.007,.009);
  plate(head,gold,[[-.082,.06],[0,.13],[.082,.06],[.065,.10],[0,.18],[-.065,.10]],.045,0,.025,-.025);
  for(const [s,label]of [[-1,'L'],[1,'R']]){
    const leg=part(rider,'Rider'+label+'Leg',s*.14,-.04,.07);round(leg,robe,s*.04,-.075,.05,.08,.13,.085);round(leg,dark,s*.07,-.22,.02,.05,.105,.06);
    const arm=part(rider,label+'Arm',s*.17,.27,0);round(arm,robe,0,-.11,0,.052,.13,.055);round(arm,gold,s*.015,.025,0,.072,.045,.072);const elbow=part(arm,label+'Elbow',0,-.2,0);round(elbow,robe,0,-.08,.03,.047,.10,.05);round(elbow,face,0,-.19,.04,.04,.038,.04);arm.rotation.x=-.42;arm.rotation.z=s*.12;
    if(s===1){const w=staff(elbow,m);w.scale.setScalar(.65);w.rotation.x=.25;}else cable(torso,gold,[[-.17,.32,.03],[-.15,.2,.5],[-.11,.23,.85]],.009);
  }
  cloak(rider,{cloth:robe,trim:gold},'arcanist');
  mergePart(scene);scene.updateMatrixWorld(true);scene.userData.ground=new THREE.Box3().setFromObject(scene.getObjectByName('LFoot')).min.y;scene.userData.height=new THREE.Box3().setFromObject(head).max.y-scene.userData.ground;scene.userData.mounted=true;
  const track=(node,axis,times,values)=>new THREE.NumberKeyframeTrack(`${node}.rotation[${axis}]`,times,values),t=[0,.18,.36,.54,.72],clips=[];
  clips.push(new THREE.AnimationClip('Idle',2.4,[track('Torso','x',[0,1.2,2.4],[.01,-.025,.01]),track('Tail','y',[0,1.2,2.4],[-.12,.16,-.12]),track('LWing','z',[0,1.2,2.4],[-.08,-.16,-.08]),track('RWing','z',[0,1.2,2.4],[.08,.16,.08])]));
  const running=[track('Torso','x',t,[.03,-.025,.03,-.025,.03]),track('Tail','y',t,[-.2,0,.2,0,-.2])];for(const [s,label]of [[-1,'L'],[1,'R']]){running.push(track(label+'Leg','x',t,[s*.43,0,-s*.43,0,s*.43]),track(label+'Hind','x',t,[-s*.35,0,s*.35,0,-s*.35]),track(label+'Knee','x',t,[.1,.25,.08,.2,.1]),track(label+'Wing','z',t,[s*.08,s*.17,s*.08,s*.17,s*.08]));}clips.push(new THREE.AnimationClip('Run',.72,running));
  const a=[0,.12,.25,.4,.6],attack=new THREE.AnimationClip('Bow_Shoot',.6,[track('DragonNeck','x',a,[0,-.25,.23,.08,0]),track('RArm','x',a,[-.42,-1.4,-.6,-.42,-.42]),track('Rider','y',a,[0,-.15,.18,.05,0])]);clips.push(attack);const spell=attack.clone();spell.name='Spell1';clips.push(spell);clips.push(new THREE.AnimationClip('Spell2',1,[track('LWing','z',[0,.25,.65,1],[-.08,-.6,-.35,-.08]),track('RWing','z',[0,.25,.65,1],[.08,.6,.35,.08]),track('DragonNeck','x',[0,.25,.65,1],[0,-.4,-.12,0]),track('RArm','x',[0,.25,.65,1],[-.42,-1.5,-1.2,-.42])]));
  clips.push(new THREE.AnimationClip('Roll',.32,[track('Torso','x',[0,.16,.32],[0,.15,0])]));clips.push(new THREE.AnimationClip('Death',.65,[track('Hips','z',[0,.25,.65],[0,.25,1.15]),new THREE.NumberKeyframeTrack('Hips.position[y]',[0,.25,.65],[.78,.6,.3])]));return {scene,animations:clips};
}
export function forgeTemplates(){return new Map([...Object.keys(palettes).map(id=>[id,id==='arcanist'?dragonRider():['sentinel','bulwark'].includes(id)?tailorMotion(id,make(id)):make(id)]),...additionalTemplates(make),...loreTemplates(make)]);}
