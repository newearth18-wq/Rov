const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {sandbox,run,el}=require('./smoke.cjs');
const load=name=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/',name),'utf8'),sandbox);
load('audio-synthesis.js');
for(const kind of Object.keys(sandbox.RiftSoundDesign.durations)){const pcm=sandbox.RiftSoundDesign.synth(kind,22050);assert.ok(pcm.every(Number.isFinite),kind+' finite');const rms=Math.sqrt(pcm.reduce((s,n)=>s+n*n,0)/pcm.length);assert.ok(rms>.01&&rms<.5,kind+' audible without clipping');assert.ok(Math.max(...pcm)<.95,kind+' headroom');assert.ok(Math.abs(pcm[0])<.001&&Math.abs(pcm.at(-1))<.01,kind+' click-free edges');}
assert.notDeepEqual(sandbox.RiftSoundDesign.synth('gun'),sandbox.RiftSoundDesign.synth('sword'),'distinct weapons');
load('battle-feedback.js');
run(`startGame();game.wave=999;game.player.x=700;game.player.y=500;const target=game.entities.find(e=>e.type==='hero'&&e.team===1);target.x=740;target.y=500;const shieldBefore=target.hp;damage(target,100,game.player);`);
assert.ok(run("effects.some(e=>e.type==='impact'&&e.target===target.id&&e.sound==='impact')"),'actual damage creates visual and audio event');
run('const beforeRejected=effects.length;target.invulnerable=1;damage(target,100,game.player);');assert.ok(run('effects.length===beforeRejected'),'invulnerable hit creates no impact');
run('target.invulnerable=0;game.player.cd.q=0;useSkill("q");const eventsBeforeRejected=effects.length;useSkill("q");');assert.ok(run('effects.length===eventsBeforeRejected'),'failed skill does not make sound');
run('effects=[];');
let frames=[],listeners={},stored={},sources=[],nodes=[];
sandbox.localStorage={getItem:k=>stored[k]??null,setItem:(k,v)=>stored[k]=v};
sandbox.document.addEventListener=(n,f)=>listeners[n]=f;sandbox.requestAnimationFrame=f=>frames.push(f);sandbox.document.hidden=false;
function node(){const n={gain:{value:1,setTargetAtTime(v){this.value=v;}},pan:{value:0},threshold:{value:0},ratio:{value:0},connect(){},disconnect(){}};nodes.push(n);return n;}
class AudioContext{constructor(){this.state='running';this.currentTime=1;this.sampleRate=22050;this.destination={};}createGain(){return node();}createDynamicsCompressor(){return node();}createAnalyser(){return {fftSize:256,connect(){},getFloatTimeDomainData(a){a.fill(.03);}};}createBuffer(c,length){return {copyToChannel(){},getChannelData(){return new Float32Array(length);}};}createBufferSource(){const s={...node(),playbackRate:{value:1},start(){sources.push(this);}};return s;}createStereoPanner(){return node();}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}}
sandbox.window.AudioContext=AudioContext;load('audio.js');
const frame=()=>{const f=frames.shift();assert.ok(f);f();};
assert.equal(el('soundBtn').dataset.audioState,'waiting','wait for user gesture');assert.equal(sources.length,0,'no autoplay');
listeners.pointerdown();frame();assert.equal(el('soundBtn').dataset.lastSound,'start');assert.ok(sources.length>=2,'audio buffers connected and started');
const count=el('soundBtn').dataset.soundCount;run('game={...game};effects=effects.map(e=>({...e}));');frame();assert.equal(el('soundBtn').dataset.soundCount,count,'snapshot replay does not duplicate sounds');
el('soundBtn').onclick();assert.equal(stored['rift.sound'],'off');assert.equal(nodes[0].gain.value,0,'mute silences master');run('battleEvent("sound",game.player,{sound:"gun"});');frame();assert.equal(el('soundBtn').dataset.soundCount,count,'muted action is silent');
el('soundBtn').onclick();assert.equal(stored['rift.sound'],'on');el('soundVolume').value='35';el('soundVolume').oninput();assert.equal(stored['rift.volume'],'0.35');assert.equal(nodes[0].gain.value,.35,'volume reaches output gain');
run('audioContext.currentTime=3;battleEvent("sound",{x:1490,y:10},{sound:"gun"});');const distant=el('soundBtn').dataset.soundCount;frame();assert.equal(el('soundBtn').dataset.soundCount,distant,'faraway battle is inaudible');
run('audioContext.currentTime=4;game.player.kills++;game.time+=1;');frame();assert.equal(el('soundBtn').dataset.lastSound,'kill','kill cue follows player stats');
run('audioContext.currentTime=6;game.finished=true;game.winner=game.player.team;');frame();assert.equal(el('soundBtn').dataset.lastSound,'win','victory cue');
console.log('PASS: 20 original sound designs, signal/headroom, accepted combat events, autoplay unlock, mute/volume, snapshot deduplication, distance, kill and victory cues.');
