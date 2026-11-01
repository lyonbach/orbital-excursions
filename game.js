const cv=document.getElementById('game'),ctx=cv.getContext('2d');
let W=0,H=0;
function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
addEventListener('resize',resize);resize();

const G=9.81, SCALE=8;
const SAFE_VS=2.2, SAFE_HS=1.6, SAFE_G=3.5, HARD_G=6.5;
const BASE_FARE=500, FUEL_BONUS_MAX=500, HAPPINESS_RATE=5;
const TARGET_TIME=90, SPEED_BONUS_RATE=10, SPEED_BONUS_MAX=900;
const SAVE_KEY='orbitalExcursionsSave_v1';

const MISSIONS=[
 {id:'lunar',name:'Lunar Shuttle Run',fare:500,gravity:9.81,padWidth:150,roughness:1,wind:0,drag:0,startVx:18,startFuel:1,description:'A calm training run to the illuminated lunar pad.',unlockAt:0,
  environment:{title:'The Moon',body:'Earth’s only natural satellite',diameter:'3,474 km',gravity:'1.62 m/s² (16.6% of Earth)',atmosphere:'Effectively a vacuum; only a highly tenuous exosphere.',temperature:'Approximately 120 °C in sunlight to −171 °C in shadow.',hazards:'No atmospheric braking, extreme thermal swings, and abrasive regolith.',source:'Moon',url:'https://en.wikipedia.org/wiki/Moon'}},
 {id:'mars',name:'Mars Express',fare:900,gravity:5.5,padWidth:120,roughness:1.25,wind:0,drag:.015,startVx:26,startFuel:.9,description:'Low gravity, but a faster approach and a tighter landing zone.',unlockAt:1,
  environment:{title:'Mars',body:'Fourth planet from the Sun',diameter:'6,779 km',gravity:'3.72 m/s² (38% of Earth)',atmosphere:'Very thin, primarily carbon dioxide; surface pressure is a tiny fraction of Earth’s.',temperature:'Approximately −153 °C to 20 °C.',hazards:'Thin-air aerobraking, dust, low pressure, and elevated radiation exposure.',source:'Mars',url:'https://en.wikipedia.org/wiki/Mars'}},
 {id:'titan',name:'Titan Charter',fare:1400,gravity:2.8,padWidth:105,roughness:1.5,wind:7,drag:.09,startVx:30,startFuel:.85,description:'Thick atmosphere, crosswinds, and a narrow pad.',unlockAt:2,
  environment:{title:'Titan',body:'Largest moon of Saturn',diameter:'5,149 km',gravity:'1.352 m/s² (13.8% of Earth)',atmosphere:'Dense nitrogen atmosphere with methane; surface pressure exceeds Earth’s.',temperature:'About −179.5 °C.',hazards:'Methane weather, hydrocarbon lakes, dense haze, and strong atmospheric drag.',source:'Titan (moon)',url:'https://en.wikipedia.org/wiki/Titan_(moon)'}},
 {id:'io',name:'Io Emergency',fare:2200,gravity:12.5,padWidth:95,roughness:1.8,wind:11,drag:.002,startVx:34,startFuel:.8,description:'High gravity, radiation gusts, and almost no margin for error.',unlockAt:3,
  environment:{title:'Io',body:'Innermost Galilean moon of Jupiter',diameter:'About 3,642 km',gravity:'1.796 m/s² (18.3% of Earth)',atmosphere:'Extremely thin, dominated by sulfur dioxide.',temperature:'Cold surface, with intense local heating around volcanic features.',hazards:'Extreme volcanism, sulfur compounds, radiation and tidal gusts, with negligible aerodynamic drag.',source:'Io (moon)',url:'https://en.wikipedia.org/wiki/Io_(moon)'}}
];

const UPGRADES={
 engine:{name:'Main Engine',levels:[0,400,900,1600],effect:l=>`Thrust ${26+3*l}`,desc:'Improves climb and braking authority.'},
 fuel:{name:'Fuel Capacity',levels:[0,350,800,1500],effect:l=>`${100+20*l} units`,desc:'Carry more propellant for long approaches.'},
 hull:{name:'Hull Plating',levels:[0,450,1000,1800],effect:l=>`${100+15*l} hull, ${Math.round(8*l)}% impact resistance`,desc:'Absorbs more landing and collision damage.'},
 rcs:{name:'RCS Thrusters',levels:[0,300,700,1300],effect:l=>`Lateral thrust ${6+1.5*l}`,desc:'Improves sideways correction without rotating.'}
};

