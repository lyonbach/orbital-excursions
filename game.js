const cv=document.getElementById('game'),ctx=cv.getContext('2d');
let W=0,H=0;
function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
addEventListener('resize',resize);resize();

const G=9.81, SCALE=8;
const SAFE_VS=2.2, SAFE_HS=1.6, SAFE_G=3.5, HARD_G=6.5;
const BASE_FARE=500, FUEL_BONUS_MAX=500, HAPPINESS_RATE=5;
const TARGET_TIME=90, SPEED_BONUS_RATE=10, SPEED_BONUS_MAX=900;
const SAVE_KEY='orbitalExcursionsSave_v1';
const LANDING={deployTime:2,travel:10,spring:24,damper:5.5,settleTime:.65,crashSpeed:8.5};

const MISSIONS=[
 {id:'lunar',name:'Lunar Shuttle Run',fare:500,gravity:9.81,padWidth:150,roughness:1,wind:0,drag:0,startVx:18,startFuel:1,description:'A calm training run to the illuminated lunar pad.',unlockAt:0,
  environment:{title:'The Moon',body:'Earth’s only natural satellite',diameter:'3,474 km',gravity:'1.62 m/s² (16.6% of Earth)',atmosphere:'Effectively a vacuum; only a highly tenuous exosphere.',temperature:'Approximately 120 °C in sunlight to −171 °C in shadow.',hazards:'No atmospheric braking, extreme thermal swings, and abrasive regolith.',source:'Moon',url:'https://en.wikipedia.org/wiki/Moon'}},
 {id:'mars',name:'Mars Express',fare:900,gravity:5.5,padWidth:120,roughness:1.25,wind:0,drag:.015,startVx:26,startFuel:.9,description:'Low gravity, but a faster approach and a tighter landing zone.',unlockAt:1,
  environment:{title:'Mars',body:'Fourth planet from the Sun',diameter:'6,779 km',gravity:'3.72 m/s² (38% of Earth)',atmosphere:'Thin-air aerobraking, dust, low pressure, and elevated radiation exposure.',temperature:'Approximately −153 °C to 20 °C.',hazards:'Thin-air aerobraking, dust, low pressure, and elevated radiation exposure.',source:'Mars',url:'https://en.wikipedia.org/wiki/Mars'}},
 {id:'titan',name:'Titan Charter',fare:1400,gravity:2.8,padWidth:105,roughness:1.5,wind:7,drag:.09,startVx:30,startFuel:.85,description:'Thick atmosphere, crosswinds, and a narrow pad.',unlockAt:2,
  environment:{title:'Titan',body:'Largest moon of Saturn',diameter:'5,149 km',gravity:'1.352 m/s² (13.8% of Earth)',atmosphere:'Dense nitrogen atmosphere with methane; surface pressure exceeds Earth’s.',temperature:'About −179.5 °C.',hazards:'Methane weather, hydrocarbon lakes, dense haze, and strong atmospheric drag.',source:'Titan (moon)',url:'https://en.wikipedia.org/wiki/Titan_(moon)'}},
 {id:'io',name:'Io Emergency',fare:2200,gravity:12.5,padWidth:95,roughness:1.8,wind:11,drag:.002,startVx:34,startFuel:.8,description:'High gravity, radiation gusts, and almost no margin for error.',unlockAt:3,
  environment:{title:'Io',body:'Innermost Galilean moon of Jupiter',diameter:'About 3,642 km',gravity:'1.796 m/s² (18.3% of Earth)',atmosphere:'Extremely thin, dominated by sulfur dioxide.',temperature:'Cold surface, with intense local heating around volcanic features.',hazards:'Extreme volcanism, sulfur compounds, radiation and tidal gusts, with negligible aerodynamic drag.',source:'Io (moon)',url:'https://en.wikipedia.org/wiki/Io_(moon)'}}
];

const UPGRADES={
 engine:{name:'Main Engine',levels:[0,400,900,1600],effect:l=>`Thrust ${26+3*l}`,desc:'Improves climb and braking authority.'},
 fuel:{name:'Fuel Capacity',levels:[0,350,800,1500],effect:l=>`${100+20*l} units`,desc:'Carry more propellant for long approaches. Extra capacity does not include fuel.'},
 hull:{name:'Hull Plating',levels:[0,450,1000,1800],effect:l=>`${100+15*l} hull, ${Math.round(8*l)}% impact resistance`,desc:'Absorbs more landing and collision damage. Extra capacity does not repair existing hull points.'},
 rcs:{name:'RCS Thrusters',levels:[0,300,700,1300],effect:l=>`Lateral thrust ${6+1.5*l}`,desc:'Improves sideways correction without rotating.'}
};

if (typeof FuelEconomy === 'undefined' || typeof RepairShop === 'undefined') {
  throw new Error('Orbital Excursions: economy modules did not load. Hard-refresh with cache disabled; do not reset progress.');
}

