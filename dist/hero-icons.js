'use strict';
const heroIconPaths={
  shot:'M5 25 25 5M8 25l-3-3M20 5l5 5M11 17l4 4M18 2l10 10',
  gun:'M4 9h22v7H15v4h-4l-1 9H5l3-13H4zM19 9v7',
  flame:'M16 3c2 8-5 8-3 13 3-2 5-5 5-7 7 7 9 16 0 20C5 31 3 21 9 14c-1 5 2 7 4 6',
  blade:'M5 27 22 4l5-1-1 6L9 26M4 20l8 8M3 29l3-3',
  shield:'M16 3 27 7v10c0 6-6 11-11 13C9 27 5 23 5 17V7zM11 16l4 4 7-8',
  hammer:'M5 6h20v9H5zM10 15v14h8V15M8 6v9M22 6v9',
  sensor:'M16 18v11M11 29h10M12 11a6 6 0 1 1 8 0M8 15a11 11 0 1 1 16 0M16 3v5',
  sight:'M16 2v6M16 24v6M2 16h6M24 16h6M16 6a10 10 0 1 1-.01 0M16 12v8M12 16h8',
  star:'M16 2 19 12 30 16 20 20 16 30 12 20 2 16 12 12zM16 12a4 4 0 1 1-.01 0',
  bow:'M5 3c20 1 24 25 0 26L13 16zM3 16h26M23 11l6 5-6 5',
  wings:'M16 27V13M16 20C10 19 2 11 3 3l9 5 4 10M16 20c6-1 14-9 13-17l-9 5-4 10M8 15l-3 6 11 5M24 15l3 6-11 5',
  dash:'M3 9h12M1 16h12M3 23h12M15 7l11 9-11 9M23 11l7 5-7 5',
  pulse:'M3 17h5l4-11 6 21 4-10h7',
  vortex:'M16 3c11 0 16 14 7 23M29 10l-5 2-2-5M25 27c-9 7-22 0-22-11M8 29l-1-6 6-1M3 8c4-7 14-9 20-4M2 2l6 1-1 6'
};
const heroSkillGlyphs={stuart:['shot','shield','gun'],capheny:['gun','dash','shot'],maloch:['blade','shield','wings'],ignis:['flame','flame','vortex'],mortos:['blade','shield','blade'],taara:['hammer','vortex','pulse'],elsu:['sensor','sight','dash'],hayate:['star','dash','vortex'],flowborn:['pulse','bow','dash'],zata:['wings','vortex','wings'],arcanist:['flame','vortex','wings'],ranger:['bow','dash','bow'],oracle:['pulse','dash','shield'],sentinel:['blade','dash','vortex'],bulwark:['hammer','dash','shield'],shade:['blade','dash','star']};
Object.assign(heroSkillGlyphs,{ilumia:['pulse','shield','star'],lauriel:['wings','dash','pulse'],liliana:['pulse','dash','star'],nakroth:['blade','dash','vortex'],telannas:['bow','shot','bow'],volkath:['blade','shot','dash']});
const iconChoose=chooseHero;
const shortSkillNames={stuart:['กระสุน','หลบ','ถอยยิง'],capheny:['โหมดปืน','เร่งเดิน','ระดมยิง'],maloch:['ฟัน','ดูดโล่','กระโดด'],ignis:['ลูกไฟ','ฝนไฟ','เพลิง'],mortos:['ฟันใบ้','ดาบหมุน','กระโดด'],taara:['กระโดด','ค้อนหมุน','ฟื้นเลือด'],elsu:['เปิดพุ่ม','สไนเปอร์','ถอยยิง'],hayate:['ดาวกระจาย','พุ่ง','พายุ'],flowborn:['Flow','ศรพลัง','กระโดด'],zata:['ขนนก','พายุ','ทะยาน']};
Object.assign(shortSkillNames,{ilumia:['ลูกแสง','ผลัก','แสงทั่วแมป'],lauriel:['ลำแสง','พุ่ง','วงเวท'],liliana:['ระเบิดแสง','กระสุนสตัน','แปลงร่าง'],nakroth:['พุ่งคู่','ถอย','ดาบพิพากษา'],telannas:['ยิงไกล','ศรชะลอ','ศรสตัน'],volkath:['ฟันกวาด','กรงเล็บ','ม้าศึก']});
chooseHero=function(id){iconChoose(id);const glyphs=heroSkillGlyphs[selected.id]||['shot','dash','vortex'];['q','w','e'].forEach((key,i)=>{const button=document.querySelector('[data-action="'+key+'"]'),span=button.querySelector('span');span.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="'+heroIconPaths[glyphs[i]]+'"/></svg>';if(shortSkillNames[selected.id])button.querySelector('b').textContent=shortSkillNames[selected.id][i];});};
chooseHero(selected.id);
