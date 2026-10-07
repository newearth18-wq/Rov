'use strict';
(function(){
  const dialog=document.createElement('dialog');dialog.id='joinQrDialog';dialog.setAttribute('aria-labelledby','joinQrTitle');
  dialog.innerHTML='<div class="qr-heading"><h2 id="joinQrTitle"></h2><button id="closeJoinQr" aria-label="ปิด QR">ปิด ×</button></div><div id="joinQrBody"></div><p id="joinQrStatus" role="status" aria-live="polite"></p>';
  document.body.appendChild(dialog);let scanner=null,imageUrl=null,operation=0,returnFocus=null;
  const status=s=>document.getElementById('joinQrStatus').textContent=s;
  function stop(){operation++;scanner?.stop();scanner=null;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;}
  function close(){dialog.close();}
  dialog.addEventListener('close',()=>{stop();returnFocus?.focus();});dialog.addEventListener('cancel',stop);document.getElementById('closeJoinQr').onclick=close;
  document.addEventListener('visibilitychange',()=>{if(document.hidden){scanner?.stop();if(dialog.open&&document.getElementById('qrCamera'))status('หยุดกล้องแล้ว กดเปิดกล้องเพื่อสแกนต่อ');}});window.addEventListener('pagehide',stop);
  function open(title,html){stop();returnFocus=document.activeElement;document.getElementById('joinQrTitle').textContent=title;document.getElementById('joinQrBody').innerHTML=html;status('');if(!dialog.open)dialog.showModal();}
  async function share(kind,code){
    open(kind==='class'?'QR เข้าห้องเรียน':'QR เข้าห้องเพื่อน','<canvas id="roomQrCanvas" aria-label="QR สำหรับเข้าห้อง"></canvas><strong id="qrRoomCode"></strong><p>เปิดกล้องมือถือสแกน หรือกดสแกน QR ในเกม<br>เลือกชื่อและฮีโร่ก่อนเข้าห้อง</p><input id="qrJoinLink" readonly aria-label="ลิงก์เข้าห้อง"><div class="qr-actions"><button id="copyJoinLink">คัดลอกลิงก์</button><button id="saveJoinQr">บันทึกภาพ QR</button></div>');
    const ticket=operation;try{const link=RiftQR.roomLink(kind,code,location.origin);document.getElementById('qrRoomCode').textContent=code;document.getElementById('qrJoinLink').value=link;await RiftQR.draw(document.getElementById('roomQrCanvas'),link);if(ticket!==operation)return;
      document.getElementById('copyJoinLink').onclick=async()=>{try{await navigator.clipboard.writeText(link);status('คัดลอกลิงก์เข้าห้องแล้ว');}catch{document.getElementById('qrJoinLink').select();status('เลือกลิงก์ไว้แล้ว กรุณาคัดลอก');}};
      document.getElementById('saveJoinQr').onclick=()=>{const a=document.createElement('a');a.href=document.getElementById('roomQrCanvas').toDataURL('image/png');a.download='rift-'+kind+'-'+code+'.png';a.click();};
    }catch{if(ticket===operation)status('สร้าง QR ไม่สำเร็จ กรุณาใช้รหัสห้อง');}
  }
  function route(value){const target=RiftQR.parseRoomLink(value,location.origin);if(!target){status('QR นี้ไม่ใช่ลิงก์ห้องของเว็บนี้ กรุณาสแกนโค้ดที่เจ้าของห้องแสดง');return false;}
    if(net.session||education.session&&sessionStorage.getItem('rift.classActive')==='1'){status('คุณอยู่ในห้องแล้ว กรุณาออกจากห้องเดิมก่อนเข้าห้องใหม่');return false;}
    history.replaceState(null,'',RiftQR.roomLink(target.kind,target.code,location.origin));
    if(target.kind==='class')window.riftJoinClassroom(target.code);else{document.getElementById('classroom').hidden=true;document.body.classList.remove('education-open');selectMode('online');document.getElementById('roomCode').value=target.code;networkMessage('อ่าน QR แล้ว เลือกชื่อ ทีม และฮีโร่ แล้วกดเข้าห้อง');}
    returnFocus=document.getElementById(target.kind==='class'?'studentName':'playerName');if(dialog.open)close();returnFocus.focus();return true;
  }
  function scan(){open('สแกน QR เข้าห้อง','<p>สแกนโค้ดที่ครูหรือเพื่อนแสดง ทั้งห้องเรียนและห้องเพื่อน</p><video id="qrCamera" muted playsinline aria-label="ภาพกล้องสำหรับสแกน"></video><canvas id="qrScanCanvas" hidden></canvas><div class="qr-actions"><button id="startQrCamera">เปิดกล้อง</button><label class="qr-file">เลือกภาพ QR<input id="qrPhoto" type="file" accept="image/*"></label></div><p class="qr-note">อ่านภาพบนเครื่องของคุณ กล้องและรูปจะไม่ถูกอัปโหลด<br>หากเปิดกล้องไม่ได้ ใช้ภาพ QR หรือกล้องของมือถือแทน</p>');
    const video=document.getElementById('qrCamera'),canvas=document.getElementById('qrScanCanvas');
    document.getElementById('startQrCamera').onclick=()=>{scanner?.stop();scanner=new RiftQR.CameraScanner({video,canvas,onResult:value=>{if(!route(value))status('โค้ดไม่ถูกต้องหรือยังอยู่ในห้องเดิม กดเปิดกล้องเพื่อสแกนใหม่');},onError:e=>status(e.name==='NotAllowedError'?'ไม่ได้รับสิทธิ์กล้อง กรุณาอนุญาตกล้องหรือเลือกภาพ QR':e.name==='NotFoundError'?'ไม่พบกล้อง กรุณาเลือกภาพ QR':e.message||'เปิดกล้องไม่ได้ กรุณาเลือกภาพ QR')});status('กำลังเปิดกล้อง…');const active=scanner;void active.start().then(()=>{if(scanner===active&&active.stream)status('เล็งกล้องให้เห็น QR ครบทั้งรูป');});};
    document.getElementById('qrPhoto').onchange=async e=>{scanner?.stop();const file=e.target.files[0];if(!file)return;if(file.size>10*1024*1024){status('รูปต้องมีขนาดไม่เกิน 10 MB');return;}
      const ticket=++operation;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(file);const ownUrl=imageUrl;
      try{const image=new Image();image.src=ownUrl;await image.decode();if(ticket!==operation||!dialog.open)return;const factor=Math.min(1,1600/Math.max(image.width,image.height));canvas.width=Math.round(image.width*factor);canvas.height=Math.round(image.height*factor);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);const p=ctx.getImageData(0,0,canvas.width,canvas.height),value=RiftQR.decode(p.data,p.width,p.height);if(!value)status('ไม่พบ QR ในรูป ลองใช้ภาพที่เห็นโค้ดครบและชัดขึ้น');else route(value);
      }catch{if(ticket===operation)status('อ่านรูปไม่ได้ ลองเลือก PNG หรือ JPG');}finally{URL.revokeObjectURL(ownUrl);if(imageUrl===ownUrl)imageUrl=null;}
    };
  }
  window.RiftJoin={share,scan,route};document.getElementById('scanRoomQr').onclick=scan;document.getElementById('roomQrBtn').onclick=()=>share('room',net.session.code);
  const target=RiftQR.parseRoomLink(location.href,location.origin);if(target&&!net.session&&(!education.session||sessionStorage.getItem('rift.classActive')!=='1'))route(location.href);
})();
