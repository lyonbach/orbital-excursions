const EnvironmentVisuals=(()=>{
 const themes={
  lunar:{sky:['#010208','#080b13','#141923'],ground:'#30343e',edge:'#87909e',dust:'#d0d1d4',stars:1,ridges:['#171c27','#252a35'],haze:0},
  mars:{sky:['#24151b','#613b34','#a47758'],ground:'#693c30',edge:'#c18562',dust:'#dba17a',stars:.08,ridges:['#694b43','#805445'],haze:.13},
  titan:{sky:['#201710','#574124','#a17b3e'],ground:'#51422d',edge:'#aa9160',dust:'#c5ab79',stars:.015,ridges:['#706040','#665437'],haze:.28},
  io:{sky:['#030309','#15121b','#443629'],ground:'#5b4d2b',edge:'#b9a65c',dust:'#d2c387',stars:.9,ridges:['#272329','#39302a'],haze:.05}
 };
 const key=()=>selectedMission.destination||selectedMission.id;
 const theme=()=>themes[key()]||themes.lunar;
 const windDust=[];
 function spawnWindDust(dt){
  const wind=selectedMission.wind||0,magnitude=Math.abs(wind);
  if(magnitude>=.12){
   const target=Math.min(24,Math.floor(magnitude*11));
   while(windDust.length<target)windDust.push({
    x:wind>0?-20:W+20,y:H*(.58+Math.random()*.26),
    size:.8+Math.random()*1.7,life:1.1+Math.random()*1.2,age:0,
    rise:3+Math.random()*9
   });
  }
  for(const p of windDust){
   p.age+=dt;p.x+=wind*(55+p.size*22)*dt;p.y-=p.rise*dt;
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
  p.ridges.forEach((color,layer)=>{
   ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-20,H+20);
   for(let x=-20;x<=W+40;x+=20){
    const u=x/Math.max(1,W),base=.69+layer*.055;
    const height=Math.sin(u*13+layer*2)*.04+Math.sin(u*29+layer)*.022;
    ctx.lineTo(x,H*(base-height));
   }
   ctx.lineTo(W+40,H+20);ctx.closePath();ctx.fill();
  });
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
 draw=function(dt=1/60){
  ctx.clearRect(0,0,W,H);
  ctx.save();ctx.translate((Math.random()-.5)*cameraShake,(Math.random()-.5)*cameraShake);
  backdrop();
  const colors=theme();
  ctx.beginPath();ctx.moveTo(-100,H+10);
  for(const p of terrain.pts)ctx.lineTo(p.x,p.y);
  ctx.lineTo(W+100,H+10);ctx.closePath();
  ctx.fillStyle=colors.ground;ctx.fill();ctx.strokeStyle=colors.edge;ctx.lineWidth=2;ctx.stroke();
  const pad=terrain.pad;
  ctx.fillStyle='#1d2c4a';ctx.fillRect(pad.x,pad.y,pad.w,8);
  ctx.strokeStyle='#7fd1ff';ctx.lineWidth=2;ctx.strokeRect(pad.x,pad.y,pad.w,8);
  drawWindsock(selectedMission);
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
