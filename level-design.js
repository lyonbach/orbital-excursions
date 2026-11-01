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
  {...moon,id:'lunar-ridge',name:'Ridge Terminal',fare:950,padWidth:100,startVx:20,requires:'lunar-crater',description:'A narrow elevated terminal. Remove sideways drift before committing to the final descent.',layout:{padAt:.7,padY:.67,startX:.12,startY:.14,profile:[[0,.9],[.3,.88],[.5,.91],[1,.9]]}}
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