let save=loadSave(),resourceSaveElapsed=0;
function loadSave(){
 try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(raw)return FuelEconomy.migrate(JSON.parse(raw));
 }catch(e){}
 return FuelEconomy.fresh();
}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save));}
persist();

const keys={};
let showFlightInstruments=true,showTrajectory=true;
addEventListener('keydown',e=>{
 const target=e.target;
 if(target&&(target.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target.tagName)))return;
 keys[e.code]=true;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 if(!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&state==='play'){
  if(e.code==='KeyH'){e.preventDefault();showFlightInstruments=!showFlightInstruments;}
  if(e.code==='KeyT'){e.preventDefault();showTrajectory=!showTrajectory;}
  if(e.code==='KeyG'){e.preventDefault();ship.gear.target=1-ship.gear.target;ship.settleTime=0;}
 }
 if(e.code==='Escape'&&(state==='missions'||state==='hangar'))showTitle();
});
addEventListener('keyup',e=>keys[e.code]=false);

let ship,terrain,stars,state='title',t=0,missionTime=0,lastT=performance.now(),result=null,selectedMission=MISSIONS[0],windPhase=0,shipAccel={x:0,y:0};
let approachState=null;
let dustParticles=[];
const screenEl=document.getElementById('screen'),envEl=document.getElementById('env');
const approachAlertEl=document.getElementById('approachAlerts');
function flushFlightResources(){if(state==='play'&&ship){save.fuel=ship.fuel;save.hull=ship.hull;persist();resourceSaveElapsed=0;}}
addEventListener('pagehide',flushFlightResources);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushFlightResources();});

function makeTerrain(m){
 const pts=[]; let x=-200;
 while(x<W+400){
  pts.push({x,y:H-70-Math.sin(x*.004)*28*m.roughness-Math.sin(x*.011)*14*m.roughness-Math.random()*7*m.roughness});
  x+=24;
 }
 const px=W*.72,pw=m.padWidth,py=H-105;
 for(const p of pts){if(p.x>px-6&&p.x<px+pw+6)p.y=py;}
 return {pts,pad:{x:px,w:pw,y:py}};
}

function maxFuel(){return FuelEconomy.capacity(save);}
function maxHull(){return RepairShop.capacity(save);}
function enginePower(){return 26+3*save.upgrades.engine;}
function rcsPower(){return 6+1.5*save.upgrades.rcs;}
function hullResistance(){return 1-.08*save.upgrades.hull;}