let save=loadSave();
function loadSave(){
 try{
  const raw=localStorage.getItem(SAVE_KEY);
  if(raw){const s=JSON.parse(raw);return {credits:s.credits||0,upgrades:Object.assign({engine:0,fuel:0,hull:0,rcs:0},s.upgrades||{}),completed:s.completed||[]};}
 }catch(e){}
 return {credits:0,upgrades:{engine:0,fuel:0,hull:0,rcs:0},completed:[]};
}
function persist(){localStorage.setItem(SAVE_KEY,JSON.stringify(save));}

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
 }
 if(e.code==='Escape'&&(state==='missions'||state==='hangar'))showTitle();
});
addEventListener('keyup',e=>keys[e.code]=false);

let ship,terrain,stars,state='title',t=0,missionTime=0,lastT=performance.now(),result=null,selectedMission=MISSIONS[0],windPhase=0,shipAccel={x:0,y:0};
const screenEl=document.getElementById('screen'),envEl=document.getElementById('env');

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

function maxFuel(){return 100+20*save.upgrades.fuel;}
function maxHull(){return 100+15*save.upgrades.hull;}
function enginePower(){return 26+3*save.upgrades.engine;}
function rcsPower(){return 6+1.5*save.upgrades.rcs;}
function hullResistance(){return 1-.08*save.upgrades.hull;}

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
 selectedMission=m;
 terrain=makeTerrain(m);
 stars=Array.from({length:170},()=>({x:Math.random()*W,y:Math.random()*H*.72,r:Math.random()*1.5+.3,a:Math.random()*.7+.2}));
 const fuelMax=maxFuel();
 ship={x:120,y:120,vx:m.startVx,vy:0,angle:0,angVel:0,fuel:fuelMax*m.startFuel,fuelMax,hull:maxHull(),hullMax:maxHull(),crew:100,happiness:100,thrusting:false,rcsL:false,rcsR:false,gVert:0,gLat:0,prevVx:0,prevVy:0,peakG:0};
 missionTime=0;result=null;windPhase=0;shipAccel={x:0,y:0};
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
 t+=dt;missionTime+=dt;windPhase+=dt;
 const s=ship,m=selectedMission;
 s.prevVx=s.vx;s.prevVy=s.vy;

 if(keys.KeyQ)s.angVel-=2.4*dt;
 if(keys.KeyE)s.angVel+=2.4*dt;
 s.angVel*=.94;s.angle+=s.angVel*dt;

 s.thrusting=(keys.KeyW||keys.ArrowUp)&&s.fuel>0;
 s.rcsL=(keys.KeyA||keys.ArrowLeft)&&s.fuel>0;
 s.rcsR=(keys.KeyD||keys.ArrowRight)&&s.fuel>0;

 let ax=0,ay=m.gravity;
 if(m.wind){ax+=Math.sin(windPhase*.7)*m.wind*.08;}
 if(s.thrusting){
  const power=enginePower()*(.55+.45*s.hull/s.hullMax);
  ax+=Math.sin(s.angle)*power;
  ay-=Math.cos(s.angle)*power;
  s.fuel=Math.max(0,s.fuel-7.5*dt);
 }
 if(s.rcsL){ax-=rcsPower();s.fuel=Math.max(0,s.fuel-1.8*dt);}
 if(s.rcsR){ax+=rcsPower();s.fuel=Math.max(0,s.fuel-1.8*dt);}

 const drag=m.drag||0;
 ax-=s.vx*drag;
 ay-=s.vy*drag;
 shipAccel={x:ax,y:ay};

 s.vx+=ax*dt;s.vy+=ay*dt;
 s.x+=s.vx*SCALE*dt;s.y+=s.vy*SCALE*dt;

 const dvx=(s.vx-s.prevVx)/dt,dvy=(s.vy-s.prevVy)/dt;
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

 const gy=terrainYAt(s.x);
 if(s.y+18>=gy){
  s.y=gy-18;
  const vs=Math.abs(s.vy),hs=Math.abs(s.vx);
  const onPad=s.x>terrain.pad.x&&s.x<terrain.pad.x+terrain.pad.w;
  const impact=(Math.max(0,vs-SAFE_VS)*8+Math.max(0,hs-SAFE_HS)*5)*hullResistance();
  s.hull=Math.max(0,s.hull-impact);
  s.crew=Math.max(0,s.crew-impact*.8);
  s.happiness=Math.max(0,s.happiness-impact*1.5);
  s.vx*=.15;s.vy=0;s.angVel*=.2;

  if(s.hull<=0||s.crew<=0||(!onPad&&vs>SAFE_VS*2.2)){
   state='over';result=calculatePayout(false);showResult(false);
  }else if(onPad&&vs<=SAFE_VS&&hs<=SAFE_HS&&Math.abs(s.angle)<.35){
   state='won';result=calculatePayout(true);
   if(!save.completed.includes(m.id)){save.completed.push(m.id);}
   save.credits+=result.money;persist();showResult(true);
  }
 }
}

