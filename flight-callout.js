function drawShipReadouts(){
 const s=ship, margin=10, bw=Math.min(176,Math.max(1,W-2*margin)), bh=88;
 const right=s.x+48+bw<=W-margin;
 let x=right?s.x+48:s.x-48-bw;
 let y=s.y-112;
 if(y<margin)y=s.y+34;
 x=Math.max(margin,Math.min(x,W-bw-margin));
 y=Math.max(margin,Math.min(y,H-bh-margin));
 const edgeX=right?x:x+bw;
 const edgeY=Math.max(y+10,Math.min(s.y-20,y+bh-10));
 ctx.save();
 ctx.globalAlpha=1;
 ctx.lineWidth=1;
 ctx.strokeStyle='rgba(159,180,216,.8)';
 ctx.beginPath();
 ctx.moveTo(s.x+(right?18:-18),s.y-18);
 ctx.lineTo(edgeX+(right?-12:12),edgeY+12);
 ctx.lineTo(edgeX,edgeY);
 ctx.stroke();
 ctx.fillStyle='rgba(8,14,28,.82)';
 ctx.fillRect(x,y,bw,bh);
 ctx.strokeRect(x,y,bw,bh);
 ctx.font='11px ui-monospace,monospace';
 ctx.textBaseline='middle';
 const rows=[
  ['SPEED',Math.hypot(s.vx,s.vy).toFixed(1)+' m/s','#dfe7ff'],
  ['VERT',s.vy.toFixed(1)+' m/s','#59c2ff'],
  ['HORIZ',s.vx.toFixed(1)+' m/s','#ffa657'],
  ['G-LOAD',Math.hypot(s.gVert,s.gLat).toFixed(1)+' g','#7ee787']
 ];
 rows.forEach(([label,value,color],i)=>{
  const ty=y+14+i*20;
  ctx.fillStyle=color;
  ctx.textAlign='left';ctx.fillText(label,x+10,ty);
  ctx.textAlign='right';ctx.fillText(value,x+bw-10,ty);
 });
 ctx.restore();
}