function createLandingGear(){
 return {target:0,progress:0,legs:[{side:-1,compression:0,touching:false},{side:1,compression:0,touching:false}]};
}
function worldPoint(s,x,y){
 const c=Math.cos(s.angle),sn=Math.sin(s.angle);
 return {x:s.x+x*c-y*sn,y:s.y+x*sn+y*c};
}
function gearFoot(s,leg,compressed=true){
 const p=s.gear.progress;
 return worldPoint(s,leg.side*(11+8*p),8+20*p-(compressed?leg.compression:0));
}
function hullPoints(s){return [[-12,12],[12,12],[-14,0],[14,0],[0,-20]].map(([x,y])=>worldPoint(s,x,y));}
function contactPoints(s,compressed=true){
 const points=hullPoints(s);
 if(s.gear.progress>=.999)points.push(...s.gear.legs.map(leg=>gearFoot(s,leg,compressed)));
 return points;
}
function clearanceAt(s,compressed=true){
 const points=contactPoints(s,compressed);
 return points.reduce((best,p)=>{
  const gap=terrainYAt(p.x)-p.y;
  return gap<best.gap?{gap,x:p.x,y:p.y}:best;
 },{gap:Infinity,x:s.x,y:s.y});
}
function applyLandingDamage(s,amount){
 const damage=Math.max(0,amount)*hullResistance();
 s.hull=Math.max(0,s.hull-damage);
 s.crew=Math.max(0,s.crew-damage*.8);
 s.happiness=Math.max(0,s.happiness-damage*1.5);
}
function spawnDust(x,y,speed,side){
 const count=Math.min(26,8+Math.floor(speed*2.5));
 for(let i=0;i<count;i++){
  if(dustParticles.length>=220)dustParticles.shift();
  dustParticles.push({
   x:x+(Math.random()-.5)*8,
   y:y-1,
   vx:side*(.7+Math.random()*2.4)+(Math.random()-.5)*1.8,
   vy:-(.6+Math.random()*2)*Math.min(3,.6+speed*.22),
   life:.7+Math.random()*.7,
   age:0,
   size:1.5+Math.random()*3.5
  });
 }
}
function updateDust(dt){
 for(const p of dustParticles){
  p.age+=dt;
  p.x+=p.vx*SCALE*dt;
  p.y+=p.vy*SCALE*dt;
  p.vy+=2.4*dt;
  p.vx*=Math.exp(-1.5*dt);
 }
 dustParticles=dustParticles.filter(p=>p.age<p.life);
}
function drawDust(){
 for(const p of dustParticles){
  ctx.globalAlpha=Math.max(0,1-p.age/p.life)*.8;
  ctx.fillStyle='#c3d2e8';
  ctx.beginPath();
  ctx.arc(p.x,p.y,p.size,0,7);
  ctx.fill();
 }
 ctx.globalAlpha=1;
}
function integrateLandingMotion(s,dt,ax,ay){
 const steps=Math.ceil(dt*120),h=dt/steps;
 for(let i=0;i<steps&&!s.failureReason;i++){
  let support=0,torque=0,contacts=0;
  const drive=ThrusterPhysics.wrench(s.jets||[],s.angle,SCALE);
  const down=s.gear.progress>=.999;
  for(const leg of s.gear.legs){
   const foot=gearFoot(s,leg,false),penetration=foot.y-terrainYAt(foot.x);
   const touching=down&&penetration>0;
   if(touching){
    const rx=(foot.x-s.x)/SCALE,normalSpeed=s.vy+s.angVel*rx;
    if(!leg.touching){
     spawnDust(foot.x,terrainYAt(foot.x),Math.abs(normalSpeed),leg.side);
     applyLandingDamage(s,(Math.max(0,normalSpeed-SAFE_VS-1.2)*8+Math.max(0,Math.abs(s.vx)-SAFE_HS)*5)/2);
     const onPad=foot.x>terrain.pad.x&&foot.x<terrain.pad.x+terrain.pad.w;
     if(normalSpeed>LANDING.crashSpeed||(!onPad&&normalSpeed>SAFE_VS*2.2))s.failureReason='The landing impact was too severe.';
    }
    const force=Math.max(0,LANDING.spring*penetration/SCALE+LANDING.damper*normalSpeed);
    support+=force;torque-=rx*force/ThrusterPhysics.inertia;contacts++;
   }
   leg.touching=touching;
  }
  if(s.failureReason)break;
  s.vx+=(ax+drive.ax)*h;s.vy+=(ay+drive.ay-support)*h;
  s.angVel=(s.angVel+(torque+drive.alpha)*h)*ThrusterPhysics.damping(h);
  if(contacts)s.vx*=Math.exp(-4*h);
  s.x+=s.vx*SCALE*h;s.y+=s.vy*SCALE*h;
  s.angle=ThrusterPhysics.normalizeAngle(s.angle+s.angVel*h);
  const c=Math.cos(s.angle);
  for(const leg of s.gear.legs){
   const foot=gearFoot(s,leg,false),penetration=Math.max(0,foot.y-terrainYAt(foot.x));
   leg.compression=down?Math.min(LANDING.travel,penetration/Math.max(.2,c)):0;
   if(down&&c>.25&&penetration>LANDING.travel*c){
    applyLandingDamage(s,Math.max(0,s.vy-1.2)*12);
    s.y-=penetration-LANDING.travel*c;s.vy=Math.min(0,s.vy);s.angVel*=.6;
   }
  }
  const hull=hullPoints(s);
  const penetration=Math.max(...hull.map(p=>p.y-terrainYAt(p.x)));
  if(penetration>=0){
   applyLandingDamage(s,15+Math.max(0,s.vy)*8+Math.abs(s.vx)*5);
   s.y-=penetration+.01;s.vy=Math.min(0,s.vy);
   s.failureReason=down?'The hull struck the terrain.':'Hull strike: landing gear was not fully deployed.';
  }
  if(s.hull<=0||s.crew<=0)s.failureReason='The landing impact was too severe.';
 }
}

function showEnvironment(m){
 const e=m.environment;
 envEl.innerHTML=`
  <h2>${e.title}</h2>
  <dl>
   <dt>Body</dt><dd>${e.body}</dd>
   <dt>Diameter</dt><dd>${e.diameter}</dd>
   <dt>Surface gravity</dt><dd>${e.gravity}</dd>
   <dt>Atmosphere</dt><dd>${e.atmosphere}</dd>
   <dt>Temperature</dt><dd>${e.temperature}</dd>
   <dt>Operational hazards</dt><dd>${e.hazards}</dd>
  </dl>
  <div class="source">Source: <a href="${e.url}" target="_blank" rel="noopener noreferrer">Wikipedia — ${e.source}</a></div>
 `;
 envEl.classList.remove('hidden');
}

function startMission(m){
 if(save.fuel<=1e-6||save.hull<=1e-6){showHangar();return;}
 selectedMission=m;
 terrain=makeTerrain(m);
 stars=Array.from({length:170},()=>({x:Math.random()*W,y:Math.random()*H*.72,r:Math.random()*1.5+.3,a:Math.random()*.7+.2}));
 const fuelMax=maxFuel();
 ship={x:120,y:120,vx:m.startVx,vy:0,angle:0,angVel:0,fuel:save.fuel,fuelMax,hull:save.hull,hullMax:maxHull(),crew:100,happiness:100,thrusting:false,rcsL:false,rcsR:false,gVert:0,gLat:0,prevVx:0,prevVy:0,peakG:0,gear:createLandingGear(),settleTime:0,failureReason:''};
 approachState=ApproachWarnings.create(Math.max(0,clearanceAt(ship).gap/SCALE));
 missionTime=0;result=null;windPhase=0;shipAccel={x:0,y:0};resourceSaveElapsed=0;
 dustParticles=[];
 state='play';
 screenEl.style.display='none';
 screenEl.classList.add('hidden');
 document.getElementById('hud').classList.remove('hidden');
 showEnvironment(m);
}

