'use strict';
// Session credentials stay on this device; links and QR codes contain only the room code.
function rememberClassSession(persist=true){
  education.remember=persist;try{sessionStorage.setItem('rift.classStudent',JSON.stringify(education.session));if(persist)localStorage.setItem('rift.classStudent',JSON.stringify(education.session));else localStorage.removeItem('rift.classStudent');}catch{}
}
function clearClassSession(){
  const id=education.session?.playerId;education.session=null;education.pending=[];education.pendingOwner=null;try{sessionStorage.removeItem('rift.classStudent');localStorage.removeItem('rift.classStudent');if(id){localStorage.removeItem('rift.classAnswers:'+id);localStorage.removeItem('rift.playAnswer:'+id);}window.RiftSnow?.stop();window.RiftLearningPlay?.stop();sessionStorage.setItem('rift.classActive','0');}catch{}detachClassMatch();
}
function classPendingAnswers(){
  const id=education.session?.playerId;if(!id)return [];
  if(education.pendingOwner!==id){education.pendingOwner=id;try{education.pending=JSON.parse(localStorage.getItem('rift.classAnswers:'+id)||'[]');}catch{education.pending=[];}if(!Array.isArray(education.pending))education.pending=[];education.pending=education.pending.filter(a=>typeof a.questionId==='string'&&Number.isInteger(a.answer)&&a.answer>=0&&a.answer<4&&['pretest','posttest','checkpoint'].includes(a.stage)&&Number.isInteger(a.round));}
  return education.pending;
}
function persistClassAnswers(){try{localStorage.setItem('rift.classAnswers:'+education.session.playerId,JSON.stringify(education.pending));}catch{}}
function queueClassAnswer(value){const pending=classPendingAnswers();if(!pending.some(a=>a.questionId===value.questionId&&a.stage===value.stage&&a.round===value.round)){pending.push(value);persistClassAnswers();}}
async function flushClassAnswers(details){
  if(education.sendingAnswers||!education.session)return;const pending=classPendingAnswers();if(!pending.length)return;education.sendingAnswers=true;let sent=false;
  try{for(const value of [...pending]){
    if(value.stage!==details.phase||value.round!==details.round){education.pending=education.pending.filter(a=>a!==value);persistClassAnswers();window.riftLessonError?.('ครูเปลี่ยนช่วงแล้ว มีคำตอบที่ยังส่งไม่สำเร็จ กรุณาแจ้งครู');continue;}
    try{await lessonRequest('classes/'+details.code+'/answer','POST',value);education.pending=education.pending.filter(a=>a!==value);persistClassAnswers();sent=true;}catch(e){if([400,409].includes(e.status)){education.pending=education.pending.filter(a=>a!==value);persistClassAnswers();window.riftLessonError?.('ส่งคำตอบไม่สำเร็จ: '+e.message);}else{window.riftClassConnection?.(false);throw e;}}
  }if(sent){const fresh=await lessonRequest('classes/'+details.code+'?compact=1');education.details={...fresh,lesson:details.lesson};}
  }finally{education.sendingAnswers=false;}
}
(function(){
  const banner=document.createElement('div');banner.id='classConnectionStatus';banner.hidden=true;banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');document.body.appendChild(banner);
  window.riftClassConnection=connected=>{education.linkLost=!connected;const pending=education.session?classPendingAnswers().length:0;banner.hidden=connected&&!pending||!education.session;const label=connected?'เชื่อมต่อแล้ว · กำลังส่งคำตอบที่ค้าง '+pending+' ข้อ':'การเชื่อมต่อสะดุด · ระบบจะกลับเข้าห้องเดิมให้อัตโนมัติ'+(pending?' · รอส่ง '+pending+' ข้อ':'');if(banner.textContent!==label)banner.textContent=label;};
  window.addEventListener('offline',()=>{if(education.session)window.riftClassConnection(false);});
  window.addEventListener('online',()=>{window.riftRetryClass?.();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)window.riftRetryClass?.();});
})();
