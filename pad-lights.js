/* Pad lamps render in world space before dust and the shuttle. */
(()=>{
 const drawPadScenery=drawWindsock;
 drawWindsock=function(m){
  const p=terrain.pad,now=performance.now()/1000;
  ctx.save();
  for(let i=0;i<5;i++){
   const x=p.x+8+i*((p.w-16)/4),y=p.y-2;
   const brightness=.8+.2*(Math.sin(now*3+i*.45)*.5+.5);
   const glow=ctx.createRadialGradient(x,y,1,x,y,17);
   glow.addColorStop(0,`rgba(255,153,42,${.65*brightness})`);
   glow.addColorStop(.4,`rgba(255,119,24,${.25*brightness})`);
   glow.addColorStop(1,'rgba(255,119,24,0)');
   ctx.fillStyle=glow;ctx.fillRect(x-17,y-17,34,34);
   ctx.shadowColor='#ff8c20';ctx.shadowBlur=10*brightness;
   ctx.fillStyle='#ff8c20';ctx.fillRect(x-4,y-3,8,6);
   ctx.shadowBlur=0;
   ctx.fillStyle='#ffe0a3';ctx.fillRect(x-2.5,y-2,5,2);
  }
  ctx.restore();
  drawPadScenery(m);
 };
})();