function terrainYAt(x){
 const p=terrain.pts;
 for(let i=0;i<p.length-1;i++){
  if(x>=p[i].x&&x<=p[i+1].x){const f=(x-p[i].x)/(p[i+1].x-p[i].x);return p[i].y+(p[i+1].y-p[i].y)*f;}
 }
 return H;
}

function update(dt){
 if(dt<=0)return;
 t+=dt;missionTime+=dt;windPhase+=dt;
 const s=ship,m=selectedMission;
 s.prevVx=s.vx;s.prevVy=s.vy;
 s.gear.progress+=Math.max(-dt/LANDING.deployTime,Math.min(dt/LANDING.deployTime,s.gear.target-s.gear.progress));

 const commands=ThrusterPhysics.prepare(s,{
  main:!!(keys.KeyW||keys.ArrowUp),left:!!(keys.KeyA||keys.ArrowLeft),
  right:!!(keys.KeyD||keys.ArrowRight),ccw:!!keys.KeyQ,cw:!!keys.KeyE
 },dt,enginePower()*(.55+.45*s.hull/s.hullMax),rcsPower());
 s.jets=commands.jets;s.fuel=Math.max(0,s.fuel-commands.fuelUsed);
 s.thrusting=commands.main;s.rcsL=commands.left;s.rcsR=commands.right;

 let ax=0,ay=m.gravity;
 if(m.wind){ax+=Math.sin(windPhase*.7)*m.wind*.08;}
 const drag=m.drag||0;
 ax-=s.vx*drag;ay-=s.vy*drag;
 integrateLandingMotion(s,dt,ax,ay);
 updateDust(dt);
 const dvx=(s.vx-s.prevVx)/dt,dvy=(s.vy-s.prevVy)/dt;
 shipAccel={x:dvx,y:dvy};
 s.gLat=Math.abs(dvx)/G;s.gVert=Math.abs(dvy)/G;
 const totalG=Math.hypot(dvx,dvy)/G;
 s.peakG=Math.max(s.peakG,totalG);

 if(totalG>SAFE_G){
  const excess=totalG-SAFE_G,stress=excess*(totalG>HARD_G?9:3.2)*dt;
  s.crew=Math.max(0,s.crew-stress);
  s.happiness=Math.max(0,s.happiness-stress*1.25);
 }else if(totalG<1.5){
  s.crew=Math.min(100,s.crew+.7*dt);
  s.happiness=Math.min(100,s.happiness+1.1*dt);
 }

 if(s.x<20){s.x=20;s.vx=Math.abs(s.vx)*.4;s.hull=Math.max(0,s.hull-2*hullResistance());s.happiness=Math.max(0,s.happiness-3);}
 if(s.x>W-20){s.x=W-20;s.vx=-Math.abs(s.vx)*.4;s.hull=Math.max(0,s.hull-2*hullResistance());s.happiness=Math.max(0,s.happiness-3);}
 if(s.y<20){s.y=20;s.vy=Math.max(s.vy,0);}
 save.fuel=s.fuel;save.hull=s.hull;resourceSaveElapsed+=dt;
 if(resourceSaveElapsed>=1){persist();resourceSaveElapsed=0;}

 if(s.failureReason||s.hull<=0||s.crew<=0){
  state='over';result=calculatePayout(false);persist();showResult(false);return;
 }
 ApproachWarnings.update(approachState,s,Math.max(0,clearanceAt(s).gap/SCALE),dt);
 const pad=terrain.pad;
 const onPad=s.gear.progress>=.999&&s.gear.legs.every(leg=>{
  const foot=gearFoot(s,leg);
  return leg.touching&&foot.x>pad.x&&foot.x<pad.x+pad.w&&Math.abs(terrainYAt(foot.x)-pad.y)<1;
 });
 const stable=onPad&&!s.thrusting&&Math.abs(s.vy)<=SAFE_VS&&Math.abs(s.vx)<=SAFE_HS&&Math.abs(s.angle)<.35&&Math.abs(s.angVel)<.3;
 s.settleTime=stable?s.settleTime+dt:0;
 if(s.settleTime>=LANDING.settleTime){
  state='won';result=calculatePayout(true);
  if(!save.completed.includes(m.id))save.completed.push(m.id);
  const payment=FuelEconomy.settle(save,result.money);
  result.debtRepaid=payment.repaid;result.netMoney=payment.net;
  persist();showResult(true);
 }
}

