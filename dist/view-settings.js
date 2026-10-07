'use strict';
(function(){
  let settings={zoom:1,controls:1};try{const saved=JSON.parse(localStorage.getItem('rift.view'));if(saved&&[.86,1,1.15].includes(saved.zoom))settings.zoom=saved.zoom;if(saved&&[1,1.1,1.2].includes(saved.controls))settings.controls=saved.controls;}catch{}
  const apply=()=>{window.riftCameraZoom=settings.zoom;document.documentElement.style.setProperty('--rift-control-size',settings.controls);try{localStorage.setItem('rift.view',JSON.stringify(settings));}catch{}};apply();
  const panel=document.createElement('fieldset');panel.className='view-settings';panel.innerHTML='<legend>ปรับหน้าจอของคุณ</legend><label>ระยะกล้อง<select id="viewZoom"><option value="0.86">ใกล้ · ตัวละครใหญ่ขึ้น</option><option value="1">ปกติ</option><option value="1.15">ไกล · เห็นสนามกว้างขึ้น</option></select></label><label>ขนาดปุ่มต่อสู้<select id="viewControls"><option value="1">ปกติ</option><option value="1.1">ใหญ่</option><option value="1.2">ใหญ่พิเศษ</option></select></label><p>บันทึกเฉพาะเครื่องนี้ เปลี่ยนได้ระหว่างเล่น</p>';document.getElementById('understood').before(panel);
  document.getElementById('viewZoom').value=String(settings.zoom);document.getElementById('viewControls').value=String(settings.controls);
  document.getElementById('viewZoom').onchange=e=>{settings.zoom=Number(e.target.value);apply();};document.getElementById('viewControls').onchange=e=>{settings.controls=Number(e.target.value);apply();};
})();
