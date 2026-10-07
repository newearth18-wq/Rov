const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
async function main(){
  const worker=(await import('../server/worker.mjs')).default,DB=require('../server/local-db.cjs').createDb();
  const call=async(route,method='GET',data,token)=>{const h={'content-type':'application/json'};if(token)h.authorization='Bearer '+token;const r=await worker.fetch(new Request('https://class.test/api/'+route,{method,headers:h,body:method==='GET'?undefined:JSON.stringify(data)}),{DB},{});return {status:r.status,data:await r.json()};};
  const ok=async(...args)=>{const r=await call(...args);assert.ok(r.status<300,JSON.stringify(r.data));return r.data;};
  const teacher=await ok('teachers','POST',{}),other=await ok('teachers','POST',{});
  const defaults=await ok('lesson-banks','GET',undefined,teacher.token);assert.equal(defaults.banks.length,8);
  const source=defaults.banks.find(b=>b.subject==='คณิตศาสตร์');const custom=await ok('lesson-banks','POST',{...source,title:'แบบทดสอบในห้องเรียน',subject:'วิชาเพิ่มเติม',level:'ม.1'},teacher.token);
  assert.equal((await call('lesson-banks/'+custom.id,'PUT',source,other.token)).status,404,'banks isolated between teachers');
  assert.equal((await call('lesson-banks','POST',{title:'bad',subject:'bad',questions:[]},teacher.token)).status,400);
  custom.questions.push({id:'added-question',prompt:'2 + 3 = ?',options:['3','4','5','6'],correct:2,explanation:'รวมจำนวนได้ 5'});
  await ok('lesson-banks/'+custom.id,'PUT',custom,teacher.token);
  assert.equal((await ok('lesson-banks','GET',undefined,teacher.token)).banks.find(b=>b.id===custom.id).questions.length,4,'teacher can add and save questions');
  for(const mode of ['split','mass']){
    const room=await ok('classes','POST',{bankId:custom.id,title:'ทดสอบ '+mode,mode,minutes:8,mission:'ใช้ความรู้คณิตศาสตร์วางแผนร่วมกัน'},teacher.token);
    assert.equal((await call(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token)).status,400,'cannot begin empty class');
    const joined=await Promise.all(Array.from({length:51},(_,n)=>call(`classes/${room.code}/join`,'POST',{name:'นักเรียน '+(n+1),hero:['stuart','ilumia','lauriel','liliana','nakroth','telannas','volkath'][n%7]})));
    const players=joined.filter(r=>r.status===201).map(r=>r.data).sort((a,b)=>a.arena-b.arena||a.roomSlot-b.roomSlot);assert.equal(players.length,50,'atomic admission of 50 students');assert.equal(joined.filter(r=>r.status===409).length,1,'51st student rejected');
    assert.equal(new Set(players.map(p=>p.arena+':'+p.roomSlot)).size,50,'unique assignment');
    if(mode==='mass'){assert.equal(players.filter(p=>p.team===0).length,25);assert.equal(players.filter(p=>p.team===1).length,25);}else for(let arena=0;arena<5;arena++){assert.equal(players.filter(p=>p.arena===arena).length,10);assert.equal(players.filter(p=>p.arena===arena&&p.team===0).length,5);}
    const student=await ok(`classes/${room.code}`,'GET',undefined,players[0].token);assert.ok(!('correct' in student.lesson.questions[0]),'unanswered test has no answer key');assert.ok(!JSON.stringify(student).includes(teacher.token));
    assert.equal((await call(`classes/${room.code}/control`,'POST',{action:'next'},players[0].token)).status,401,'student cannot control classroom');
    assert.equal((await call(`classes/${room.code}/teacher`,'GET',undefined,other.token)).status,403,'other teacher cannot read results');
    await ok(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token);
    await Promise.all(players.flatMap((p,i)=>custom.questions.map((q,n)=>ok(`classes/${room.code}/answer`,'POST',{stage:'pretest',round:0,questionId:q.id,answer:n===0?q.correct:(q.correct+1)%4},p.token))));
    const retry=await ok(`classes/${room.code}/answer`,'POST',{stage:'pretest',round:0,questionId:custom.questions[0].id,answer:(custom.questions[0].correct+1)%4},players[0].token);assert.equal(retry.answer,custom.questions[0].correct,'retries cannot change submitted answer');
    await ok(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token);
    const learning=await ok(`classes/${room.code}`,'GET',undefined,players[0].token);assert.equal(learning.lesson.questions[0].correct,custom.questions[0].correct,'answer key opens only at briefing');
    await ok(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token);
    const match=await ok(`classes/${room.code}/match`,'GET',undefined,players[0].token);assert.equal(match.host,true);
    delete require.cache[require.resolve('./smoke.cjs')];const {sandbox,run}=require('./smoke.cjs');sandbox.setInterval=()=>0;sandbox.AbortSignal=AbortSignal;sandbox.navigator={};sandbox.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
    for(const name of ['battle-feedback.js','network.js','mobile.js','classroom-network.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',name),'utf8').replace('void restoreRoom();',''),sandbox);
    sandbox.classSession={...players[0],host:true,classroom:true};sandbox.classMembers=match.members;run('net.session=classSession;net.mode="online";originals.start();configureRoster(classMembers);education.details={phase:"play",paused:false}');
    assert.equal(run('game.entities.filter(e=>e.type==="hero").length'),mode==='mass'?50:10,'real game roster expanded');
    assert.equal(run('game.entities.filter(e=>e.type==="hero"&&e.remoteHuman).length'),mode==='mass'?49:9,'all assigned humans have controls');
    assert.equal(run('new Set(game.entities.filter(e=>e.type==="hero").map(e=>e.x+":"+e.y)).size'),mode==='mass'?50:10,'spawn positions spread out');
    let snapshot=JSON.parse(run('JSON.stringify(serializeMatch())'));await ok(`classes/${room.code}/match-start`,'POST',{state:snapshot},players[0].token);
    const guestIndex=players.findIndex(p=>p.arena===players[0].arena&&p.playerId!==players[0].playerId),guest=players[guestIndex];
    const frame=await ok(`classes/${room.code}/frame`,'POST',{input:{seq:1,move:{x:1,y:0},commands:[{id:1,kind:'q',aim:{x:750,y:500}}],active:true}},guest.token);
    assert.equal(frame.state.entities.filter(e=>e.type==='hero').length,mode==='mass'?50:10);assert.ok(frame.members.every(m=>m.input===undefined),'guests cannot see other input streams');
    assert.equal((await call(`classes/${room.code}/match-state`,'POST',{state:snapshot},guest.token)).status,403,'only arena host can publish');
    // All five split arenas publish separately; every one of the 50 clients receives its own arena.
    if(mode==='split'){sandbox.mainState=snapshot;sandbox.mainSession=players[0];for(let arena=1;arena<5;arena++){const captain=players.find(p=>p.arena===arena&&p.roomSlot===0),otherMatch=await ok(`classes/${room.code}/match`,'GET',undefined,captain.token);sandbox.nextCaptain=captain;sandbox.nextMembers=otherMatch.members;run('net.session={...nextCaptain,classroom:true,host:true,capacity:10};originals.start();configureRoster(nextMembers);');await ok(`classes/${room.code}/match-start`,'POST',{state:JSON.parse(run('JSON.stringify(serializeMatch())'))},captain.token);}run('net.session={...mainSession,classroom:true,host:true,capacity:10};acceptSnapshot(mainState);');}
    const concurrentFrames=await Promise.all(players.map(p=>ok(`classes/${room.code}/frame`,'POST',{input:{seq:0,move:{x:0,y:0},active:true,commands:[]}},p.token)));assert.equal(concurrentFrames.length,50);concurrentFrames.forEach((f,i)=>{assert.equal(f.state.entities.filter(e=>e.type==='hero').length,players[i].capacity);assert.ok(f.state.entities.some(e=>e.clientId===players[i].playerId),'client receives the assigned arena');if(!f.host)assert.ok(f.members.every(m=>m.input===undefined),'guest frames protect other input streams');});
    const updatedRoster=await ok(`classes/${room.code}/match`,'GET',undefined,players[0].token);sandbox.classMembers=updatedRoster.members;run('applyRemoteInputs(classMembers);const remote=game.entities.find(e=>e.clientId===classMembers.find(m=>m.seq===1).id);const remoteBefore=remote.x;for(let i=0;i<10;i++)update(.05);');assert.ok(run('remote.x>remoteBefore'),'human input moves expanded roster');
    let maxSize=0;run('game.entities.filter(e=>e.type==="hero"&&!e.player).forEach(e=>e.autoPilot=true);');for(let n=0;n<2000&&!run('game.finished');n++){run('update(.05)');if(n%20===0)maxSize=Math.max(maxSize,Buffer.byteLength(run('JSON.stringify(serializeMatch())')));}assert.ok(run('game.entities.every(e=>[e.x,e.y,e.hp].every(Number.isFinite))'),'50-body simulation remains finite');assert.ok(maxSize<512000,'snapshots fit classroom transport');
    await ok(`classes/${room.code}/control`,'POST',{action:'pause'},teacher.token);snapshot=JSON.parse(run('JSON.stringify(serializeMatch())'));await ok(`classes/${room.code}/match-state`,'POST',{state:snapshot},players[0].token);const paused=await ok(`classes/${room.code}/match`,'GET',undefined,guest.token);assert.equal(paused.state.paused,true,'teacher pause enforced in authoritative state');
    await ok(`classes/${room.code}/control`,'POST',{action:'resume'},teacher.token);await ok(`classes/${room.code}/control`,'POST',{action:'checkpoint',questionId:custom.questions[1].id},teacher.token);const checkpoint=await ok(`classes/${room.code}`,'GET',undefined,guest.token);assert.equal(checkpoint.phase,'checkpoint');assert.equal(checkpoint.round,1);
    assert.equal((await call(`classes/${room.code}/answer`,'POST',{stage:'checkpoint',round:1,questionId:custom.questions[0].id,answer:0},guest.token)).status,400,'checkpoint accepts chosen question only');await ok(`classes/${room.code}/answer`,'POST',{stage:'checkpoint',round:1,questionId:custom.questions[1].id,answer:custom.questions[1].correct},guest.token);
    await ok(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token);
    await DB.prepare('UPDATE class_matches SET updated_at=? WHERE class_id=?').bind(Date.now()-20000,room.code).run();await DB.prepare('UPDATE class_students SET seen_at=?,input=? WHERE id=?').bind(Date.now()-20000,JSON.stringify({active:false}),players[0].playerId).run();await DB.prepare('UPDATE class_students SET seen_at=? WHERE id=?').bind(Date.now(),guest.playerId).run();
    const takeover=await ok(`classes/${room.code}/match`,'GET',undefined,guest.token);assert.equal(takeover.host,true,'another student takes over a missing host');assert.ok(takeover.state,'host takeover retains last match');assert.equal((await call(`classes/${room.code}/match-state`,'POST',{state:snapshot},players[0].token)).status,403,'old host loses publishing permission');
    await DB.prepare('UPDATE classrooms SET deadline=? WHERE id=?').bind(Date.now()-1,room.code).run();const expired=await ok(`classes/${room.code}`,'GET',undefined,guest.token);assert.equal(expired.phase,'posttest','lesson timer switches to post-test');
    await Promise.all(players.flatMap(p=>custom.questions.map(q=>ok(`classes/${room.code}/answer`,'POST',{stage:'posttest',round:1,questionId:q.id,answer:q.correct},p.token))));
    await ok(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token);await Promise.all(players.map(p=>ok(`classes/${room.code}/reflection`,'POST',{knowledge:'ใช้การคำนวณแบ่งทรัพยากร',teamwork:'ตกลงบทบาทก่อนลงมือ'},p.token)));await ok(`classes/${room.code}/control`,'POST',{action:'next'},teacher.token);
    const report=await ok(`classes/${room.code}/teacher`,'GET',undefined,teacher.token);assert.equal(report.phase,'finished');assert.equal(report.students.length,50);assert.equal(report.answers.filter(a=>a.stage==='posttest').length,200);assert.ok(report.students.every(p=>p.reflection&&p.scores.some(s=>s.stage==='posttest'&&s.correct===4)),'complete server-graded reports and reflections');
    console.log('PASS classroom '+mode+': 50 admissions, teams, real roster/inputs, snapshot peak '+Math.round(maxSize/1024)+' KiB, teacher control, checkpoint, host transfer, timer, 50 graded reports.');
  }
  DB.close();console.log('PASS: editable subject banks, ownership boundaries, hidden answer keys, idempotent submissions, both 50-person modes and classroom lifecycle.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