function calculatePayout(success){
 const s=ship;
 const fuelBonus=Math.round((s.fuel/s.fuelMax)*FUEL_BONUS_MAX);
 const happinessBonus=Math.round(s.happiness*HAPPINESS_RATE);
 const speedBonus=Math.min(SPEED_BONUS_MAX,Math.max(0,Math.round((TARGET_TIME-missionTime)*SPEED_BONUS_RATE)));
 const money=success?selectedMission.fare+fuelBonus+happinessBonus+speedBonus:0;
 return {money,fuelBonus,happinessBonus,speedBonus,debtRepaid:0,netMoney:money};
}

function draw(){
 ctx.clearRect(0,0,W,H);
 const sky=ctx.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,'#040718');sky.addColorStop(.65,'#0b1630');sky.addColorStop(1,'#16233d');
 ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 for(const st of stars){ctx.globalAlpha=st.a;ctx.fillStyle='#cfe3ff';ctx.beginPath();ctx.arc(st.x,st.y,st.r,0,7);ctx.fill();}
 ctx.globalAlpha=1;
 ctx.beginPath();ctx.moveTo(-100,H+10);
 for(const p of terrain.pts)ctx.lineTo(p.x,p.y);
 ctx.lineTo(W+100,H+10);ctx.closePath();
 ctx.fillStyle='#101a2e';ctx.fill();ctx.strokeStyle='#3b5480';ctx.lineWidth=2;ctx.stroke();
 const p=terrain.pad;
 ctx.fillStyle='#1d2c4a';ctx.fillRect(p.x,p.y,p.w,8);
 ctx.strokeStyle='#7fd1ff';ctx.lineWidth=2;ctx.strokeRect(p.x,p.y,p.w,8);
 for(let i=0;i<5;i++){
  const blink=Math.sin(t*4+i)*.5+.5;
  ctx.fillStyle=`rgba(120,220,255,${.25+blink*.65})`;
  ctx.fillRect(p.x+8+i*((p.w-16)/4)-2,p.y-4,5,5);
 }
 drawDust();
 if(showTrajectory&&state==='play')drawTrajectory();
 drawShip();
 if(showFlightInstruments&&state==='play')drawShipReadouts();
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
}

function drawShipReadouts(){
 const s=ship,margin=10,bw=Math.min(180,Math.max(1,W-20)),bh=108;
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(v,Math.max(lo,hi)));
 const obstacles=[document.querySelector('#hud .panel'),envEl].filter(el=>el&&!el.closest('.hidden')).map(el=>el.getBoundingClientRect());
 const candidates=[
  {x:s.x+48,y:s.y-132},{x:s.x-48-bw,y:s.y-132},
  {x:s.x+48,y:s.y+34},{x:s.x-48-bw,y:s.y+34},
  {x:s.x-bw/2,y:s.y+48},{x:s.x-bw/2,y:s.y-48-bh}
 ].map(p=>({x:clamp(p.x,margin,W-bw-margin),y:clamp(p.y,margin,H-bh-margin)}));
 const overlap=(p,r)=>Math.max(0,Math.min(p.x+bw,r.right+6)-Math.max(p.x,r.left-6))*Math.max(0,Math.min(p.y+bh,r.bottom+6)-Math.max(p.y,r.top-6));
 const shipRect={left:s.x-25,right:s.x+25,top:s.y-25,bottom:s.y+30};
 const score=p=>obstacles.reduce((sum,r)=>sum+overlap(p,r),0)+overlap(p,shipRect)*2;
 const box=candidates.reduce((best,p)=>score(p)<score(best)?p:best);
 const x=box.x,y=box.y,ex=clamp(s.x,x,x+bw),ey=clamp(s.y,y,y+bh);
 const dx=ex-s.x,dy=ey-s.y,len=Math.hypot(dx,dy)||1;
 ctx.save();ctx.globalAlpha=1;ctx.lineWidth=1;
 ctx.strokeStyle='rgba(159,180,216,.8)';
 ctx.beginPath();ctx.moveTo(s.x+dx/len*25,s.y+dy/len*25);
 ctx.lineTo(ex-dx/len*12,ey-dy/len*12);ctx.lineTo(ex,ey);ctx.stroke();
 ctx.fillStyle='rgba(8,14,28,.82)';ctx.fillRect(x,y,bw,bh);ctx.strokeRect(x,y,bw,bh);
 ctx.font='11px ui-monospace,monospace';ctx.textBaseline='middle';
 const gearStatus=ApproachWarnings.gearStatus(s.gear);
 const rows=[
  ['SPEED',Math.hypot(s.vx,s.vy).toFixed(1)+' m/s','#dfe7ff'],
  ['VERT',s.vy.toFixed(1)+' m/s','#59c2ff'],
  ['HORIZ',s.vx.toFixed(1)+' m/s','#ffa657'],
  ['G-LOAD',Math.hypot(s.gVert,s.gLat).toFixed(1)+' g','#7ee787'],
  ['GEAR [G]',gearStatus,gearStatus==='DOWN'?'#7ee787':'#ffd166']
 ];
 rows.forEach(([label,value,color],i)=>{
  ctx.fillStyle=color;ctx.textAlign='left';ctx.fillText(label,x+10,y+14+i*20);
  ctx.textAlign='right';ctx.fillText(value,x+bw-10,y+14+i*20);
 });
 ctx.restore();
}