function calculatePayout(success){
 const s=ship;
 const fuelBonus=Math.round((s.fuel/s.fuelMax)*FUEL_BONUS_MAX);
 const happinessBonus=Math.round(s.happiness*HAPPINESS_RATE);
 const speedBonus=Math.min(SPEED_BONUS_MAX,Math.max(0,Math.round((TARGET_TIME-missionTime)*SPEED_BONUS_RATE)));
 const money=success?selectedMission.fare+fuelBonus+happinessBonus+speedBonus:0;
 return {money,fuelBonus,happinessBonus,speedBonus};
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
 if(showTrajectory&&state==='play')drawTrajectory();
 drawShip();
 if(showFlightInstruments&&state==='play')drawShipReadouts();
 document.getElementById('time').textContent=missionTime.toFixed(1);
 document.getElementById('alt').textContent=Math.max(0,Math.round((terrainYAt(ship.x)-ship.y-18)/SCALE));
 document.getElementById('fuelText').textContent=`${Math.round(ship.fuel)} / ${ship.fuelMax}`;
 document.getElementById('fuelFill').style.width=(ship.fuel/ship.fuelMax*100)+'%';
 document.getElementById('hullFill').style.width=(ship.hull/ship.hullMax*100)+'%';
 document.getElementById('crewFill').style.width=ship.crew+'%';
 document.getElementById('happyFill').style.width=ship.happiness+'%';
}

