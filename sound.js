const FlightSound=(()=>{
 let audio,master,engineGain,rcsGain,rumbleGain,failed=false,ready=false;
 let muted=false,volume=.35,tail=0,lastContact=-Infinity,trackedShip=null;
 const voices=new Set();
 const panel=document.createElement('div');
 panel.style.cssText='position:fixed;right:12px;bottom:12px;z-index:1000;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#080e1ce8;border:1px solid #40516b;border-radius:8px;color:#dfe7ff;font:12px monospace';
 const button=document.createElement('button');button.type='button';button.textContent='SOUND: ON';button.setAttribute('aria-pressed','false');
 const label=document.createElement('label');label.textContent='Volume ';
 const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value='35';slider.setAttribute('aria-label','Sound volume');slider.style.width='90px';
 label.append(slider);panel.append(button,label);document.body.append(panel);
 function noise(){
  const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;return source;
 }
 function init(){
  if(audio||failed)return;
  try{
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context)throw new Error('Web Audio unavailable');
   audio=new Context();master=audio.createGain();master.gain.value=0;
   const compressor=audio.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=6;master.connect(compressor);compressor.connect(audio.destination);
   engineGain=audio.createGain();engineGain.gain.value=0;engineGain.connect(master);
   const exhaust=noise(),low=audio.createBiquadFilter();low.type='lowpass';low.frequency.value=450;low.Q.value=.65;exhaust.connect(low);low.connect(engineGain);exhaust.start();
   rumbleGain=audio.createGain();rumbleGain.gain.value=0;rumbleGain.connect(master);
   const rumble=audio.createOscillator();rumble.type='sine';rumble.frequency.value=38;rumble.connect(rumbleGain);rumble.start();
   const whine=audio.createOscillator(),whineGain=audio.createGain();whine.type='triangle';whine.frequency.value=110;whineGain.gain.value=.06;whine.connect(whineGain);whineGain.connect(engineGain);whine.start();
   rcsGain=audio.createGain();rcsGain.gain.value=0;rcsGain.connect(master);
   const gas=noise(),high=audio.createBiquadFilter();high.type='highpass';high.frequency.value=1800;gas.connect(high);high.connect(rcsGain);gas.start();
  }catch(error){failed=true;button.textContent='SOUND UNAVAILABLE';button.disabled=true;slider.disabled=true;if(audio)audio.close().catch(()=>{});}
 }
 function unlock(){
  if(document.hidden||muted||failed)return;init();
  if(audio)audio.resume().then(()=>{ready=audio.state==='running';}).catch(()=>{ready=false;});
 }
 function silence(){
  ready=false;tail=0;
  if(!audio||failed)return;
  for(const source of voices){try{source.stop();}catch(error){}}voices.clear();
  for(const gain of [master,engineGain,rumbleGain,rcsGain]){gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setValueAtTime(0,audio.currentTime);}
 }
 function effect(impact=false,strength=1){
  if(!audio||failed||!ready||muted||document.hidden||!document.hasFocus()||audio.state!=='running')return;
  const now=audio.currentTime,duration=impact?.32:.22,level=impact?.12+.18*strength:.12*strength;
  tail=Math.max(tail,now+duration);
  const source=noise(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  source.loop=false;filter.type=impact?'lowpass':'bandpass';filter.frequency.value=impact?550+strength*900:1500;filter.Q.value=impact?.7:2;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  source.connect(filter);filter.connect(gain);gain.connect(master);
  voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(now);source.stop(now+duration);
  const frequencies=impact?[90,170]:[340,790,1270];
  for(const frequency of frequencies){
   const tone=audio.createOscillator(),envelope=audio.createGain();tone.type='sine';tone.frequency.setValueAtTime(frequency,now);tone.frequency.exponentialRampToValueAtTime(frequency*(impact?.45:.9),now+duration);
   envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(level*.4/frequencies.length,now+.003);envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);
   tone.connect(envelope);envelope.connect(master);voices.add(tone);tone.onended=()=>{voices.delete(tone);tone.disconnect();envelope.disconnect();};tone.start(now);tone.stop(now+duration);
  }
 }
 button.addEventListener('click',()=>{muted=!muted;button.textContent=muted?'SOUND: OFF':'SOUND: ON';button.setAttribute('aria-pressed',String(muted));if(muted)silence();else unlock();});
 slider.addEventListener('input',()=>{volume=Number(slider.value)/100;unlock();});
 addEventListener('pointerdown',unlock);
 addEventListener('keydown',event=>{if(!event.repeat)unlock();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();if(audio&&!failed)audio.suspend().catch(()=>{});}});
 addEventListener('blur',silence);addEventListener('pagehide',silence);
 const originalUpdate=update;
 update=function(dt){
  const current=ship,playing=state==='play'&&current&&dt>0;
  if(current!==trackedShip){trackedShip=current;lastContact=-Infinity;}
  const before=playing?current.gear.progress:0;
  const target=playing?current.gear.target:0;
  originalUpdate(dt);
  if(!playing||ship!==current)return;
  const after=current.gear.progress;
  if((target===1&&before<.999&&after>=.999)||(target===0&&before>.001&&after<=.001))effect(false,1.2);
 };
 addEventListener('keydown',event=>{
  if(event.code!=='KeyG'||event.repeat||event.ctrlKey||event.metaKey||event.altKey||state!=='play'||!ship)return;
  const target=event.target;if(target&&(target.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target.tagName)))return;
  effect(false,.85);
 });
 const originalDust=spawnDust;
 spawnDust=function(x,y,speed,side){
  originalDust(x,y,speed,side);
  if(state!=='play'||!ship)return;
  if(ship!==trackedShip){trackedShip=ship;lastContact=-Infinity;}
  if(missionTime-lastContact<.12)return;
  lastContact=missionTime;effect(true,Math.min(1,Math.max(0,speed)/8.5));
 };
 function tick(){
  if(audio&&!failed){
   const enabled=ready&&!muted&&!document.hidden&&document.hasFocus();
   const active=enabled&&typeof state!=='undefined'&&state==='play'&&typeof ship!=='undefined'&&ship;
   let main=0,rcs=0;
   if(active)for(const jet of ship.jets||[]){if(Math.hypot(jet.fx,jet.fy)<=0)continue;const strength=Math.max(0,Math.min(1,jet.strength||0));if(jet.name==='main')main=Math.max(main,strength);else rcs=Math.max(rcs,strength);}
   const now=audio.currentTime;
   master.gain.setTargetAtTime(enabled&&(active||now<tail)?volume:0,now,.025);
   engineGain.gain.setTargetAtTime(main*.28,now,main?.035:.07);
   rumbleGain.gain.setTargetAtTime(main*.09,now,.045);
   rcsGain.gain.setTargetAtTime(rcs*.065,now,rcs?.008:.025);
  }
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);return {silence};
})();
