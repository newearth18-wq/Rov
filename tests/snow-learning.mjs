import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {makeSnow,stepSnow,SNOW_WORLD} from '../server/snow-game.mjs';
import worker from '../server/worker.mjs';
const require=createRequire(import.meta.url),DB=require('../server/local-db.cjs').createDb();
async function call(route,method='GET',data,token){const r=await worker.fetch(new Request('https://learning.test/api/'+route,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:method==='GET'?undefined:JSON.stringify(data)}),{DB},{});return {status:r.status,data:await r.json()};}
async function ok(...args){const r=await call(...args);assert.ok(r.status<300,JSON.stringify(r));return r.data;}
const teacher=await ok('teachers','POST',{}),bank=(await ok('lesson-banks','GET',undefined,teacher.token)).banks[0];
const control=(room,action)=>ok(`classes/${room.code}/control`,'POST',{action},teacher.token);
const makeInput=(seq,extra={})=>({seq,move:{x:1,y:0},commands:[],active:true,...extra});
for(const mode of ['split','mass']){
 const room=await ok('classes','POST',{bankId:bank.id,mode,minutes:8,activity:'snow'},teacher.token),players=[];
 for(let i=0;i<50;i++)players.push(await ok(`classes/${room.code}/join`,'POST',{name:'นักเรียน '+i,hero:'telannas'}));
 assert.equal((await call(`classes/${room.code}/join`,'POST',{name:'51',hero:'telannas'})).status,409);
 assert.equal((await call(`classes/${room.code}/play-question`,'GET',undefined,players[0].token)).status,409);
 for(let i=0;i<3;i++)await control(room,'next');
 let frames=await Promise.all(players.map(p=>ok(`classes/${room.code}/snow-frame`,'POST',makeInput(1,{x:999999,role:'zombie',energy:99999}),p.token)));
 frames.forEach((f,i)=>{assert.equal(f.state.players.length,mode==='mass'?50:10);assert.equal(f.state.players.filter(p=>p.zombie).length,1);assert.equal(f.resources.energy,1000);assert.ok(f.state.players.some(p=>p.id===players[i].playerId));assert.ok(!f.state.players.some(p=>p.x===999999));});
 const p=players[0],question=await ok(`classes/${room.code}/play-question`,'GET',undefined,p.token),q=bank.questions.find(q=>q.id===question.question.id);
 assert.ok(!('correct' in question.question));const value={cursor:question.cursor,questionId:q.id,answer:q.correct};
 const duplicates=await Promise.all(Array.from({length:8},()=>ok(`classes/${room.code}/play-answer`,'POST',value,p.token)));
 duplicates.forEach(r=>assert.equal(r.resources.cursor,1));assert.equal((await ok(`classes/${room.code}/play-question`,'GET',undefined,p.token)).resources.energy,2000);
 await DB.prepare('UPDATE class_play_progress SET answered_at=0 WHERE student_id=?').bind(p.playerId).run();
 const next=await ok(`classes/${room.code}/play-question`,'GET',undefined,p.token),wrongQ=bank.questions.find(q=>q.id===next.question.id);
 const wrong=await ok(`classes/${room.code}/play-answer`,'POST',{cursor:next.cursor,questionId:wrongQ.id,answer:(wrongQ.correct+1)%4},p.token);assert.equal(wrong.correct,false);assert.equal(wrong.resources.energy,2000);assert.equal(wrong.resources.ammo,9);
 const wrongReplay=await ok(`classes/${room.code}/play-answer`,'POST',{cursor:next.cursor,questionId:wrongQ.id,answer:wrongQ.correct},p.token);assert.equal(wrongReplay.correct,false,'retry cannot change a wrong answer');
 const slow=await ok(`classes/${room.code}/play-question`,'GET',undefined,p.token);assert.equal((await call(`classes/${room.code}/play-answer`,'POST',{cursor:slow.cursor,questionId:slow.question.id,answer:0},p.token)).status,429);
 await DB.prepare('UPDATE class_snow_states SET updated_at=updated_at-250,state=json_set(state,\'$.updatedAt\',json_extract(state,\'$.updatedAt\')-250) WHERE class_id=?').bind(room.code).run();
 const advanced=await ok(`classes/${room.code}/snow-frame`,'POST',makeInput(2),p.token);assert.ok(advanced.state.players.find(m=>m.id===p.playerId).x>120);assert.ok(advanced.resources.energy<2000,'moving spends server-held energy');
 await control(room,'pause');const oldX=advanced.state.players.find(m=>m.id===p.playerId).x;
 await DB.prepare('UPDATE class_snow_states SET updated_at=updated_at-250,state=json_set(state,\'$.updatedAt\',json_extract(state,\'$.updatedAt\')-250) WHERE class_id=?').bind(room.code).run();
 const paused=await ok(`classes/${room.code}/snow-frame`,'POST',makeInput(3),p.token);assert.equal(paused.state.players.find(m=>m.id===p.playerId).x,oldX);assert.equal((await call(`classes/${room.code}/play-answer`,'POST',value,p.token)).status,423);
 await control(room,'resume');const resumed=await ok(`classes/${room.code}`,'GET',undefined,p.token);assert.equal(resumed.memberCount,50);assert.equal(resumed.resources.cursor,2,'reload preserves progress');
 const report=await ok(`classes/${room.code}/teacher`,'GET',undefined,teacher.token);assert.equal(report.students.find(s=>s.id===p.playerId).scores.find(s=>s.stage==='practice').answered,2);assert.equal(report.answers.filter(a=>a.stage==='practice').length,0,'reports use compact aggregates');
 await control(room,'finish');assert.equal((await call(`classes/${room.code}/snow-frame`,'POST',makeInput(4),p.token)).status,409);assert.equal((await call(`classes/${room.code}/play-answer`,'POST',value,p.token)).status,409);
 console.log(`PASS snow ${mode}: 50 admissions, arena isolation, authoritative inputs, eight concurrent retries rewarded once, wrong feedback, rate limit, movement/paused state, recovery and reports.`);
}
const moba=await ok('classes','POST',{bankId:bank.id,mode:'split',minutes:8,activity:'moba',energyQuestions:true},teacher.token),p=await ok(`classes/${moba.code}/join`,'POST',{name:'MOBA',hero:'sentinel'});
for(let i=0;i<3;i++)await control(moba,'next');await ok(`classes/${moba.code}/frame`,'POST',{input:makeInput(1)},p.token);
await DB.prepare('UPDATE class_play_progress SET moved_at=? WHERE student_id=?').bind(Date.now()-500,p.playerId).run();const mobaFrame=await ok(`classes/${moba.code}/frame`,'POST',{input:makeInput(2)},p.token);assert.ok(mobaFrame.members[0].resources.energy<1000);const energy=mobaFrame.members[0].resources.energy;
await ok(`classes/${moba.code}/frame`,'POST',{input:makeInput(1)},p.token);assert.equal((await ok(`classes/${moba.code}`,'GET',undefined,p.token)).resources.energy,energy,'old input cannot spend twice');
const {sandbox,run}=require('./smoke.cjs');sandbox.setInterval=()=>0;sandbox.AbortSignal=AbortSignal;sandbox.navigator={};sandbox.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
sandbox.document.createElement=()=>({style:{},dataset:{},hidden:false,classList:{toggle(){}},innerHTML:''});sandbox.document.body.appendChild=()=>{};
const fs=require('node:fs'),vm=require('node:vm');for(const file of ['battle-feedback.js','network.js','mobile.js','classroom-network.js','learning-play.js'])vm.runInContext(fs.readFileSync(new URL('../dist/'+file,import.meta.url),'utf8').replace('void restoreRoom();',''),sandbox);
sandbox.classSession={...p,host:true,classroom:true};sandbox.classMembers=mobaFrame.members;run('net.session=classSession;net.mode="online";originals.start();configureRoster(classMembers);education.details={phase:"play",energyQuestions:true};game.player.lessonEnergy=0;const before=game.player.x;move(game.player,game.player.x+200,game.player.y,.5);');assert.equal(run('game.player.x'),run('before'));run('game.player.lessonEnergy=100;move(game.player,game.player.x+200,game.player.y,.5)');assert.ok(run('game.player.x>before'),'refilled energy unlocks actual MOBA movement');
let snow=makeSnow([{id:'a',name:'a',hero:'sentinel'},{id:'b',name:'b',hero:'sentinel'}],0);snow.players[0].x=200;snow.players[0].y=110;snow.players[1].x=300;snow.players[1].y=110;snow.players.forEach(p=>p.immune=0);snow.players[0].hp=1;snow.time=2;
const members=[{id:'a',seen_at:200,input:JSON.stringify({move:{x:1,y:0}}),credits:0,ammo:0},{id:'b',seen_at:200,input:JSON.stringify({move:{x:0,y:0},attack:true,aim:{x:200,y:110}}),credits:0,ammo:6}];const hit=stepSnow(snow,members,200);assert.equal(hit.players[0].x,200,'zero energy stops survivor');assert.equal(hit.players[0].zombie,true,'snowball hit converts a survivor');assert.equal(hit.finished,true);
assert.ok(SNOW_WORLD.obstacles.length);DB.close();console.log('PASS MOBA: movement draws from server-held question rewards, exhausted movement blocked, recharge restores it. PASS snow collision, role conversion and finish.');
