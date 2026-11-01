const FuelEconomy=(()=>{
 const price=3;
 const nonnegative=(v,fallback=0)=>Number.isFinite(v)?Math.max(0,v):fallback;
 const cents=v=>Math.round(v*100)/100;
 const money=v=>v.toFixed(2);
 const units=v=>v.toFixed(2);
 const capacity=s=>100+20*s.upgrades.fuel;
 function fresh(){return {credits:200,fuel:0,hull:100,debt:0,economyVersion:1,upgrades:{engine:0,fuel:0,hull:0,rcs:0},completed:[]};}
 function migrate(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return fresh();
  const s=fresh();
  s.credits=cents(nonnegative(raw.credits));s.debt=cents(nonnegative(raw.debt));
  for(const id of Object.keys(s.upgrades))s.upgrades[id]=Math.min(3,Math.floor(nonnegative(raw.upgrades&&raw.upgrades[id])));
  s.completed=Array.isArray(raw.completed)?raw.completed.filter(v=>typeof v==='string'):[];
  s.fuel=Object.prototype.hasOwnProperty.call(raw,'fuel')?Math.min(capacity(s),nonnegative(raw.fuel)):capacity(s);
  const hullMax=100+15*s.upgrades.hull;
  s.hull=Object.prototype.hasOwnProperty.call(raw,'hull')?Math.min(hullMax,nonnegative(raw.hull)):hullMax;
  return s;
 }
 function quote(s,request){
  const room=Math.max(0,capacity(s)-s.fuel);
  const requested=request==='fill'?room:nonnegative(request);
  const limit=Math.min(room,requested,s.credits/price);
  const amount=Math.floor((limit+1e-9)*100)/100;
  return {units:amount,cost:cents(amount*price)};
 }
 function purchase(s,request){
  const q=quote(s,request);
  if(q.units<=0||q.cost>s.credits+1e-9)return false;
  s.credits=cents(Math.max(0,s.credits-q.cost));s.fuel=Math.min(capacity(s),s.fuel+q.units);
  return q;
 }
 const canBorrow=s=>s.fuel<=1e-6&&s.credits<price;
 function borrow(s){
  if(!canBorrow(s))return false;
  const amount=Math.min(100,Math.max(0,capacity(s)-s.fuel));
  if(amount<=0)return false;
  const cost=cents(amount*price);
  s.fuel+=amount;s.debt=cents(s.debt+cost);
  return {units:amount,cost};
 }
 function settle(s,gross){
  gross=cents(nonnegative(gross));
  const repaid=Math.min(s.debt,gross),net=cents(gross-repaid);
  s.debt=cents(s.debt-repaid);s.credits=cents(s.credits+net);
  return {repaid,net};
 }
 function panel(s){
  const cap=capacity(s);
  const buttons=[10,25,'fill'].map(request=>{
   const q=quote(s,request),label=request==='fill'?'Fill tank (affordable)':`Buy up to ${request} units`;
   const arg=request==='fill'?"'fill'":request;
   return `<button type="button" ${q.units<=0?'disabled':''} onclick="buyFuel(${arg})">${label} — ${units(q.units)} units / ${money(q.cost)} cr</button>`;
  }).join('');
  return `<div class="upgrade"><h3>Fuel service</h3>
   <p>Tank: ${units(s.fuel)} / ${cap} units · ${price} cr per unit</p>
   <div class="bar"><div class="fill" style="width:${s.fuel/cap*100}%;background:#59c2ff"></div></div>
   <div class="row">${buttons}</div>
   <p class="small">Manual refuelling only. Purchases use 0.01-unit increments and are limited by capacity and available credits. Unused fuel carries across missions and retries. Capacity upgrades do not include fuel.</p>
   ${s.fuel<=1e-6?'<p class="warn">Tank empty — refuel before launching.</p>':''}
  </div><div class="upgrade"><h3>Emergency refuelling &amp; debt</h3>
   <p>Outstanding debt: <span class="${s.debt>0?'warn':'good'}">${money(s.debt)} cr</span></p>
   <p class="small">No interest. Successful mission earnings repay debt first. An emergency loan supplies 100 fuel units directly, adds 200 cr to debt, and gives no spendable credits.</p>
   <button type="button" ${canBorrow(s)?'':'disabled'} onclick="borrowEmergencyFuel()">Emergency refuel — borrow 200 cr</button>
   <p class="small">Available only with an empty tank and less than 2 cr. Further emergency loans remain available if stranded again.</p>
  </div>`;
 }
 return {price,fresh,migrate,capacity,quote,purchase,canBorrow,borrow,settle,panel,money};
})();

