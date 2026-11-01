const LevelDesign=(()=>{
 const roots=MISSIONS.slice();
 const destinations=roots.map((m,i)=>({id:m.id,name:m.environment.title,intro:m.id,previous:i?roots[i-1].id:null,environment:m.environment,gravity:m.gravity,drag:m.drag,wind:m.wind}));
 for(const m of roots)m.destination=m.id;
 const moon=roots[0];
 moon.description='An open approach to a broad pad on a low ridge. Brake early and deploy the gear before touchdown.';
 moon.startVx=14;
 moon.layout={padAt:.68,padY:.8,startX:.12,startY:.18,profile:[[0,.88],[.28,.87],[.48,.86],[1,.88]]};
 MISSIONS.push(
  {...moon,id:'lunar-crater',name:'Crater Approach',fare:700,padWidth:125,startVx:18,requires:'lunar',description:'Brake above the crater rim, then descend into the basin. Keep clear of the raised edges.',layout:{padAt:.65,padY:.87,startX:.12,startY:.16,profile:[[0,.85],[.3,.83],[.5,.67],[.96,.69],[1,.8]]}},
  {...moon,id:'lunar-ridge',name:'Ridge Terminal',fare:950,padWidth:100,startVx:20,requires:'lunar-crater',description:'A narrow elevated terminal. Remove sideways drift before committing to the final descent.',layout:{padAt:.7,padY:.67,startX:.12,startY:.14,profile:[[0,.9],[.3,.88],[.5,.91],[1,.9]]}},
  {...moon,id:'lunar-terrace',name:'Highland Terrace',fare:1100,padWidth:110,startVx:22,requires:'lunar-ridge',description:'Cross the highlands and settle on a raised terrace above the lower plains.',layout:{padAt:.62,padY:.68,startX:.12,startY:.16,profile:[[0,.88],[.25,.86],[.45,.8],[.58,.68],[.78,.72],[1,.86]]}},
  {...moon,id:'lunar-regolith',name:'Regolith Field',fare:1250,padWidth:95,startVx:24,requires:'lunar-terrace',description:'A small pad is hidden among uneven regolith mounds. Keep your descent tightly controlled.',layout:{padAt:.48,padY:.78,startX:.12,startY:.15,profile:[[0,.86],[.18,.82],[.32,.86],[.44,.78],[.56,.78],[.68,.85],[.84,.82],[1,.87]]}},
  {...moon,id:'lunar-shadow',name:'Shadow Crater',fare:1400,padWidth:90,startVx:25,requires:'lunar-regolith',description:'Descend into a deep shadowed crater. The floor is broad, but the rim leaves little margin for error.',layout:{padAt:.5,padY:.84,startX:.12,startY:.14,profile:[[0,.78],[.2,.74],[.36,.68],[.46,.84],[.54,.84],[.64,.68],[.8,.74],[1,.78]]}},
  {...moon,id:'lunar-peak',name:'Peak Relay',fare:1600,padWidth:85,startVx:26,requires:'lunar-shadow',description:'A communications relay sits atop a narrow lunar peak. Approach high, then drop precisely onto the summit.',layout:{padAt:.5,padY:.58,startX:.12,startY:.13,profile:[[0,.9],[.22,.86],[.38,.74],[.46,.58],[.54,.58],[.62,.74],[.78,.86],[1,.9]]}},
  {...moon,id:'lunar-canyon',name:'Canyon Ledge',fare:1800,padWidth:80,startVx:28,requires:'lunar-peak',description:'Thread the canyon and land on a narrow ledge between steep rock walls.',layout:{padAt:.5,padY:.55,startX:.12,startY:.13,profile:[[0,.7],[.18,.78],[.32,.88],[.42,.55],[.58,.55],[.68,.88],[.82,.78],[1,.7]]}},
  {...moon,id:'lunar-spire',name:'Terminal Spire',fare:2100,padWidth:75,startVx:30,requires:'lunar-canyon',description:'A tiny terminal crowns a lunar spire. There is almost no room to correct a late approach.',layout:{padAt:.5,padY:.5,startX:.12,startY:.12,profile:[[0,.88],[.2,.84],[.36,.72],[.44,.5],[.56,.5],[.64,.72],[.8,.84],[1,.88]]}},
  {...moon,id:'lunar-precision',name:'Mare Precision Dock',fare:2400,padWidth:70,startVx:32,requires:'lunar-spire',description:'A tiny isolated dock on the mare. Carry too much speed and there will be no room to correct.',layout:{padAt:.5,padY:.62,startX:.1,startY:.14,profile:[[0,.9],[.2,.88],[.34,.84],[.42,.74],[.58,.74],[.66,.84],[.82,.88],[1,.9]]}}
 );
 const mars=roots[1];
 MISSIONS.push(
  {...mars,id:'mars-dusty',name:'Dusty Plains',fare:1100,padWidth:110,startVx:28,wind:2,drag:.018,requires:'mars',description:'Your first Martian crosswind. Brake across the open plains and settle on the broad landing field.',layout:{padAt:.55,padY:.8,startX:.12,startY:.16,profile:[[0,.86],[.25,.84],[.45,.8],[.62,.8],[.82,.85],[1,.87]]}},
  {...mars,id:'mars-olympus',name:'Olympus Approach',fare:1300,padWidth:100,startVx:30,wind:3,drag:.02,requires:'mars-dusty',description:'Climb over the lower slopes and land on a high volcanic shelf.',layout:{padAt:.6,padY:.62,startX:.12,startY:.15,profile:[[0,.88],[.25,.85],[.42,.76],[.55,.62],[.75,.68],[1,.86]]}},
  {...mars,id:'mars-valles',name:'Valles Overlook',fare:1500,padWidth:95,startVx:31,wind:4,drag:.022,requires:'mars-olympus',description:'A research ledge overlooks the canyon system. Keep clear of the walls and manage your descent.',layout:{padAt:.45,padY:.55,startX:.12,startY:.14,profile:[[0,.75],[.18,.82],[.32,.9],[.4,.55],[.58,.55],[.68,.9],[.84,.8],[1,.74]]}},
  {...mars,id:'mars-dustdevil',name:'Dust Devil Field',fare:1700,padWidth:90,startVx:33,wind:6,drag:.024,requires:'mars-valles',description:'Shifting dust devils push the shuttle sideways. Correct early and stay ahead of the drift.',layout:{padAt:.5,padY:.76,startX:.12,startY:.14,profile:[[0,.85],[.18,.8],[.34,.85],[.46,.76],[.58,.76],[.7,.84],[.86,.8],[1,.86]]}},
  {...mars,id:'mars-polar',name:'Polar Ridge',fare:1900,padWidth:85,startVx:34,wind:6,drag:.026,requires:'mars-dustdevil',description:'A narrow polar ridge demands a fast, precise approach and a controlled final descent.',layout:{padAt:.5,padY:.6,startX:.12,startY:.13,profile:[[0,.88],[.22,.84],[.38,.72],[.46,.6],[.54,.6],[.62,.72],[.78,.84],[1,.88]]}},
  {...mars,id:'mars-crater-rim',name:'Crater Rim Station',fare:2150,padWidth:80,startVx:36,wind:7,drag:.028,requires:'mars-polar',description:'Land beside a steep crater wall. The rim gives you little room to correct a late approach.',layout:{padAt:.62,padY:.66,startX:.12,startY:.13,profile:[[0,.82],[.2,.78],[.38,.7],[.5,.66],[.72,.7],[.86,.78],[1,.82]]}},
  {...mars,id:'mars-canyon',name:'Canyon Crossing',fare:2400,padWidth:75,startVx:38,wind:8,drag:.03,requires:'mars-crater-rim',description:'Descend between canyon walls to a low landing floor. Preserve enough speed margin to arrest the crosswind.',layout:{padAt:.5,padY:.82,startX:.12,startY:.12,profile:[[0,.7],[.18,.76],[.32,.88],[.42,.82],[.58,.82],[.68,.88],[.82,.76],[1,.7]]}},
  {...mars,id:'mars-storm',name:'Storm Terminal',fare:2700,padWidth:70,startVx:40,wind:9,drag:.032,requires:'mars-canyon',description:'A dust storm batters a small elevated terminal. Correct the drift early and commit only when stable.',layout:{padAt:.5,padY:.58,startX:.12,startY:.12,profile:[[0,.86],[.2,.82],[.36,.7],[.44,.58],[.56,.58],[.64,.7],[.8,.82],[1,.86]]}},
  {...mars,id:'mars-summit',name:'Olympus Summit Dock',fare:3000,padWidth:65,startVx:42,wind:10,drag:.035,requires:'mars-storm',description:'A tiny research dock crowns Olympus Mons. Fight the thin-air crosswind and arrive with enough control to settle.',layout:{padAt:.5,padY:.48,startX:.1,startY:.12,profile:[[0,.9],[.2,.86],[.34,.74],[.43,.48],[.57,.48],[.66,.74],[.8,.86],[1,.9]]}}
 );
 const jupiterEnvironment={title:'Jupiter',body:'Fifth planet from the Sun',diameter:'139,820 km',gravity:'24.79 m/s² (2.53 times Earth)',atmosphere:'Mostly hydrogen and helium, with ammonia clouds and powerful storms.',temperature:'About -145 °C at the cloud tops.',hazards:'Extreme winds, radiation belts, violent storms, and no solid surface.',source:'Jupiter',url:'https://en.wikipedia.org/wiki/Jupiter'};
 const jupiterFloat={
  id:'jupiter-float',
  name:'Cloud Station Approach',
  fare:1150,
  gravity:8.2,
  padWidth:105,
  roughness:1,
  wind:8,
  drag:.11,
  startVx:24,
  startFuel:.85,
  unlockAt:4,
  destination:'jupiter',
  platform:{x:.58,y:.72,width:105,sway:{x:10,y:14,speed:.35}},
  description:'Ride the cloud deck through high winds, then settle onto the station’s slowly floating platform.',
  environment:jupiterEnvironment
 };
 const jupiterDrift={
  id:'jupiter-drift',
  name:'Drifting Terminal',
  fare:1450,
  gravity:8.2,
  padWidth:95,
  roughness:1,
  wind:12,
  drag:.12,
  startVx:28,
  startFuel:.8,
  unlockAt:5,
  requires:'jupiter-float',
  destination:'jupiter',
  platform:{x:.35,y:.68,width:95,sway:{x:8,y:10,speed:.5},drift:{x:190,y:8,speed:.22}},
  description:'Match the drifting terminal’s sideways motion before committing to a final descent.',
  environment:jupiterEnvironment
 };
 MISSIONS.push(jupiterFloat,jupiterDrift);
 roots.push(jupiterFloat);
 destinations.push({id:'jupiter',name:'Jupiter',intro:'jupiter-float',previous:'io',environment:jupiterEnvironment,gravity:jupiterFloat.gravity,drag:jupiterFloat.drag,wind:jupiterFloat.wind});
 const done=id=>save.completed.includes(id);
 function destinationOpen(d){return !d.previous||done(d.previous)||MISSIONS.some(m=>m.destination===d.id&&done(m.id));}
 function missionOpen(m){const d=destinations.find(d=>d.id===m.destination);return !!d&&destinationOpen(d)&&(!m.requires||done(m.requires)||done(m.id));}
 const resources=()=>`Credits: ${FuelEconomy.money(save.credits)} cr · Fuel ${save.fuel.toFixed(2)} / ${maxFuel()} · Hull ${save.hull.toFixed(2)} / ${maxHull()}`;
 function showDestinations(){
  state='missions';
  const cards=destinations.map(d=>{
   const missions=MISSIONS.filter(m=>m.destination===d.id),open=destinationOpen(d);
   return `<div class="mission"><h3>${d.name}</h3><p>${missions.filter(m=>done(m.id)).length} / ${missions.length} missions completed</p><p class="small">${open?'Choose an approach at this destination.':`Complete ${roots.find(m=>m.id===d.previous).name} to unlock.`}</p><button type="button" ${open?'':'disabled'} onclick="LevelDesign.showDestination('${d.id}')">${open?'SELECT DESTINATION':'LOCKED'}</button></div>`;
  }).join('');
  showScreen(`<h1>DESTINATIONS</h1><p>${resources()}</p>${cards}<div class="row"><button type="button" onclick="showHangar()">HANGAR / SERVICE</button><button type="button" onclick="showTitle()">BACK</button></div>`);
 }
 function showDestination(id){
  const d=destinations.find(d=>d.id===id);
  if(!d||!destinationOpen(d)){showDestinations();return;}
  state='missions';
  const cards=MISSIONS.filter(m=>m.destination===id).map(m=>{
   const open=missionOpen(m),operable=save.hull>1e-6,fueled=save.fuel>1e-6;
   const label=!open?'LOCKED':!operable?'REPAIR IN HANGAR':!fueled?'REFUEL IN HANGAR':'LAUNCH';
   const prerequisite=m.requires?MISSIONS.find(v=>v.id===m.requires):null;
   return `<div class="mission"><h3>${m.name}${done(m.id)?' — COMPLETED':''}</h3><p>${m.description}</p><p class="small">Fare ${m.fare} cr · ${m.layout?'Handcrafted terrain':m.platform?'Floating platform':'Original approach'}</p>${!open&&prerequisite?`<p class="small">Complete ${prerequisite.name} to unlock.</p>`:''}<button type="button" ${open&&operable&&fueled?'':'disabled'} onclick="startMissionById('${m.id}')">${label}</button></div>`;
  }).join('');
  showScreen(`<h1>${d.name.toUpperCase()} — MISSIONS</h1><p>${resources()}</p>${cards}<div class="row"><button type="button" onclick="showHangar()">HANGAR / SERVICE</button><button type="button" onclick="showMissions()">DESTINATIONS</button></div>`);
 }
 const originalTerrain=makeTerrain;
 makeTerrain=function(m){
  if(!m.layout)return originalTerrain(m);
  const l=m.layout,pw=Math.min(m.padWidth,Math.max(60,W*.22));
  const px=Math.min(W-pw-24,Math.max(24,W*l.padAt)),py=H*l.padY;
  const left=px-12,right=px+pw+12;
  const pts=l.profile.map(([x,y])=>({x:x*W,y:y*H})).filter(p=>p.x<left||p.x>right);
  pts.push({x:-400,y:H*.9},{x:left,y:py},{x:px,y:py},{x:px+pw,y:py},{x:right,y:py},{x:W+400,y:H*.9});
  pts.sort((a,b)=>a.x-b.x);
  return {pts,pad:{x:px,w:pw,y:py}};
 };
 const originalStart=startMission;
 startMission=function(m){
  if(!m||!missionOpen(m)){showDestinations();return;}
  originalStart(m);
  if(state!=='play')return;
  if(m.platform){
   MovingPlatform.current=MovingPlatform.create(m.platform);
   MovingPlatform.apply(MovingPlatform.current);
  }else{
   MovingPlatform.current=null;
  }
  if(!m.layout)return;
  ship.x=Math.max(24,Math.min(W-24,W*m.layout.startX));
  ship.y=Math.max(40,Math.min(H-80,H*m.layout.startY));
  approachState=ApproachWarnings.create(Math.max(0,clearanceAt(ship).gap/SCALE));
 };
 const originalUpdate=update;
 update=function(dt){
  const platform=MovingPlatform.current;
  if(platform){
   MovingPlatform.update(platform,dt);
   MovingPlatform.apply(platform);
  }
  originalUpdate(dt);
 };
 showMissions=showDestinations;
 showTitle();
 return {showDestination,showDestinations,destinationOpen,missionOpen};
})();