function drawTrajectory(){
 const dt=1/60,steps=480,m=selectedMission;
 let x=ship.x,y=ship.y,vx=ship.vx,vy=ship.vy,impact=null;
 const points=[{x,y}];
 const projected=(px,py)=>({...ship,x:px,y:py});
 for(let i=1;i<=steps;i++){
  const oldX=x,oldY=y,drag=m.drag||0;
  const ax=(m.wind?Math.sin((windPhase+i*dt)*.7)*m.wind*.08:0)-vx*drag;
  const ay=m.gravity-vy*drag;
  vx+=ax*dt;vy+=ay*dt;x+=vx*SCALE*dt;y+=vy*SCALE*dt;
  if(x<20||x>W-20||y<20){points.push({x,y});break;}
  if(clearanceAt(projected(x,y),false).gap<=0){
   let lo=0,hi=1;
   for(let j=0;j<10;j++){
    const f=(lo+hi)/2,px=oldX+(x-oldX)*f,py=oldY+(y-oldY)*f;
    if(clearanceAt(projected(px,py),false).gap<=0)hi=f;else lo=f;
   }
   x=oldX+(x-oldX)*hi;y=oldY+(y-oldY)*hi;
   points.push({x,y});const contact=clearanceAt(projected(x,y),false);
   impact={x:contact.x,y:terrainYAt(contact.x)};break;
  }
  if(i%4===0)points.push({x,y});
 }
 if(points.length<2)return;
 ctx.save();ctx.globalAlpha=.6;ctx.strokeStyle='#7fd1ff';ctx.lineWidth=1;ctx.setLineDash([5,5]);
 ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
 ctx.stroke();ctx.setLineDash([]);
 if(impact){
  ctx.strokeStyle='#ffd166';ctx.beginPath();
  ctx.moveTo(impact.x-5,impact.y-5);ctx.lineTo(impact.x+5,impact.y+5);
  ctx.moveTo(impact.x+5,impact.y-5);ctx.lineTo(impact.x-5,impact.y+5);ctx.stroke();
 }
 ctx.restore();
}

function drawLandingGear(s){
 const p=s.gear.progress;
 if(p<=.001)return;
 ctx.lineWidth=2;
 for(const leg of s.gear.legs){
  const x=leg.side*(11+8*p),y=8+20*p-leg.compression;
  ctx.strokeStyle='#9fb4d8';ctx.beginPath();
  ctx.moveTo(leg.side*9,8);ctx.lineTo(x,y);ctx.stroke();
  ctx.strokeStyle=leg.touching?'#7ee787':'#dfe7ff';
  ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.stroke();
  if(p>.5){
   ctx.strokeStyle='#59c2ff';ctx.lineWidth=3;ctx.beginPath();
   ctx.moveTo(leg.side*9+(x-leg.side*9)*.35,8+(y-8)*.35);
   ctx.lineTo(leg.side*9+(x-leg.side*9)*.7,8+(y-8)*.7);ctx.stroke();ctx.lineWidth=2;
  }
 }
}

function drawLandingLights(s){
 const altitude=clearanceAt(s).gap/SCALE;
 const fade=Math.max(0,1-altitude/35);
 if(fade<=.01)return;
 const intensity=fade*fade;
 for(const lx of [-6,6]){
  const lamp=worldPoint(s,lx,10);
  const groundY=terrainYAt(lamp.x);
  const distance=Math.max(0,groundY-lamp.y);
  const length=Math.min(280,distance);
  if(distance<8)continue;
  const endY=lamp.y+distance;
  const gradient=ctx.createLinearGradient(lamp.x,lamp.y,lamp.x,endY);
  gradient.addColorStop(0,`rgba(255,255,255,${.22*fade})`);
  gradient.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=gradient;
  ctx.beginPath();
  ctx.moveTo(lamp.x-2,lamp.y);
  ctx.lineTo(lamp.x+2,lamp.y);
  ctx.lineTo(lamp.x+7+18*fade,endY);
  ctx.lineTo(lamp.x-7-18*fade,endY);
  ctx.closePath();
  ctx.fill();
 }
}

