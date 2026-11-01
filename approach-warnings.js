const ApproachWarnings=(()=>{
 const levels=[
  [60,'APPROACHING MINIMUMS'],[50,'MINIMUMS — FIFTY...'],
  [40,'FORTY...'],[30,'THIRTY...'],[20,'TWENTY...'],
  [10,'TEN...'],[5,'RETARD...']
 ];
 function create(altitude){
  return {previous:altitude,armed:new Set(levels.filter(([h])=>altitude>h).map(([h])=>h)),message:null,remaining:0,warning:null,approach:false};
 }
 function gearStatus(gear){
  if(gear.target===1&&gear.progress>=.999)return 'DOWN';
  if(gear.target===0&&gear.progress<=.001)return 'UP';
  return gear.target===1?'DEPLOYING':'RETRACTING';
 }
 function update(s,ship,altitude,dt){
  if(!s)return;
  s.remaining=Math.max(0,s.remaining-dt);
  if(s.remaining===0)s.message=null;
  for(const [h] of levels)if(altitude>=h+3)s.armed.add(h);
  const descending=ship.vy>.05;
  const crossed=descending?levels.filter(([h])=>s.armed.has(h)&&s.previous>h&&altitude<=h):[];
  for(const [h] of crossed)s.armed.delete(h);
  if(crossed.length){s.message={text:crossed[crossed.length-1][1],tone:'callout'};s.remaining=2;}
  if(altitude>35)s.approach=false;
  if(descending&&altitude<=30)s.approach=true;
  const status=gearStatus(ship.gear);
  s.warning=null;
  if(s.approach&&status!=='DOWN'){
   const text=status==='DEPLOYING'?'GEAR DEPLOYING':status==='RETRACTING'?'GEAR RETRACTING — PRESS G TO DEPLOY':'LANDING GEAR UP — PRESS G';
   s.warning={text,tone:altitude<=10?'critical':'caution'};
   s.message=null;s.remaining=0;
  }
  s.previous=altitude;
 }
 function render(element,s,active){
  const message=active&&s&&(s.warning||s.message);
  if(!message){element.className='approach-alert hidden';if(element.textContent)element.textContent='';return;}
  element.className='approach-alert '+message.tone;
  if(element.textContent!==message.text)element.textContent=message.text;
 }
 return {create,gearStatus,update,render};
})();
