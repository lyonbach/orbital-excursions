/* Visual renderer replacements only; no simulation or save mutations. */
(()=>{
 const clock=()=>performance.now()/1000;
 function lamp(x,y,color,bright,radius=2.2){
  ctx.save();
  ctx.fillStyle=color;
  ctx.globalAlpha=bright?1:.16;
  if(bright){ctx.shadowColor=color;ctx.shadowBlur=9;}
  ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  ctx.restore();
 }
 drawShip=function(){
  const s=ship,flash=clock()%2.06>=2;
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
  ThrusterPhysics.draw(ctx,s.jets||[]);
  drawLandingGear(s);
  ctx.fillStyle='#dfe7ff';ctx.beginPath();ctx.moveTo(0,-20);
  ctx.quadraticCurveTo(16,-4,14,12);ctx.lineTo(-14,12);
  ctx.quadraticCurveTo(-16,-4,0,-20);ctx.fill();
  ctx.fillStyle='#7fa8ff';ctx.fillRect(-7,-8,14,7);
  lamp(-15,-3,'#ff5252',flash);
  lamp(15,-3,'#4ade80',flash);
  lamp(0,-20,'#ffffff',flash,1.8);
  ctx.restore();
  drawLandingLights(s);
 };
 drawWindsock=function(m){
  if(m.wind<=0)return;
  const now=clock(),wind=Math.sin(windPhase*.7)*m.wind*.08;
  const strength=Math.min(1,Math.abs(wind)/(m.wind*.08));
  const direction=wind>=0?1:-1;
  const x=Math.max(82,terrain.pad.x-92);
  const ground=terrainYAt(x),roof=ground-96;
  ctx.save();
  for(const offset of [-3,3]){
   const legs=[-1,1].map(side=>({top:x+side*14+offset,foot:x+side*26+offset}));
   ctx.strokeStyle=offset<0?'#344b6c':'#637b9d';ctx.lineWidth=2;
   for(const leg of legs){
    const base=terrainYAt(leg.foot);
    ctx.beginPath();ctx.moveTo(leg.top,roof);ctx.lineTo(leg.foot,base);ctx.stroke();
    ctx.fillStyle='#405372';ctx.fillRect(leg.foot-4,base-3,8,4);
   }
   const point=(leg,f)=>({x:leg.top+(leg.foot-leg.top)*f,y:roof+(terrainYAt(leg.foot)-roof)*f});
   ctx.lineWidth=1.2;
   for(let i=0;i<3;i++){
    const a=point(legs[0],i/3),b=point(legs[1],i/3);
    const c=point(legs[0],(i+1)/3),d=point(legs[1],(i+1)/3);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(d.x,d.y);
    ctx.moveTo(b.x,b.y);ctx.lineTo(c.x,c.y);
    ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   }
  }
  ctx.fillStyle='#324966';ctx.fillRect(x-22,roof-2,44,5);
  ctx.strokeStyle='#8aa1bd';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(x-22,roof-2);ctx.lineTo(x+22,roof-2);ctx.stroke();
  const mastY=roof-26;
  ctx.beginPath();ctx.moveTo(x,roof);ctx.lineTo(x,mastY-9);ctx.stroke();
  ctx.fillStyle='#324966';ctx.fillRect(x+12,roof-10,4,13);
  const pulse=Math.pow(Math.max(0,Math.sin(now*Math.PI*2)),8);
  lamp(x+14,roof-12,'#ff4545',pulse>.25,2.8);
  ctx.globalAlpha=pulse*.25;ctx.fillStyle='#ff4545';
  ctx.beginPath();ctx.arc(x+14,roof-12,9,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  const length=30+46*strength;
  const center=f=>({x:x+direction*length*f,y:mastY+(1-strength)*27*f+Math.sin(now*(5+4*strength)-f*5)*3*strength*f});
  for(let i=0;i<6;i++){
   const a=i/6,b=(i+1)/6,p=center(a),q=center(b);
   const wa=7-4*a,wb=7-4*b;
   ctx.fillStyle=i%2?'#f1f3ec':'#ff8c42';
   ctx.beginPath();ctx.moveTo(p.x,p.y-wa);ctx.lineTo(q.x,q.y-wb);
   ctx.lineTo(q.x,q.y+wb);ctx.lineTo(p.x,p.y+wa);ctx.closePath();ctx.fill();
  }
  ctx.strokeStyle='#dce5ef';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(x,mastY,2,7,0,0,Math.PI*2);ctx.stroke();
  ctx.restore();
 };
})();
