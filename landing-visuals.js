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
 const themes={
  lunar:{skyTop:'#040718',skyMid:'#0b1630',skyBottom:'#16233d',surface:'#2a3346',surfaceDark:'#1a2231',surfaceLight:'#3d4a61',accent:'#c9d6ea',planet:'#c9d6ea',planetX:.82,planetY:.22,planetR:70,haze:'rgba(201,214,234,.04)',particle:'rgba(201,214,234,.45)'},
  mars:{skyTop:'#180a12',skyMid:'#3b1620',skyBottom:'#6b2a20',surface:'#5d2f22',surfaceDark:'#3d1f18',surfaceLight:'#7c4230',accent:'#ffb08a',planet:'#f2b48c',planetX:.18,planetY:.20,planetR:52,haze:'rgba(255,176,138,.07)',particle:'rgba(255,176,138,.55)'},
  titan:{skyTop:'#12100a',skyMid:'#2f230f',skyBottom:'#5a3f16',surface:'#2f2416',surfaceDark:'#1d160e',surfaceLight:'#4a3a22',accent:'#ffcf7a',planet:'#e8c07a',planetX:.76,planetY:.16,planetR:88,haze:'rgba(255,207,122,.10)',particle:'rgba(255,207,122,.55)'},
  io:{skyTop:'#0d0714',skyMid:'#241026',skyBottom:'#4a1c22',surface:'#6d5a20',surfaceDark:'#463a14',surfaceLight:'#8d742c',accent:'#ffd166',planet:'#e0a35a',planetX:.24,planetY:.18,planetR:64,haze:'rgba(255,209,102,.07)',particle:'rgba(255,209,102,.55)'}
 };
 function theme(){
  const id=selectedMission&&selectedMission.id;
  return themes[id]||themes.lunar;
 }
 function windDirection(m,phase){
  if(!m||!m.wind)return 1;
  if(m.id==='titan')return Math.sin(phase*.018)>=0?1:-1;
  return Math.sin(phase*.05)>=0?1:-1;
 }
 function windStrength(m,phase){
  if(!m||!m.wind)return 0;
  const wind=Math.sin(phase*.7)*m.wind*.08;
  return Math.min(1,Math.abs(wind)/(m.wind*.08));
 }
 function seeded(x){
  const v=Math.sin(x*.017)*43758.5453;
  return v-Math.floor(v);
 }
 function drawBackground(T){
  const sky=ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,T.skyTop);sky.addColorStop(.65,T.skyMid);sky.addColorStop(1,T.skyBottom);
  ctx.fillStyle=sky;ctx.fillRect(-20,-20,W+40,H+40);
  for(const st of stars){
   ctx.globalAlpha=st.a;
   ctx.fillStyle='#cfe3ff';
   ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,7);ctx.fill();
  }
  ctx.globalAlpha=1;
  const px=W*T.planetX,py=H*T.planetY,pr=T.planetR;
  const glow=ctx.createRadialGradient(px,py,pr*.35,px,py,pr*1.7);
  glow.addColorStop(0,T.haze);glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(px,py,pr*1.7,0,7);ctx.fill();
  ctx.fillStyle=T.planet;ctx.globalAlpha=.16;ctx.beginPath();ctx.arc(px,py,pr,0,7);ctx.fill();
  ctx.globalAlpha=.08;ctx.fillStyle='#000';
  ctx.beginPath();ctx.ellipse(px-pr*.25,py+pr*.18,pr*.72,pr*.34,-.25,0,7);ctx.fill();
  ctx.globalAlpha=1;
 }
 function drawTerrain(T){
  ctx.beginPath();ctx.moveTo(-100,H+10);
  for(const p of terrain.pts)ctx.lineTo(p.x,p.y);
  ctx.lineTo(W+100,H+10);ctx.closePath();
  const ground=ctx.createLinearGradient(0,H*.55,0,H+20);
  ground.addColorStop(0,T.surfaceLight);ground.addColorStop(.45,T.surface);ground.addColorStop(1,T.surfaceDark);
  ctx.fillStyle=ground;ctx.fill();
  ctx.strokeStyle=T.accent;ctx.globalAlpha=.22;ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;
  ctx.save();ctx.beginPath();ctx.moveTo(-100,H+10);
  for(const p of terrain.pts)ctx.lineTo(p.x,p.y);
  ctx.lineTo(W+100,H+10);ctx.closePath();ctx.clip();
  for(let x=-40;x<W+80;x+=18){
   const y=terrainYAt(x);
   const r=seeded(x);
   if(r>.72){
    ctx.globalAlpha=.16+r*.16;ctx.fillStyle=T.surfaceLight;
    ctx.beginPath();ctx.ellipse(x,y+3+r*7,3+r*7,1.5+r*2.5,0,0,7);ctx.fill();
   }
   if(r<.12){
    ctx.globalAlpha=.24;ctx.fillStyle=T.surfaceDark;
    ctx.beginPath();ctx.ellipse(x,y+5+r*20,5+r*9,2+r*3,0,0,7);ctx.fill();
   }
  }
  ctx.globalAlpha=.08;ctx.fillStyle='#ffffff';
  for(let x=-60;x<W+100;x+=7){
   const y=terrainYAt(x);
   ctx.fillRect(x,y+2,2,1);
  }
  ctx.restore();ctx.globalAlpha=1;
 }
 function drawPad(T){
  const p=terrain.pad;
  ctx.save();
  ctx.fillStyle='#131d31';ctx.fillRect(p.x-6,p.y-2,p.w+12,14);
  ctx.fillStyle='#1d2c4a';ctx.fillRect(p.x,p.y,p.w,8);
  ctx.strokeStyle='#7fd1ff';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,p.w,8);
  ctx.globalAlpha=.75;ctx.fillStyle='#dfe7ff';
  for(let i=0;i<4;i++)ctx.fillRect(p.x+10+i*(p.w-20)/3.5,p.y+2,14,3);
  ctx.globalAlpha=.55;ctx.fillStyle='#7fd1ff';
  ctx.fillRect(p.x+p.w/2-16,p.y+2,32,3);
  ctx.globalAlpha=.8;ctx.strokeStyle='#dfe7ff';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(p.x+p.w/2-8,p.y+16);ctx.lineTo(p.x+p.w/2,p.y+10);ctx.lineTo(p.x+p.w/2+8,p.y+16);ctx.stroke();
  ctx.globalAlpha=1;
  for(let i=0;i<5;i++){
   const blink=Math.sin(t*4+i)*.5+.5;
   lamp(p.x+8+i*((p.w-16)/4)-2,p.y-4,'#7fd1ff',blink>.25,2.6);
  }
  ctx.restore();
 }
 drawShip=function(){
  const s=ship,flash=clock()%2.06>=2;
  ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
  ThrusterPhysics.draw(ctx,s.jets||[]);
  drawLandingGear(s);
  ctx.beginPath();ctx.moveTo(0,-20);
  ctx.quadraticCurveTo(16,-4,14,12);ctx.lineTo(-14,12);
  ctx.quadraticCurveTo(-16,-4,0,-20);ctx.closePath();
  const hull=ctx.createLinearGradient(-14,-18,14,14);
  hull.addColorStop(0,'#f4f7ff');hull.addColorStop(.55,'#dfe7ff');hull.addColorStop(1,'#a9b7cd');
  ctx.fillStyle=hull;ctx.fill();
  ctx.strokeStyle='#7f92ad';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#7fa8ff';ctx.beginPath();ctx.moveTo(-6,-9);ctx.quadraticCurveTo(0,-15,6,-9);ctx.lineTo(6,-3);ctx.lineTo(-6,-3);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#4f6b8f';ctx.lineWidth=.8;ctx.stroke();
  ctx.fillStyle='rgba(90,110,140,.35)';
  ctx.fillRect(-11,0,5,9);ctx.fillRect(6,0,5,9);ctx.fillRect(-2,3,4,7);
  ctx.fillStyle='#8494ab';ctx.fillRect(-4,10,8,4);
  ctx.fillStyle='#5d6d85';ctx.beginPath();ctx.moveTo(-5,13);ctx.lineTo(5,13);ctx.lineTo(3,17);ctx.lineTo(-3,17);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ff8c42';ctx.fillRect(-13,6,3,3);ctx.fillRect(10,6,3,3);
  lamp(-15,-3,'#ff5252',flash);
  lamp(15,-3,'#4ade80',flash);
  lamp(0,-20,'#ffffff',flash,1.8);
  ctx.restore();
  drawLandingLights(s);
 };
 drawWindsock=function(m){
  if(m.wind<=0)return;
  const now=clock();
  const strength=windStrength(m,windPhase);
  const direction=windDirection(m,windPhase);
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
 let highGShake=0,lastVisualTime=clock(),previousShip=null;
 const windParticles=[];
 function updateWindParticles(dt,T){
  const m=selectedMission||{wind:0};
  const strength=windStrength(m,windPhase);
  const direction=windDirection(m,windPhase);
  const desired=Math.round(120+strength*260);
  while(windParticles.length<desired){
   windParticles.push({x:Math.random()*W,y:Math.random()*H*.92,s:4+Math.random()*13,a:.07+Math.random()*.22,r:.6+Math.random()*1.7,ph:Math.random()*7});
  }
  while(windParticles.length>desired)windParticles.pop();
  const speed=24+strength*190;
  for(const p of windParticles){
   p.x+=direction*speed*dt*(.55+p.s/18);
   p.y+=(Math.sin(clock()*1.7+p.ph)*10+6)*dt;
   if(direction>0&&p.x>W+20)p.x=-20;
   if(direction<0&&p.x<-20)p.x=W+20;
   if(p.y>H*.94)p.y=0;
  }
  ctx.save();
  ctx.fillStyle=T.particle;
  for(const p of windParticles){
   ctx.globalAlpha=p.a*(.35+strength*.65);
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();
  }
  ctx.restore();ctx.globalAlpha=1;
 }
 draw=function(){
  const now=clock(),dt=Math.min(.1,Math.max(0,now-lastVisualTime));
  lastVisualTime=now;
  if(ship!==previousShip){highGShake=0;previousShip=ship;}
  const gLoad=state==='play'?Math.hypot(ship.gVert,ship.gLat):0;
  const target=gLoad<=1.5?0:gLoad<=2.5?.8*(gLoad-1.5):
   gLoad<=3.5?.8+.8*(gLoad-2.5):1.6+.8*Math.min(1,(gLoad-3.5)/3);
  const rate=target>highGShake?12:9;
  highGShake+=(target-highGShake)*(1-Math.exp(-rate*dt));
  const impactShake=cameraShake;
  cameraShake=Math.min(5,Math.max(0,impactShake)+highGShake);
  ctx.clearRect(0,0,W,H);
  const shakeX=(Math.random()-.5)*cameraShake;
  const shakeY=(Math.random()-.5)*cameraShake;
  ctx.save();ctx.translate(shakeX,shakeY);
  const T=theme();
  drawBackground(T);
  drawTerrain(T);
  drawPad(T);
  drawWindsock(selectedMission);
  updateWindParticles(dt,T);
  drawDust();
  if(showTrajectory&&state==='play')drawTrajectory();
  drawShip();
  if(showFlightInstruments&&state==='play')drawShipReadouts();
  ctx.restore();
  ApproachWarnings.render(approachAlertEl,approachState,state==='play');
  const gearStatusEl=document.getElementById('gearStatus');
  const status=ApproachWarnings.gearStatus(ship.gear);
  gearStatusEl.textContent=status;
  gearStatusEl.className=status==='DOWN'?'good':approachState&&approachState.warning&&approachState.warning.tone==='critical'?'bad':'warn';
  document.getElementById('time').textContent=missionTime.toFixed(1);
  document.getElementById('alt').textContent=Math.max(0,Math.round(clearanceAt(ship).gap/SCALE));
  document.getElementById('fuelText').textContent=`${Math.round(ship.fuel)} / ${ship.fuelMax}`;
  document.getElementById('fuelFill').style.width=(ship.fuel/ship.fuelMax*100)+'%';
  document.getElementById('hullFill').style.width=(ship.hull/ship.hullMax*100)+'%';
  document.getElementById('crewFill').style.width=ship.crew+'%';
  document.getElementById('happyFill').style.width=ship.happiness+'%';
 };
})();