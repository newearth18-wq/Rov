/* Original sound designs, generated locally. No third-party recordings. */
(function(root){
  const durations={sword:.28,gun:.22,cannon:.48,bow:.3,fire:.65,magic:.6,dash:.35,shield:.5,heal:.65,impact:.2,turret:.5,death:.8,kill:1,level:.8,start:1.25,win:2.1,loss:1.6,recall:.9,buy:.25,ultimate:1};
  function synth(kind,rate=44100){
    const duration=durations[kind]||.35,out=new Float32Array(Math.ceil(duration*rate));let seed=1234567,low=0,phase=0;
    const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
    for(let i=0;i<out.length;i++){
      const t=i/rate,u=t/duration,n=noise();low+=.12*(n-low);let v=0;
      const pulse=(freq,decay,amp=1)=>Math.sin(2*Math.PI*freq*t)*Math.exp(-t*decay)*amp;
      const sweep=(from,to,decay,amp=1)=>{phase+=2*Math.PI*(from+(to-from)*u)/rate;return Math.sin(phase)*Math.exp(-t*decay)*amp;};
      if(kind==='gun')v=n*.8*Math.exp(-t*38)+pulse(95,24,.9)+pulse(2100,70,.2);
      else if(kind==='cannon'||kind==='turret')v=low*2*Math.exp(-t*9)+sweep(145,35,9,.8)+n*.3*Math.exp(-t*40);
      else if(kind==='sword')v=(n-low)*Math.sin(Math.PI*u)*Math.exp(-t*6)*.7+pulse(1800,35,.23)+pulse(2450,28,.13);
      else if(kind==='bow')v=n*Math.exp(-t*28)*.3+sweep(1350,350,18,.3)+pulse(180,20,.5);
      else if(kind==='impact')v=n*.5*Math.exp(-t*35)+pulse(120,25,.8)+pulse(870,45,.2);
      else if(kind==='fire')v=low*2.5*Math.sin(Math.PI*u)*Math.exp(-t*2)+n*.35*Math.exp(-t*5)+pulse(75,6,.4);
      else if(kind==='dash')v=(n-low)*Math.sin(Math.PI*u)*.65+sweep(900,180,7,.16);
      else if(kind==='shield')v=pulse(340,6,.45)+pulse(680,7,.25)+pulse(1358,8,.17)+n*Math.exp(-t*35)*.14;
      else if(kind==='magic'||kind==='ultimate')v=sweep(kind==='ultimate'?130:480,kind==='ultimate'?850:1150,3,.33)+pulse(660,4,.2)+pulse(990,5,.15)+low*Math.exp(-t*5)*.5;
      else if(kind==='death'||kind==='loss')v=sweep(220,65,2,.28)+pulse(110,2,.22)+low*Math.exp(-t*3)*.7;
      else {
        const notes=kind==='win'?[523.25,659.25,783.99,1046.5]:kind==='start'?[261.63,392,523.25,783.99]:kind==='kill'?[659.25,783.99,1046.5]:kind==='level'?[523.25,659.25,1046.5]:kind==='heal'?[523.25,783.99]:kind==='recall'?[392,587.33,783.99]:[880,1320];
        for(let k=0;k<notes.length;k++){const a=t-k*duration*.13;if(a>=0)v+=(Math.sin(2*Math.PI*notes[k]*a)+.25*Math.sin(4*Math.PI*notes[k]*a))*Math.exp(-a*5)*.22*Math.min(1,a*150);}
      }
      const edge=Math.min(1,t*500,(duration-t)*150);out[i]=Math.tanh(v*1.2)*edge*.7;
    }return out;
  }
  root.RiftSoundDesign={synth,durations};
})(typeof globalThis!=='undefined'?globalThis:this);
