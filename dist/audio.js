'use strict';
// Audio starts only on a trusted gesture. Muting/volume are remembered per browser.
(function(){
  let enabled=true,volume=.7;try{enabled=localStorage.getItem('rift.sound')!=='off';volume=Number(localStorage.getItem('rift.volume')||.7);}catch{}
  volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.7;let master,analyser,ambience,ambientGain,unlocked=false,previous=null,lastMatch=null,lastTime=-1,lastAudible=null,voices=0,peak=0,seen=new Map(),buffers=new Map(),cooldowns=new Map();
  const btn=$('soundBtn'),slider=$('soundVolume');
  function status(){sound=enabled;btn.textContent='เสียง: '+(enabled?'เปิด':'ปิด');btn.setAttribute('aria-label',enabled?'ปิดเสียง':'เปิดเสียง');btn.setAttribute('aria-pressed',String(enabled));btn.dataset.audioState=!enabled?'muted':audioContext?.state||'waiting';slider.value=String(Math.round(volume*100));if(master&&audioContext)master.gain.setTargetAtTime(enabled?volume:0,audioContext.currentTime,.025);}
  function unlock(){if(!enabled)return;try{if(!audioContext){audioContext=new (window.AudioContext||window.webkitAudioContext)();master=audioContext.createGain();const limiter=audioContext.createDynamicsCompressor();limiter.threshold.value=-14;limiter.ratio.value=5;analyser=audioContext.createAnalyser();analyser.fftSize=256;master.connect(limiter);limiter.connect(analyser);analyser.connect(audioContext.destination);const b=audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate),d=b.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v+=(Math.random()*2-1-v)*.015;d[i]=v*.08;}ambience=audioContext.createBufferSource();ambience.buffer=b;ambience.loop=true;ambientGain=audioContext.createGain();ambientGain.gain.value=0;ambience.connect(ambientGain);ambientGain.connect(master);ambience.start();}unlocked=true;status();if(audioContext.state==='suspended')void audioContext.resume().then(status).catch(()=>{});}catch{btn.dataset.audioState='unavailable';}}
  function play(kind,at=null,important=false){if(!enabled||!unlocked||!audioContext||audioContext.state!=='running'||document.hidden||voices>=24)return;
    const now=audioContext.currentTime,last=cooldowns.get(kind)||-10;const spacing=important?.15:({impact:.1,sword:.12,gun:.07,fire:.18,magic:.15,cannon:.15,turret:.18}[kind]||.09);if(now-last<spacing)return;
    let loud=important?.72:.48,pan=0;if(at&&game?.player){const p=game.player,d=Math.hypot(at.x-p.x,at.y-p.y);if(d>600&&!important)return;loud*=Math.max(.06,(1-d/650)**2);pan=Math.max(-.85,Math.min(.85,(at.x-p.x)/500));}
    cooldowns.set(kind,now);
    let buffer=buffers.get(kind);if(!buffer){const pcm=RiftSoundDesign.synth(kind,audioContext.sampleRate);buffer=audioContext.createBuffer(1,pcm.length,audioContext.sampleRate);buffer.copyToChannel(pcm,0);buffers.set(kind,buffer);}
    const source=audioContext.createBufferSource(),gain=audioContext.createGain(),panner=audioContext.createStereoPanner();source.buffer=buffer;source.playbackRate.value=important?1:.96+Math.random()*.08;gain.gain.value=loud;panner.pan.value=pan;source.connect(gain);gain.connect(panner);panner.connect(master);voices++;source.onended=()=>{voices--;source.disconnect();gain.disconnect();panner.disconnect();};source.start();btn.dataset.lastSound=kind;btn.dataset.soundCount=String((Number(btn.dataset.soundCount)||0)+1);const counter='sound'+kind[0].toUpperCase()+kind.slice(1);btn.dataset[counter]=String((Number(btn.dataset[counter])||0)+1);
  }
  // Remove the old beep calls; events are now matched to the real combat action.
  tone=function(){};
  btn.onclick=()=>{enabled=!enabled;try{localStorage.setItem('rift.sound',enabled?'on':'off');}catch{}status();if(enabled){unlock();play('buy',null,true);}};
  slider.oninput=()=>{volume=Number(slider.value)/100;try{localStorage.setItem('rift.volume',String(volume));}catch{}status();unlock();};
  document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioContext?.state==='running')void audioContext.suspend().then(status);});
  status();
  function frame(){
    const audible=enabled&&!document.hidden&&!game?.paused&&(typeof net==='undefined'||!net.localPause);
    if(master&&audioContext&&audible!==lastAudible){master.gain.setTargetAtTime(audible?volume:0,audioContext.currentTime,.025);lastAudible=audible;}
    if(ambientGain&&audioContext)ambientGain.gain.setTargetAtTime(game&&!game.finished&&!game.paused&&!document.hidden?.28:0,audioContext.currentTime,.2);
    if(game&&game.time<lastTime){seen.clear();previous=null;}
    if(game?.matchId!==lastMatch){seen.clear();previous=null;}lastMatch=game?.matchId;lastTime=game?.time??-1;
    if(game&&!game.paused&&!document.hidden){
      const p=game.player,current={kills:p.kills,level:p.level,dead:p.dead,finished:game.finished,recall:p.recall,inventory:p.inventory.length};
      if(!previous){play('start',null,true);}else{
        if(current.kills>previous.kills)play('kill',null,true);
        if(current.level>previous.level)play('level',null,true);
        if(current.dead&&!previous.dead)play('death',null,true);
        if(current.recall>previous.recall)play('recall',p);
        if(current.inventory>previous.inventory)play('buy',null,true);
        if(current.finished&&!previous.finished)play(game.winner===p.team?'win':'loss',null,true);
      }previous=current;
      for(const f of effects){if(!f.sound||seen.has(f.fxId))continue;seen.set(f.fxId,game.time);const source=game.entities.find(e=>e.id===f.source);if(source&&source.type==='hero'&&!visibleToTeam(source,p.team)&&distance(source,p)>175)continue;play(f.sound,f);}
      for(const [id,t]of seen)if(game.time-t>5)seen.delete(id);
    }else if(!game)previous=null;
    if(analyser){const meter=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(meter);let sum=0;for(const v of meter)sum+=v*v;const rms=Math.sqrt(sum/meter.length);peak=Math.max(peak,rms);btn.dataset.audioRms=rms.toFixed(5);btn.dataset.audioPeak=peak.toFixed(5);btn.dataset.audioState=enabled?audioContext.state:'muted';}
    requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
})();
