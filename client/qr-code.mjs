import QRCode from 'qrcode';
import jsQR from 'jsqr';

export function roomLink(kind,code,origin){
  if(!['room','class'].includes(kind)||!/^[A-Z0-9]{6}$/.test(code))throw new Error('รหัสห้องไม่ถูกต้อง');
  const url=new URL('/',origin);url.searchParams.set(kind,code);return url.href;
}
export function parseRoomLink(value,origin){
  try{const url=new URL(value),base=new URL(origin),entries=[...url.searchParams];
    if(!['http:','https:'].includes(url.protocol)||url.origin!==base.origin||url.username||url.password||url.pathname!=='/'||url.hash||entries.length!==1)return null;
    const [kind,code]=entries[0];return ['room','class'].includes(kind)&&/^[A-Z0-9]{6}$/.test(code)?{kind,code}:null;
  }catch{return null;}
}
export const draw=(canvas,value)=>QRCode.toCanvas(canvas,value,{width:280,margin:4,errorCorrectionLevel:'M',color:{dark:'#102334',light:'#ffffff'}});
export const decode=(data,width,height)=>jsQR(data,width,height,{inversionAttempts:'attemptBoth'})?.data||null;

// Closing while permission is pending must also stop a stream returned later.
export class CameraScanner{
  constructor({video,canvas,onResult,onError,media=navigator.mediaDevices,raf=requestAnimationFrame,caf=cancelAnimationFrame}){Object.assign(this,{video,canvas,onResult,onError,media,raf,caf});this.generation=0;this.frame=null;this.stream=null;}
  stop(){this.generation++;if(this.frame!==null)this.caf(this.frame);this.frame=null;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.video.srcObject=null;}
  async start(){this.stop();const generation=this.generation;
    try{if(!this.media?.getUserMedia)throw new Error('ไม่รองรับกล้อง กรุณาเลือกภาพ QR หรือใช้กล้องของมือถือ');
      const stream=await this.media.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:960}},audio:false});
      if(generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;this.video.srcObject=stream;await this.video.play();if(generation!==this.generation)return;
      let last=0;const tick=time=>{if(generation!==this.generation)return;
        try{if(time-last>120&&this.video.readyState>=2){last=time;const width=Math.min(960,this.video.videoWidth);if(width){this.canvas.width=width;this.canvas.height=Math.round(width*this.video.videoHeight/this.video.videoWidth);const ctx=this.canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(this.video,0,0,this.canvas.width,this.canvas.height);const pixels=ctx.getImageData(0,0,this.canvas.width,this.canvas.height),value=decode(pixels.data,pixels.width,pixels.height);if(value){this.stop();this.onResult(value);return;}}}
          this.frame=this.raf(tick);
        }catch(e){this.stop();this.onError(e);}
      };this.frame=this.raf(tick);
    }catch(e){if(generation===this.generation){this.stop();this.onError(e);}}
  }
}
