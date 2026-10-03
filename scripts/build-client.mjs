import {build} from 'esbuild';
await build({entryPoints:['client/renderer3d.mjs'],bundle:true,format:'iife',globalName:'Rift3D',target:['es2020'],minify:true,outfile:'dist/renderer3d.js',legalComments:'eof'});
console.log('3D renderer bundled.');
