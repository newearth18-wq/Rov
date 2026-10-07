import * as THREE from 'three';
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.83});
const ball=(p,m,x,y,z,sx,sy,sz)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o;};
const strand=(p,m,points,r)=>{const o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),12,r,6,false),m);p.add(o);return o;};
export function humanFace(head,id,m){
  head.clear();const female=['capheny','taara','ilumia','lauriel','liliana','telannas'].includes(id),old=['ignis','oracle'].includes(id),demon=id==='maloch',mask=['hayate','shade'].includes(id);
  const skin=material(demon?0x91454a:old?0xcba996:female?0xe2b6a3:0xccaa93),hair=material(['taara','zata','ignis','oracle','liliana'].includes(id)?0xd9dbe3:id==='capheny'?0x732c48:['ilumia','lauriel'].includes(id)?0xcaa775:id==='telannas'?0xb3a0ce:0x25303d),ink=material(0x252c37),white=material(0xf7eee5),iris=material(['ilumia','lauriel','telannas','liliana','taara'].includes(id)?0x608ea5:0x795b3d),lip=material(0xab6d69);
  // A tapered jaw, nose and layered eyes replace the flat visor on human heroes.
  const face=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),skin);face.position.y=.02;face.scale.set(female?.091:.104,.126,.088);head.add(face);
  ball(head,skin,0,-.062,.015,female?.065:.075,.055,.065);ball(head,hair,0,.079,-.031,.105,.093,.095);
  ball(head,skin,0,.002,.090,.013,.024,.016);ball(head,skin,0,-.019,.098,.014,.008,.012);
  for(const s of [-1,1]){ball(head,skin,s*.093,.018,0,.019,.037,.014);ball(head,white,s*.035,.030,.088,.022,.010,.006);ball(head,iris,s*.034,.029,.094,.009,.009,.003);ball(head,ink,s*.034,.029,.097,.0038,.0065,.002);ball(head,white,s*.037,.033,.099,.002,.002,.0015);
    strand(head,ink,[[s*.016,.045,.091],[s*.035,.048,.090],[s*.054,.044,.082]],female?.004:.005);
    strand(head,hair,[[s*.068,.103,.023],[s*.063,.087,.078],[s*.031,.072,.085],[s*.018,.059,.089]],.016);
    if(female)strand(head,hair,[[s*.088,.067,-.035],[s*.1,-.049,-.057],[s*.075,-.27,-.095]],.024);
  }
  if(!mask&&!old){ball(head,lip,0,-.047,.082,.020,.005,.005);ball(head,skin,0,-.058,.080,.019,.004,.004);}
  if(mask){ball(head,m.cloth,0,-.056,.065,.093,.045,.036);ball(head,m.cloth,0,.104,-.009,.115,.032,.101);}
  if(old){ball(head,hair,0,-.075,.058,.073,.081,.039);strand(head,hair,[[-.07,-.03,.075],[0,-.019,.094],[.07,-.03,.075]],.013);}
  head.userData.faceStyle='sculpted';
}