const RepairShop=(()=>{
 const price=4.5,epsilon=1e-6;
 const capacity=s=>100+15*s.upgrades.hull;
 const money=v=>v.toFixed(2);
 function quote(s,request){
  const missing=Math.max(0,capacity(s)-s.hull);
  const requested=request==='all'?missing:Number.isFinite(request)?Math.max(0,request):0;
  const budget=Math.floor((s.credits+1e-9)*100);
  const amount=Math.min(missing,requested,budget/(price*100));
  const cost=Math.min(budget,Math.ceil(amount*price*100-1e-7))/100;
  return {amount,cost};
 }
 function repair(s,request){
  const q=quote(s,request);
  if(q.amount<=epsilon||q.cost>s.credits+1e-9)return false;
  s.hull=Math.min(capacity(s),s.hull+q.amount);
  s.credits=Math.round(Math.max(0,s.credits-q.cost)*100)/100;
  return q;
 }
 const canBorrow=s=>s.hull<=epsilon&&s.credits<price;
 function borrow(s){
  if(!canBorrow(s))return false;
  const amount=Math.max(0,capacity(s)*.5-s.hull);
  const cost=Math.ceil(amount*price*100-1e-7)/100;
  s.hull+=amount;s.debt=Math.round((s.debt+cost)*100)/100;
  return {amount,cost};
 }
 function panel(s){
  const cap=capacity(s),missing=Math.max(0,cap-s.hull);
  const condition=s.hull<=epsilon?'DESTROYED — REPAIR REQUIRED':missing<=epsilon?'NO REPAIRS NEEDED':`${missing.toFixed(2)} hull points damaged`;
  const buttons=[10,'all'].map(request=>{
   const q=quote(s,request),label=request==='all'?'Repair all (affordable)':'Repair up to 10 points';
   const arg=request==='all'?"'all'":request;
   return `<button type="button" ${q.amount<=epsilon?'disabled':''} onclick="repairHull(${arg})">${label} — ${q.amount.toFixed(2)} points / ${money(q.cost)} cr</button>`;
  }).join('');
  const loanCost=Math.ceil(cap*.5*price*100)/100;
  return `<div class="upgrade"><h3>Repair shop</h3>
   <p>Hull: ${s.hull.toFixed(2)} / ${cap} — ${Math.round(s.hull/cap*100)}%</p>
   <div class="bar"><div class="fill" style="width:${s.hull/cap*100}%;background:#7ee787"></div></div>
   <p class="${s.hull<=epsilon?'bad':missing>epsilon?'warn':'good'}">${condition}</p>
   <p class="small">${price} cr per hull point. Repair costs round up to the nearest 0.01 cr. Damage carries across missions, retries, and reloads. Hull upgrades add capacity, not repairs.</p>
   <div class="row">${buttons}</div>
   <h3 style="margin-top:14px">Emergency rebuilding</h3>
   <p class="small">Available only at zero hull with less than ${price} cr. Restore to 50% hull, add the repair cost to your existing debt, and receive no spendable credits. No interest; successful missions repay debt first.</p>
   <button type="button" ${canBorrow(s)?'':'disabled'} onclick="borrowEmergencyRepair()">Emergency repair — ${ (cap*.5).toFixed(2)} hull / ${money(loanCost)} cr debt</button>
  </div>`;
 }
 return {price,capacity,quote,repair,canBorrow,borrow,panel};
})();