function drawShip(){
 const s=ship;
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
 ThrusterPhysics.draw(ctx,s.jets||[]);
 drawLandingGear(s);
 ctx.fillStyle='#dfe7ff';ctx.beginPath();ctx.moveTo(0,-20);ctx.quadraticCurveTo(16,-4,14,12);ctx.lineTo(-14,12);ctx.quadraticCurveTo(-16,-4,0,-20);ctx.fill();
 ctx.fillStyle='#7fa8ff';ctx.fillRect(-7,-8,14,7);
 const strobePhase=Math.floor(t*2.5)%2;
 ctx.globalAlpha=strobePhase===0?1:.22;
 ctx.fillStyle='#ff5252';ctx.beginPath();ctx.arc(-15,-3,2.2,0,7);ctx.fill();
 ctx.globalAlpha=strobePhase===1?1:.22;
 ctx.fillStyle='#4ade80';ctx.beginPath();ctx.arc(15,-3,2.2,0,7);ctx.fill();
 ctx.globalAlpha=Math.floor(t*1.5)%3===0?1:.1;
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(0,-20,1.8,0,7);ctx.fill();
 ctx.globalAlpha=1;
 ctx.restore();
 drawLandingLights(s);
}

function showScreen(html){
 ApproachWarnings.render(approachAlertEl,approachState,false);
 document.getElementById('screenCard').innerHTML=html;
 screenEl.style.display='flex';
 screenEl.classList.remove('hidden');
 document.getElementById('hud').classList.add('hidden');
 envEl.classList.add('hidden');
}

function showTitle(){
 state='title';
 const completed=save.completed.length;
 showScreen(`
  <h1>ORBITAL EXCURSIONS</h1>
  <p>You are Captain of a near-future tourism shuttle.</p>
  <p>Credits: <span class="credits">${FuelEconomy.money(save.credits)}</span> &nbsp;|&nbsp; Missions completed: ${completed}/${MISSIONS.length}</p>
  <p class="small">Fuel ${save.fuel.toFixed(2)} / ${maxFuel()} units · Hull ${save.hull.toFixed(2)} / ${maxHull()} · Debt ${FuelEconomy.money(save.debt)} cr</p>
  <div class="row" style="margin-top:18px">
   <button type="button" onclick="showMissions()">FLY</button>
   <button type="button" onclick="showHangar()">HANGAR</button>
   <button type="button" onclick="resetSave()" class="small">Reset progress</button>
  </div>
  <h2>Flight controls</h2>
  <p><kbd>W</kbd>/<kbd>&uarr;</kbd> main engine &nbsp; <kbd>A</kbd>/<kbd>D</kbd> RCS &nbsp; <kbd>Q</kbd>/<kbd>E</kbd> rotate</p>
  <p><kbd>G</kbd> landing gear &nbsp; <kbd>H</kbd> flight callout &nbsp; <kbd>T</kbd> coasting trajectory (engines off)</p>
  <p>Missions start with gear up. Deploy with G before touchdown. Approach callouts are visual only, in metres.</p>
  <p>Buy fuel and repairs manually in the hangar. Fuel and hull condition carry across missions and retries.</p>
  <p>Deploy both feet and let the suspension settle on the pad to complete a landing.</p>
  <p>Land gently on the pad, preserve fuel, protect passengers, and arrive quickly.</p>
 `);
}

function showMissions(){
 state='missions';
 const fueled=save.fuel>1e-6,operable=save.hull>1e-6;
 const cards=MISSIONS.map((m,i)=>{
  const unlocked=i===0||save.completed.includes(MISSIONS[i-1].id);
  const done=save.completed.includes(m.id);
  return `<div class="mission">
   <h3>${m.name} ${done?'<span class="good">— COMPLETED</span>':''}</h3>
   <p>${m.description}</p>
   <p class="small">Gravity ${m.gravity.toFixed(1)} m/s² &nbsp;|&nbsp; Pad ${m.padWidth}px &nbsp;|&nbsp; Wind ${m.wind} &nbsp;|&nbsp; Fare ${m.fare} cr</p>
   <button type="button" ${unlocked&&fueled&&operable?'':"disabled"} onclick="startMissionById('${m.id}')">${!unlocked?'LOCKED':!operable?'REPAIR IN HANGAR':fueled?'LAUNCH':'REFUEL IN HANGAR'}</button>
  </div>`;
 }).join('');
 showScreen(`<h1>MISSION SELECT</h1><p>Credits: <span class="credits">${FuelEconomy.money(save.credits)}</span> · Fuel ${save.fuel.toFixed(2)} / ${maxFuel()} · Hull ${save.hull.toFixed(2)} / ${maxHull()}</p>${cards}<div class="row"><button type="button" onclick="showHangar()">HANGAR / SERVICE</button><button type="button" onclick="showTitle()">BACK</button></div>`);
}

