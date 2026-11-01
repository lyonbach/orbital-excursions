/* Reusable moving-platform module. No mission uses it yet; it becomes active only when a later step creates and updates a platform. */
const MovingPlatform=(()=>{
 let current=null;
 function create(config){
  if(!config)return null;
  return {
   baseX:W*config.x,
   baseY:H*config.y,
   width:config.width,
   swayX:config.sway?.x||0,
   swayY:config.sway?.y||0,
   swaySpeed:config.sway?.speed||.4,
   driftX:config.drift?.x||0,
   driftY:config.drift?.y||0,
   driftSpeed:config.drift?.speed||.15,
   x:0,
   y:0,
   vx:0,
   vy:0,
   phase:0
  };
 }
 function update(platform,dt){
  if(!platform||dt<=0)return;
  platform.phase+=dt;
  const swayX=Math.sin(platform.phase*platform.swaySpeed)*platform.swayX;
  const swayY=Math.sin(platform.phase*platform.swaySpeed)*platform.swayY;
  const driftX=Math.sin(platform.phase*platform.driftSpeed)*platform.driftX;
  const driftY=Math.sin(platform.phase*platform.driftSpeed)*platform.driftY;
  const nextX=platform.baseX+swayX+driftX;
  const nextY=platform.baseY+swayY+driftY;
  platform.vx=(nextX-platform.x)/Math.max(dt,1e-6);
  platform.vy=(nextY-platform.y)/Math.max(dt,1e-6);
  platform.x=nextX;
  platform.y=nextY;
 }
 function apply(platform){
  if(!platform||!terrain)return;
  terrain.pad.x=platform.x;
  terrain.pad.y=platform.y;
  terrain.pad.w=platform.width;
  terrain.pts=[
   {x:-400,y:H*.9},
   {x:platform.x-14,y:platform.y},
   {x:platform.x,y:platform.y},
   {x:platform.x+platform.width,y:platform.y},
   {x:platform.x+platform.width+14,y:platform.y},
   {x:W+400,y:H*.9}
  ];
 }
 function reset(platform){
  if(!platform)return;
  platform.x=platform.baseX;
  platform.y=platform.baseY;
  platform.vx=0;
  platform.vy=0;
 }
 return {create,update,apply,reset,get current(){return current;},set current(value){current=value;}};
})();
