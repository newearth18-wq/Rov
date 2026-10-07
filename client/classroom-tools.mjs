import {readSheet} from 'read-excel-file/universal';

export const headers=['โจทย์','A','B','C','D','เฉลย','คำอธิบาย'];
export function parseDelimited(source,separator){
  source=String(source).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  separator ||= source.split('\n')[0].includes('\t')?'\t':',';
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<source.length;i++){const c=source[i];if(c==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else if(quoted||!cell)quoted=!quoted;else cell+=c;}
    else if(!quoted&&(c===separator||c==='\n')){row.push(cell);cell='';if(c==='\n'){rows.push(row);row=[];}}else cell+=c;
  }
  if(quoted)throw Error('เครื่องหมายคำพูดในตารางยังปิดไม่ครบ');
  if(cell||row.length){row.push(cell);rows.push(row);}return rows.filter(r=>r.some(v=>String(v??'').trim()));
}
export function questionsFromRows(rows){
  rows=rows.filter(r=>r.some(v=>String(v??'').trim()));
  if(rows.length&&['โจทย์','prompt','question'].includes(String(rows[0][0]).trim().toLowerCase()))rows=rows.slice(1);
  if(!rows.length||rows.length>40)throw Error('นำเข้าได้ครั้งละ 1–40 ข้อ');
  return rows.map((r,i)=>{const [prompt,...rest]=r.map(v=>String(v??'').trim()),options=rest.slice(0,4),key=String(rest[4]||'').toUpperCase(),correct=/^[A-D]$/.test(key)?key.charCodeAt(0)-65:/^[1-4]$/.test(key)?Number(key)-1:-1;
    if(!prompt||prompt.length>500||options.length!==4||options.some(v=>!v||v.length>180)||correct<0||(rest[5]||'').length>700)throw Error('แถว '+(i+1)+': ต้องมีโจทย์ ตัวเลือก A–D และเฉลย A–D หรือ 1–4 ตามแบบฟอร์ม');
    return {id:crypto.randomUUID(),prompt,options,correct,explanation:rest[5]||'',image:''};
  });
}
export async function importQuestions(file){
  if(file.size>1000000)throw Error('ไฟล์คำถามต้องเล็กกว่า 1 MB');
  if(/\.xlsx$/i.test(file.name))return questionsFromRows(await readSheet(file));
  if(!/\.(csv|tsv|txt)$/i.test(file.name))throw Error('เลือกไฟล์ .xlsx, .csv หรือ .tsv');
  return questionsFromRows(parseDelimited(await file.text()));
}
export function toCSV(rows){return '\uFEFF'+rows.map(r=>r.map(value=>{let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
export const template=()=>toCSV([headers,['2 + 3 เท่ากับเท่าใด','3','4','5','6','C','รวมจำนวน 2 กับ 3 ได้ 5']]);
export function report(d){
  const count=d.lesson.questions.length,stage=(p,s)=>p.scores.filter(x=>x.stage===s).reduce((a,x)=>({answered:a.answered+x.answered,correct:a.correct+x.correct}),{answered:0,correct:0});
  const paired=d.students.map(p=>({pre:stage(p,'pretest'),post:stage(p,'posttest')})).filter(x=>x.pre.answered===count&&x.post.answered===count);
  const average=s=>paired.length?paired.reduce((a,x)=>a+x[s].correct/count*100,0)/paired.length:null;
  const pre=average('pre'),post=average('post');
  const questions=d.lesson.questions.map((q,i)=>{const answers=d.answers.filter(a=>a.question_id===q.id&&a.stage==='posttest');const wrong=answers.filter(a=>!a.correct).length;return {id:q.id,number:i+1,prompt:q.prompt,answered:answers.length,wrong,wrongPercent:answers.length?wrong/answers.length*100:null,correct:q.options[q.correct],explanation:q.explanation};}).sort((a,b)=>(b.wrongPercent??-1)-(a.wrongPercent??-1)||b.wrong-a.wrong||a.number-b.number);
  return {paired:paired.length,pre,post,gain:paired.length?post-pre:null,questions};
}
export function reportHTML(d,esc){const r=report(d),percent=v=>v===null?'ยังไม่มีข้อมูล':v.toFixed(1)+'%';
  return `<section class="lesson-card learning-dashboard"><h2>ภาพรวมการเรียนรู้</h2><p>เทียบเฉพาะนักเรียน ${r.paired} คนที่ตอบก่อนและหลังเรียนครบทั้ง ${d.lesson.questions.length} ข้อ</p><div class="learning-metrics"><div>ก่อนเรียน<strong>${percent(r.pre)}</strong></div><div>หลังเรียน<strong>${percent(r.post)}</strong></div><div>คะแนนเปลี่ยนแปลง<strong>${r.gain===null?'—':(r.gain>=0?'+':'')+r.gain.toFixed(1)+' จุด'}</strong></div></div><h3>โจทย์ที่ควรทบทวนก่อน</h3>${r.questions.map(q=>`<div class="question-metric"><span>ข้อ ${q.number} · ${esc(q.prompt)}</span><span>${q.answered?'ผิด '+q.wrong+' / '+q.answered+' คน':'ยังไม่มีคำตอบหลังเรียน'}</span><meter min="0" max="100" value="${q.wrongPercent||0}" aria-label="ข้อ ${q.number} ตอบผิด ${q.wrongPercent?.toFixed(0)||0} เปอร์เซ็นต์"></meter></div>`).join('')}<button id="exportQuestionReport">ดาวน์โหลดรายงานรายข้อ (Excel / CSV)</button></section>`;
}
export function questionCSV(d){return toCSV([['ข้อ','โจทย์','ผู้ตอบหลังเรียน','ตอบผิด','ผิด (%)','เฉลย','คำอธิบาย'],...report(d).questions.map(q=>[q.number,q.prompt,q.answered,q.wrong,q.wrongPercent===null?'':q.wrongPercent.toFixed(1),q.correct,q.explanation])]);}
export async function compressImage(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>6000000)throw Error('เลือกรูป JPG, PNG หรือ WebP ขนาดไม่เกิน 6 MB');
  const url=URL.createObjectURL(file),img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('อ่านรูปไม่สำเร็จ'));img.src=url;});
    if(img.naturalWidth*img.naturalHeight>40000000)throw Error('รูปมีขนาดกว้างหรือสูงมากเกินไป');
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    for(const side of [900,640,420]){const scale=Math.min(1,side/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);for(const quality of [.78,.6,.4,.25]){const data=canvas.toDataURL('image/jpeg',quality);if(data.length<=70000)return data;}}throw Error('รูปยังใหญ่เกินไป กรุณาครอบหรือย่อรูปก่อน');
  }finally{URL.revokeObjectURL(url);}
}
export function imageHTML(q,esc){return q.image?`<img class="question-image" src="${esc(q.image)}" alt="รูปประกอบโจทย์" loading="lazy">`:'';}
