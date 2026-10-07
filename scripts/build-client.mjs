import {build} from 'esbuild';
await build({entryPoints:['client/renderer3d.mjs'],bundle:true,format:'iife',globalName:'Rift3D',target:['es2020'],minify:true,outfile:'dist/renderer3d.js',legalComments:'eof'});
await build({entryPoints:['client/qr-code.mjs'],bundle:true,format:'iife',globalName:'RiftQR',target:['es2020'],minify:true,outfile:'dist/qr-code.js',legalComments:'eof'});
console.log('3D renderer bundled.');
await build({entryPoints:['client/classroom-tools.mjs'],bundle:true,format:'iife',globalName:'RiftClassTools',target:['es2020'],minify:true,outfile:'dist/classroom-tools.js',legalComments:'eof'});
