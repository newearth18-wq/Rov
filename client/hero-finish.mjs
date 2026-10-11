import * as THREE from 'three';

// Small sculpted accents are merged with the existing rig and used in both portraits and matches.
export function finishHero(id,{scene,torso,m}){
  const caster=['oracle','ignis','zata','ilumia','lauriel','liliana'].includes(id);
  const cloth=new THREE.Shape();cloth.moveTo(-.085,0);cloth.quadraticCurveTo(-.14,-.23,-.09,-.50);cloth.lineTo(0,-.59);cloth.lineTo(.09,-.50);cloth.quadraticCurveTo(.14,-.23,.085,0);cloth.closePath();
  for(const side of [-1,1]){
    const panel=new THREE.Mesh(new THREE.ExtrudeGeometry(cloth,{depth:.008,bevelEnabled:false}),m.cloth);
    panel.position.set(side*.11,.07,-.14);panel.rotation.y=side*.30;panel.rotation.z=side*.13;torso.add(panel);
    const seam=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(side*.11,.06,-.155),new THREE.Vector3(side*.13,-.19,-.17),new THREE.Vector3(side*.12,-.46,-.17)]),10,.007,4,false),m.trim);torso.add(seam);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.035),m.glow);gem.position.set(side*.13,.32,.125);gem.scale.set(.65,1.3,.4);torso.add(gem);
    const wrist=scene.getObjectByName(side<0?'LElbow':'RElbow');
    if(wrist){const cuff=new THREE.Mesh(new THREE.TorusGeometry(.047,.009,5,12),m.trim);cuff.rotation.x=Math.PI/2;cuff.position.set(0,-.24,.01);wrist.add(cuff);}
  }
  if(caster){const halo=new THREE.Mesh(new THREE.TorusGeometry(.19,.009,5,28),m.trim);halo.rotation.x=Math.PI/2;halo.position.y=.21;scene.getObjectByName('Head').add(halo);}
  scene.userData.finish='sculpted-v19';
}
