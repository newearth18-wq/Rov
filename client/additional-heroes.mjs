import * as THREE from 'three';
import {tailorBody,tailorMotion} from './hero-tailoring.mjs';

// Rift Arena interpretations of the ten heroes in the user's reference video.
// Each portrait and battlefield instance comes from this same articulated template.
const config={
  stuart:['sentinel',0x586372,0xc7a87f,0x732c40,0xff955e],
  capheny:['ranger',0x798f98,0xc2a16a,0x733443,0xfcad6e],
  maloch:['bulwark',0x592d38,0xaf7c46,0x24202d,0xff6046],
  ignis:['oracle',0xbbb6a7,0xc9a653,0x8a3025,0xffb453],
  mortos:['bulwark',0xa9b4bd,0xccb36a,0x29396c,0xf1dfa0],
  taara:['sentinel',0x8daebb,0xb8c7ce,0x243b64,0x85ddff],
  elsu:['ranger',0x56616d,0xada38a,0x253245,0xa9d6ee],
  hayate:['shade',0x393f59,0xb3816d,0x501f31,0xfc7061],
  flowborn:['ranger',0x75848d,0xbcb08a,0x123d49,0x62e1ef],
  zata:['oracle',0x9cb6ba,0xceb578,0x243747,0x6be3dc]
};
function group(parent,x=0,y=0,z=0){const n=new THREE.Group();n.position.set(x,y,z);parent.add(n);return n;}
function put(parent,g,m,x=0,y=0,z=0,sx=1,sy=1,sz=1){const n=new THREE.Mesh(g,m);n.position.set(x,y,z);n.scale.set(sx,sy,sz);n.castShadow=true;n.receiveShadow=true;parent.add(n);return n;}
const material=(c,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness:metalness?.4:.8,metalness});
function ball(parent,m,x,y,z,sx,sy,sz){return put(parent,new THREE.SphereGeometry(1,12,8),m,x,y,z,sx,sy,sz);}
function cable(parent,m,points,r=.018){return put(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,6,false),m);}
function face(head,id,m){
  head.clear();const female=id==='capheny'||id==='taara',old=id==='ignis',demon=id==='maloch',skin=material(demon?0x8c3f41:id==='zata'?0x968d80:0xc4aa99),hair=material(old||id==='taara'||id==='zata'?0xd6d2c9:id==='capheny'?0x73313a:0x242c35);
  ball(head,skin,0,.015,0,female?.10:.11,.13,.104);ball(head,hair,0,.075,-.025,.117,.10,.104);ball(head,skin,0,-.006,.104,.017,.033,.018);
  for(const s of [-1,1]){ball(head,m.dark,s*.039,.02,.101,.018,.009,.008);ball(head,skin,s*.103,.01,0,.025,.044,.018);}
  if(id==='stuart'||id==='elsu'){ball(head,hair,-.044,.087,.055,.06,.08,.06);const scarf=ball(head,id==='stuart'?m.cloth:m.trim,0,-.12,-.015,.133,.045,.117);}
  if(female){for(const s of [-1,1]){ball(head,hair,s*.09,.065,-.065,.055,.12,.055);cable(head,hair,[[s*.11,.01,-.085],[s*.14,-.13,-.13],[s*.10,-.29,-.11]],.032);}}
  if(old){ball(head,hair,0,-.06,.071,.089,.105,.055);put(head,new THREE.ConeGeometry(.055,.15,8),hair,0,-.16,.078).rotation.z=Math.PI;}
  if(demon){for(const s of [-1,1])cable(head,m.trim,[[s*.08,.09,-.025],[s*.16,.20,-.05],[s*.20,.37,-.11],[s*.11,.42,-.15]],.027);ball(head,m.glow,0,.003,.108,.095,.012,.015);}
  if(id==='hayate'){ball(head,m.cloth,0,-.06,.071,.102,.057,.047);ball(head,m.cloth,0,.10,-.01,.129,.054,.113);}
  if(id==='flowborn')cable(head,hair,[[0,.08,-.10],[.08,.13,-.22],[.12,-.1,-.23]],.04);
  if(id==='zata'){for(const s of [-1,1]){const ear=put(head,new THREE.ConeGeometry(.028,.15,5),skin,s*.12,.025,0);ear.rotation.z=-s*.7;}ball(head,hair,.07,.087,.056,.045,.092,.045);}
}
function gun(elbow,m,kind){const w=group(elbow,0,-.29,.025);const heavy=kind==='capheny',rifle=kind==='elsu',length=heavy?.8:rifle?1.1:.36;
  put(w,new THREE.BoxGeometry(heavy?.20:.075,.22,heavy?.20:.085),m.metal,0,-.07,0);put(w,new THREE.BoxGeometry(.07,.15,.12),m.dark,0,.035,-.07);
  if(heavy){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;put(w,new THREE.CylinderGeometry(.025,.025,length,10),m.dark,Math.cos(a)*.078,-length/2-.11,Math.sin(a)*.078);}
    for(const y of [-.18,-.55,-.84])put(w,new THREE.CylinderGeometry(.12,.12,.045,12),m.trim,0,y,0);ball(w,m.glow,0,-.87,0,.085,.015,.085);put(w,new THREE.BoxGeometry(.16,.3,.14),m.cloth,.16,-.19,0);
  }else{put(w,new THREE.CylinderGeometry(rifle?.029:.036,rifle?.029:.036,length,12),m.dark,0,-length/2-.10,0);put(w,new THREE.CylinderGeometry(.041,.041,.045,12),m.trim,0,-length-.12,0);if(rifle){put(w,new THREE.BoxGeometry(.078,.30,.10),m.cloth,0,.05,0);const scope=put(w,new THREE.CylinderGeometry(.038,.038,.24,10),m.metal,0,-.25,.086);ball(w,m.glow,0,-.38,.086,.034,.012,.034);}}
  return w;
}
function hammer(elbow,m){const w=group(elbow,0,-.29,0);put(w,new THREE.CylinderGeometry(.035,.035,1.07,12),m.dark,0,-.24,0);put(w,new THREE.BoxGeometry(.49,.23,.27),m.metal,0,-.74,0);for(const s of [-1,1])put(w,new THREE.BoxGeometry(.065,.27,.31),m.trim,s*.245,-.74,0);ball(w,m.glow,0,-.74,.15,.069,.069,.017);w.rotation.x=-.7;}
function cleaver(elbow,m){const w=group(elbow,0,-.3,0);put(w,new THREE.CylinderGeometry(.036,.036,1.1,12),m.dark,0,-.28,0);const blade=put(w,new THREE.BoxGeometry(.52,.47,.06),m.metal,.17,-.71,0);blade.rotation.z=-.24;put(w,new THREE.BoxGeometry(.11,.54,.075),m.trim,.4,-.66,0).rotation.z=-.24;w.rotation.x=-.6;}
function bow(elbow,m){const w=group(elbow,0,-.28,.03);cable(w,m.trim,[[0,.50,0],[-.15,.32,0],[-.19,0,0],[-.13,-.31,0],[0,-.5,0]],.028);cable(w,m.glow,[[0,.50,0],[.065,0,0],[0,-.5,0]],.007);}
function throwingStar(elbow,m){const w=group(elbow,0,-.31,.06);for(let i=0;i<4;i++){const a=i*Math.PI/2,p=put(w,new THREE.ConeGeometry(.06,.26,3),m.metal,Math.sin(a)*.12,Math.cos(a)*.12,0);p.rotation.z=-a;}ball(w,m.trim,0,0,.02,.056,.056,.018);}
function wings(torso,m,demon){for(const s of [-1,1]){const w=group(torso,s*.13,.34,-.16);w.rotation.z=s*.12;if(demon){const pts=[0,0,0,s*.52,.22,-.10,s*.78,-.02,-.18,s*.46,-.19,-.08,s*.24,-.10,-.02],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setIndex([0,1,3,1,2,3,0,3,4]);g.computeVertexNormals();const membrane=m.cloth.clone();membrane.side=THREE.DoubleSide;put(w,g,membrane);cable(w,m.trim,[[0,0,0],[s*.52,.22,-.1],[s*.78,-.02,-.18]],.02);}else for(let i=0;i<7;i++){const feather=ball(w,i%2?m.cloth:m.metal,s*(.16+i*.045),.17-i*.055,-.035*i,.045,.35-i*.018,.014);feather.rotation.z=-s*(.5+i*.1);}}}
export function additionalTemplates(factory){return Object.entries(config).map(([id,[base,metal,trim,cloth,light]])=>[id,tailorMotion(id,factory(base,{metal,trim,cloth,light},({scene,root,torso,head,m})=>{
  tailorBody(id,{scene,root,torso,m});
  if(id!=='mortos')face(head,id,m);
  const left=scene.getObjectByName('LElbow'),right=scene.getObjectByName('RElbow');for(const elbow of [left,right])for(const child of [...elbow.children])if(child.isGroup)elbow.remove(child);
  if(id==='stuart'){gun(left,m,id);gun(right,m,id);for(const s of [-1,1])ball(torso,m.cloth,s*.16,-.15,-.10,.11,.4,.06);}
  if(id==='capheny'){gun(right,m,id);}
  if(id==='elsu'){gun(right,m,id);cable(torso,m.cloth,[[-.13,.45,.14],[.1,.38,.15],[.17,.05,.10]],.04);}
  if(id==='taara')hammer(right,m);
  if(id==='maloch'){cleaver(right,m);wings(torso,m,true);root.scale.set(1.45,1.10,1.16);}
  if(id==='mortos'){
    const sword=group(right,0,-.3,0);put(sword,new THREE.BoxGeometry(.07,.8,.025),m.metal,0,-.5,0);put(sword,new THREE.BoxGeometry(.27,.025,.055),m.trim,0,-.09,0);sword.rotation.x=-.6;put(left,new THREE.BoxGeometry(.32,.58,.06),m.metal,0,-.22,.1);put(left,new THREE.BoxGeometry(.035,.5,.025),m.trim,0,-.22,.14);
  }
  if(id==='hayate'){throwingStar(left,m);throwingStar(right,m);cable(head,m.cloth,[[0,-.08,-.08],[.18,-.1,-.25],[.31,-.14,-.48]],.035);}
  if(id==='flowborn'){bow(left,m);put(right,new THREE.TorusGeometry(.105,.012,6,20),m.glow,0,-.14,.13);}
  if(id==='ignis'){
    const staff=group(right,0,-.3,0);put(staff,new THREE.CylinderGeometry(.024,.024,1.7,12),m.trim,0,.15,0);ball(staff,m.glow,0,1.08,0,.13,.2,.13);put(staff,new THREE.TorusGeometry(.18,.018,6,20),m.trim,0,1.06,0);for(const s of [-1,1])ball(torso,m.cloth,s*.17,-.30,0,.13,.47,.11);
  }
  if(id==='zata'){wings(torso,m,false);for(const elbow of [left,right])ball(elbow,m.glow,0,-.3,.08,.06,.06,.025);}
  scene.userData.hero=id;
}))]);}
