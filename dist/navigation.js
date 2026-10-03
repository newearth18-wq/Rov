'use strict';
function routeClear(a,b,obstacles,radius){return obstacles.every(o=>segmentDistance(o,a,b)>=o.radius+radius+2);}
function findDetour(start,goal,obstacles,radius){
  if(routeClear(start,goal,obstacles,radius))return [];
  const blocking=obstacles.filter(o=>segmentDistance(o,start,goal)<o.radius+radius+2).sort((a,b)=>distance(start,a)-distance(start,b))[0];
  const ring=blocking.radius+radius+28,points=Array.from({length:16},(_,i)=>({x:blocking.x+Math.cos(i*Math.PI/8)*ring,y:blocking.y+Math.sin(i*Math.PI/8)*ring}));
  let best=null,cost=Infinity;
  for(const a of points){if(!routeClear(start,a,obstacles,radius))continue;
    if(routeClear(a,goal,obstacles,radius)){const length=distance(start,a)+distance(a,goal);if(length<cost){cost=length;best=[a];}}
    for(const b of points){if(!routeClear(a,b,obstacles,radius)||!routeClear(b,goal,obstacles,radius))continue;const length=distance(start,a)+distance(a,b)+distance(b,goal);if(length<cost){cost=length;best=[a,b];}}
  }
  return best||[];
}
