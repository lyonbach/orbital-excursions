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
  const left=x-21,right=x+21,deck=roof+32;
  ctx.save();
  ctx.lineWidth=2;ctx.strokeStyle='#637b9d';
  for(const side of [-1,1]){
   const top=x+side*14,foot=x+side*26,base=terrainYAt(foot);
   ctx.beginPath();ctx.moveTo(top,deck);ctx.lineTo(foot,base);ctx.stroke();
   ctx.fillStyle='#405372';ctx.fillRect(foot-5,base-3,10,4);
  }
  ctx.strokeStyle='#344b6c';ctx.lineWidth=1.4;
  for(const offset of [-3,3]){
   ctx.beginPath();ctx.moveTo(left+offset,deck);
   ctx.lineTo(right+offset,ground-5);
   ctx.moveTo(right+offset,deck);ctx.lineTo(left+offset,ground-5);ctx.stroke();
  }
  const tank=ctx.createLinearGradient(left,0,right,0);
  tank.addColorStop(0,'#243650');tank.addColorStop(.4,'#536c8b');tank.addColorStop(1,'#1b2c44');
  ctx.fillStyle=tank;ctx.strokeStyle='#7f99b7';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(left,roof+7);
  ctx.quadraticCurveTo(x,roof-9,right,roof+7);
  ctx.lineTo(right,deck);ctx.quadraticCurveTo(x,deck+10,left,deck);
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,roof+7,21,6,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#8aa1bd';ctx.beginPath();ctx.moveTo(left-3,deck+3);ctx.lineTo(right+3,deck+3);ctx.stroke();
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
