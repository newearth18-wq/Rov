const assert=require('node:assert/strict');
(async()=>{
  const THREE=await import('three'),{forgeTemplates}=await import('../client/forge-heroes.mjs');
  const templates=forgeTemplates();assert.equal(templates.size,6);
  for(const [id,model]of templates){
    assert.ok(model.scene.userData.height>1.6&&model.scene.userData.height<2.4,id+' anatomy bounds');
    const first=model.scene.clone(true),second=model.scene.clone(true),mixer=new THREE.AnimationMixer(first);
    const run=model.animations.find(c=>c.name==='Run');mixer.clipAction(run).play();mixer.update(.12);
    assert.notEqual(first.getObjectByName('LLeg').rotation.x,second.getObjectByName('LLeg').rotation.x,id+' independent rig');
    assert.ok(Math.abs(second.getObjectByName('LLeg').rotation.x)<1e-8,id+' clone must keep rest pose');
    for(const clip of model.animations){mixer.stopAllAction();mixer.clipAction(clip).reset().play();for(let i=0;i<15;i++)mixer.update(.05);first.updateMatrixWorld(true);first.traverse(n=>{for(const value of n.matrixWorld.elements)assert.ok(Number.isFinite(value),id+' '+clip.name+' finite pose');});}
    let meshes=0;model.scene.traverse(n=>{if(n.isMesh){meshes++;const positions=n.geometry.attributes.position.array;for(const value of positions)assert.ok(Number.isFinite(value),id+' finite geometry');}});assert.ok(meshes<60,id+' mesh budget');
    const foot=new THREE.Box3().setFromObject(second.getObjectByName('LFoot'));assert.ok(Math.abs(foot.min.y-model.scene.userData.ground)<.0001,id+' ground anchor');
    mixer.stopAllAction();mixer.uncacheRoot(first);
  }
  console.log('Art checks passed: six original meshes, independent animation rigs, finite poses and ground anchors.');
})().catch(e=>{console.error(e);process.exitCode=1;});
