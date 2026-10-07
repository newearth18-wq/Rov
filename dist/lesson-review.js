'use strict';
window.RiftLessonReview={render(d,esc){
  if(!['reflection','finished'].includes(d.phase))return '';
  return '<section class="lesson-card lesson-review"><h2>ทบทวนคำตอบทีละข้อ</h2><p>เทียบคำตอบก่อนและหลังเรียน แล้วอ่านเหตุผลของคำตอบ</p>'+d.lesson.questions.map((q,i)=>{
    if(!Number.isInteger(q.correct)||!q.options[q.correct])return '';
    const answer=stage=>{const a=d.answers.find(a=>a.stage===stage&&a.question_id===q.id);return !a?'<p class="review-choice">ยังไม่ได้ตอบ</p>':`<p class="review-choice ${a.answer===q.correct?'correct':'incorrect'}">${a.answer===q.correct?'ถูก':'ควรทบทวน'} · ${esc(q.options[a.answer]||'คำตอบไม่พบ')}</p>`;};
    return `<details><summary>ข้อ ${i+1}: ${esc(q.prompt)}</summary><b>ก่อนเรียน</b>${answer('pretest')}<b>หลังเรียน</b>${answer('posttest')}<p class="review-choice correct">คำตอบที่ถูก: ${esc(q.options[q.correct])}</p><p>${esc(q.explanation||'ครูยังไม่ได้เพิ่มคำอธิบายสำหรับข้อนี้')}</p></details>`;
  }).join('')+'</section>';
}};
