import * as THREE from 'three';
const textures=new Map(),pending=[];
export function surface(kind){
  if(textures.has(kind))return textures.get(kind);
  let complete;pending.push(new Promise(resolve=>{complete=resolve;}));
  const texture=new THREE.TextureLoader().load(`assets/terrain/${kind}-v6.webp`,()=>complete(true),undefined,()=>complete(false));
  texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;
  texture.repeat.set(...(kind==='grass'?[30,24]:kind==='dirt'?[2,2]:[1,1]));textures.set(kind,texture);
  return texture;
}
export async function surfacesReady(){return(await Promise.all(pending)).every(Boolean);}
