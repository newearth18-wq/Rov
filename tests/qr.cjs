const assert=require('node:assert/strict');
(async()=>{const {roomLink,parseRoomLink,decode,CameraScanner}=await import('../client/qr-code.mjs'),QR=require('qrcode'),origin='https://rift-arena-newearth.new-earth18.chatgpt.site';
  for(const kind of ['room','class']){const link=roomLink(kind,'A4B7Z9',origin);assert.deepEqual(parseRoomLink(link,origin),{kind,code:'A4B7Z9'});
    const qr=QR.create(link,{errorCorrectionLevel:'M'}),scale=6,margin=4,size=(qr.modules.size+margin*2)*scale,pixels=new Uint8ClampedArray(size*size*4).fill(255);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.floor(y/scale)-margin,c=Math.floor(x/scale)-margin;if(r>=0&&c>=0&&r<qr.modules.size&&c<qr.modules.size&&qr.modules.get(r,c)){const i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=16;}}
    assert.equal(decode(pixels,size,size),link,kind+' real QR pixel roundtrip');
  }
  for(const value of ['javascript:alert(1)','https://evil.test/?class=A4B7Z9',origin+'/?class=A4B7Z9&token=secret',origin+'/?room=A4B7Z9&class=A4B7Z9',origin+'/?class=A4B7Z9&class=A4B7Z9',origin+'/?room=bad',origin+'/else?room=A4B7Z9',origin+'/?room=A4B7Z9#x'])assert.equal(parseRoomLink(value,origin),null,'reject unsafe/ambiguous QR');
  let stopped=0,resolve,frames=0,cancelled=0,errors=0;const video={srcObject:null,play:async()=>{},readyState:0},stream={getTracks:()=>[{stop(){stopped++;}}]},options={video,canvas:{},onResult(){throw new Error('unexpected scan');},onError(){errors++;},raf(){frames++;return 1;},caf(){cancelled++;}};
  const pending=new CameraScanner({...options,media:{getUserMedia:()=>new Promise(r=>resolve=r)}}),start=pending.start();pending.stop();resolve(stream);await start;assert.equal(stopped,1);assert.equal(video.srcObject,null);assert.equal(frames,0,'no camera after close during prompt');
  const active=new CameraScanner({...options,media:{getUserMedia:async()=>stream}});await active.start();assert.equal(video.srcObject,stream);active.stop();assert.equal(stopped,2);assert.equal(cancelled,1);assert.equal(video.srcObject,null);
  const denied=new CameraScanner({...options,media:{getUserMedia:async()=>{throw new Error('denied');}}});await denied.start();assert.equal(errors,1);assert.equal(denied.stream,null);
  console.log('QR: both room types decode; foreign/secret/ambiguous links rejected; camera stops on close, including pending permission.');
})().catch(e=>{console.error(e);process.exitCode=1;});
