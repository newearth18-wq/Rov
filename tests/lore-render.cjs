const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{sandbox,run}=require('./smoke.cjs');
const errors=[];sandbox.console={...console,error:(...args)=>errors.push(args.join(' ')),warn:()=>{}};
run('const net={session:null,localPause:false};');
run(fs.readFileSync(path.join(__dirname,'../dist/mobile.js'),'utf8'));
sandbox.Rift3D={create:()=>({render:()=>{},project:(x,y,h)=>({x,y:y-h*10}),unproject:(x,y)=>({x,y}),loading:Promise.resolve(true),turnPreview:()=>{}})};
run(fs.readFileSync(path.join(__dirname,'../dist/three-game.js'),'utf8'));
for(const id of ['ilumia','lauriel','liliana','nakroth','telannas','volkath']){
  run(`{lobby();chooseHero('${id}');startGame();view.width=1280;view.height=720;game.player.x=700;game.player.y=500;const marked=game.entities.find(e=>e.team===1&&e.type==='hero');marked.x=800;marked.y=500;marked.doom={stacks:3,until:game.time+5};effects.push({type:'text',x:800,y:500,text:'220',color:'#fff',life:.5,max:.6});draw();}`);
  assert.equal(run('rendererFailed'),false,id+' renders damage numbers and marks without disabling 3D');
}
assert.deepEqual(errors,[],'bridge has no runtime exceptions');
console.log('PASS: all six hero overlays render damage text and marks without falling back from 3D.');
