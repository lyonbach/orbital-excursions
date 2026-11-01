const ThrusterPhysics=(()=>{
 const mass=1,inertia=6;
 const mounts={
  main:[[0,14,0,-1,1]],
  left:[[14,-8,-1,0,.5],[14,8,-1,0,.5]],
  right:[[-14,-8,1,0,.5],[-14,8,1,0,.5]],
  ccw:[[14,-8,-1,0,1],[-14,8,1,0,1]],
  cw:[[-14,-8,1,0,1],[14,8,-1,0,1]]
 };
 function prepare(ship,input,dt,mainPower,rcsPower){
  const actions=[];
  if(input.main)actions.push({name:'main',power:mainPower*mass,rate:7.5});
  const lateral=Number(!!input.right)-Number(!!input.left);
  const rotation=Number(!!input.cw)-Number(!!input.ccw);
  if(lateral)actions.push({name:lateral<0?'left':'right',power:rcsPower*mass,rate:1.8});
  if(rotation)actions.push({name:rotation<0?'ccw':'cw',power:rcsPower*mass*1.2,rate:1.8});
  const demand=actions.reduce((sum,a)=>sum+a.rate*dt,0);
  const fraction=demand>0?Math.min(1,Math.max(0,ship.fuel)/demand):0;
  const jets=[];
  if(fraction>0)for(const a of actions){
   for(const [x,y,dx,dy,weight] of mounts[a.name]){
    const force=a.power*weight*fraction;
    jets.push({name:a.name,x,y,fx:dx*force,fy:dy*force,strength:fraction});
   }
  }
  return {jets,fuelUsed:demand*fraction,
   main:fraction>0&&!!input.main,left:fraction>0&&lateral<0,right:fraction>0&&lateral>0};
 }
 function wrench(jets,angle,pixelsPerMeter){
  const c=Math.cos(angle),s=Math.sin(angle);
  let fx=0,fy=0,torque=0;
  for(const jet of jets){
   const x=(jet.x*c-jet.y*s)/pixelsPerMeter;
   const y=(jet.x*s+jet.y*c)/pixelsPerMeter;
   const wx=jet.fx*c-jet.fy*s,wy=jet.fx*s+jet.fy*c;
   fx+=wx;fy+=wy;torque+=x*wy-y*wx;
  }
  return {ax:fx/mass,ay:fy/mass,alpha:torque/inertia};
 }
 function draw(ctx,jets){
  ctx.save();
  for(const jet of jets){
   const mag=Math.hypot(jet.fx,jet.fy);
   if(mag<=0)continue;
   const dx=-jet.fx/mag,dy=-jet.fy/mag;
   const main=jet.name==='main';
   const length=(main?18+Math.random()*14:7+Math.random()*6)*Math.sqrt(jet.strength);
   const width=main?5:1.8;
   ctx.fillStyle=main?'rgba(255,170,70,.9)':'rgba(120,220,255,.85)';
   ctx.beginPath();ctx.moveTo(jet.x-dy*width,jet.y+dx*width);
   ctx.lineTo(jet.x+dy*width,jet.y-dx*width);
   ctx.lineTo(jet.x+dx*length,jet.y+dy*length);ctx.closePath();ctx.fill();
  }
  ctx.restore();
 }
 return {prepare,wrench,draw,inertia,damping:dt=>Math.pow(.94,dt*60),normalizeAngle:a=>Math.atan2(Math.sin(a),Math.cos(a))};
})();
