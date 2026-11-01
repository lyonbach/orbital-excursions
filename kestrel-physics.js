const KestrelPhysics=(()=>{
 const config=Object.freeze({mass:4,inertia:24,engineX:54,engineY:14,mainAcceleration:30,lateralAcceleration:.3,engineFuelRate:7.5,rcsFuelRate:.3});
 const clamp=v=>Math.max(-1,Math.min(1,v));
 function prepare(ship,input,dt){
  dt=Number.isFinite(dt)?Math.max(0,dt):0;
  const lift=Number(!!input.main);
  const turn=Number(!!input.cw)-Number(!!input.ccw);
  const lateral=Number(!!input.right)-Number(!!input.left);
  const left=clamp(lift+turn),right=clamp(lift-turn);
  const demand=((Math.abs(left)+Math.abs(right))*config.engineFuelRate+Math.abs(lateral)*config.rcsFuelRate)*dt;
  const fuel=Number.isFinite(ship.fuel)?Math.max(0,ship.fuel):0;
  const fraction=demand>0?Math.min(1,fuel/demand):0;
  const jets=[];
  for(const [x,command] of [[-config.engineX,left],[config.engineX,right]]){
   if(!command||!fraction)continue;
   jets.push({name:'main',x,y:command>0?config.engineY:-config.engineY,fx:0,fy:-command*config.mainAcceleration*config.mass*.5*fraction,strength:Math.abs(command)*fraction});
  }
  if(lateral&&fraction)jets.push({name:'rcs',x:-lateral*70,y:0,fx:lateral*config.lateralAcceleration*config.mass*fraction,fy:0,strength:fraction});
  return {jets,fuelUsed:demand*fraction,main:fraction>0&&!!lift,left:fraction>0&&lateral<0,right:fraction>0&&lateral>0,engines:{left:left*fraction,right:right*fraction}};
 }
 function wrench(jets,angle,pixelsPerMeter){
  if(!(pixelsPerMeter>0))throw new RangeError('pixelsPerMeter must be positive');
  const c=Math.cos(angle),s=Math.sin(angle);
  let fx=0,fy=0,torque=0;
  for(const jet of jets){
   fx+=jet.fx*c-jet.fy*s;
   fy+=jet.fx*s+jet.fy*c;
   torque+=(jet.x*jet.fy-jet.y*jet.fx)/pixelsPerMeter;
  }
  return {ax:fx/config.mass,ay:fy/config.mass,alpha:torque/config.inertia};
 }
 return {config,prepare,wrench};
})();
