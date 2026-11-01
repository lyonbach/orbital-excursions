(() => {
 'use strict';
 if(window.orbitalTrajectory)return;
 const settings={enabled:true};
 window.orbitalTrajectory=settings;
 addEventListener('keydown',e=>{
  const target=e.target;
  if(target&&(target.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target.tagName)))return;
  if(e.code==='KeyT'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&state==='play'){
   e.preventDefault();
   settings.enabled=!settings.enabled;
  }
 });
 function predict(){
  const dt=1/60, steps=480, m=selectedMission;
  let x=ship.x,y=ship.y,vx=ship.vx,vy=ship.vy;
  const points=[{x,y}];
  let impact=null;
  for(let i=1;i<=steps;i++){
   const oldX=x,oldY=y;
   const drag=m.drag||0;
   const ax=(m.wind?Math.sin((windPhase+i*dt)*.7)*m.wind*.08:0)-vx*drag;
   const ay=m.gravity-vy*drag;
   vx+=ax*dt;vy+=ay*dt;
   x+=vx*SCALE*dt;y+=vy*SCALE*dt;
   const clearance=terrainYAt(x)-18-y;
   if(clearance<=0){
    let lo=0,hi=1;
    for(let j=0;j<10;j++){
     const f=(lo+hi)/2,px=oldX+(x-oldX)*f,py=oldY+(y-oldY)*f;
     if(py+18>=terrainYAt(px))hi=f;else lo=f;
    }
    x=oldX+(x-oldX)*hi;y=oldY+(y-oldY)*hi;
    points.push({x,y});impact={x,y:y+18};break;
   }
   if(i%4===0)points.push({x,y});
   if(x<20||x>W-20||y<20){
    if(i%4!==0)points.push({x,y});
    break;
   }
  }
  return {points,impact};
 }
 function render(){
  if(!settings.enabled||state!=='play'||!ship||!terrain)return;
  const {points,impact}=predict();
  if(points.length<2)return;
  ctx.save();
  ctx.globalAlpha=.65;
  ctx.strokeStyle='#7fd1ff';
  ctx.lineWidth=1;
  ctx.setLineDash([5,5]);
  ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
  if(impact){
   ctx.strokeStyle='#ffd166';
   ctx.beginPath();
   ctx.moveTo(impact.x-5,impact.y-5);ctx.lineTo(impact.x+5,impact.y+5);
   ctx.moveTo(impact.x+5,impact.y-5);ctx.lineTo(impact.x-5,impact.y+5);
   ctx.stroke();
  }
  const label=points[Math.min(8,points.length-1)];
  ctx.font='10px ui-monospace,monospace';
  ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillStyle='#7fd1ff';
  ctx.fillText('COAST',Math.max(4,Math.min(W-44,label.x+8)),Math.max(14,Math.min(H-4,label.y-8)));
  ctx.restore();
 }
 const originalDrawShip=drawShip;
 drawShip=function(){
  render();
  return originalDrawShip.apply(this,arguments);
 };
})();