function showHangar(){
 state='hangar';
 const cards=Object.entries(UPGRADES).map(([id,u])=>{
  const level=save.upgrades[id];
  const cost=level<3?u.levels[level+1]:null;
  const affordable=cost!==null&&save.credits>=cost;
  return `<div class="upgrade">
   <h3>${u.name} — Level ${level}/3</h3>
   <p>${u.desc}</p>
   <p class="small">Current: ${u.effect(level)}${level<3?` &nbsp;→&nbsp; Next: ${u.effect(level+1)}`:''}</p>
   <button type="button" ${cost===null?'disabled':affordable?'':'disabled'} onclick="buyUpgrade('${id}')">${cost===null?'MAXED':`UPGRADE — ${cost} cr`}</button>
  </div>`;
 }).join('');
 showScreen(`<h1>HANGAR</h1><p>Available credits: <span class="credits">${FuelEconomy.money(save.credits)}</span></p>${RepairShop.panel(save)}${FuelEconomy.panel(save)}<h2>Upgrades</h2>${cards}<div class="row"><button type="button" onclick="showMissions()">MISSIONS</button><button type="button" onclick="showTitle()">BACK</button></div>`);
}

function repairHull(amount){
 if(state!=='hangar')return;
 if(RepairShop.repair(save,amount))persist();
 showHangar();
}
function borrowEmergencyRepair(){
 if(state!=='hangar')return;
 if(RepairShop.borrow(save))persist();
 showHangar();
}
function buyFuel(amount){
 if(state!=='hangar')return;
 if(FuelEconomy.purchase(save,amount))persist();
 showHangar();
}
function borrowEmergencyFuel(){
 if(state!=='hangar')return;
 if(FuelEconomy.borrow(save))persist();
 showHangar();
}
function startMissionById(id){startMission(MISSIONS.find(m=>m.id===id));}
function buyUpgrade(id){
 const u=UPGRADES[id],level=save.upgrades[id];
 if(level>=3)return;
 const cost=u.levels[level+1];
 if(save.credits<cost)return;
 save.credits-=cost;save.upgrades[id]++;persist();showHangar();
}
function resetSave(){
 save=FuelEconomy.fresh();persist();showTitle();
}

function showResult(success){
 const m=selectedMission;
 if(success){
  showScreen(`<h1>MISSION COMPLETE</h1><p>${m.name} delivered safely.</p>
   <p>Mission time: ${missionTime.toFixed(1)} s</p>
   <p>Hull: ${Math.round(ship.hull/ship.hullMax*100)}% &nbsp; Health: ${Math.round(ship.crew)}% &nbsp; Happiness: ${Math.round(ship.happiness)}%</p>
   <p>Mission fare: ${m.fare} cr<br>Fuel bonus: ${result.fuelBonus} cr<br>Happiness bonus: ${result.happinessBonus} cr<br>Speed bonus: ${result.speedBonus} cr</p>
   <p>Gross earned: ${FuelEconomy.money(result.money)} cr<br>Debt repaid: ${FuelEconomy.money(result.debtRepaid)} cr<br><b>Added to balance: ${FuelEconomy.money(result.netMoney)} cr</b></p>
   <p>Fuel remaining: ${save.fuel.toFixed(2)} / ${maxFuel()} units · Hull: ${save.hull.toFixed(2)} / ${maxHull()} · Debt remaining: ${FuelEconomy.money(save.debt)} cr</p>
   <p>Peak G: ${ship.peakG.toFixed(1)} G</p>
   <div class="row"><button type="button" onclick="showMissions()">MISSIONS</button><button type="button" onclick="showHangar()">HANGAR / SERVICE</button><button type="button" onclick="startMissionById('${m.id}')">FLY AGAIN</button></div>`);
 }else{
  showScreen(`<h1>MISSION FAILED</h1><p>${ship.hull<=0?'The shuttle was destroyed.':ship.crew<=0?'Passengers did not survive the flight.':ship.failureReason||'You missed the landing zone.'}</p><p>No payment was issued. Burned fuel and hull damage are retained.</p><p>Fuel remaining: ${save.fuel.toFixed(2)} / ${maxFuel()} units · Hull: ${save.hull.toFixed(2)} / ${maxHull()} · Debt: ${FuelEconomy.money(save.debt)} cr</p><div class="row"><button type="button" onclick="startMissionById('${m.id}')">RETRY</button><button type="button" onclick="showMissions()">MISSIONS</button><button type="button" onclick="showHangar()">HANGAR / SERVICE</button></div>`);
 }
}

function loop(now){
 const dt=Math.min(.033,(now-lastT)/1000);lastT=now;
 if(state==='play')update(dt);
 if(ship&&(state==='play'||state==='won'||state==='over'))draw();
 requestAnimationFrame(loop);
}

terrain=makeTerrain(MISSIONS[0]);
stars=Array.from({length:170},()=>({x:Math.random()*W,y:Math.random()*H*.72,r:Math.random()*1.5+.3,a:Math.random()*.7+.2}));
ship={x:120,y:120,vx:0,vy:0,angle:0,angVel:0,fuel:save.fuel,fuelMax:maxFuel(),hull:save.hull,hullMax:maxHull(),crew:100,happiness:100,thrusting:false,rcsL:false,rcsR:false,gVert:0,gLat:0,prevVx:0,prevVy:0,peakG:0,gear:createLandingGear(),settleTime:0,failureReason:''};
showTitle();
requestAnimationFrame(loop);
