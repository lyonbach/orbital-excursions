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
 const titan=roots[2];
 MISSIONS.push(
  {...titan,id:'titan-shore',name:'Methane Shore',fare:1600,padWidth:100,startVx:30,wind:7,drag:.095,requires:'titan',description:'Follow the shoreline through a steady crosswind and land beside the hydrocarbon lake.',layout:{padAt:.55,padY:.78,startX:.12,startY:.16,profile:[[0,.84],[.22,.8],[.4,.78],[.58,.78],[.78,.82],[1,.85]]}},
  {...titan,id:'titan-dune',name:'Dune Station',fare:1800,padWidth:95,startVx:32,wind:8,drag:.1,requires:'titan-shore',description:'Cross the dune field and settle on a station pad tucked between uneven ridges.',layout:{padAt:.48,padY:.76,startX:.12,startY:.15,profile:[[0,.84],[.18,.79],[.34,.83],[.44,.76],[.56,.76],[.68,.83],[.84,.79],[1,.85]]}},
  {...titan,id:'titan-haze',name:'Haze Basin',fare:2000,padWidth:90,startVx:33,wind:8,drag:.105,requires:'titan-dune',description:'Descend through thick haze into a broad basin. The pad is generous, but the approach is disorienting.',layout:{padAt:.5,padY:.84,startX:.12,startY:.14,profile:[[0,.76],[.2,.72],[.36,.68],[.46,.84],[.54,.84],[.64,.68],[.8,.72],[1,.76]]}},
  {...titan,id:'titan-cliff',name:'Cliffside Terminal',fare:2200,padWidth:85,startVx:35,wind:9,drag:.11,requires:'titan-haze',description:'A terminal clings to a cliff above the lowlands. Keep clear of the wall and correct the crosswind early.',layout:{padAt:.5,padY:.56,startX:.12,startY:.13,profile:[[0,.74],[.18,.8],[.32,.9],[.42,.56],[.58,.56],[.68,.9],[.84,.8],[1,.74]]}},
  {...titan,id:'titan-archipelago',name:'Lake Archipelago',fare:2450,padWidth:80,startVx:36,wind:10,drag:.115,requires:'titan-cliff',description:'Land on a small island terminal surrounded by lower methane-lake terrain.',layout:{padAt:.5,padY:.66,startX:.12,startY:.13,profile:[[0,.82],[.2,.78],[.36,.72],[.44,.66],[.56,.66],[.64,.72],[.8,.78],[1,.82]]}},
  {...titan,id:'titan-rapids',name:'Methane Rapids',fare:2700,padWidth:75,startVx:38,wind:11,drag:.12,requires:'titan-archipelago',description:'Follow the rapid-moving channel and land on its narrow bank before the crosswind carries you past.',layout:{padAt:.5,padY:.78,startX:.12,startY:.12,profile:[[0,.72],[.18,.78],[.32,.88],[.42,.78],[.58,.78],[.68,.88],[.82,.78],[1,.72]]}},
  {...titan,id:'titan-kraken',name:'Kraken Shelf',fare:3000,padWidth:70,startVx:39,wind:12,drag:.125,requires:'titan-rapids',description:'A research shelf overlooks Kraken Mare. Manage drag and drift during the long final descent.',layout:{padAt:.5,padY:.6,startX:.12,startY:.12,profile:[[0,.86],[.2,.82],[.36,.72],[.44,.6],[.56,.6],[.64,.72],[.8,.82],[1,.86]]}},
  {...titan,id:'titan-stormfront',name:'Stormfront Terminal',fare:3350,padWidth:65,startVx:40,wind:13,drag:.13,requires:'titan-kraken',description:'A stormfront sweeps across the elevated terminal. Expect powerful, shifting crosswinds.',layout:{padAt:.5,padY:.56,startX:.12,startY:.12,profile:[[0,.84],[.2,.8],[.36,.7],[.44,.56],[.56,.56],[.64,.7],[.8,.8],[1,.84]]}},
  {...titan,id:'titan-grand',name:'Titan Grand Terminal',fare:3700,padWidth:60,startVx:42,wind:14,drag:.14,requires:'titan-stormfront',description:'The final Titan terminal sits above the haze in powerful crosswinds. Manage drag, arrest drift, and settle precisely.',layout:{padAt:.5,padY:.52,startX:.1,startY:.12,profile:[[0,.88],[.2,.84],[.34,.72],[.43,.52],[.57,.52],[.66,.72],[.8,.84],[1,.88]]}}
 );
 const io=roots[3];
 MISSIONS.push(
  {...io,id:'io-sulfur',name:'Sulfur Flats',fare:2500,padWidth:90,startVx:35,wind:11,drag:.002,requires:'io',description:'Cross the fractured sulfur plains and settle on a broad but uneven volcanic field.',layout:{padAt:.55,padY:.8,startX:.12,startY:.15,profile:[[0,.86],[.24,.82],[.42,.8],[.6,.8],[.8,.84],[1,.86]]}},
  {...io,id:'io-plume',name:'Plume Watch',fare:2800,padWidth:85,startVx:36,wind:12,drag:.002,requires:'io-sulfur',description:'A monitoring station sits beside an active plume. Expect turbulent gusts and a fast descent.',layout:{padAt:.5,padY:.72,startX:.12,startY:.14,profile:[[0,.84],[.22,.8],[.38,.74],[.46,.72],[.56,.72],[.66,.76],[.82,.8],[1,.84]]}},
  {...io,id:'io-lava',name:'Lava Tube Ridge',fare:3100,padWidth:80,startVx:38,wind:12,drag:.003,requires:'io-plume',description:'Land on a narrow ridge above a collapsed lava tube. Gravity leaves little time to correct.',layout:{padAt:.5,padY:.6,startX:.12,startY:.13,profile:[[0,.88],[.22,.84],[.38,.72],[.46,.6],[.54,.6],[.62,.72],[.78,.84],[1,.88]]}},
  {...io,id:'io-caldera',name:'Caldera Edge',fare:3450,padWidth:75,startVx:39,wind:13,drag:.003,requires:'io-lava',description:'A precision pad sits on the rim of an active caldera. Stay high until aligned, then commit.',layout:{padAt:.5,padY:.66,startX:.12,startY:.13,profile:[[0,.8],[.2,.76],[.36,.7],[.44,.66],[.56,.66],[.64,.7],[.8,.76],[1,.8]]}},
  {...io,id:'io-radiation',name:'Radiation Shelf',fare:3800,padWidth:70,startVx:41,wind:14,drag:.003,requires:'io-caldera',description:'A small research shelf is exposed to intense radiation and severe gusts. Descend decisively.',layout:{padAt:.5,padY:.58,startX:.12,startY:.12,profile:[[0,.86],[.2,.82],[.36,.7],[.44,.58],[.56,.58],[.64,.7],[.8,.82],[1,.86]]}},
  {...io,id:'io-basalt',name:'Basalt Canyon',fare:4200,padWidth:65,startVx:43,wind:15,drag:.004,requires:'io-radiation',description:'Thread a basalt canyon and land on its low floor. The walls leave almost no lateral margin.',layout:{padAt:.5,padY:.82,startX:.12,startY:.12,profile:[[0,.7],[.18,.76],[.32,.88],[.42,.82],[.58,.82],[.68,.88],[.82,.76],[1,.7]]}},
  {...io,id:'io-eruption',name:'Eruption Break',fare:4600,padWidth:60,startVx:45,wind:16,drag:.004,requires:'io-basalt',description:'A narrow pad sits in an eruption corridor. Turbulent gusts and high gravity make every correction costly.',layout:{padAt:.5,padY:.74,startX:.12,startY:.12,profile:[[0,.78],[.2,.74],[.36,.68],[.44,.74],[.56,.74],[.64,.68],[.8,.74],[1,.78]]}},
  {...io,id:'io-firestorm',name:'Firestorm Terminal',fare:5000,padWidth:55,startVx:45,wind:17,drag:.005,requires:'io-eruption',description:'A tiny terminal is battered by firestorm gusts. There is almost no aerodynamic help and no room for error.',layout:{padAt:.5,padY:.56,startX:.12,startY:.12,profile:[[0,.86],[.2,.82],[.36,.7],[.44,.56],[.56,.56],[.64,.7],[.8,.82],[1,.86]]}},
  {...io,id:'io-beacon',name:'Io Rescue Beacon',fare:5500,padWidth:50,startVx:46,wind:18,drag:.006,requires:'io-firestorm',description:'A stranded crew’s beacon sits on an isolated volcanic shelf. Fight the gravity, ignore nothing, and land with absolute precision.',layout:{padAt:.5,padY:.54,startX:.1,startY:.12,profile:[[0,.9],[.2,.86],[.34,.74],[.43,.54],[.57,.54],[.66,.74],[.8,.86],[1,.9]]}}
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
 const jupiterStorm={
  id:'jupiter-storm',
  name:'Storm Anchor',
  fare:1750,
  gravity:8.2,
  padWidth:100,
  roughness:1,
  wind:13,
  drag:.12,
  startVx:30,
  startFuel:.82,
  unlockAt:5,
  requires:'jupiter-drift',
  destination:'jupiter',
  platform:{x:.5,y:.66,width:100,sway:{x:10,y:18,speed:.4}},
  description:'The station rises and falls through the storm. Time your descent and settle as the platform levels.',
  environment:jupiterEnvironment
 };
 const jupiterBrass={
  id:'jupiter-brass',
  name:'Brass Relay',
  fare:2050,
  gravity:8.2,
  padWidth:90,
  roughness:1,
  wind:14,
  drag:.125,
  startVx:32,
  startFuel:.8,
  unlockAt:5,
  requires:'jupiter-storm',
  destination:'jupiter',
  platform:{x:.42,y:.64,width:90,sway:{x:10,y:14,speed:.45},drift:{x:220,y:8,speed:.25}},
  description:'A narrow brass relay drifts steadily through the cloud deck. Match its sideways motion before descending.',
  environment:jupiterEnvironment
 };
 const jupiterCopper={
  id:'jupiter-copper',
  name:'Copper Crossing',
  fare:2350,
  gravity:8.2,
  padWidth:85,
  roughness:1,
  wind:14,
  drag:.13,
  startVx:34,
  startFuel:.78,
  unlockAt:5,
  requires:'jupiter-brass',
  destination:'jupiter',
  platform:{x:.38,y:.62,width:85,sway:{x:12,y:16,speed:.5},drift:{x:260,y:9,speed:.3}},
  description:'The copper crossing sweeps across a wide storm corridor. Intercept its motion, then brake with the wind.',
  environment:jupiterEnvironment
 };
 const jupiterHigh={
  id:'jupiter-high',
  name:'High Balloon Dock',
  fare:2650,
  gravity:8.2,
  padWidth:90,
  roughness:1,
  wind:15,
  drag:.13,
  startVx:35,
  startFuel:.78,
  unlockAt:5,
  requires:'jupiter-copper',
  destination:'jupiter',
  platform:{x:.45,y:.52,width:90,sway:{x:14,y:22,speed:.5}},
  description:'A high-altitude dock sways above the cloud deck. Wait for the platform to level before committing.',
  environment:jupiterEnvironment
 };
 const jupiterGust={
  id:'jupiter-gust',
  name:'Gust Line',
  fare:2950,
  gravity:8.2,
  padWidth:80,
  roughness:1,
  wind:17,
  drag:.135,
  startVx:37,
  startFuel:.75,
  unlockAt:5,
  requires:'jupiter-high',
  destination:'jupiter',
  platform:{x:.45,y:.62,width:80,sway:{x:12,y:18,speed:.5},drift:{x:200,y:8,speed:.25}},
  description:'A powerful gust line pushes across the approach. Correct early and use the platform’s motion to your advantage.',
  environment:jupiterEnvironment
 };
 const jupiterRivet={
  id:'jupiter-rivet',
  name:'Rivet Yard',
  fare:3250,
  gravity:8.2,
  padWidth:75,
  roughness:1,
  wind:18,
  drag:.14,
  startVx:39,
  startFuel:.75,
  unlockAt:5,
  requires:'jupiter-gust',
  destination:'jupiter',
  platform:{x:.4,y:.6,width:75,sway:{x:16,y:24,speed:.55}},
  description:'A compact riveted yard swings through the storm. There is very little room to correct a late approach.',
  environment:jupiterEnvironment
 };
 const jupiterTempest={
  id:'jupiter-tempest',
  name:'Tempest Terminal',
  fare:3600,
  gravity:8.2,
  padWidth:70,
  roughness:1,
  wind:19,
  drag:.145,
  startVx:41,
  startFuel:.72,
  unlockAt:5,
  requires:'jupiter-rivet',
  destination:'jupiter',
  platform:{x:.38,y:.58,width:70,sway:{x:14,y:20,speed:.6},drift:{x:240,y:9,speed:.3}},
  description:'The tempest terminal combines drift, sway, and severe wind. Read its motion and commit only when aligned.',
  environment:jupiterEnvironment
 };
 const jupiterZeppelin={
  id:'jupiter-zeppelin',
  name:'Zeppelin Grand Terminal',
  fare:4000,
  gravity:8.2,
  padWidth:65,
  roughness:1,
  wind:20,
  drag:.15,
  startVx:43,
  startFuel:.7,
  unlockAt:5,
  requires:'jupiter-tempest',
  destination:'jupiter',
  platform:{x:.4,y:.62,width:65,sway:{x:16,y:26,speed:.65},drift:{x:300,y:10,speed:.35}},
  description:'The grand terminal rides the storm at high speed. Match its motion, fight the crosswind, and settle with absolute precision.',
  environment:jupiterEnvironment
 };
 MISSIONS.push(jupiterFloat,jupiterDrift,jupiterStorm,jupiterBrass,jupiterCopper,jupiterHigh,jupiterGust,jupiterRivet,jupiterTempest,jupiterZeppelin);
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