function drawShipReadouts(){
 const s=ship,margin=10,bw=Math.min(180,Math.max(1,W-20)),bh=88;
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(v,Math.max(lo,hi)));
 const obstacles=[document.querySelector('#hud .panel'),envEl].filter(el=>el&&!el.closest('.hidden')).map(el=>el.getBoundingClientRect());
 const candidates=[
  {x:s.x+48,y:s.y-112},{x:s.x-48-bw,y:s.y-112},
  {x:s.x+48,y:s.y+34},{x:s.x-48-bw,y:s.y+34},
  {x:s.x-bw/2,y:s.y+48},{x:s.x-bw/2,y:s.y-48-bh}
 ].map(p=>({x:clamp(p.x,margin,W-bw-margin),y:clamp(p.y,margin,H-bh-margin)}));
 const overlap=(p,r)=>Math.max(0,Math.min(p.x+bw,r.right+6)-Math.max(p.x,r.left-6))*Math.max(0,Math.min(p.y+bh,r.bottom+6)-Math.max(p.y,r.top-6));
 const shipRect={left:s.x-25,right:s.x+25,top:s.y-25,bottom:s.y+25};
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
 const rows=[
  ['SPEED',Math.hypot(s.vx,s.vy).toFixed(1)+' m/s','#dfe7ff'],
  ['VERT',s.vy.toFixed(1)+' m/s','#59c2ff'],
  ['HORIZ',s.vx.toFixed(1)+' m/s','#ffa657'],
  ['G-LOAD',Math.hypot(s.gVert,s.gLat).toFixed(1)+' g','#7ee787']
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
 for(let i=1;i<=steps;i++){
  const oldX=x,oldY=y,drag=m.drag||0;
  const ax=(m.wind?Math.sin((windPhase+i*dt)*.7)*m.wind*.08:0)-vx*drag;
  const ay=m.gravity-vy*drag;
  vx+=ax*dt;vy+=ay*dt;x+=vx*SCALE*dt;y+=vy*SCALE*dt;
  if(x<20||x>W-20||y<20){points.push({x,y});break;}
  if(y+18>=terrainYAt(x)){
   let lo=0,hi=1;
   for(let j=0;j<10;j++){
    const f=(lo+hi)/2,px=oldX+(x-oldX)*f,py=oldY+(y-oldY)*f;
    if(py+18>=terrainYAt(px))hi=f;else lo=f;
   }
   x=oldX+(x-oldX)*hi;y=oldY+(y-oldY)*hi;
   points.push({x,y});impact={x,y:y+18};break;
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

function drawShip(){
 const s=ship;
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.angle);
 if(s.thrusting&&s.fuel>0){
  const f=18+Math.random()*14;
  ctx.fillStyle='rgba(255,170,70,.9)';ctx.beginPath();ctx.moveTo(-6,16);ctx.lineTo(6,16);ctx.lineTo(0,16+f);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,240,180,.9)';ctx.beginPath();ctx.moveTo(-3,16);ctx.lineTo(3,16);ctx.lineTo(0,16+f*.55);ctx.closePath();ctx.fill();
 }
 ctx.fillStyle='#dfe7ff';ctx.beginPath();ctx.moveTo(0,-20);ctx.quadraticCurveTo(16,-4,14,12);ctx.lineTo(-14,12);ctx.quadraticCurveTo(-16,-4,0,-20);ctx.fill();
 ctx.fillStyle='#7fa8ff';ctx.fillRect(-7,-8,14,7);
 ctx.strokeStyle='#9fb4d8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,11);ctx.lineTo(-15,19);ctx.moveTo(9,11);ctx.lineTo(15,19);ctx.stroke();
 if(s.rcsL&&s.fuel>0){ctx.fillStyle='rgba(120,220,255,.85)';ctx.fillRect(18,-2,8+Math.random()*6,3);}
 if(s.rcsR&&s.fuel>0){ctx.fillStyle='rgba(120,220,255,.85)';ctx.fillRect(-18,-2,-8-Math.random()*6,3);}
 ctx.restore();
}

function showScreen(html){
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
  <p>Credits: <span class="credits">${save.credits}</span> &nbsp;|&nbsp; Missions completed: ${completed}/${MISSIONS.length}</p>
  <div class="row" style="margin-top:18px">
   <button type="button" onclick="showMissions()">FLY</button>
   <button type="button" onclick="showHangar()">HANGAR</button>
   <button type="button" onclick="resetSave()" class="small">Reset progress</button>
  </div>
  <h2>Flight controls</h2>
  <p><kbd>W</kbd>/<kbd>&uarr;</kbd> main engine &nbsp; <kbd>A</kbd>/<kbd>D</kbd> RCS &nbsp; <kbd>Q</kbd>/<kbd>E</kbd> rotate</p>
  <p><kbd>H</kbd> flight callout &nbsp; <kbd>T</kbd> coasting trajectory (engines off)</p>
  <p>Land gently on the pad, preserve fuel, protect passengers, and arrive quickly.</p>
 `);
}

function showMissions(){
 state='missions';
 const cards=MISSIONS.map((m,i)=>{
  const unlocked=i===0||save.completed.includes(MISSIONS[i-1].id);
  const done=save.completed.includes(m.id);
  return `<div class="mission">
   <h3>${m.name} ${done?'<span class="good">— COMPLETED</span>':''}</h3>
   <p>${m.description}</p>
   <p class="small">Gravity ${m.gravity.toFixed(1)} m/s² &nbsp;|&nbsp; Pad ${m.padWidth}px &nbsp;|&nbsp; Wind ${m.wind} &nbsp;|&nbsp; Fare ${m.fare} cr</p>
   <button type="button" ${unlocked?'':"disabled"} onclick="startMissionById('${m.id}')">${unlocked?'LAUNCH':'LOCKED'}</button>
  </div>`;
 }).join('');
 showScreen(`<h1>MISSION SELECT</h1><p>Credits: <span class="credits">${save.credits}</span></p>${cards}<div class="row"><button type="button" onclick="showTitle()">BACK</button></div>`);
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
 showScreen(`<h1>HANGAR</h1><p>Credits: <span class="credits">${save.credits}</span></p>${cards}<div class="row"><button type="button" onclick="showTitle()">BACK</button></div>`);
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
 save={credits:0,upgrades:{engine:0,fuel:0,hull:0,rcs:0},completed:[]};persist();showTitle();
}

function showResult(success){
 const m=selectedMission;
 if(success){
  showScreen(`<h1>MISSION COMPLETE</h1><p>${m.name} delivered safely.</p>
   <p>Mission time: ${missionTime.toFixed(1)} s</p>
   <p>Hull: ${Math.round(ship.hull)}% &nbsp; Health: ${Math.round(ship.crew)}% &nbsp; Happiness: ${Math.round(ship.happiness)}%</p>
   <p>Mission fare: ${m.fare} cr<br>Fuel bonus: ${result.fuelBonus} cr<br>Happiness bonus: ${result.happinessBonus} cr<br>Speed bonus: ${result.speedBonus} cr</p>
   <p><b>Total earned: ${result.money} credits</b></p><p>Peak G: ${ship.peakG.toFixed(1)} G</p>
   <div class="row"><button type="button" onclick="showMissions()">MISSIONS</button><button type="button" onclick="showHangar()">HANGAR</button><button type="button" onclick="startMissionById('${m.id}')">FLY AGAIN</button></div>`);
 }else{
  showScreen(`<h1>MISSION FAILED</h1><p>${ship.hull<=0?'The shuttle was destroyed.':ship.crew<=0?'Passengers did not survive the flight.':'You missed the landing zone.'}</p><p>No payment was issued.</p><div class="row"><button type="button" onclick="startMissionById('${m.id}')">RETRY</button><button type="button" onclick="showMissions()">MISSIONS</button><button type="button" onclick="showHangar()">HANGAR</button></div>`);
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
ship={x:120,y:120,vx:0,vy:0,angle:0,angVel:0,fuel:100,fuelMax:100,hull:100,hullMax:100,crew:100,happiness:100,thrusting:false,rcsL:false,rcsR:false,gVert:0,gLat:0,prevVx:0,prevVy:0,peakG:0};
showTitle();
requestAnimationFrame(loop);
