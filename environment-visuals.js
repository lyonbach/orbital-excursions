const EnvironmentVisuals=(()=>{
 const themes={
  lunar:{sky:['#010208','#080b13','#141923'],ground:'#30343e',edge:'#87909e',dust:'#d0d1d4',stars:1,ridges:['#171c27','#252a35'],haze:0},
  mars:{sky:['#24151b','#613b34','#a47758'],ground:'#693c30',edge:'#c18562',dust:'#dba17a',stars:.08,ridges:['#694b43','#805445'],haze:.13},
  titan:{sky:['#201710','#574124','#a17b3e'],ground:'#51422d',edge:'#aa9160',dust:'#c5ab79',stars:.015,ridges:['#706040','#665437'],haze:.28},
  io:{sky:['#030309','#15121b','#443629'],ground:'#5b4d2b',edge:'#b9a65c',dust:'#d2c387',stars:.9,ridges:['#272329','#39302a'],haze:.05},
  jupiter:{sky:['#0b1030','#3b2a4d','#a97b4a'],ground:'#232c42',edge:'#7f95bd',dust:'#d9c3a0',stars:.08,ridges:['#4d3358','#7c5340'],haze:.34}
 };
 const key=()=>selectedMission.destination||selectedMission.id;
 const theme=()=>themes[key()]||themes.lunar;
 const windDust=[];
 function spawnWindDust(dt){
  const windMax=(selectedMission.wind||0)*.08;
  const windValue=Math.sin(windPhase*.7)*windMax;
  const windStrength=windMax?Math.min(1,Math.abs(windValue)/windMax):0;
  const magnitude=Math.abs(windValue);
  if(magnitude>=.012){
   const target=Math.min(24,Math.floor(magnitude*130));
   while(windDust.length<target)windDust.push({
    x:windValue>0?-20:W+20,y:H*(.58+Math.random()*.26),
    size:.8+Math.random()*1.7,life:1.1+Math.random()*1.2,age:0,
    rise:1+Math.random()*3+windStrength*2
   });
  }
  for(const p of windDust){
   p.age+=dt;p.x+=windValue*(700+p.size*160)*dt;p.y-=p.rise*dt;
  }
  for(let i=windDust.length-1;i>=0;i--){
   const p=windDust[i];
   if(p.age>p.life||p.x<-35||p.x>W+35)windDust.splice(i,1);
  }
 }
 function drawWindDust(){
  if(!windDust.length)return;
  ctx.save();ctx.fillStyle=theme().dust;
  for(const p of windDust){
   const fade=Math.sin(Math.min(1,p.age/p.life)*Math.PI);
   ctx.globalAlpha=fade*.24;
   ctx.beginPath();ctx.ellipse(p.x,p.y,p.size*3.4,p.size*.8,0,0,7);ctx.fill();
  }
  ctx.restore();
 }
 function backdrop(){
  const p=theme(),sky=ctx.createLinearGradient(0,0,0,H);
  p.sky.forEach((c,i)=>sky.addColorStop(i/2,c));
  ctx.fillStyle=sky;ctx.fillRect(-20,-20,W+40,H+40);
  for(const s of stars){ctx.globalAlpha=s.a*p.stars;ctx.fillStyle='#e1e7ef';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();}
  ctx.globalAlpha=1;
  if(key()!=='jupiter'){
   p.ridges.forEach((color,layer)=>{
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-20,H+20);
    for(let x=-20;x<=W+40;x+=20){
     const u=x/Math.max(1,W),base=.69+layer*.055;
     const height=Math.sin(u*13+layer*2)*.04+Math.sin(u*29+layer)*.022;
     ctx.lineTo(x,H*(base-height));
    }
    ctx.lineTo(W+40,H+20);ctx.closePath();ctx.fill();
   });
  }else{
   ctx.save();
   for(let layer=0;layer<4;layer++){
    ctx.globalAlpha=.16+layer*.09;
    ctx.fillStyle=layer%2?'#7c5340':'#4d3358';
    ctx.beginPath();ctx.moveTo(-20,H*(.34+layer*.13));
    for(let x=-20;x<=W+40;x+=28){
     const u=x/W;
     ctx.lineTo(x,H*(.34+layer*.13)+Math.sin(u*(9+layer*3)+layer*2)*16);
    }
    ctx.lineTo(W+40,H+20);ctx.lineTo(-20,H+20);ctx.closePath();ctx.fill();
   }
   ctx.restore();
  }
  if(key()==='io'){
   ctx.save();ctx.strokeStyle='#da7a38';ctx.shadowColor='#f08a38';ctx.shadowBlur=7;ctx.globalAlpha=.45;ctx.lineWidth=1.5;
   for(const u of [.18,.47,.83]){ctx.beginPath();ctx.moveTo(W*u,H*.73);ctx.lineTo(W*(u+.012),H*.75);ctx.lineTo(W*(u+.007),H*.78);ctx.stroke();}
   ctx.restore();
  }
  if(p.haze){
   const haze=ctx.createLinearGradient(0,H*.4,0,H);
   haze.addColorStop(0,'rgba(210,166,102,0)');haze.addColorStop(1,`rgba(210,166,102,${p.haze})`);
   ctx.fillStyle=haze;ctx.fillRect(-20,H*.4,W+40,H*.6+20);
  }
 }
 drawDust=function(){
  ctx.save();ctx.fillStyle=theme().dust;
  for(const p of dustParticles){ctx.globalAlpha=Math.max(0,1-p.age/p.life)*.8;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill();}
  ctx.restore();
 };
 function drawPlatformMotion(pad,platform){
  if(!platform)return;
  const speed=Math.min(1,Math.abs(platform.vx)/140);
  const tilt=Math.max(-.05,Math.min(.05,platform.vx/900));
  const cx=pad.x+pad.w/2,cy=pad.y+4;
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(tilt);
  const balloons=[
   {x:-pad.w*.38,y:-158,r:54},
   {x:0,y:-184,r:62},
   {x:pad.w*.38,y:-158,r:54}
  ];
  ctx.strokeStyle='#8a6a3a';
  ctx.lineWidth=2.5;
  for(const b of balloons){
   ctx.beginPath();
   ctx.moveTo(b.x*.78,-2);
   ctx.lineTo(b.x,b.y+b.r*1.08);
   ctx.stroke();
  }
  for(const b of balloons){
   const hull=ctx.createLinearGradient(b.x-b.r,b.y-b.r,b.x+b.r,b.y+b.r);
   hull.addColorStop(0,'#e9c47c');
   hull.addColorStop(.45,'#b97f3c');
   hull.addColorStop(1,'#77491f');
   ctx.fillStyle=hull;
   ctx.beginPath();
   ctx.ellipse(b.x,b.y,b.r,b.r*1.18,0,0,7);
   ctx.fill();
   ctx.strokeStyle='#6b431d';
   ctx.lineWidth=3;
   for(const f of [-.48,0,.48]){
    ctx.beginPath();
    ctx.ellipse(b.x,b.y,b.r*Math.cos(f),b.r*1.18,0,-Math.PI/2,Math.PI/2);
    ctx.stroke();
   }
   ctx.fillStyle='#f2d79d';
   for(let i=0;i<10;i++){
    const a=-Math.PI*.85+i*Math.PI*.17;
    ctx.beginPath();
    ctx.arc(b.x+Math.cos(a)*b.r*.82,b.y+Math.sin(a)*b.r*1.02,1.7,0,7);
    ctx.fill();
   }
   ctx.strokeStyle='#5d3a18';
   ctx.lineWidth=3;
   ctx.beginPath();
   ctx.moveTo(b.x-b.r*.42,b.y+b.r*1.02);
   ctx.lineTo(b.x,b.y+b.r*1.24);
   ctx.lineTo(b.x+b.r*.42,b.y+b.r*1.02);
   ctx.stroke();
   ctx.fillStyle='#8c5a26';
   ctx.fillRect(b.x-9,b.y+b.r*1.18,18,7);
   ctx.strokeStyle='#f0cf8c';
   ctx.lineWidth=1.5;
   ctx.strokeRect(b.x-9,b.y+b.r*1.18,18,7);
  }
  ctx.fillStyle='#1d2c4a';
  ctx.fillRect(-pad.w/2,-4,pad.w,8);
  ctx.strokeStyle='#7fd1ff';
  ctx.lineWidth=2;
  ctx.strokeRect(-pad.w/2,-4,pad.w,8);
  ctx.save();
  ctx.translate(pad.w/2-4,0);
  ctx.strokeStyle='#a97b3a';
  ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(0,-24);
  ctx.stroke();
  ctx.fillStyle='#7c4f22';
  ctx.fillRect(-5,-28,10,6);
  const windMax=(selectedMission.wind||0)*.08;
  const windValue=Math.sin(windPhase*.7)*windMax;
  const windStrength=windMax?Math.min(1,Math.abs(windValue)/windMax):0;
  const vane=windMax?windValue/windMax*.9:0;
  const blade=10+9*windStrength;
  ctx.translate(0,-25);
  ctx.rotate(vane);
  ctx.fillStyle='#d9a44a';
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(blade,-4);
  ctx.lineTo(blade,4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle='#5d3a18';
  ctx.lineWidth=1.5;
  ctx.stroke();
  ctx.fillStyle='#ffffff';
  ctx.beginPath();
  ctx.moveTo(blade*.45,-2.2);
  ctx.lineTo(blade*.65,-1);
  ctx.lineTo(blade*.65,1);
  ctx.lineTo(blade*.45,2.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  const pulse=.35+Math.abs(Math.sin(t*(2+speed*4)))*.65;
  ctx.fillStyle=`rgba(255,140,66,${pulse})`;
  ctx.fillRect(-pad.w/2,-7,7,3);
  ctx.fillRect(pad.w/2-7,-4,7,3);
  if(speed>.08){
   const direction=platform.vx>=0?-1:1;
   ctx.globalAlpha=.16+speed*.18;
   ctx.fillStyle='#d9c3a0';
   for(let i=0;i<4;i++){
    const offset=direction*(18+i*16)*speed;
    ctx.beginPath();
    ctx.ellipse(offset,2+i,26-i*4,2.2-i*.3,0,0,7);
    ctx.fill();
   }
  }
  ctx.restore();
 }
 draw=function(dt=1/60){
  ctx.clearRect(0,0,W,H);
  ctx.save();ctx.translate((Math.random()-.5)*cameraShake,(Math.random()-.5)*cameraShake);
  backdrop();
  const colors=theme();
  if(key()!=='jupiter'){
   ctx.beginPath();ctx.moveTo(-100,H+10);
   for(const p of terrain.pts)ctx.lineTo(p.x,p.y);
   ctx.lineTo(W+100,H+10);ctx.closePath();
   ctx.fillStyle=colors.ground;ctx.fill();ctx.strokeStyle=colors.edge;ctx.lineWidth=2;ctx.stroke();
  }
  const pad=terrain.pad;
  if(key()==='jupiter'&&MovingPlatform.current){
   drawPlatformMotion(pad,MovingPlatform.current);
  }else{
   ctx.fillStyle='#1d2c4a';ctx.fillRect(pad.x,pad.y,pad.w,8);
   ctx.strokeStyle='#7fd1ff';ctx.lineWidth=2;ctx.strokeRect(pad.x,pad.y,pad.w,8);
  }
  if(key()!=='jupiter')drawWindsock(selectedMission);
  spawnWindDust(dt);drawWindDust();drawDust();
  if(showTrajectory&&state==='play')drawTrajectory();
  drawShip();
  if(showFlightInstruments&&state==='play')drawShipReadouts();
  ctx.restore();
  ApproachWarnings.render(approachAlertEl,approachState,state==='play');
  const gear=document.getElementById('gearStatus'),status=ApproachWarnings.gearStatus(ship.gear);
  gear.textContent=status;
  gear.className=status==='DOWN'?'good':approachState&&approachState.warning&&approachState.warning.tone==='critical'?'bad':'warn';
  document.getElementById('time').textContent=missionTime.toFixed(1);
  document.getElementById('alt').textContent=Math.max(0,Math.round(clearanceAt(ship).gap/SCALE));
  document.getElementById('fuelText').textContent=`${Math.round(ship.fuel)} / ${ship.fuelMax}`;
  document.getElementById('fuelFill').style.width=(ship.fuel/ship.fuelMax*100)+'%';
  document.getElementById('hullFill').style.width=(ship.hull/ship.hullMax*100)+'%';
  document.getElementById('crewFill').style.width=ship.crew+'%';
  document.getElementById('happyFill').style.width=ship.happiness+'%';
 };
 return {theme,backdrop,windDust,spawnWindDust};
})();
