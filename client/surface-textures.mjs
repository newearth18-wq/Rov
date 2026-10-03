import * as THREE from 'three';
export function surface(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');let seed=1927;
  const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  if(kind==='grass'){
    ctx.fillStyle='#385344';ctx.fillRect(0,0,512,512);
    for(let n=0;n<85;n++){const x=random()*512,y=random()*512,r=15+random()*65;const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,n%3?'#526b4638':'#243e3b66');glow.addColorStop(1,'#38534400');ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);}
    for(let n=0;n<14000;n++){const x=random()*512,y=random()*512;ctx.fillStyle=n%3?'#adc08418':'#061e1828';ctx.fillRect(x,y,1+random()*2,1+random()*3);}
    for(let n=0;n<650;n++){const x=random()*512,y=random()*512;ctx.strokeStyle=n%2?'#879a6138':'#1b342944';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x-2,y+3);ctx.lineTo(x,y-3);ctx.lineTo(x+2,y+3);ctx.stroke();}
  }else{
    ctx.fillStyle='#505d53';ctx.fillRect(0,0,512,512);
    for(let row=0;row<8;row++)for(let col=-1;col<5;col++){const x=col*128+(row%2?64:0),y=row*64,shade=Math.floor(112+random()*10);ctx.fillStyle=`rgb(${shade},${shade+5},${shade-9})`;ctx.fillRect(x+2,y+2,124,60);ctx.strokeStyle='#b2b6a34a';ctx.strokeRect(x+4,y+4,120,56);if(random()>.55){ctx.strokeStyle='#414d4a88';ctx.beginPath();ctx.moveTo(x+20,y+5);ctx.lineTo(x+45,y+28);ctx.lineTo(x+37,y+60);ctx.stroke();}if(random()>.4){ctx.fillStyle='#3c654147';ctx.fillRect(x+2,y+51,22+random()*40,10);}}
    for(let n=0;n<8000;n++){ctx.fillStyle=n%2?'#e4e7c914':'#0c171a22';ctx.fillRect(random()*512,random()*512,1,1);}
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(kind==='grass'?22:28,kind==='grass'?17:2);texture.anisotropy=4;return texture;
}
